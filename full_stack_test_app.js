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
var radio2 = new Radio();
var band1 = new Band("40m");
var band2 = new Band("80m");
var so2rcontroller = new SO2RController();
var keyer = new Keyer();

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

setGain = function(newGain, radio) {
  if (!isNaN(newGain)) {
    newGain = newGain / 100.0;
    radio.setAFGain(newGain);
  }
}

setNoiseGain = function(newGain, radio) {
  if (!isNaN(newGain)) {
    newGain = newGain / 100.0;
    radio.band.setNoiseGain(newGain);
  }
}

$( document ).ready(function() {
  console.log("READY");
  // Insert other on-load app initialization here
});

$(function() {

  // ========= global controls

  $("#start").click(function() {
    console.log("Start simulation");
    context = new (window.AudioContext || window.webkitAudioContext);

    so2rcontroller.init(context, context.destination);

    radio1.init(context, so2rcontroller.getRadio1Input());
    radio1.setBand(band1);
    radio2.init(context, so2rcontroller.getRadio2Input());
    radio2.setBand(band2);

    keyer.init(context, so2rcontroller.getKeyerInput());

    setFilterBandwidth(parseInt($('#bandwidth').val()), radio1);
    setFilterFrequency(parseInt($('#filter_frequency').val()), radio1);
    setFilterBandwidth(parseInt($('#bandwidth2').val()), radio2);
    setFilterFrequency(parseInt($('#filter_frequency2').val()), radio2);

    band1.setListenFrequency(0);
    band1.setNoiseGain(parseInt($('#noise_gain').val() / 100.0));
    band2.setListenFrequency(0);
    band2.setNoiseGain(parseInt($('#noise_gain2').val() / 100.0));
  });

  $("#stop").click(function() {
    console.log("Stop simulation");
    radio1.stop();
    radio2.stop();
  });

  $("#select-radio1").click(function() {
    console.log("Select radio 1");
    so2rcontroller.selectRadio1();
  });

  $("#select-radio2").click(function() {
    console.log("Select radio 2");
    so2rcontroller.selectRadio2();
  });

  $("#select-both").click(function() {
    console.log("Select both radios");
    so2rcontroller.selectBothRadios();
  });

  $("#radio1").click(function(e) {
   console.log("focus radio1");
   so2rcontroller.focusRadio1();
  });

  $("#radio2").click(function(e) {
   console.log("focus radio2");
   so2rcontroller.focusRadio2();
  });

  // ========= radio1 controls

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

  $("#bandwidth").keyup(function(e) {
    bandwidth = parseInt($('#bandwidth').val());
    if (e.which == 38) {
      // up arrow
      bandwidth = Math.min(bandwidth + 25, 2400);
    } else if (e.which == 40) {
      bandwidth = Math.max(bandwidth - 25, 100);
    }
    $('#bandwidth').val(bandwidth.toString());
    setFilterBandwidth(bandwidth, radio1);
  });

  $("#filter_frequency").on('input', function() {
    newFilterFrequency = $('#filter_frequency').val();
    setFilterFrequency(newFilterFrequency, radio1);
  });

  $("#filter_frequency").keyup(function(e) {
    filter_frequency = parseInt($('#filter_frequency').val());
    if (e.which == 38) {
      // up arrow
      filter_frequency = Math.min(filter_frequency + 25, 1800);
    } else if (e.which == 40) {
      filter_frequency = Math.max(filter_frequency - 25, 100);
    }
    $('#filter_frequency').val(filter_frequency.toString());
    setFilterFrequency(filter_frequency, radio1);
  });

  $("#noise_gain").on('input', function() {
    newGain = $('#noise_gain').val();
    if (newGain > 100) {
      newGain = 100;
      $("#noise_gain").val(newGain);
    }
    band1.setNoiseGain(newGain / 100.0  , radio1);
  });

  // ========= radio2 controls

  $("#frequency2").on('input', function() {
    newFrequency = $('#frequency2').val();
    setFrequency(newFrequency, radio2);
  });

  $("#frequency2").keyup(function(e) {
    frequency = parseInt($('#frequency2').val());
    if (e.which == 38) {
      // up arrow
      frequency = Math.min(frequency + 25, 10000);
    } else if (e.which == 40) {
      frequency = Math.max(frequency - 25, 0);
    }
    $('#frequency2').val(frequency.toString());
    setFrequency(frequency, radio2);
  });

  $("#gain2").on('input', function() {
    newGain = $('#gain2').val();
    if (newGain > 100) {
      newGain = 100;
      $("#gain2").val(newGain);
    }
    setGain(newGain, radio2);
  });

  $("#bandwidth2").on('input', function() {
    newBandwidth = $('#bandwidth2').val();
    setFilterBandwidth(newBandwidth, radio2);
  });

  $("#bandwidth2").keyup(function(e) {
    bandwidth = parseInt($('#bandwidth2').val());
    if (e.which == 38) {
      // up arrow
      bandwidth = Math.min(bandwidth + 25, 2400);
    } else if (e.which == 40) {
      bandwidth = Math.max(bandwidth - 25, 100);
    }
    $('#bandwidth2').val(bandwidth.toString());
    setFilterBandwidth(bandwidth, radio2);
  });

  $("#filter_frequency2").on('input', function() {
    newFilterFrequency = $('#filter_frequency2').val();
    setFilterFrequency(newFilterFrequency, radio2);
  });

  $("#filter_frequency2").keyup(function(e) {
    filter_frequency = parseInt($('#filter_frequency2').val());
    if (e.which == 38) {
      // up arrow
      filter_frequency = Math.min(filter_frequency + 25, 1800);
    } else if (e.which == 40) {
      filter_frequency = Math.max(filter_frequency - 25, 100);
    }
    $('#filter_frequency2').val(filter_frequency.toString());
    setFilterFrequency(filter_frequency, radio2);
  });

  $("#noise_gain2").on('input', function() {
    newGain = $('#noise_gain2').val();
    if (newGain > 100) {
      newGain = 100;
      $("#noise_gain2").val(newGain);
    }
    band2.setNoiseGain(newGain / 100.0  , radio2);
  });

  $("#f1").click(function() {
    console.log("F1");
    radio = so2rcontroller.getFocusedRadio();
    // BETTER WAY TO HANDLE THIS:
    // each radio has its own keyer
    // radio has a method send() that just delegates to the keyer
    // that way, the so2rcontroller doesn't need to be concerned with
    // routing audio from a single keyer. In a real station, the keying
    // audio would be coming out of the sidetone monitor of either
    // radio, so this is actually more like real life
    radio.mute();
    keyer.send("CQ TEST KM6I KM6I", function(){ console.log("DONE SENDING"); radio.unMute()});
  });

  $("#f2").click(function() {
    console.log("F2");
  });

  $("#f3").click(function() {
    console.log("F3");
  });

  $("#f4").click(function() {
    console.log("F4");
  });

  $("#f5").click(function() {
    console.log("F5");
  });

  $("#abort").click(function() {
    console.log("ABORT");
    keyer.abortMessage();
    so2rcontroller.getFocusedRadio().unMute();
  });

});
