/*
  A Band object represents a frequency band used in a
  contest. The Band object manages the list of stations
  occupying the band and various noise sources (background
  noise, atmospheric noise bursts, and other various
  nasties). When the tuning frequency is set, the
  stations within the maximum bandwidth of the receiver
  are activated and audio from their simulated transmissions
  is sent to the audioSink.

  The Band object manages which of its stations are actually
  "turned on" (and therefore using CPU), so we model the
  frequency of the listener in the band object. This means
  that there can only one listener to each Band object.

  The Band object is responsible for the "rf gain" of all
  of the stations on the band.

  Band frequencies are in Hz offset from 0
 */
var Band = function(bandName, audioSink) {
  this.bandName = bandName;
  this.audioSink = audioSink;

  this.noiseSource = new NoiseSource(this.audioSink);
  // TODO(ggood) add QRN source
  this.listenFrequency = 5000;

  const BAND_UPPER_FREQ = 10000;  // 10 KHz for now...
  this.stations = [];
  // TODO(ggood) remove hordcoded stations
  this.stations.push(new Station("N6RO", this.audioSink));
  this.stations.push(new Station("W6YX", this.audioSink));
  this.stations.push(new Station("W6SX", this.audioSink));
  this.stations.push(new Station("K9YC", this.audioSink));
  this.stations.push(new Station("K6XX", this.audioSink));
  this.stations.push(new Station("W7RN", this.audioSink));
  this.stations.push(new Station("N6TX", this.audioSink));
  this.stations.push(new Station("N5KO", this.audioSink));
  this.stations.push(new Station("W6OAT", this.audioSink));
  for (var i = 0; i < this.stations.length; i++) {
    this.stations[i].setFrequency(i * 1000);   // for now, uniform spacing
}

};

Band.prototype.setListenFrequency = function(value) {
  this.listenFrequency = value;
  console.log("Band " + this.bandName + " set to offset " + this.listenFrequency);
  // TODO(ggood):
  // based on maximum rx bandwith and rx freq, figure out which stations
  // can be heard and enable only them. Then calculate the expected sidetone
  // from each and update the station objects.
}
