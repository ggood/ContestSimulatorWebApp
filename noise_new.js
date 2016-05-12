/*
Audio node that generates no1se.
*/

function NoiseSource(audioSink) {
  this.audioSink = audioSink;

  // Noise gain
  this.gain = context.createGain();
  this.gain.gain.value = 0.2;

  this.gain.connect(this.audioSink);
}

NoiseSource.prototype.setEnabled = function(value) {
  if (value) {
    // Create noise source
    var bufferSize = 5 * context.sampleRate,
      noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate),
      output = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    this.noise = context.createBufferSource();
    this.noise.buffer = noiseBuffer;
    this.noise.loop = true;
    this.noise.connect(this.gain);
    this.noise.start(0);
  } else {
    this.noise.stop();
  }
};

NoiseSource.prototype.setGain = function(value) {
  this.gain.gain.value = value;
};
