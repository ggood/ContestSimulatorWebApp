/*
Audio node that generates no1se.
*/

function NoiseSource(audioSink) {
  this.audioSink = audioSink;
  this.initialized = false;
}

NoiseSource.prototype.setEnabled = function(value) {
  console.log("Noise enabled: " + value);
  if (value) {
    if (this.initialized) {
      // Turn on existing noise source
      this.noise.start();
    } else {
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

      // Noise gain
      this.gain = context.createGain();
      this.gain.gain.value = 0.2;
      this.gain.connect(this.audioSink);

      this.noise.connect(this.gain);
      this.noise.start(0);
      this.initialized = true;
    }
  } else {
    // TODO(ggood) doesn't work correctly - when enabled again, the old
    // noise source is still active, so you have two.
    this.noise.stop();
  }
};

NoiseSource.prototype.setGain = function(value) {
  console.log("Noise gain set to " + value);
  this.gain.gain.value = value;
};
