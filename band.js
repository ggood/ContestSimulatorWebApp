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
  this.cwPitch = 610;  // TODO make this come from the radio
  // TODO remove hardcoded kber list
  this.kbers = ["N6RO", "W6YX", "W6SX", "K9YC", "K6XX", "W7RN", "N6TV",
                "N5KO", "W6OAT", "W0YK", "KX7M", "W1RH", "W6FB", "KA3DRR",
                "K6MM", "AE6Y", "WC6H", "K5RC", "W6JTI", "KM6I", "KE1B",
                "K6MMM", "K6RIM", "W6NL", "NA6O", "K6MR", "K6VVA", "N6BV",
                "K3EST", "N6EE", "N6IE", "K6MI", "N6ML", "N6NZ", "N6WM",
                "ND2T", "W6CT", "W6RGG", "WA6O"];

  this.stations = [];
  //for (var i = 0; i < this.kbers.length; i++) {
  for (var i = 0; i < 1; i++) {
    this.stations.push(new Station(this.kbers[i], "run"));
  }
};

Band.prototype.init = function(context, audioSink) {
  this.context = context;
  this.audioSink = audioSink;

  this.gainNode = context.createGain();
  this.gainNode.gain.value = 1.0;
  this.gainNode.connect(audioSink);

  this.noiseSource = new NoiseSource(this.gainNode);
  this.noiseSource.setEnabled(true);
  // TODO(ggood) add QRN source
  this.listenFrequency = 5000;

  const BAND_UPPER_FREQ = 1000;  // 10 KHz for now...

  for (var i = 0; i < this.stations.length; i++) {
    this.stations[i].init(this.context, this.gainNode);
    this.stations[i].setFrequency(Math.random() * BAND_UPPER_FREQ);
    this.stations[i].keyer.setSpeed(Math.floor(Math.random() * 20) + 25);
    // TODO(ggood) don't model repeats this way. Model them as the stations
    // making the decision about when to send. That way, all of the state
    // transitions are initiated by the station or my inbound messages.
    // TODO ggood repeat is station behavior this.stations[i].keyer.setRepeatInterval(Math.random() + 1.5);
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


Band.prototype.setListenFrequency = function(value) {
  this.listenFrequency = value;
  console.log("Band " + this.bandName + " set to offset " + this.listenFrequency);
  for (var i = 0; i < this.stations.length; i++) {
    station = this.stations[i];
    // Determine if we should be hearing this station, and
    // if so, cacluate the pitch.
    offset = station.getFrequency() - this.listenFrequency;
    if ((offset < this.cwPitch * 2) && (offset > -this.cwPitch) ){
      station.keyer.setPitch(offset + this.cwPitch);
      station.unMute();
    } else {
      station.mute();
    }
  }
}

Band.prototype.setNoiseGain = function(value) {
  this.noiseSource.setGain(value);
}

// TODO(ggood) do I need the following
//Band.prototype.startReceivingTransmission(senderCall, frequency, message) {
  // Indicate to the band that the local station is beginning to send
  // the given message at a particular freqeuncy.
//}

Band.prototype.finishReceivingTransmission = function(senderCall, frequency, message) {
  // Indicate to the band that the local station's message is now complete.
  // FInd all stations on the band that could hear this transmission and
  // forwaerd the message to them.
}

Band.prototype.finishReceivingCQ = function(senderCall, frequency) {
  // Indicate to the band that our station has sent a CQ on the given
  // frequency. The band will determine if calling station(s) respond
  // to the CQ.
  // TODO(ggod) for how, just always have one station respond
  this.respondingStation = new Station("N5UM");
  this.respondingStation.setFrequency(frequency);
  this.respondingStation.setMode("sp");
  this.respondingStation.handleMessageEnd("CQ TEST " + senderCall);
}

Band.prototype.handleMessageEnd = function(message, frequency) {
  console.log(this.bandName + " handling message end " + message + " on frequency " + frequency);

  for (var i = 0; i < this.stations.length; i++) {
    offset = this.stations[i].getFrequency() - frequency;
    if (Math.abs(offset) < 100) {
      this.stations[i].handleMessageEnd(message);
    }
  }
  //this.respondingStation = new Station("N5UM");
  //this.respondingStation.setFrequency(frequency);
  //this.respondingStation.setMode("sp");
  //this.respondingStation.handleMessageEnd(message);
}
