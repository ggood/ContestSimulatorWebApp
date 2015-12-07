var Contest = function() {
  this.activeStations = [];
  this.stationList = new StationList();

  this.isRunning = false;

  // My station
  this.myStation = new Station("KM6I");  // TODO remove hardconded callsign

  // Audio elements in signal chain
  // Pink noise source for background noise
  this.backgroundNoise = new NoiseSource();

  // Bandpass filter
  this.lpFilter = context.createBiquadFilter();
  this.lpFilter.type = "lowpass";
  this.lpFilter.Q.value = 3.0;
  this.lpFilter.frequency.value = 600;

  // Master gain
  this.masterGain = context.createGain();
  this.masterGain.gain.value = 1;

  console.log("Contest instance created");
};

Contest.prototype.start = function() {
  this.backgroundNoise.connect(this.lpFilter);
  this.lpFilter.connect(this.masterGain);
  this.masterGain.connect(context.destination);
  this.isRunning = true;
  console.log("Contest started " + this.isRunning);
};

Contest.prototype.stop = function() {
  this.masterGain.disconnect();
  this.isRunning = false;
};

Contest.prototype.finishCq = function() {
  this.activeStations.push(new Station(this.stationList.getCall()));
  for (var i = 0; i < this.activeStations.length; i++) {
    this.activeStations[i].callMe();
  }
}
