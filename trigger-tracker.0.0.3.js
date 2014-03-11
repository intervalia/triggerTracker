/*
 * Trigger Tracker (v.0.0.3)
 * by Michael G Collins (www.intervalia.com)
 * intervalia@gmail.com
 *
 * Copyright (c) 2013 Michael G Collins
 * Licensed under the GPL license.
 *
 * NOTE: Requires jQuery framework (www.jquery.com)
 *  Tested with jQuery versions 1.7, 1.8.1 and 1.9.1
 *
 */
(function ($, undefined) {
  var trackOn = false;
  var trackHandlers = true;
  var handlerTimeIndex = 0;

  var con = $.triggerTrackerConsole || window.console;

  // If con === undefined what do we do?
  if (con !== undefined) {
    // Support IE 10 and below
    if (con.groupCollapsed === undefined) {
      con.groupCollapsed = con.log;
      con.groupEnd = function () { };

      var timers = {};
      con.time = function (name) {
        timers[name] = (new Date()).valueOf();
      };
      con.timeEnd = function (name) {
        var d = (new Date()).valueOf();
        if (timers[name]) {
          var ts = d - timers[name];
          con.info(name + ": " + ts + "ms");
          timers[name] = undefined;
        }
      }
    }
    // Support IE8 and IE9
    if (con.dir === undefined) {
      con.dir = function (obj) {
        var output = "\n", indentVal = 1;
        var isObjArray = $.isArray(obj);
        output += (isObjArray ? "[" : "{");

        function indent() {
          var indentation = "";
          for (var i = 0; i < indentVal; i++) {
            indentation += "  ";
          }
          return indentation;
        }

        function outputJSONResponse(k, v) {
          var resp = "\n" + indent() + k + ': ';

          if ($.isArray(v) || $.isPlainObject(v)) {
            var isArray = $.isArray(v);
            // Should this do both for loops as below?
            resp += (isArray ? "[" : "{");
            for (var k2 in v) {
              if (k2) {
                indentVal++;
                resp += outputJSONResponse(k2, v[k2]);
                indentVal--;
              }
            }
            resp += "\n" + indent() + (isArray ? "]" : "}");
          } else if ($.isFunction(v)) {
            resp += functionName(v);
          }
          else {
            resp += v;
          }

          return resp;
        }

        var processedAsObject = false;
        for (var k in obj) {
          processedAsObject = true;
          if (k) {
            output += outputJSONResponse(k, obj[k]);
          }
        }

        if (!processedAsObject) {
          for (var i = 0; i < obj.length; i++) {
            output += outputJSONResponse(i, obj[i]);
          }
        }

        output += "\n" + (isObjArray ? "]" : "}");
        con.log(output);
      }
    }

    function functionName(fn) {
      if (fn) {
        var tmpFn = fn.__originalMethod || fn;
        var tmpName = "";
        if (fn) {
          var re = /(function )+|(\r*\n)+\s*/g; //TODO: Add code to remove comments from params.
          var fnDecl = tmpFn.toString().replace(re, " ").split('{')[0].trim();
          if (fnDecl.split("(")[0].length === 0) {
            tmpName = fn.__functionName || "function ";
          }
          return tmpName + fnDecl;
        }
      }

      return typeof (fn);
    }

    function trackable(eventType) {
      var trackable = true;
      var et = eventType;
      if (typeof (et) === "object") {
        et = et.type;
      }
      var incList = $.triggerTrackerIncludeList;
      if (incList && incList instanceof Array) {
        trackable = (incList.indexOf(et) > -1);
      }
      var excList = $.triggerTrackerExcludeList;
      if (trackable && excList && excList instanceof Array) {
        trackable = (excList.indexOf(et) === -1);
      }
      return trackable;
    }

    function getVarNames(fnName, len) {
      var i = -1, varNames = [];
      for (; ++i < len;) {
        varNames.push(i);
      }
      if (fnName) {
        var args = /\(([^)]+)/.exec(fnName);
        if (args && args[1]) {
          args = args[1].split(/\s*,\s*/);
          for (i = 0; i < args.length; i++) {
            varNames[i] = args[i] || "" + i;
          }
        }
      }

      return varNames;
    }

    function handlerTracker(inst, originalHandler) {
      return function (evt) {
        var returnValue = undefined;
        var exception = undefined;
        var track = trackable(evt.type);
        var handlerKey = (++handlerTimeIndex) + ") Duration of handler";
        var fnName = functionName(originalHandler);
        var varNames = getVarNames(fnName, arguments.length);
        if (track) {
          con.groupCollapsed("HANDLER: (" + evt.type + ") " + fnName);
          if (evt.currentTarget === evt.target) {
            con.log("Target: ", evt.currentTarget);
          }
          else {
            con.log("Current target: ", evt.currentTarget);
            con.log("Original target: ", evt.target);
          }
          con.log("Handler: ", originalHandler.__originalMethod || originalHandler);
          con.log("Params:");
          con.log("  event: ", evt);
          if (arguments.length > 1) {
            for (var a = 1; a < arguments.length; a++) {
              con.log("  " + varNames[a] + ": ", arguments[a]);
            }
          }
          con.time(handlerKey);
        }
        else {
          con.log("HANDLER: (" + evt.type + ") " + fnName);
        }
        try {
          returnValue = originalHandler.apply(inst, arguments);
          if (track) {
            if (returnValue === false) {
              con.info("Returned false: event propagation was stopped and default action was prevented.");
            }
            else {
              con.log("Returned: ", returnValue);
              if (evt.originalEvent && evt.originalEvent.cancelBubble && evt.originalEvent && evt.originalEvent.defaultPrevented) {
                con.info("Event propagation was stopped and default action was prevented.");
              }
              else {
                if (evt.originalEvent && evt.originalEvent.cancelBubble) {
                  con.info("Event propagation was stopped.");
                }

                if (evt.originalEvent && evt.originalEvent.defaultPrevented) {
                  con.info("Default action was prevented.");
                }
              }
            }
          }
        }

        catch (ex) {
          if (track) {
            con.error("Exception thrown in event handler: ", ex);
          }
          exception = ex;
        }
        if (track) {
          con.timeEnd(handlerKey);
          con.groupEnd();
        }
        --handlerTimeIndex;
        if (exception) {
          throw (exception);
        }

        return returnValue;
      }
    }

    //$(document).ready(function() {
    var original_trigger = $.fn.trigger;
    var original_handlers = $.event.handlers; // jQuery 1.9+
    var original_on = $.fn.on; // jQuery below version 1.9

    var triggerTimeIndex = 0;
    $.fn.trigger = function triggerTracker(cmd) {
      var timeKey = (++triggerTimeIndex) + ") Duration of trigger";
      var name, returnValue, exception;
      if (this.length > 0) {
        name = this[0]._classNameForLogging || this.selector || this[0].mimeType || functionName(this[0]);
      }
      else {
        name = this.selector || this.toString();
      }
      if (typeof name === "object" && name._classNameForLogging) {
        name = name._classNameForLogging;
      }
      var track = trackable(cmd);
      var cmdIsObj = typeof cmd === "object";
      if (track) {
        con.groupCollapsed("TRIGGER: (" + (cmdIsObj ? cmd.type : cmd) + ") " + name);
        console.dir(name);
        con.log("Source: ", this);
        if (cmdIsObj) {
          con.log("Event: ", cmd);
        }
        con.log("Caller: ", arguments.callee.caller);
        if (arguments.length > 1) {
          con.log("Params:");
          con.dir(arguments[1]);
        }
        con.time(timeKey);
      }
      else {
        con.log("TRIGGER: (" + name + ") ", (cmdIsObj ? cmd.type : cmd));
      }
      try {
        returnValue = original_trigger.apply(this, arguments);  // Add the exception handler here too
      }

      catch (ex) {
        if (track) {
          con.error("Exception thrown in trigger call: ", ex);
        }
        exception = ex;
      }
      if (track) {
        con.timeEnd(timeKey);
        con.groupEnd();
      }
      --triggerTimeIndex;
      if (exception) {
        throw (exception);//new Error("Exception in event handler!", exception));
      }

      return returnValue;
    };

    if (trackHandlers || trackOn) {
      if (original_handlers) {
        $.event.handlers = function (event, handlers) {
          var handlerQueue = original_handlers.call(this, event, handlers);
          var newHandlerQueue = [];
          for (var i = 0; i < handlerQueue.length; i++) {
            var handlerObj = $.extend({}, handlerQueue[i]);
            var handlers = handlerObj.handlers;
            handlerObj.handlers = [];
            for (var q = 0; q < handlers.length; q++) {
              var handler = $.extend({}, handlers[q]);
              var oldFn = handler.handler;
              handler.handler = handlerTracker(this, oldFn);
              handler.handler.originalHandler = oldFn;
              handlerObj.handlers.push(handler);
            }
            newHandlerQueue.push(handlerObj);
          }
          return newHandlerQueue;
        };
      }
      else {
        $.fn.on = function onTracker(events) {
          var oldFn, newFn;
          var track = trackable(events);
          if (track && trackOn) {
            con.time("On time");
          }
          var name;
          if (this.length > 0) {
            name = this[0]._classNameForLogging || this.selector || this[0].mimeType || functionName(this[0]);
          }
          else {
            name = this.selector || this.toString();
          }

          if (track && trackOn) {
            con.groupCollapsed("Setting event handler: (" + name + ").on(", events, ")");
            con.log("Source Object: ", this);
            con.dir(arguments);
          }
          if (trackHandlers && !original_handlers) {
            var args = [].slice.call(arguments);
            for (var i = 0; i < args.length; i++) {
              if (typeof (args[i]) === "function") {
                oldFn = args[i];
                newFn = handlerTracker(this, oldFn);
                args[i] = newFn;
                newFn.guid = oldFn.guid;
              }
            }
          }
          var ret = original_on.apply(this, args);
          if (oldFn) {
            oldFn.guid = newFn.guid;
          }
          if (track && trackOn) {
            con.timeEnd("On time");
            con.groupEnd();
          }
          return ret;
        }
      }
    }
    //});
  }
})(jQuery);
