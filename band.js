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
  this.stations.push(new Station("N6TX", this.gainNode));
  this.stations.push(new Station("N5KO", this.gainNode));
  this.stations.push(new Station("W6OAT", this.gainNode));
  this.stations.push(new Station("K6RM", this.gainNode));
  this.stations.push(new Station("KX7M", this.gainNode));
  this.stations.push(new Station("W1RH", this.gainNode));
  this.stations.push(new Station("W8UM", this.gainNode));
  this.stations.push(new Station("KA3DRR", this.gainNode));
  this.stations.push(new Station("W8LT", this.gainNode));
  this.stations.push(new Station("KT8K", this.gainNode));
  this.stations.push(new Station("WC6H", this.gainNode));
  this.stations.push(new Station("K3LR", this.gainNode));
  this.stations.push(new Station("K5ZD", this.gainNode));
  for (var i = 0; i < this.stations.length; i++) {
    this.stations[i].setFrequency(Math.random() * 10000);   // for now, uniform spacing
    this.stations[i].keyer.setSpeed(Math.floor(Math.random() * 20) + 20);
    this.stations[i].keyer.setRepeatInterval(Math.random() + 0.5);
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
