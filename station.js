var Station = function(callSign) {
  this.callSign = callSign;
  var voiceOsc = context.createOscillator()
  // TODO create signal chain

  console.log("Station " + this.callSign + " created.");
};

Station.prototype.callMe = function() {
  console.log("Station " + this.callSign + " is calling.");
};
