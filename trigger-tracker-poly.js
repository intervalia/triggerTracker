/* @preserve
 * Trigger Tracker IE Polyfill(v.1.0.0)
 * by Michael G Collins (www.intervalia.com)
 * intervalia@gmail.com
 *
 * Copyright (c) 2013-2014 Michael G Collins
 * Licensed under the GNU GPL v3.0 license.
 *
 * NOTE: Requires trigger-tracker
 */
window.ttrackPoly = function ttrackPoly(con, functionName) {
  // Support IE 10 and below
  if (!con.groupCollapsed) {
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
    };
  }
  // Support IE8 and IE9
  if (!con.dir) {
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
    };
  }
};
