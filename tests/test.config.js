require.config({
   baseUrl: '/src',
   paths:{
   	'Hoist':'index',
   	'chai':'../bower_components/chai/chai'
   }
});

require([
  // FILE(S) BEING TESTED
  '../tests/data/model_api_specs'
], function() {
  // INITIALIZE THE RUN
  if (window.mochaPhantomJS) { mochaPhantomJS.run(); }
  else { mocha.run(); }
});