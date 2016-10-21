/*
  A Radio object represents a contest radio. It contains
  controls for whatever simulated features we want to
  enable.

  A Radio may be tuned to one band at a time.

  Initially, the Radio object has controls for:
  - tuned frequency
  - af gain
  - filter bandwidth
 */
var Radio = function() {
  this.audioSink = null;
  this.band = null;  // If not tuned to a band, no audio is produced
};

Radio.prototype.init = function(context, audioSink) {
  this.context = context;
  this.audioSink = audioSink;
  // AF Gain setup
  this.afGain = context.createGain();
  this.afGain.gain.value = 1.0;  // Unity gain
  this.afGain.connect(this.audioSink);
  // Sidetone gain
  this.sidetoneGain = context.createGain();
  this.sidetoneGain.gain.value = 1.0;
  this.sidetoneGain.connect(this.audioSink);
  // Filter setup
  this.filterBw = 500;  // Default filter bandwidth
  // Bandpass filter chain
  // TODO(ggood) - may need multiple filters in series
  this.filterBank = [];
  this.filterBank.push(context.createBiquadFilter());
  this.filterBank.push(context.createBiquadFilter());
  this.filterBank.push(context.createBiquadFilter());
  for (var i = 0; i < this.filterBank.length; i++) {
    this.filterBank[i].type = "bandpass";
    this.filterBank[i].Q.value = 3.0;  // Default Q
    this.filterBank[i].frequency.value = 600;  // Default center frequency
  }
  for (var i = 0; i < this.filterBank.length; i++) {
    if (i < this.filterBank.length - 1) {
      this.filterBank[i].connect(this.filterBank[i + 1]);
    } else {
      this.filterBank[i].connect(this.afGain);
    }
  }
  this.listenFrequency = 0;
  // Keyer setup
  this.keyer = new Keyer();
  this.keyer.init(this.context, this.sidetoneGain);

  console.log("Radio: initialized");
};

Radio.prototype.setAFGain = function(value) {
  this.afGain.gain.value = value;
};

Radio.prototype.mute = function() {
  this.afGain.disconnect();
};

Radio.prototype.unMute = function() {
  this.afGain.connect(this.audioSink);
};

Radio.prototype.setFilterBandwidth = function(value) {
  /*
   Set the bandpass filter to a given bandwidth.

   This conversion from bandwidth to Q is completely
   bogus and is just based on ear. Do the math at some point.
   */
  // Map 100->600 Hz to 10.0->2.5 Q (not inversion)
  console.log("Set filter bw to " + value);
  q = 10 - (((value - 100.0) * (10 - 2.5)) / (600 - 100));
  for (var i = 0; i < this.filterBank.length; i++) {
    this.filterBank[i].Q.value = q;
  }
  console.log("Set filter Q to " + q);
};

Radio.prototype.setFilterFrequency = function(value) {
  for (var i = 0; i < this.filterBank.length; i++) {
    this.filterBank[i].frequency.value = value;
  }
  console.log("Set filter frequency to " + value);
};

Radio.prototype.setBand = function(value) {
  this.band = value;
  this.band.init(this.context, this.filterBank[0]);
  //this.band.radioConnected(this.audioSink);
};

Radio.prototype.setFrequency = function(value) {
  if (this.band == null) {
    console.log("Radio: not connected to a band, ignoring frequency change")
    return;
  }
  this.listenFrequency = value;
  this.band.setListenFrequency(value);
};

Radio.prototype.sendMessage = function(message) {
  self = this;
  this.mute();
  this.keyer.send(message, function() {
    self.unMute();
    self.band.handleMessageEnd(message, self.listenFrequency);
  });
};

Radio.prototype.stop = function(value) {
  if (this.band != null) {
    this.band.radioDisconnected();
    this.keyer.stop();
    this.band = null;
  }
}
