/*
A Station object represents a participant in a
contest. It has a callsign, a current frequency,
a morse keyer, and a set of methods that are
called to simulate station behavior, such as
calling CQ. It also has other configuration to
make the station unique, such as a contest exchange.

Frequencies are expressed as an offset from a
base frequency. The units are hertz.
*/

var Station = function(callSign, audioSink) {
  // Station configuration
  this.callSign = callSign;
  this.keyer = new Keyer(audioSink);

  // Station state (may change during contest)
  this.frequency = 0;
  this.exchange = "5nn";
};

Station.prototype.setFrequency = function(frequency) {
  this.frequency = frequency;
};

Station.prototype.setExchange = function(exchange) {
  this.exchange = exchange;
};

/*
 Send a CQ
 */
Station.prototype.callCq = function() {
  this.keyer.send("cq test " + this.callSign + " " + this.callSign);
};

/*
 Send the contest exchange
 */
Station.prototype.sendExchange = function() {
  this.send(this.exchange);
};

/*
 Send my callsign
 */
Station.prototype.sendCallSign = function() {
  this.send(this.callSign);
};

/*
 Send TU + Callsign
 */
Station.prototype.sendTU = function() {
  this.send("tu " + this.callSign);
};
