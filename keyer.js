/*

 A morse code keyer, based on HTML5 audio.

 Gordon Good velo27 [at] yahoo [dot] com

 License: None; use as you wish

 Limitations:
   - Schedules all audio events up front. This means the speed cannot
     be changed after the send method is called.

 */

// Morse constants
var INTER_CHARACTER = 2.5  // Time between letters
var INTER_WORD = 3.5  // Time between words
var RAMP = 0.010

function wpmToElementDuration(wpm) {
  // Convert a words-per-minute value to an element duration, expressed
  // in seconds.
  // Based on CODEX (60000 ms per minute / W * 60 dit values in CODEX)
  return 1.0 / wpm;
};

var Keyer = function(callSign) {
  // Keyer configuration
  this.callSign = callSign;
  this.speed = 25;  // in wpm
  this.repeatInterval = -1.0;  // Interval (in seconds) between repeats. Negative = disabled
  this.elementDuration = wpmToElementDuration(this.speed);
  this.startTime = 0;
  this.completionCallback = null;
  this.completionCallbackId = null;
  this.voxDelay = 250;  // Time from message end to unkey tx

  // Message sending state
  // Largest time at which we've scheduled an audio event
  this.latestScheduledEventTime = 0;

  // If keyer repeat is on, this is the pending timeout
  this.currentTimeout = null;
};

Keyer.prototype.init = function(context, audioSink) {
  this.context = context;
  this.audioSink = audioSink;

  // Signal chain; oscillator -> gain (keying) -> gain (monitor volume)
  this.voiceOsc = context.createOscillator();
  this.voiceOsc.type = 'sine';
  this.voiceOsc.frequency.value = 500;
  this.voiceOsc.start();

  // envelopeGain control is used to generate keying envelope
  this.envelopeGain = context.createGain();
  this.envelopeGain.gain.value = 0.0;
  this.monitorGain = context.createGain();
  this.monitorGain.gain.value = 1.0;

  this.voiceOsc.connect(this.envelopeGain);
  this.envelopeGain.connect(this.monitorGain);
  this.monitorGain.connect(this.audioSink);
};

Keyer.prototype.stop = function() {
  this.abortMessage();
  // Just disconnecting the oscillator seems sufficient to cause
  // CPU usage to drop when the keyer is stoppped. Previously,
  // we did this.voiceOsc.stop();
  this.voiceOsc.disconnect();
};

Keyer.prototype.setPitch = function(pitch) {
  // Schedule the frequency change in the future, otherwise
  // we will hear it sweep from the current to the new
  // frequency.
  console.log(this.callSign + " set pitch " + pitch)
  var now = context.currentTime;
  this.voiceOsc.frequency.setValueAtTime(pitch, now);
};


Keyer.prototype.setMonitorGain = function(gain) {
  this.monitorGain.gain.value = gain;
};


Keyer.prototype.setSpeed = function(wpm) {
  this.speed = wpm;
  this.elementDuration = wpmToElementDuration(this.speed);
};


Keyer.prototype.isSending = function() {
  return (this.latestScheduledEventTime > context.currentTime);
};


Keyer.prototype.abortMessage = function() {
  this.setRepeatInterval(-1.0);
  this.envelopeGain.gain.cancelScheduledValues(this.startTime);
  this.envelopeGain.gain.linearRampToValueAtTime(0.0, context.currentTime + RAMP);
  this.latestScheduledEventTime = 0.0;
  if (this.completionCallbackId != null) {
    clearTimeout(this.completionCallbackId);
    setTimeout(this.completionCallback, 0);
    this.completionCallback = null;
  }

};

Keyer.prototype.setRepeatInterval = function(interval) {
  if (interval < 0.0) {
    if (this.currentTimeout != null) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
  }
  this.repeatInterval = interval;
  console.log("Keyer: repeating every " + interval + " seconds");
};


Keyer.prototype.blab = function(text) {
  console.log("Keyer.blab(" + text + ") called at " + context.currentTime);
};

/*
 Send the given text.
 */
