jQuery triggerTracker
=====================

TriggerTracker is a tool for tracking jQuery events. It is a single JavaScript file that, when loaded, provides output to the browser's console related to jQuery event triggering and event handlers.

### Compatibility

triggerTracker has been tested with jQuery versions 1.7.0 through 1.11.0. I have not yet (March 13, 2014) tested with jQuery 2.x.

### How to use triggerTracker

Just load triggerTracker as soon as possible after loading jQuery.

```html
<script src="jQuery-1.11.0.min.js"></script>
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
  <script src="js/jQuery-1.11.0.js"></script>
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


### How triggerTracker works

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


