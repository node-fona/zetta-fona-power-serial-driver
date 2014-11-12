var Device = require('zetta-device');
var util = require('util');

var FonaPower = module.exports = function() {
  Device.call(this);
  this._serialDevice = arguments[0];

  this.adcVoltage = null;
  this.batteryPercentage = null;
  this.batteryVoltage = null;
  
  
};
util.inherits(FonaPower, Device);

FonaPower.prototype.init = function(config) {

  config
  .name('Adafruit Fona Power')
  .type('fona-power')
  .state('waiting')
  .when('waiting', { allow: ['get-battery-voltage', 'get-adc-voltage']})
  .map('get-battery-voltage', this.getBatteryVoltage)
  .map('get-adc-voltage', this.getADCVoltage);

};

FonaPower.prototype.getBatteryVoltage = function(cb) {
  this.log('getBatteryVoltage');  

  var self = this;
  
  var tasks = [
  {    
    before: function() {self.state = 'getting-battery-voltage'},
    command: 'AT+CBC',
    regexp: /^$/
  },
  {
    regexp: /^\+CBC: .*,(.*),(.*)/,
    onMatch: function(match) {
      self.batteryPercentage = match[1];
      self.batteryVoltage = match[2];
    }
  },
  {
    regexp: /^$/
  },
  {
    regexp: /OK/,
    onMatch: function(match) {
      self.state = 'waiting';
      cb();
    }
  }
  ];

  this._serialDevice.enqueue(tasks, null, function() {});
};

FonaPower.prototype.getADCVoltage = function(cb) {
  this.log('getADCVoltage');  

  var self = this;
  
  var tasks = [
  {    
    before: function() {self.state = 'getting-adc-voltage'},
    command: 'AT+CADC?',
    regexp: /^$/
  },
  {
    regexp:  /^\+CADC: .*,(.*)/,
    onMatch: function(match) {
      self.adcVoltage = match[1];
    }
  },
  {
    regexp: /^$/
  },
  {
    regexp: /OK/,
    onMatch: function () {
      self.state='waiting';
      cb();
    }
  }
  ];

  this._serialDevice.enqueue(tasks, null, function() {});
};
