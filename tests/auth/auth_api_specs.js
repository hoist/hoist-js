var testSuite = function (Hoist, chai, sinon) {
  'use strict';

  var should = chai.should();
  describe("Hoist SDK: Auth", function () {
    it('should expose the startus function', function () {
      Hoist.status.should.be.a('Function');
    });
    it('should expose the login function', function () {
      Hoist.login.should.be.a('Function');
    });
  });
};

if (typeof define === "function" && define.amd) {
  define(['Hoist', 'chai', 'sinon'], testSuite);
} else if (typeof window === "object" && typeof window.document === "object") {
  testSuite(window.Hoist, window.chai, window.superagent, window.sinon);
} else if (typeof module === "object" && typeof module.exports === "object") {
  testSuite(
    require('../../'),
    require('chai'),
    require('sinon')
  );
}
