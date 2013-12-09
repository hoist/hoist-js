require.config({
  baseUrl: '/src',
  paths: {
    'chai': '../lib/chai/chai',
    'heir': '../lib/heir/heir',
    'EventEmitter':'../lib/eventEmitter/EventEmitter',
    'superagent': '../lib/superagent/superagent',
    'sinon':'../util/sinon',
    'lodash':'../util/lodash'
  },
  shim:{
    sinon:{
      exports:'sinon'
    }
  }
});

require([
  // FILE(S) BEING TESTED
  '../tests/data/model_api_specs',
  '../tests/auth/auth_api_specs',
  '../tests/notifications/notifications_api_specs'
], function() {
  // INITIALIZE THE RUN
  if (window.mochaPhantomJS) {
    mochaPhantomJS.run();
  } else {
    mocha.run();
  }
});
