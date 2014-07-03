require.config({
  baseUrl: '/build',
  paths: {
    'chai': '../bower_components/chai/chai',
    'sinon': '../bower_components/sinonjs/sinon',
    'lodash': '../bower_components/lodash/dist/lodash',
    'chai-as-promised': '../bower_components/chai-as-promised/lib/chai-as-promised',
    'superagent': '../bower_components/superagent/superagent'
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
  'superagent',
  '../tests/blob.shim.js',
  // FILE(S) BEING TESTED
  '../tests/data/data_api_specs',
  '../tests/auth/auth_api_specs',
  '../tests/notify/notify_api_specs',
  '../tests/file/file_api_specs'
], function (chai, chaiAsPromised) {
  chai.use(chaiAsPromised);
  // INITIALIZE THE RUN
  if (window.mochaPhantomJS) {
    mochaPhantomJS.run();
  } else {
    mocha.run();
  }
});
