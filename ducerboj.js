MAX_STATIONS = 1

$( document ).ready(function() {
  console.log("READY");
  // Insert other on-load app initialization here
});

function mkStation(outputNode) {
  // Select a callsign at random
  var callsign = document.callsigns[Math.floor(Math.random()*document.callsigns.length)];
  // Create a station with that callsign in search and pounce mode
  var station = new Station(callsign, "sp")
  console.log(context);
  console.log(outputNode);
  station.init(context, outputNode);
  station.keyer.setPitch(Math.random() * 500 + 200);
  station.keyer.setSpeed(Math.random() * 30 + 15);
  station.setRfGain(Math.random);
  return station
}

$(function() {
  $("#start").click(function() {
    console.log("Start");
    // Wipe log fields
    $('#log_left').html("");
    $('#log_right').html("");
    // Start focused on left input
    $("#callsign_left").focus();

    // Initialize audio chain
    context = new (window.AudioContext || window.webkitAudioContext);

    var so2rcontroller = new SO2RController();
    // Any way to make these not global?
    leftGain = context.createGain();
    rightGain = context.createGain();

    leftGain.gain.value = 1.0;
    rightGain.gain.value = 1.0;

    so2rcontroller.init(context, context.destination);

    leftGain.connect(so2rcontroller.getRadio1Input());
    rightGain.connect(so2rcontroller.getRadio2Input());

    document.leftStations = []
    document.rightStations = []
    for (i = 0; i < MAX_STATIONS; i++) {
      document.leftStations.push(mkStation(leftGain));
      document.rightStations.push(mkStation(rightGain));
    }

    so2rcontroller.selectBothRadios();

    for (i = 0; i < MAX_STATIONS; i++) {
      document.leftStations[i].sendRepeated(document.leftStations[i].getCallsign(), 2000);
      document.rightStations[i].sendRepeated(document.rightStations[i].getCallsign(), 2000);
    }

  });

  $("#end").click(function() {
    console.log("Stop");
    for (i = 0; i < MAX_STATIONS; i++) {
      document.leftStations[i].keyer.stop();
      document.rightStations[i].keyer.stop();
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

  $("#reset_left").click(function() {
    console.log("Reset left");
    for (i = 0; i < MAX_STATIONS; i++) {
      document.leftStations[i].cancelRepeated();
      document.leftStations[i].stop();
      var newStation = mkStation(leftGain);
      document.leftStations[i] = newStation;
      setTimeout(function() {newStation.sendRepeated(newStation.getCallsign(), 2000)}, 2000);
    }
  });

  $("#reset_right").click(function() {
    console.log("Reset right");
    for (i = 0; i < MAX_STATIONS; i++) {
      document.rightStations[i].cancelRepeated();
      document.rightStations[i].stop();
      var newStation = mkStation(rightGain);
      document.rightStations[i] = newStation;
      setTimeout(function() {newStation.sendRepeated(newStation.getCallsign(), 2000)}, 2000);
    }
  });

});
