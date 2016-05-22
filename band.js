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
var Band = function(bandName) {
  this.bandName = bandName;
};

Band.prototype.setListenFrequency = function(value) {
  this.listenFrequency = value;
  console.log("Band " + this.bandName + " set to offset " + this.listenFrequency);
  for (var i = 0; i < this.stations.length; i++) {
    station = this.stations[i];
    offset = station.getFrequency() - this.listenFrequency;
    if (offset > 0 && offset < 2000) {
      console.log("Station " + station.getCallsign() + " offset " + offset);
      station.unMute(0.0);
      station.keyer.setPitch(offset);
    } else {
      station.mute(0.0);
    }
  }
}

Band.prototype.radioConnected = function(audioSink) {
  this.gainNode = context.createGain();
  this.gainNode.gain.value = 1.0;
  this.gainNode.connect(audioSink);

  this.noiseSource = new NoiseSource(this.gainNode);
  this.noiseSource.setEnabled(true);
  // TODO(ggood) add QRN source
  this.listenFrequency = 5000;

  const BAND_UPPER_FREQ = 10000;  // 10 KHz for now...
  this.stations = [];
  // TODO(ggood) remove hardcoded stations
  this.stations.push(new Station("N6RO", this.gainNode));
  this.stations.push(new Station("W6YX", this.gainNode));
  this.stations.push(new Station("W6SX", this.gainNode));
  this.stations.push(new Station("K9YC", this.gainNode));
  this.stations.push(new Station("K6XX", this.gainNode));
  this.stations.push(new Station("W7RN", this.gainNode));
  this.stations.push(new Station("N6TV", this.gainNode));
  this.stations.push(new Station("N5KO", this.gainNode));
  this.stations.push(new Station("W6OAT", this.gainNode));
  this.stations.push(new Station("W0YK", this.gainNode));
  this.stations.push(new Station("KX7M", this.gainNode));
  this.stations.push(new Station("W1RH", this.gainNode));
  this.stations.push(new Station("W6FB", this.gainNode));
  this.stations.push(new Station("KA3DRR", this.gainNode));
  this.stations.push(new Station("K6MM", this.gainNode));
  this.stations.push(new Station("AE6Y", this.gainNode));
  this.stations.push(new Station("WC6H", this.gainNode));
  this.stations.push(new Station("K5RC", this.gainNode));
  this.stations.push(new Station("W6JTI", this.gainNode));
  this.stations.push(new Station("KM6I", this.gainNode));
  this.stations.push(new Station("KE1B", this.gainNode));
  this.stations.push(new Station("K6MMM", this.gainNode));
  this.stations.push(new Station("K6RIM", this.gainNode));
  this.stations.push(new Station("W6NL", this.gainNode));
  this.stations.push(new Station("NA6O", this.gainNode));
  this.stations.push(new Station("K6MR", this.gainNode));
  this.stations.push(new Station("K6VVA", this.gainNode));
  this.stations.push(new Station("N6BV", this.gainNode));
  this.stations.push(new Station("K3EST", this.gainNode));
  this.stations.push(new Station("N6EE", this.gainNode));
  this.stations.push(new Station("N6IE", this.gainNode));
  this.stations.push(new Station("K6MI", this.gainNode));
  this.stations.push(new Station("N6ML", this.gainNode));
  this.stations.push(new Station("N6NZ", this.gainNode));
  this.stations.push(new Station("N6WM", this.gainNode));
  this.stations.push(new Station("ND2T", this.gainNode));
  this.stations.push(new Station("W6CT", this.gainNode));
  this.stations.push(new Station("W6RGG", this.gainNode));
  this.stations.push(new Station("WA6O", this.gainNode));
  for (var i = 0; i < this.stations.length; i++) {
    this.stations[i].setFrequency(Math.random() * 10000);
    this.stations[i].keyer.setSpeed(Math.floor(Math.random() * 20) + 30);
    this.stations[i].keyer.setRepeatInterval(Math.random() + 1.5);
    this.stations[i].setRfGain(Math.random());
    this.stations[i].callCq();
  }
}

Band.prototype.radioDisconnected = function() {
  for (var i = 0; i < this.stations.length; i++) {
    this.stations[i].stop();
  }
  this.noiseSource.setEnabled(false);
}

Band.prototype.setNoiseGain = function(value) {
  this.noiseSource.setGain(value);
}
