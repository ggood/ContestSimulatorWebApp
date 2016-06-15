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

var Station = function(callSign, mode) {
  // Station configuration
  this.callSign = callSign;
  this.mode = mode;
  this.state = "idle";

  // Station state (may change during contest)
  this.frequency = 0;
  this.exchange = "5nn";
  this.rfGain = 0.5;

  this.keyer = new Keyer();
  this.inactivityTimeout = null; // used for, e.g. calling cq if no answer
};

Station.prototype.init = function(context, audioSink) {
  this.context = context;
  this.audioSink = audioSink;

  this.rfGainControl = context.createGain();
  this.rfGainControl.gain.value = this.rfGain;
  this.rfGainControl.connect(audioSink);
  this.keyer.init(context, this.rfGainControl);

  if (this.mode == "run") {
    this.callCq();
  }
};

Station.prototype.setFrequency = function(frequency) {
  this.frequency = frequency;
};

Station.prototype.getFrequency = function() {
  return this.frequency;
};

Station.prototype.setExchange = function(exchange) {
  this.exchange = exchange;
};

Station.prototype.getCallsign = function() {
  return this.callSign;
};

Station.prototype.setRfGain = function(gain) {
  this.rfGain = gain;
};

Station.prototype.setMode = function(mode) {
  this.mode = mode;
};

Station.prototype.mute = function() {
  this.rfGainControl.gain.value = 0.0;
};

Station.prototype.unMute = function() {
  this.rfGainControl.gain.value = this.rfGain;
};

Station.prototype.stop = function() {
  this.keyer.stop();
};

Station.prototype.ifNothingHappens = function(fn, delay) {
  this.pendingAction = setTimeout(fn, delay);
  console.log("scheduled " + fn + "to happen in " + delay + "milliseconds");
}

/*
 Send a CQ
 */
Station.prototype.callCq = function() {
  self = this;
  callback = function() {
    self.state = "listening_after_cq";
    if (self.keyer.repeatInterval > 0.0) {
      self.ifNothingHappens(self.callCq.apply(self, [self.keyer.repeatInterval * 1000]));
    }
  }
  this.keyer.send("cq test " + this.callSign + " " + this.callSign, callback);
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

function isCallsign(s) {
  return (/^[0-9a-zA-Z\/]+$/).test(s);
}

function isCq(s) {
  //m = s.match(/^cq *test *([0-9a-zA-Z\/]+)$/i);
  m = s.match(/cq *test *(([0-9a-zA-Z\/]+) *)+/i);
  console.log(m);
  return (m != null);
}

function isMyReport(s) {
  re = new RegExp("^ *" + this.callSign + "..*$", "i");
  console.log(re);
  m = re.exec(s);
  console.log("isMyReport: " + (m != null));
  return m != null;
}

function isTu(s) {
  return (/^ *tu.*$/i).test(s);
}

function isFillRequest(s) {
  //if (/^ *\? *$/i).test(s) {
  if (/^ *tu.*$/i.test(s)) {
    return true;
  } else if (/^ *agn.*$/i.test(s)) {
    return true;
  } else {
    return false;
  }
}

Station.prototype.handleMessageRun = function(message, fromCall) {
  console.log("handleMessageRun: " + this.callSign + " handling " + message);
  switch (this.state) {
    case "listening_after_cq":
      if (isCallsign(message)) {
        this.state = "sending_report";
        this.keyer.send(message + " 5nn 3", function(){console.log("set state to SENT_REPORT")});
      }
      break;
  }
};


Station.prototype.handleMessageSearchAndPounce = function(message, fromCall) {
  console.log("handleMessageSearchAndPounce: " + this.callSign + " handling " + message);
  console.log("THIS IS " + this);
  switch (this.state) {
    case "idle":
      if (isCq(message)) {
        keyer.send(this.callSign);
        this.state = "wait_my_report";
      }
      break;
    case "wait_my_report":
      if (isMyReport(message)) {
        keyer.send(fromCall + " 5NN TU");
        this.state = "wait_confirm";
      } else {
        console.log("not my report");
      }
      break;
    case "wait_confirm":
      if (isTu(message)) {
        state = "idle"
      } else if (isFillRequest(message)) {
        keyer.send(fromCall + " 5NN TU");
        this.state = "wait_confirm";
      }
      break;
  }
};



Station.prototype.handleMessage = function(message, fromCall) {
  console.log("Station " + this.callSign + " (" + this.mode + " on " + this.frequency + ") handling " + message);
  console.log("In Station.handleMessage, this is " + this);
  if (this.mode == "run") {
    this.handleMessageRun(message, fromCall);
  } else {
    this.handleMessageSearchAndPounce(message, fromCall);
  }
};
