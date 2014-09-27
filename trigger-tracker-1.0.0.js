/* @preserve
 * Trigger Tracker (v.1.0.0)
 * by Michael G Collins (www.intervalia.com)
 * intervalia@gmail.com
 *
 * Copyright (c) 2013-2014 Michael G Collins
 * Licensed under the GNU GPL v3.0 license.
 *
 * NOTE: Requires jQuery framework (www.jquery.com)
 *  Tested with jQuery versions 1.7.0 to 1.11.1 and 2.0.0 to 2.1.1
 *
 */
(function ($, window, undefined) {
  var trackOn = false;
  var trackHandlers = true;
  var handlerTimeIndex = 0;
  var paused = false;
  var stoppedEventPropandDefault = "Event propagation was stopped and default action was prevented.";
  var con = $.triggerTrackerConsole || window.console;

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
    var isTrackable = !paused, et = eventType;

    if (isTrackable) {
      if (typeof (et) === "object") {
        et = et.type;
      }
      var incList = $.triggerTrackerIncludeList;
      if (incList && incList instanceof Array && incList.length > 0) {
        isTrackable = (incList.indexOf(et) > -1);
      }
      var excList = $.triggerTrackerExcludeList;
      if (isTrackable && excList && excList instanceof Array && excList.length > 0) {
        isTrackable = (excList.indexOf(et) === -1);
      }
    }
    return isTrackable;
  }

  function getVarNames(fnName, len) {
    var i = -1, varNames = [];
    // Default variable names to "arg0", "arg1", etc.
    for (; ++i < len;) {
      varNames.push("arg"+i);
    }

    if (fnName) {
      var args = /\(([^)]+)/.exec(fnName);
      if (args && args[1]) {
        len = (args = args[1].split(/\s*,\s*/)).length;
        for (i = 0; i < len; i++) {
          varNames[i] = args[i] || "arg"+i;
        }
      }
    }

    return varNames;
  }

  function handlerTracker(inst, originalHandler) {
    return function (evt) {
      var returnValue;
      var exception;
      var track = trackable(evt.type);
      var handlerKey = (++handlerTimeIndex) + ") Duration of handler";
      var fnName = functionName(originalHandler);
      var varNames = getVarNames(fnName, arguments.length);
      var originalEvent;
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
      else if (!paused) {
        con.log("HANDLER: (" + evt.type + ") " + fnName);
      }
      try {
        returnValue = originalHandler.apply(inst, arguments);
        if (track) {
          if (returnValue === false) {
            con.info("Returned false: "+stoppedEventPropandDefault);
          }
          else {
            con.log("Returned: ", returnValue);
            originalEvent = evt.originalEvent;
            if (originalEvent) {
              if (originalEvent.cancelBubble && originalEvent.defaultPrevented) {
                con.info(stoppedEventPropandDefault);
              }
              else {
                if (originalEvent.cancelBubble) {
                  con.info("Event propagation was stopped.");
                }

                if (originalEvent.defaultPrevented) {
                  con.info("Default action was prevented.");
                }
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
    };
  }

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
    else if (!paused) {
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
        var i, q;
        var handlerQueue = original_handlers.call(this, event, handlers);
        var newHandlerQueue = [];
        for (i = 0; i < handlerQueue.length; i++) {
          var handlerObj = $.extend({}, handlerQueue[i]);
          var oldHandlers = handlerObj.handlers;
          handlerObj.handlers = [];
          for (q = 0; q < oldHandlers.length; q++) {
            var oldHandler = $.extend({}, oldHandlers[q]);
            var oldHandlerFn = oldHandler.handler;
            oldHandler.handler = handlerTracker(this, oldHandlerFn);
            oldHandler.handler.originalHandler = oldHandlerFn;
            handlerObj.handlers.push(oldHandler);
          }
          newHandlerQueue.push(handlerObj);
        }
        return newHandlerQueue;
      };
    }
    else {
      $.fn.on = function onTracker(events) {
        var i, len, args;
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
          len = (args = [].slice.call(arguments)).length;
          for (i = 0; i < len; i++) {
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
      };
    }
  }

  function clearIncludeList(eventName) {
    $.triggerTrackerIncludeList = [];
  }

  function addIncludeEvent(eventName) {
    $.triggerTrackerIncludeList = $.triggerTrackerIncludeList.concat(eventName);
  }

  function clearExcludeList(eventName) {
    $.triggerTrackerExcludeList = [];
  }

  function addExcludeEvent(eventName) {
    $.triggerTrackerExcludeList = $.triggerTrackerExcludeList.concat(eventName);
  }

  function pause() {
    paused = true;
  }

  function resume() {
    paused = false;
  }

  clearIncludeList();
  clearExcludeList();

  window.ttrack = {
    'addExcludeEvent': addExcludeEvent,
    'addIncludeEvent': addIncludeEvent,
    'clearExcludeList': clearExcludeList,
    'clearIncludeList': clearIncludeList,
    'pause': pause,
    'resume': resume
  };

  if (con !== undefined && window.ttrackPoly) {
    ttrackPoly(con, functionName);
  }
})(jQuery, window);
