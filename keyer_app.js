
keyer = null;
speed = 25;

$(function() {

  $("#send").click(function() {
    console.log("Click")
    context = new (window.AudioContext || window.webkitAudioContext)
    keyer = new Keyer(context.destination);
    keyer.setSpeed(speed);
    if (keyer.isSending()) {
        console.log("Can't send now, keyer sending");
    } else {
        keyer.send(document.getElementById("send_text").value);
    }
  });

  $("#cancel").click(function() {
    if (keyer != null) {
      keyer.abortMessage();
      keyer = null;
      if (context.close) { context.close(); }
    }
  });

  $("#pitch").on('input', function() {
    newPitch = $('#pitch').val();
    if (!isNaN(newPitch)) {
      keyer.setPitch(newPitch);
    }
  });

  $("#speed").on('input', function() {
    newSpeed = $('#speed').val();
    if (!isNaN(newSpeed)) {
      speed = newSpeed;
    }
  });
});
