require.config({
  baseUrl: '/src',
  paths: {
    'chai': '../bower_components/chai/chai',
    'sinon': '../bower_components/sinonjs/sinon',
    'lodash': '../bower_components/lodash/dist/lodash',
    'chai-as-promised': '../bower_components/chai-as-promised/lib/chai-as-promised'
  },
  shim: {
    sinon: {
      exports: 'sinon'
    }
  }
});

require([
  'chai',
  'chai-as-promised',
  // FILE(S) BEING TESTED
  '../tests/data/model_api_specs',
  '../tests/auth/auth_api_specs',
  '../tests/notifications/notifications_api_specs'
], function (chai, chaiAsPromised) {
  chai.use(chaiAsPromised);
  // INITIALIZE THE RUN
  if (window.mochaPhantomJS) {
    mochaPhantomJS.run();
  } else {
    mocha.run();
  }
});
