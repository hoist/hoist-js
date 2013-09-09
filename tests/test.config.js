require.config({
  baseUrl: '/src',
  paths: {
    'Hoist': 'index',
    'chai': '../bower_components/chai/chai',
    'heir': '../bower_components/heir/heir',
    'EventEmitter':'../bower_components/eventEmitter/EventEmitter',
    'superagent': '../bower_components/superagent/superagent',
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