/*jshint node:true, laxcomma:true */

var util = require('util')
  , dgram = require('dgram')
  , logger = require('../lib/logger');

var l;
var debug;

function JSONMetricsBackend(startupTime, config, emitter){
  var self = this;
  this.config = config.json_metrics || [];
  this.sock = (config.repeaterProtocol == 'udp6') ?
        dgram.createSocket('udp6') :
        dgram.createSocket('udp4');
  // Attach DNS error handler
  this.sock.on('error', function (err) {
    if (debug) {
      l.log('Repeater error: ' + err);
    }
  });
  // attach to flush
  emitter.on('flush', function(timestamp, metrics) { self.process(timestamp, metrics); });
}

JSONMetricsBackend.prototype.process = function(timestamp, metrics) {
  var self = this;

  // we don't care about these 2 values at all so cut down on some volume
  delete metrics.pctThreshold
  delete metrics.statsd_metrics
  metrics.context = self.config.context
  var JSONMetricsPretty = JSON.stringify(metrics, null, 4);
  var JSONMetrics = JSON.stringify(metrics);
  var msg = new Buffer(JSONMetrics)
  if (debug) {
    l.log("my metrics pretty are " + JSONMetricsPretty)
    l.log("my buffer object size is " + msg.length)
  }
  for(var i=0; i<self.config.hosts.length; i++) {
    self.sock.send(msg,0,msg.length,self.config.hosts[i].port,self.config.hosts[i].host,
        function(err,bytes) { if (err && debug) { l.log(err); } });
  }
};

exports.init = function(startupTime, config, events) {
  var instance = new JSONMetricsBackend(startupTime, config, events);
  l = new logger.Logger(config.log || {});
  debug = config.debug;
  return true;
};
