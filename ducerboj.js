MAX_STATIONS = 3

$( document ).ready(function() {
  console.log("READY");
  // Insert other on-load app initialization here
});

function mkStation(outputNode) {
  var callsign = document.callsigns[Math.floor(Math.random()*document.callsigns.length)];
  var station = new Station(callsign, "sp")
  station.init(context, outputNode);
  station.keyer.setPitch(Math.random() * 500 + 200);
  station.keyer.setSpeed(Math.random() * 30 + 15);
  station.setRfGain(Math.random);
  return station
}

$(function() {
  $("#start").click(function() {
    console.log("Start");
    $('#log_left').html("");
    $('#log_right').html("");
    $("#callsign_left").focus();

    // Initialize audio chain
    context = new (window.AudioContext || window.webkitAudioContext);

    var so2rcontroller = new SO2RController();
    var leftGain = context.createGain();
    var rightGain = context.createGain();

    leftGain.gain.value = 1.0;
    rightGain.gain.value = 1.0;

    so2rcontroller.init(context, context.destination);

    leftGain.connect(so2rcontroller.getRadio1Input());
    rightGain.connect(so2rcontroller.getRadio2Input());

    leftStations = []
    rightStations = []
    for (i = 0; i < MAX_STATIONS; i++) {
      leftStations.push(mkStation(leftGain));
      rightStations.push(mkStation(rightGain));
    }

    so2rcontroller.selectBothRadios();

// TODO launch each station sending its call. Max say 5 times,
// if entered in UI, stop and move on to next call. If not
// entered, maybe register a penalty, move on to next call.
    for (i = 0; i < MAX_STATIONS; i++) {
      leftStations[i].callCq(2);
      rightStations[i].callCq(2);
    }

  });

  $("#end").click(function() {
    console.log("Stop");
    for (i = 0; i < MAX_STATIONS; i++) {
      leftStations[i].keyer.stop();
      rightStations[i].keyer.stop();
    }
  });

  // Intercept keystrkes we handle specially
  $(document).keydown(function(e) {
    if (typeof e.which == 'undefined') {
      return;
    }
    if (e.which == 9) {
      e.preventDefault();
      if ($("#callsign_left").is(":focus")) {
        console.log("Focus Right");
        $("#callsign_right").focus();
      } else {
        console.log("Focus Left");
        $("#callsign_left").focus();
      }
    }
  });

  $('#callsign_left').on('keypress', function (e) {
    if (e.keyCode == 13) {
      // Put callsign in log
      var callsign = $("#callsign_left").val().toUpperCase();
      $("#callsign_left").val("");
      console.log("Log " + callsign);
      $('#log_left').append("<br>&#9989;" + callsign );
      // Keep scrolled to bottom
      $('#log_left').scrollTop($('#log_left')[0].scrollHeight - $('#log_left')[0].clientHeight);
    }
  });

  $('#callsign_right').on('keypress', function (e) {
    if (e.keyCode == 13) {
      // Put callsign in log
      var callsign = $("#callsign_right").val().toUpperCase();
      $("#callsign_right").val("");
      console.log("Log " + callsign);
      $('#log_right').append("<br>&#10060;" + callsign );
      // Keep scrolled to bottom
      $('#log_right').scrollTop($('#log_right')[0].scrollHeight - $('#log_right')[0].clientHeight);
    }
  });
});
