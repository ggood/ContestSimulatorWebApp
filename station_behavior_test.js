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


var stn1 = new Station("W8UM", "sp");
var stn2 = new Station("KT8K", "sp");
var keyer = new Keyer();
var myCall = null;

setMyCall = function(myCall) {
  this.myCall = myCall;
};

sendMessage = function(msg) {
  var self = this;
  keyer.send(msg, function() {
    self.stn1.handleMessage(msg, self.myCall);
  })
};

$( document ).ready(function() {
  console.log("READY");
  // Insert other on-load app initialization here
});

$(function() {

  // ========= global controls

  $("#start").click(function() {
    console.log("Start simulation");
    context = new (window.AudioContext || window.webkitAudioContext);


    keyer_speed = parseInt($('#keyer_speed').val());
    stn1.init(context, context.destination);
    keyer.init(context, context.destination);
    keyer.setSpeed(keyer_speed);
    keyer.setPitch(610);
    stn1.keyer.setPitch(500);  // why are they both the same pitch?
    myCall = $("#mycall").val();
  });

  $("#stop").click(function() {
    console.log("Stop simulation");
    stn1.stop();
  });

  $("#mycall").keyup(function(e) {
    setMyCall($("#mycall").val());
  })


  $("#keyer_speed").keyup(function(e) {
    keyer_speed = parseInt($('#keyer_speed').val());
    if (e.which == 38) {
      // up arrow
      keyer_speed += 5;
    } else if (e.which == 40) {
      keyer_speed = Math.max(keyer_speed - 5, 5);
    }
    $('#keyer_speed').val(keyer_speed.toString());
    keyer.setSpeed(keyer_speed);
  });

  $("#f1").click(function() {
    sendMessage("CQ TEST " + myCall + " " + myCall);
  });

  $("#f2").click(function() {
    hiscall = $("#hiscall").val();
    sendMessage(hiscall + " 5NN");
  });

  $("#f3").click(function() {
    mycall = $("#mycall").val();
    sendMessage("TU " + mycall);
  });

  $("#f4").click(function() {
    mycall = $("#mycall").val();
    sendMessage(mycall);
  });

  $("#f5").click(function() {
    hiscall = $("#hiscall").val();
    sendMessage(hiscall);
  });

  $("#abort").click(function() {
    keyer.abortMessage();
  });

});
