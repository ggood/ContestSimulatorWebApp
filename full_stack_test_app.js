// Create the clobal audio co ntext
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


var radio1 = new Radio(context.destination);
var band1 = new Band("40m");
radio1.setBand(band1);

setFrequency = function(newFrequency, radio) {
  if (!isNaN(newFrequency)) {
    radio.setFrequency(newFrequency)
  }
}

setFilterBandwidth = function(newBandwidth, radio) {
  if (!isNaN(newBandwidth)) {
    radio.setFilterBandwidth(newBandwidth);
  }
}

setFilterFrequency = function(newFilterFrequency, radio) {
  if (!isNaN(newFilterFrequency)) {
    radio.setFilterFrequency(newFilterFrequency);
  }
}

setGain = function(newGain, station) {
  if (!isNaN(newGain)) {
    newGain = newGain / 100.0;
    station.keyer.setMonitorGain(newGain);
  }
}

setNoiseGain = function(newGain, radio) {
  if (!isNaN(newGain)) {
    newGain = newGain / 100.0;
    radio.band.setGain(newGain);
  }
}

$( document ).ready(function() {
  console.log("READY");
  // Insert other on-load app initialization here
});

$(function() {

  $("#start").click(function() {
    console.log("Start simulation");
  });

  $("#stop").click(function() {
    console.log("Stop simulation");
  });

  $("#frequency").on('input', function() {
    newFrequency = $('#frequency').val();
    setFrequency(newFrequency, radio1);
  });

  $("#gain").on('input', function() {
    newGain = $('#gain').val();
    if (newGain > 100) {
      newGain = 100;
      $("#gain").val(newGain);
    }
    setGain(newGain, radio1);
  });

  $("#bandwidth").on('input', function() {
    newBandwidth = $('#bandwidth').val();
    setFilterBandwidth(newBandwidth, radio1);
  });

  $("#noise_gain").on('input', function() {
    newGain = $('#noise_gain').val();
    if (newGain > 100) {
      newGain = 100;
      $("#noise_gain").val(newGain);
    }
    setNoiseGain(newGain, radio1);
  });
});
