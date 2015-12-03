var StationList = function() {
  this.allStations = [
    "KT8K",
    "W6OAT",
    "JA3YBK",
    "YO3RMO",
    "N6RO",
    "W8UM",
  ];
  this.activeStations = [];
}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

StationList.prototype.getCall = function() {
  var newCallsign;
  while (true) {  // Danger - will spin when all calls active.
      newCallsign = this.allStations[Math.floor(Math.random() * this.allStations.length)];
      console.log("checking if " + newCallsign + " is active");
      if (!contains(this.activeStations, newCallsign)) {
        this.activeStations.push(newCallsign);
        return newCallsign;
      } else {
        console.log(newCallsign + " in " + this.activeStations + ", choosing another");
      }
    }
};
