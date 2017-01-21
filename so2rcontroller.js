/*
 An so2rcontroller object manages the routing of audio from
 each radio to the audio outputs. It also manages which
 radio is connected to the station keyer.

 The signal chain is:

 - two monophonic radio inputs
 - one stereo output

 Controls are:
 - Radio1 left, Redio2 right
 - Radio1 both
 - Radio2 both

 */

 var SO2RController = function() {
    this.context = null;
    this.audioSink = null;
    this.focusedRadio = 1;
    this.selectedRadio = 1;  // 0 == both
 };

 SO2RController.prototype.init = function(context, audioSink) {
   this.context = context;
   this.audioSink = audioSink;

   this.radio1Panner = context.createPanner();
   this.radio1Panner.panningModel = 'equalpower';
   this.radio2Panner = context.createPanner();
   this.radio2Panner.panningModel = 'equalpower';


   this.radio1Panner.connect(context.destination);
   this.radio2Panner.connect(context.destination);
   // Default is radio 1 pan left, radio2 pan right
   this.radio1Panner.setPosition(-1.0, 0, 0);
   this.radio2Panner.setPosition(1.0, 0, 0);
 };

 SO2RController.prototype.getRadio1Input = function() {
   return this.radio1Panner;
 };

 SO2RController.prototype.getRadio2Input = function() {
   return this.radio2Panner;
 };

 SO2RController.prototype.selectRadio1 = function() {
   this.selectedRadio = 1;
   this.radio1Panner.setPosition(0, 0, 0);
   this.radio2Panner.disconnect();
   this.radio1Panner.connect(this.audioSink);
   this.focusRadio1();
 };

 SO2RController.prototype.selectRadio2 = function() {
   this.selectedRadio = 2;
   this.radio2Panner.setPosition(0, 0, 0);
   this.radio1Panner.disconnect();
   this.radio2Panner.connect(this.audioSink);
   this.focusRadio2();
 };

 SO2RController.prototype.swapRadios = function() {
   if (this.selectedRadio == 0) {
     this.selectRadio1();
   } else {
     if (this.selectedRadio == 1) {
       this.selectRadio2();
     } else if (this.selectedRadio == 2) {
       this.selectRadio1();
     } else {
       console.log("Can't switch from radio " + this.selectedRadio);
     }
   }
 };

 SO2RController.prototype.selectBothRadios = function() {
   this.selectedRadio = 0;
   this.radio1Panner.disconnect();
   this.radio2Panner.disconnect();
   this.radio1Panner.connect(this.audioSink);
   this.radio2Panner.connect(this.audioSink);
   this.radio1Panner.setPosition(-1.0, 0, 0);
   this.radio2Panner.setPosition(1.0, 0, 0);
 };

  SO2RController.prototype.focusRadio1 = function() {
    this.focusedRadio = 1;
  };

  SO2RController.prototype.focusRadio2 = function() {
    this.focusedRadio = 2;
  };

  SO2RController.prototype.getFocusedRadio = function() {
    if (this.focusedRadio == 1) {
      return radio1;
    } else if (this.focusedRadio == 2) {
      return radio2;
    }
    return null;
  };

  SO2RController.prototype.getFocusedRadioNumber = function() {
    return this.focusedRadio;
  };
