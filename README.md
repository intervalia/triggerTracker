jQuery triggerTracker
=====================

TriggerTracker is a tool for tracking jQuery events. It is a single JavaScript file that, when loaded, provides output to the browser's console related to jQuery event triggering and event handlers.

## Compatability

triggerTracker has been tested with jQuery versions 1.7.0 through 1.11.1. And jQuery 2.0.0 to 2.1.1.

## How to use triggerTracker

Just load triggerTracker as soon as possible after loading jQuery.

```html
<script src="jQuery-1.11.1.min.js"></script>
<script src="trigger-tracker.js"></script>
```

**If possible add some code to conditionaly load triggerTracker.**

Below is some sample code to conditionaly load triggerTracker within the client-side code.

```html
<!DOCTYPE html>
<html>
<head>
  <title>triggerTracker conditional load</title>
  <style>
    .selected {
      background-color: #FFFFDD;
    }
  </style>
  <script src="js/jQuery-1.11.1.js"></script>
  <script>
    function addTriggerTracker() {
      var tag = document.createElement("script"),
          head = document.getElementsByTagName("head");

      tag.setAttribute("src", "js/trigger-tracker.js");
      head[0].appendChild(tag);
    }
    (function loader() {
      var i, parts;
      if (window.location.search) {
        i = (parts = window.location.search.substr(1).split("&")).length;
        while (i) {
          if (parts[--i] === "ttrack") {
            addTriggerTracker();
            break;
          }
        }
      }
    })();


    $(document).ready(function () {
      $(".selector").on("click", function (evt) {
        var $body = $("body");
        $body.toggleClass("selected");
        if ($body.hasClass("selected")) {
          $body.trigger("selected");
        }
      });
    });
  </script>
</head>
<body>
  <button class="selector">Toggle Color</button>
</body>
</html>
```

The function `addTriggerTracker()` created the `<script src="trigger-tracker.js"></script>` tag and appends it to the `<head>` tag. *An optimization would be to have the code place the new `<script>` tag directly after the running code*


## How triggerTracker works

Copy the above code and create a stand-alone HTML file. Load this file into your browser. Make sure that **jQuery** and **triggerTracker** are in the correct folder so they get loaded.

Once this HTML page loads open your developer tools to the console output tab. This could be Firebug, Chrome Tools, etc.

The console should be pretty much empty at this point.

Click on the **Toggle Color** button and the background will change to a yellow color. The console should also show some new text:

`HANDLER: (click) function (evt)`

In the console, click on the arrow just to the left of the new `HANDLER` text to open up the details of the event handler:

```
> HANDLER: (click) function (evt)
      Target:  <button class=​"selector">​Toggle Color​</button>
     Handler:  function (evt) {
                 var $body = $("body");
                 $body.toggleClass("selected");
                 if ($body.has("selected")) {
                   $body.trigger("selected");
                 }
               }
    Params:
      event:  jQuery.Event {originalEvent: MouseEvent, type: "click", isDefaultPrevented: function, timeStamp: 1394512570160, jQuery191028470917674712837: true…}
  > TRIGGER: (selected) body
    Returned:  undefined
    1) Duration of handler: 2.000ms
```


Click on the arrow just to the left of the `TRIGGER: (selected) body` to open the trigger details:

```
> HANDLER: (click) function (evt)
      Target:  <button class=​"selector">​Toggle Color​</button>
     Handler:  function (evt) {
                 var $body = $("body");
                 $body.toggleClass("selected");
                 if ($body.has("selected")) {
                   $body.trigger("selected");
                 }
               }
    Params:
      event:  jQuery.Event {originalEvent: MouseEvent, type: "click", isDefaultPrevented: function, timeStamp: 1394512570160, jQuery191028470917674712837: true…}
  > TRIGGER: (selected) body
      body
      Source:  [body.selected, prevObject: jQuery.fn.jQuery.init[1], context: document, selector: "body", jquery: "1.9.1", constructor: function…]
      Caller:  function (evt) {
                 var $body = $("body");
                 $body.toggleClass("selected");
                 if ($body.has("selected")) {
                   $body.trigger("selected");
                 }
               }
      1) Duration of trigger: 0.000ms
    Returned:  undefined
    1) Duration of handler: 2.000ms
```

