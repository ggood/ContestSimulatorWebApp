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
var Radio = function(audioSink) {
  this.audioSink = audioSink;
  this.band = null;  // If not tuned to a band, no audio is produced
  // AF Gain setup
  this.afGain = context.createGain();
  this.afGain.gain.value = 1.0;  // Unity gain
  this.afGain.connect(this.audioSink);  // AF gain
  // Filter setup
  this.filterBw = 500;  // Default filter bandwidth
  // Bandpass filter chain
  // TODO(ggood) - may need multiple filters in series
  this.bpFilter = context.createBiquadFilter();
  this.bpFilter.type = "bandpass";
  this.bpFilter.Q.value = 3.0;  // Default Q
  this.bpFilter.frequency.value = 600;  // Default center frequency

};

Radio.prototype.setAFGain = function(value) {
  this.afGain.gain.value = value;
};

Radio.prototype.setFilterBandwidth = function(value) {
  /*
   Set the bandpass filter to a given bandwidth.

   This conversion from bandwidth to Q is completely
   bogus and is just based on ear. Do the math at some point.
   */
  // Map 100->600 Hz to 10.0->2.5 Q (not inversion)
  q = 10 - (((value - 100.0) * (10 - 2.5)) / (600 - 100));
  this.bpFilter.Q.value = q;
  console.log("Set filter Q to " + q);
};

Radio.prototype.setFilterFrequency = function(value) {
  this.bpFilter.frequency.value = value;
  console.log("Set filter frequency to " + value);
};

Radio.prototype.setBand = function(value) {
  this.band = value;
  this.band.radioConnected(this.bpFilter);
};

Radio.prototype.setFrequency = function(value) {
  if (this.band == null) {
    console.log("Radio: not connected to a band, ignoring frequency change")
    return;
  }
  this.band.setListenFrequency(value);
}
