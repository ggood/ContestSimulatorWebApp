var Contest = function() {
  this.activeStations = [];
  this.stationList = new StationList();

  this.isRunning = false;

  // Audio elements in signal chain
  // Pink noise source for background noise
  this.backgroundNoise = new NoiseSource();

  // Bandpass filter chain
  this.lpFilter1 = context.createBiquadFilter();
  this.lpFilter1.type = "bandpass";
  this.lpFilter1.Q.value = 3.0;
  this.lpFilter1.frequency.value = 600;
  this.lpFilter2 = context.createBiquadFilter();
  this.lpFilter2.type = "bandpass";
  this.lpFilter2.Q.value = 3.0;
  this.lpFilter2.frequency.value = 600;

  // Master gain
  this.masterGain = context.createGain();
  this.masterGain.gain.value = 1.0;

  // My station
  this.myStation = new Station("KM6I", this.masterGain);  // TODO remove hardconded callsign

  console.log("Contest instance created");
};

Contest.prototype.start = function() {
  this.backgroundNoise.connect(this.lpFilter1);
  this.lpFilter1.connect(this.lpFilter2);
  this.lpFilter2.connect(this.masterGain);
  this.masterGain.connect(context.destination);
  this.isRunning = true;
  console.log("Contest started " + this.isRunning);
};

Contest.prototype.stop = function() {
  this.masterGain.disconnect();
  this.isRunning = false;
};

Contest.prototype.setFilterFrequency = function(value) {
  this.lpFilter1.frequency.value = value;
  this.lpFilter2.frequency.value = value;
};

Contest.prototype.setFilterBandwidth = function(value) {
  /*
   This conversion from bandwidth to Q us completely
   bogus and is just based on ear. Do the math at some point.
   */
  // Map 100->600 Hz to 10.0->2.5 Q (not inversion)
  q = 10 - (((value - 100.0) * (10 - 2.5)) / (600 - 100));

  console.log("setting q to " + q);
  this.lpFilter1.Q.value = q;
  this.lpFilter2.Q.value = q;
};

Contest.prototype.setVolume = function(value) {
  this.masterGain.gain.value = value;
};

Contest.prototype.finishCq = function() {
  this.activeStations.push(new Station(this.stationList.getCall(), this.lpFilter1));
  for (var i = 0; i < this.activeStations.length; i++) {
    this.activeStations[i].sendCallSign();
  }
}
