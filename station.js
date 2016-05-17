// Morse constants
var INTER_CHARACTER = 2.5
var RAMP = 0.005

var Station = function(callSign, audioSink) {
  // Station configuration
  this.callSign = callSign;
  this.elementDuration = 0.04;  // TODO use WPM
  this.stationGain = 1.0;
  this.audioSink = audioSink;
  this.repeatDelay = -1.0;  // in milliseconds

  // Signal chain
  this.voiceOsc = context.createOscillator();
  this.voiceOsc.type = 'sine';
  this.voiceOsc.frequency.value = 100 + Math.random() * 900;
  this.voiceOsc.start();
  // Gain control is used to generate keying envelope and for overall
  // goin. TODO(ggood) QSB will be easier to implement if the keying
  // gain control is separate from the overall station gain.
  this.gainAndEnvelope = context.createGain();
  this.gainAndEnvelope.gain.value = 0.0;

  this.voiceOsc.connect(this.gainAndEnvelope);
  // TODO(ggood) should we only connect when sending?
  this.gainAndEnvelope.connect(this.audioSink);

  // If set, we will mute this audio gain node when sending
  this.rMixer = null;

};

Station.prototype.setRxMixer = function(mixer) {
  this.rxMixer = mixer;
};

Station.prototype.setPitch = function(pitch) {
  this.voiceOsc.frequency.value = pitch;
};

Station.prototype.getCallSign = function() {
  return this.callSign;
};

/*
 Send a CQ
 */
Station.prototype.callCq = function() {
  console.log("Station " + this.callSign + " instructed to send cq");
  this.send("cq test " + this.callSign + " " + this.callSign);
};

/*
 Send the contest exchange
 */
Station.prototype.sendExchange = function() {
  this.send("5nn ca");
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

Station.prototype.setRepeatDelay = function(delay) {
  this.repeatDelay = delay;
}

/*
 Send the given text.
 */
Station.prototype.send = function(text) {

  // Send morse
  var timeOffset = context.currentTime

  // Morse sending functions
  function dot(gainNode, stationGain, elementDuration) {
    // Send a dot
    timeOffset += RAMP;
    gainNode.linearRampToValueAtTime(stationGain, timeOffset);
    timeOffset += elementDuration;
    gainNode.linearRampToValueAtTime(stationGain, timeOffset);

    // Inter-element space
    timeOffset += RAMP;
    gainNode.linearRampToValueAtTime(0, timeOffset);
    timeOffset += elementDuration;
    gainNode.linearRampToValueAtTime(0, timeOffset);
  }

  function dash(gainNode, stationGain, elementDuration) {
    // Send a dash
    timeOffset += RAMP;
    gainNode.linearRampToValueAtTime(stationGain, timeOffset);
    timeOffset += 3 * elementDuration;
    gainNode.linearRampToValueAtTime(stationGain, timeOffset);

    // Inter-element space
    timeOffset += RAMP;
    gainNode.linearRampToValueAtTime(0, timeOffset);
    timeOffset += elementDuration;
    gainNode.linearRampToValueAtTime(0, timeOffset);
  }

  function space(gainNode, stationGain, elementDuration) {
    // Wait 3 units
    timeOffset += RAMP;
    gainNode.linearRampToValueAtTime(0, timeOffset);
    timeOffset += INTER_CHARACTER * elementDuration;
    gainNode.linearRampToValueAtTime(0, timeOffset);
  }

  console.log("Station " + this.callSign + " is sending " + text);

  // Convert text to string representing morse dots and dashes
  var morseLetters = []
  for (var i = 0, len = text.length; i < len; i++) {
    morseLetters.push(toMorse(text[i]));
  }
  morseString = morseLetters.join(" ");

  this.gainAndEnvelope.gain.linearRampToValueAtTime(0, timeOffset);

  for (var i = 0, len = morseString.length; i < len; i++) {
    switch (morseString[i]) {
      case ".":
        dot(this.gainAndEnvelope.gain, this.stationGain, this.elementDuration);
        break;
      case "-":
        dash(this.gainAndEnvelope.gain, this.stationGain, this.elementDuration);
        break;
      case " ":
        space(this.gainAndEnvelope.gain, this.stationGain, this.elementDuration);
        break;
      default:
        break;
    }
  }

  if (this.repeatDelay > 0.0) {
    // Arrange to send again in the future
    setTimeout(this.send(text), this.repeatDelay);
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
    }
    char = char.toLowerCase()
    if (char in morseMap) {
      return morseMap[char];
    } else {
      return "";
    }
  }
}
