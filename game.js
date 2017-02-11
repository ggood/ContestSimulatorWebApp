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
  return station;
}

function replaceStation(index, active, audioSink) {
  active[index].stop();
  var station = mkStation(audioSink);
  active[index] = station;
  station.sendRepeated(station.getCallsign(), 2000);
}

function checkCallsign(callSign, radio) {
  active = (radio == 0) ? document.leftStations : document.rightStations;
  var audioSink = (radio == 0) ? leftGain : rightGain;
  var correct = false;
  for (si = 0; si < active.length; si++) {
    if (active[si].getCallsign() == callSign) {
      correct = true;
      console.log("Correct: " + callSign);
      document.score++;
      break;
    }
  }
  console.log("Incorrect: " + callSign);
  // If the call was correct, then make a new one. If it was wrong,
  // but we're only doing one station in each ear, then create a
  // new one.
  if (correct) {
    replaceStation(si, active, audioSink);
  } else if (MAX_STATIONS == 1) {
    replaceStation(0, active, audioSink);
  }
  return correct;
}

$(function() {
  $("#start").click(function() {
    console.log("Start");

    // Initialize callsign
    document.myCallsign = $("#my_callsign").val().toUpperCase();
    if (document.myCallsign == "") {
      alert("Please enter your callsign");
      return;
    }

    // Initialize score
    $("#score").val(0);

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

    document.myStatiom = []
    document.leftGain = leftGain;
    document.rightStations = []
    document.rightGain = rightGain;
    document.score = 0;
    document.myStation = mkStation(leftGain);
    document.myStation.setCallsign("W8UM");
    for (i = 0; i < MAX_STATIONS; i++) {
      document.rightStations.push(mkStation(rightGain));
    }

    so2rcontroller.selectBothRadios();

    // TODO(ggood) instead of keeping separate arrays for left and right
    // stations, keep one array of tuples (stn, audioSink). That will
    // clean up all of the timeout handlers
    for (i = 0; i < MAX_STATIONS; i++) {
      document.rightStations[i].callCq(2000);
    }

    // Start reaper for lonely stations who have given up sending their callSign
    // Runs every 1/2 second
    var reaperId = setInterval(function(){
      console.log("Checking for lonelies");
      for (i = 0; i < MAX_STATIONS; i++) {
        var station = document.rightStations[i];
        if (station.msgCounter < 1) {
          console.log("Station " + station.getCallsign() + " is lonely");
        }
      }
    }, 500);

  });



  $("#end").click(function() {
    console.log("Stop");
    document.myStation.keyer.stop();
    for (i = 0; i < MAX_STATIONS; i++) {
      document.rightStations[i].keyer.stop();
    }
  });

  // Intercept keystrkes we handle specially
  $(document).keydown(function(e) {
    if (typeof e.which == 'undefined') {
      return;
    }
    if (e.which == 9) {
      // tab key - switch focus
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
      var callsign = $("#callsign_left").val().toUpperCase();
      // If entry window empty, send cq
      if (callsign == "") {
        console.log("CQ");
      } else {
        // Put callsign in log

        $("#callsign_left").val("");
        var correct = checkCallsign(callsign, 0);
        // Update score
        $("#score").val(document.score);
        var icon = correct ? "<br>&#9989;" : "<br>&#10060;";
        $('#log_left').append(icon + callsign );
        // Keep scrolled to bottom
        $('#log_left').scrollTop($('#log_left')[0].scrollHeight - $('#log_left')[0].clientHeight);
      }
    }
  });

  $('#callsign_right').on('keypress', function (e) {
    if (e.keyCode == 13) {
      // Put callsign in log
      var callsign = $("#callsign_right").val().toUpperCase();
      $("#callsign_right").val("");
      var correct = checkCallsign(callsign, 1);
      // Update score
      $("#score").val(document.score);
      var icon = correct ? "<br>&#9989;" : "<br>&#10060;";
      $('#log_right').append(icon + callsign );
      // Keep scrolled to bottom
      $('#log_right').scrollTop($('#log_right')[0].scrollHeight - $('#log_right')[0].clientHeight);
    }
  });

});
