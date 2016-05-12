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
      contest.stop();
      $("#run-button").html("Run");
    } else {
      contest.start();
      contest.finishCq();
      $("#run-button").html("Stop");
    }
  });

  $("#f1").click(function() {
    contest.myStation.callCq();
  });

  $("#f2").click(function() {
    contest.myStation.sendExchange();
  });

  $("#f3").click(function() {
    contest.myStation.sendTU();
  });

  $("#f4").click(function() {
    console.log("SENDING");
    contest.myStation.sendCallSign();
  });

  $("#f5").click(function() {
    // hiscall
  });

  $("#f6").click(function() {
    contest.myStation.send("QSO B4");
  });

  $("#f7").click(function() {
    contest.myStation.send("?");
  });

  $("#f8").click(function() {
    contest.myStation.send("NIL");
  });

  $("#af-gain").knob({
    change : function (value) {
        console.log("AF GAIN change : " + value / 100);
        contest.setVolume(value / 100);
    }
  });

  $("#mon-gain").knob({
    change : function (value) {
        console.log("MON GAIN change : " + value);
    }
  });

  $("#cw-pitch").knob({
    change : function (value) {
        console.log("PITCH change : " + value);
        contest.myStation.setPitch(value);
        contest.setFilterFrequency(value);
    },
    format : function(x) {
      return x + "xx";
    }
  });

  $("#filter-bw").knob({
    change : function (value) {
        console.log("FILTER bw change : " + value);
        contest.setFilterBandwidth(value);
    },
  });

  $("#slider").slider();

});
