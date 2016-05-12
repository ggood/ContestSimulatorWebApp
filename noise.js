/*
Audio node that generates no1se.
*/

function NoiseSource() {
  this.node = context.createScriptProcessor(1024, 1, 2);
  this.node.onaudioprocess = this.process;
}

NoiseSource.prototype.process = function(e) {
  var L = e.outputBuffer.getChannelData(0);
  var R = e.outputBuffer.getChannelData(1);
  for (var i = 0; i < L.length; i++) {
    L[i] = ((Math.random() * 2) - 1);
    R[i] = L[i];
  }
};

NoiseSource.prototype.connect = function(dest) {
  this.node.connect(dest);
};

function NoiseGenerated(callback) {
  // Generate a 30second noise buffer.
  var lengthInSamples = 30 * context.sampleRate;
  var buffer = context.createBuffer(1, lengthInSamples, context.sampleRate);
  var data = buffer.getChannelData(0);

  // Pink noise
  var b0, b1, b2, b3, b4, b5, b6;
  b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
  for (var i = 0; i < lengthInSamples; i++) {
    var white = (Math.random() * 2 - 1) * 0.2;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    data[i] *= 0.11; // (roughly) compensate for gain
    b6 = white * 0.115926;
  }

  // Create a source node from the buffer.
  this.node = context.createBufferSource();
  this.node.buffer = buffer;
  this.node.loop = true;
  this.node[this.node.start ? 'start' : 'noteOn'](0);
}
