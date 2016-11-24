$( document ).ready(function() {
  console.log("READY");
  // Insert other on-load app initialization here
});

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

    //var leftNoise = new NoiseSource(leftGain);
    //var rightNoise = new NoiseSource(rightGain);

    leftGain.gain.value = 1.0;
    rightGain.gain.value = 1.0;

    // so2rcontroller for contolling l-r switching
    // each side of so2rcontroller is fed by a mixer, where the inputs
    // are: noise source, and a keyer

    so2rcontroller.init(context, context.destination);

    leftGain.connect(so2rcontroller.getRadio1Input());
    rightGain.connect(so2rcontroller.getRadio2Input());

    var leftStation = new Station("K6A", "sp");
    var rightStation = new Station("K6B", "sp");

    leftStation.init(context, leftGain);
    leftStation.keyer.setPitch(500);
    leftStation.keyer.setSpeed(25);
    leftStation.setRfGain(Math.random);

    rightStation.init(context, rightGain);
    rightStation.keyer.setPitch(700);
    rightStation.keyer.setSpeed(32);
    rightStation.setRfGain(Math.random);
    
    so2rcontroller.selectBothRadios();

    leftStation.callCq();
    rightStation.callCq();

  });

  $("#end").click(function() {
    console.log("Stop");
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
