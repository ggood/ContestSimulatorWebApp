// Morse constants
var INTER_CHARACTER = 2.5  // Time between letters
var INTER_WORD = 3.5  // Time between words
var RAMP = 0.010

function wpmToElementDuration(wpm) {
  // Based on CODEX (60000 ms per minute / W * 60 dit values in CODEX)
  return 1.0 / wpm;
};

var Keyer = function(audioSink) {
  // Keyer configuration
  this.speed = 25;  // in wpm
  this.elementDuration = wpmToElementDuration(this.speed);
  this.audioSink = audioSink;

  // Message sending state
  // Largest time at which we've scheduled an audio event
  this.latestScheduledEventTime = 0;

  // Signal chain
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


Keyer.prototype.setPitch = function(pitch) {
  this.voiceOsc.frequency.value = pitch;
};


Keyer.prototype.setMonitorGain = function(gain) {
  this.monitorGain.gain.value = gain;
};


Keyer.prototype.setSpeed = function(wpm) {
  this.speed = wpm;
  this.elementDuration = wpmToElementDuration(this.speed);
};


Keyer.prototype.isSending = function() {
  console.log("this.latestScheduledEventTime = " + this.latestScheduledEventTime);
  console.log("context.currentTime = " + context.currentTime);
  return (this.latestScheduledEventTime > context.currentTime);
};


Keyer.prototype.abortMessage = function() {
  console.log("STOP SENDING");
  this.latestScheduledEventTime = 0.0;
  this.monitorGain.gain.cancelScheduledValues(context.currentTime);
};


/*
 Send the given text.
 */
Keyer.prototype.send = function(text) {
  var self = this

  // Send morse
  var timeOffset = context.currentTime

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

  console.log("Sending " + text);

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
