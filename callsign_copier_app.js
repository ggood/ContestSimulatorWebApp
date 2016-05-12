// Create the clobal audio context
context = new (window.AudioContext || window.webkitAudioContext)();

// Some cross-platform bulletproofing
if (!context.createGain) {
  context.createGain = context.createGainNode;
}
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

var keyer = new Keyer(context.destination);
var callsigns = [
  "KT8K",
  "N6RO",
  "N9RV",
  "N2IC",
];

$(function() {

  $("#start").click(function() {
    keyer.send("Start");
  });

  $("#end").click(function() {
    keyer.abortMessage();
  });

  $("#cw-pitch").knob({
    'draw' : function () {
        $(this.i).val(this.cv + ' Hz');
    },
    change : function (value) {
        console.log("PITCH change : " + value);
        keyer.setPitch(value);
    },
  });

  $("#cw-speed").knob({
    'draw' : function () {
        $(this.i).val(this.cv + ' WPM');
    },
    'change' : function (value) {
        console.log("SPEED change : " + value);
        keyer.setSpeed(value);
    },
  });

});
