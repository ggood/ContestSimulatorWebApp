// Morse constants
var INTER_CHARACTER = 2.5
var RAMP = 0.010

var Keyer = function(audioSink) {
  // Keyer configuration
  this.elementDuration = 0.04;  // TODO use WPM
  this.audioSink = audioSink;

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


Keyer.prototype.setMonitorGain = function(value) {
  this.monitorGain.gain.value = value;
};


/*
 Send the given text.
 */
Keyer.prototype.send = function(text) {

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
  }

  function space(gainNode, elementDuration) {
    // Wait 3 units
    timeOffset += RAMP;
    gainNode.linearRampToValueAtTime(0.0, timeOffset);
    timeOffset += INTER_CHARACTER * elementDuration;
    gainNode.linearRampToValueAtTime(0.0, timeOffset);
  }

  console.log("Sending " + text);

  // Convert text to string representing morse dots and dashes
  var morseLetters = []
  for (var i = 0, len = text.length; i < len; i++) {
    morseLetters.push(toMorse(text[i]));
  }
  morseString = morseLetters.join(" ");

  this.envelopeGain.gain.linearRampToValueAtTime(0, timeOffset);

  for (var i = 0, len = morseString.length; i < len; i++) {
    switch (morseString[i]) {
      case ".":
        dot(this.envelopeGain.gain, this.elementDuration);
        break;
      case "-":
        dash(this.envelopeGain.gain, this.elementDuration);
        break;
      case " ":
        space(this.envelopeGain.gain, this.elementDuration);
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
    }
    char = char.toLowerCase()
    if (char in morseMap) {
      return morseMap[char];
    } else {
      return "";
    }
  }
}