Keyer.prototype.send = function(text, completionCallback) {
  //console.log(this.callSign + " send " + text)
  var self = this;
  if (typeof completionCallback === "undefined") {
    this.completionCallback = null;
  } else {
    this.completionCallback = completionCallback;
  }

  //console.log("Keyer " + this.callSign + " sending " + text + " at freq " + this.voiceOsc.frequency.value);
  // Send morse
  var timeOffset = context.currentTime;
  this.startTime = timeOffset;

  // Morse sending functions
  function dot(gainNode, elementDuration) {
    // Send a dot
    timeOffset += RAMP;
    gainNode.linearRampToValueAtTime(1.0, timeOffset);
    timeOffset += elementDuration;
    gainNode.linearRampToValueAtTime(1.0, timeOffset);

    // Inter-element space
    timeOffset += RAMP;
    gainNode.linearRampToValueAtTime(0.0, timeOffset);
    timeOffset += elementDuration;
    gainNode.linearRampToValueAtTime(0.0, timeOffset);

    // Remember this time
    self.latestScheduledEventTime = timeOffset;
  }

  function dash(gainNode, elementDuration) {
    // Send a dash
    timeOffset += RAMP;
    gainNode.linearRampToValueAtTime(1.0, timeOffset);
    timeOffset += 3 * elementDuration;
    gainNode.linearRampToValueAtTime(1.0, timeOffset);

    // Inter-element space
    timeOffset += RAMP;
    gainNode.linearRampToValueAtTime(0.0, timeOffset);
    timeOffset += elementDuration;
    gainNode.linearRampToValueAtTime(0.0, timeOffset);

    // Remember this time
    self.latestScheduledEventTime = timeOffset;
  }

  function letter_space(gainNode, elementDuration) {
    // Wait INTER_CHARACTER units
    timeOffset += RAMP;
    gainNode.linearRampToValueAtTime(0.0, timeOffset);
    timeOffset += INTER_CHARACTER * elementDuration;
    gainNode.linearRampToValueAtTime(0.0, timeOffset);

    // Remember this time
    self.latestScheduledEventTime = timeOffset;
  }

  function word_space(gainNode, elementDuration) {
    // Wait INTER_WORD units
    timeOffset += RAMP;
    gainNode.linearRampToValueAtTime(0.0, timeOffset);
    timeOffset += INTER_WORD * elementDuration;
    gainNode.linearRampToValueAtTime(0.0, timeOffset);

    // Remember this time
    self.latestScheduledEventTime = timeOffset;
  }

  // keyer send() implementation
  // Convert text to string representing morse dots and dashes
  var morseLetters = []
  for (var i = 0, len = text.length; i < len; i++) {
    morseLetters.push(toMorse(text[i]));
  }
  morseString = morseLetters.join("S");

  this.envelopeGain.gain.linearRampToValueAtTime(0, timeOffset);

  // TODO(ggood) instead of scheduling all of the events here, only
  // schedule up to, say, 500 milliseconds into the future, and schedule
  // a callback in which we will schedule another 500 ms, etc.
  for (var i = 0, len = morseString.length; i < len; i++) {
    switch (morseString[i]) {
      case ".":
        dot(this.envelopeGain.gain, this.elementDuration);
        break;
      case "-":
        dash(this.envelopeGain.gain, this.elementDuration);
        break;
      case "S":
        letter_space(this.envelopeGain.gain, this.elementDuration);
        break;
      case "W":
        word_space(this.envelopeGain.gain, this.elementDuration);
        break;
      default:
        break;
    }
  }

  if (this.completionCallback != null) {
    var fireTime = ((self.latestScheduledEventTime - context.currentTime) * 1000);
    this.completionCallbackId = setTimeout(this.completionCallback, fireTime + this.voxDelay);
  }

  if (this.repeatInterval > 0.0 && false) {  // XXX(ggood) added & !false to skip this code while I move cq repeat into station object
    // Arrange to send again in the future
    var delay =  ((self.latestScheduledEventTime + this.repeatInterval - context.currentTime) * 1000);
    // The following bind() call creates a new function with the "this" bound
    // to the "this" in this context. We need to do this so we have all of
    // the current context in the future invocation.
    this.currentTimeout = setTimeout(this.send.bind(this, text), delay);
  }

  function toMorse(char) {
    var morseMap = {
      "a": ".-",
      "b": "-...",
      "c": "-.-.",
      "d": "-..",
      "e": ".",
      "f": "..-.",
      "g": "--.",
      "h": "....",
      "i": "..",
      "j": ".---",
      "k": "-.-",
      "l": ".-..",
      "m": "--",
      "n": "-.",
      "o": "---",
      "p": ".--.",
      "q": "--.-",
      "r": ".-.",
      "s": "...",
      "t": "-",
      "u": "..-",
      "v": "...-",
      "w": ".--",
      "x": "-..-",
      "y": "-.--",
      "z": "--..",
      "0": "-----",
      "1": ".----",
      "2": "..---",
      "3": "...--",
      "4": "....-",
      "5": ".....",
      "6": "-....",
      "7": "--...",
      "8": "---..",
      "9": "----.",
      "?": "..--..",
      "/": "-..-.",
      ".": ".-.-.-",
      ",": "--..--",
      " ": "W",
    }
    char = char.toLowerCase()
    if (char in morseMap) {
      return morseMap[char];
    } else {
      return "";
    }
  }
}
