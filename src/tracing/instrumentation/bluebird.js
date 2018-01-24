'use strict';

var shimmer = require('shimmer');
var requireHook = require('../../util/requireHook');
var cls = require('../cls');

var isActive = false;

exports.activate = function() {
  isActive = true;
};

exports.deactivate = function() {
  isActive = false;
};

exports.init = function() {
  requireHook.on('bluebird', instrument);
};

function instrument(bluebird) {
  if ((typeof bluebird.prototype._addCallbacks !== 'function') || (isActive === false)) {
    return;
  }

  shimmer.wrap(bluebird.prototype, '_addCallbacks', function(realAddCallbacks) {
    return function(fulfill, reject, progress, promise, receiver, domain) {
      return realAddCallbacks.call(
        this,
        cls.ns.bind(fulfill),
        cls.ns.bind(reject),
        cls.ns.bind(progress),
        promise,
        receiver,
        domain
      );
    };
  });
}
