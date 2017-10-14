// ducerboj.js - an app to help train your brain to do SO2R
// (Single Operator 2 Radio) contesting.
//

MAX_STATIONS = 1

$( document ).ready(function() {
  console.log("READY");
  // Insert other on-load app initialization here
  document.lastRadioLogged = -1;
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
      if (document.lastRadioLogged != -1 && radio != document.lastRadioLogged) {
        document.score += 5;
      } else {
        document.score++;
      }
      document.lastRadioLogged = radio;
      break;
    }
  }
  console.log("Incorrect: " + callSign);
  // If the call was correct, then make a new one. If it was wrong,
  // but we're only doing one station in each ear, then create a
  // new one.
  if (correct) {
    replaceStation(si, active, audioSink);
  }
  return correct;
}

function animateScore(oldScore, newScore) {
  console.log("animate: " + oldScore + " " + newScore);
  if (newScore - oldScore > 4) {
    console.log("bonus");
    $("#score").removeClass("wrong");
    $("#score").removeClass("correct");
    $("#score").addClass("bonus");
  } else if (newScore - oldScore > 0) {
    console.log("correct");
    $("#score").removeClass("wrong");
    $("#score").addClass("correct");
    $("#score").aremoveClass("bonus");
  } else {
    console.log("wrong");
    $("#score").addClass("wrong");
    $("#score").removeClass("correct");
    $("#score").removeClass("bonus");
  }
}

$(function() {
  $("#start").click(function() {
    console.log("Start");

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

    document.leftStations = []
    document.leftGain = leftGain;
    document.rightStations = []
    document.rightGain = rightGain;
    document.score = 0;
    for (i = 0; i < MAX_STATIONS; i++) {
      document.leftStations.push(mkStation(leftGain));
      document.rightStations.push(mkStation(rightGain));
    }

    so2rcontroller.selectBothRadios();

    // TODO(ggood) instead of keeping separate arrays for left and right
    // stations, keep one array of tuples (stn, audioSink). That will
    // clean up all of the timeout handlers
    for (i = 0; i < MAX_STATIONS; i++) {
      document.leftStations[i].sendRepeated(document.leftStations[i].getCallsign(), 2000);
      document.rightStations[i].sendRepeated(document.rightStations[i].getCallsign(), 2000);
    }

    // Start reaper for lonely stations who have given up sending their callSign
    // Runs every 1/2 second. reaperId is intentionally global.
    reaperId = setInterval(function(){
      console.log("Checking for lonelies");
      for (i = 0; i < MAX_STATIONS; i++) {
        var station = document.leftStations[i];
        if (station.msgCounter < 1) {
          console.log("Station " + station.getCallsign() + " is lonely, spawining new station");
          replaceStation(i, document.leftStations, leftGain);
        }
        station = document.rightStations[i];
        if (station.msgCounter < 1) {
          console.log("Station " + station.getCallsign() + " is lonely, spawning new station");
          replaceStation(i, document.rightStations, rightGain);
        }
      }
    }, 500);

  });



  $("#end").click(function() {
    console.log("Stop");
    for (i = 0; i < MAX_STATIONS; i++) {
      document.leftStations[i].stop();
      document.leftStations[i].keyer.stop();
      document.rightStations[i].stop();
      document.rightStations[i].keyer.stop();
      clearTimeout(reaperId);
    }
  });

  $("#help").click(function() {
    console.log("Help");
    window.open("help.html", "helpWindow", "height=700,width=640,top=10,left=10");
  });

  // Intercept keystrokes we handle specially
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
      var oldScore = document.score;
      var correct = checkCallsign(callsign, 0);
      // Update score
      $("#score").val(document.score);
      var icon = correct ? "<br>&#9989;" : "<br>&#10060;";
      $('#log_left').append(icon + callsign );
      // Keep scrolled to bottom
      $('#log_left').scrollTop($('#log_left')[0].scrollHeight - $('#log_left')[0].clientHeight);
      // animate score
      animateScore(oldScore, document.score);
    }
  });

  $('#callsign_right').on('keypress', function (e) {
    if (e.keyCode == 13) {
      // Put callsign in log
      var callsign = $("#callsign_right").val().toUpperCase();
      $("#callsign_right").val("");
      var oldScore = document.score;
      var correct = checkCallsign(callsign, 1);
      // Update score
      $("#score").val(document.score);
      var icon = correct ? "<br>&#9989;" : "<br>&#10060;";
      $('#log_right').append(icon + callsign );
      // Keep scrolled to bottom
      $('#log_right').scrollTop($('#log_right')[0].scrollHeight - $('#log_right')[0].clientHeight);
      // animate score
      animateScore(oldScore, document.score);
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
