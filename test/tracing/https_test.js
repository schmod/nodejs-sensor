'use strict';

var expect = require('chai').expect;

var supportedVersion = require('../../src/tracing/index').supportedVersion;
var agentStubControls = require('../apps/agentStubControls');
var expressControls = require('../apps/expressControls');
var config = require('../config');
var utils = require('../utils');

describe('tracing/https', function() {
  if (!supportedVersion(process.versions.node)) {
    return;
  }

  this.timeout(config.getTestTimeout());

  agentStubControls.registerTestHooks();
  expressControls.registerTestHooks({
    useHttps: true
  });

  beforeEach(function() {
    return agentStubControls.waitUntilAppIsCompletelyInitialized(expressControls.getPid());
  });

  it('must trace incoming HTTPS calls', function() {
    return expressControls.sendRequest({
      method: 'POST',
      path: '/checkout',
      responseStatus: 201,
      useHttps: true
    })
    .then(function() {
      return utils.retry(function() {
        return agentStubControls.getSpans()
        .then(function(spans) {
          expect(spans.length).to.equal(1);

          var span = spans[0];
          expect(span.n).to.equal('node.http.server');
          expect(span.async).to.equal(false);
          expect(span.error).to.equal(false);
          expect(span.ec).to.equal(0);
          expect(span.data.http.method).to.equal('POST');
          expect(span.data.http.url).to.equal('/checkout');
          expect(span.data.http.status).to.equal(201);
          expect(span.data.http.host).to.equal('127.0.0.1:3211');
        });
      });
    });
  });
});