TriggerTracker also keeps track of how long each event handler takes and how long each trigger event takes and can be used to locate long running processes. **The timing values are *skewed* since they include the amount of time taken by triggerTracker as well.**

Browser originating triggers do not show in triggerTracker. So we did not see a TRIGGER block for the 'click' event on the button. So if there are no handlers for a specific browser event, then you will see nothing new in the console.

More information can be found in the wiki: https://github.com/intervalia/triggerTracker/wiki

## New functions in version 1.0.0

I added a few new functions to version 1.0.0 that allows the user to pause and resume the trigger tracker output. As well as easier code to create an event include and exclude list.

All of these functions are accessed from the window.ttrack object.

### To pause the trigger-tracker output call the pause function from the browser's console:

```javascript
ttrack.pause();
```

### To resume the trigger-tracker output call the pause function from the browser's console:

```javascript
ttrack.resume();
```

### Limiting the events you see

To limit the events that trigger-tracker displays in the console you can use either `ttrack.addExcludeEvent()` or `ttrack.addIncludeEvent()`.

Say you didn't want to see any `mousemove` events. From the console you would type:

```javascript
ttrack.addExcludeEvent('mousemove');
```

If you wanted to exclude all mouse events, in the current version, you would have to call ttrack.addExcludeEvent() once per event.

```javascript
ttrack.addExcludeEvent('mousemove');
ttrack.addExcludeEvent('mouseup');
ttrack.addExcludeEvent('mousedown');
ttrack.addExcludeEvent('mouseover');
ttrack.addExcludeEvent('mouseout');
```

I play to add reqular expressions to these list in the future.

If you only wanted to see your custom event 'close-dialog' then you would enter the following from the console:

```javascript
ttrack.addIncludeEvent('close-dialog');
```

If you set values for both the include list and the exclude list you may not get any events since the lists are mutually exclusive.

To clear the two event list you can call either `ttrack.clearExcludeList()` or `ttrack.clearIncludeList()`. These two commands clear out their associated list of events.

If your include an exclude lists become a confusing mess, then you can clear them by entering the following in the console:

```javascript
ttrack.clearExcludeList();
ttrack.clearIncludeList();
```

#### $.triggerTrackerExcludeList and $.triggerTrackerIncludeList

The event lists are stored in the jQuery variables $.triggerTrackerExcludeList and $.triggerTrackerIncludeList. You can always manipulate these variables directly to remove an individual entry or just to have more control over the list.

**Again, at this time [2014-09-27], the entries in these lists must be exact matches of the event names, includeing case. I will improve this to use regular expressions and ignore case in the future.**

## IE and trigger-tracker-poly.

To help reduce the size of trigger-tracker I moved some polyfill code out of trigger-tracker.js and placed it into the file trigger-tracker-poly.js.

trigger-tracker-poly is **only** needed to polyfill some of the console output commands in the various version of IE.

If you are planning to run trigger-tracker in IE, then include trigger-tracker-poly.js before including trigger-tracker.js

```html
<script src="jQuery-1.11.1.min.js"></script>
<script src="trigger-tracker-poly.min.js"></script>
<script src="trigger-tracker.min.js"></script>
```

If you are not planning to run trigger-tracker on IE, then you don't need to include trigger-tracker-poly.js.

```html
<script src="jQuery-1.11.1.min.js"></script>
<script src="trigger-tracker.min.js"></script>
```

## gulpfile.js

I added a new gulpfile.js to allow for simple builds. This will auto-build trigger-tracker and trigger-tracker-poly.

The build process takes the current version, as of 2014-09-27 that is 1.0.0 and make a non-versioned copy of it. Then it minifies the code and saves it with the .min.js extension.
