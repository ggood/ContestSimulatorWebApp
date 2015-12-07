// Create the clobal audio context
context = new (window.AudioContext || window.webkitAudioContext)();

// Some cross-platform bulletproofing
if (!context.createGain)
  context.createGain = context.createGainNode;
if (!context.createDelay)
  context.createDelay = context.createDelayNode;
if (!context.createScriptProcessor)
  context.createScriptProcessor = context.createJavaScriptNode;

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
return  window.requestAnimationFrame       ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame    ||
  window.oRequestAnimationFrame      ||
  window.msRequestAnimationFrame     ||
  function( callback ){
  window.setTimeout(callback, 1000 / 60);
};
})();
// end cross-platform bulletproofing

var contest = new Contest();

$(function() {

  $("#run-button").click(function() {
    if (contest.isRunning) {
      console.log("WAS RUNNING");
      contest.stop();
      $("#run-button").html("Run");
    } else {
      console.log("WAS NOT RUNNING");
      contest.start();
      contest.finishCq();
      $("#run-button").html("Stop");
    }
  });

  $(".knob").knob({
    /*change : function (value) {
        //console.log("change : " + value);
    },
    release : function (value) {
        console.log("release : " + value);
    },
    cancel : function () {
        console.log("cancel : " + this.value);
    },*/
    draw: function() {

      // "tron" case
      if (this.$.data('skin') == 'tron') {

        var a = this.angle(this.cv) // Angle
          ,
          sa = this.startAngle // Previous start angle
          ,
          sat = this.startAngle // Start angle
          ,
          ea // Previous end angle
          , eat = sat + a // End angle
          ,
          r = true;

        this.g.lineWidth = this.lineWidth;

        this.o.cursor && (sat = eat - 0.3) && (eat = eat + 0.3);

        if (this.o.displayPrevious) {
          ea = this.startAngle + this.angle(this.value);
          this.o.cursor && (sa = ea - 0.3) && (ea = ea + 0.3);
          this.g.beginPath();
          this.g.strokeStyle = this.previousColor;
          this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sa, ea, false);
          this.g.stroke();
        }

        this.g.beginPath();
        this.g.strokeStyle = r ? this.o.fgColor : this.fgColor;
        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, sat, eat, false);
        this.g.stroke();

        this.g.lineWidth = 2;
        this.g.beginPath();
        this.g.strokeStyle = this.o.fgColor;
        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
        this.g.stroke();

        return false;
      }
    }
  });

  // Example of infinite knob, iPod click wheel
  var v, up = 0,
    down = 0,
    i = 0,
    $idir = $("div.idir"),
    $ival = $("div.ival"),
    incr = function() {
      i++;
      $idir.show().html("+").fadeOut();
      $ival.html(i);
    },
    decr = function() {
      i--;
      $idir.show().html("-").fadeOut();
      $ival.html(i);
    };
  $("input.infinite").knob({
    min: 0,
    max: 20,
    stopper: false,
    change: function() {
      if (v > this.cv) {
        if (up) {
          decr();
          up = 0;
        } else {
          up = 1;
          down = 0;
        }
      } else {
        if (v < this.cv) {
          if (down) {
            incr();
            down = 0;
          } else {
            down = 1;
            up = 0;
          }
        }
      }
      v = this.cv;
    }
  });
});
