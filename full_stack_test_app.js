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


var radio1 = new Radio();
var band1 = new Band("40m");

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
    context = new (window.AudioContext || window.webkitAudioContext)
    radio1.setAudioSink(context.destination);
    radio1.setBand(band1);
    band1.setListenFrequency(0);
  });

  $("#stop").click(function() {
    console.log("Stop simulation");
    radio1.stop();
  });

  $("#frequency").on('input', function() {
    newFrequency = $('#frequency').val();
    setFrequency(newFrequency, radio1);
  });

  $("#frequency").keyup(function(e) {
    frequency = parseInt($('#frequency').val());
    if (e.which == 38) {
      // up arrow
      frequency = Math.min(frequency + 25, 10000);
    } else if (e.which == 40) {
      frequency = Math.max(frequency - 25, 0);
    }
    $('#frequency').val(frequency.toString());
    setFrequency(frequency, radio1);
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
