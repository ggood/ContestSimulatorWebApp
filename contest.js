var Contest = function() {
  this.activeStations = [];
  this.stationList = new StationList();

  console.log("Contest instance created");
};

Contest.prototype.start = function() {
  console.log("Contest started");
};

Contest.prototype.finishCq = function() {
  this.activeStations.push(new Station(this.stationList.getCall()));
  for (var i = 0; i < this.activeStations.length; i++) {
    this.activeStations[i].callMe();
  }
}
