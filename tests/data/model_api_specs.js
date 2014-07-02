var testSuite = function (Hoist, chai, sinon) {
  'use strict';

  describe('Hoist SDK: Data', function () {
    var server;
    before(function () {
      Hoist.apiKey('TESTAPIKEY');
      if (sinon.fakeServer) {
        server = sinon.fakeServer.create();
        server.autoRespond = true;
        server.autoRespondAfter = 2;
      } else if (require) {
        server = require('nock');
        server.disableNetConnect();
      }
    });
    describe('collections', function () {
      var _collection;
      before(function () {
        _collection = new Hoist('myobject');
      });
      describe('#get', function (done) {
        var _request;
        var _result;
        before(function () {
          if (server.respondWith) {
            server.respondWith(function (request) {
              _request = request;
              request.respond(200, {
                  "Content-Type": "application/json"
                },
                JSON.stringify({
                  _type: 'myobject',
                  _id: 'myid',
                  key: 'value'
                })
              );
            });
          } else if (server) {
            server('https://data.hoi.io')
              .filteringPath(function (path) {
                _request = {
                  url: "https://data.hoi.io" + path,
                  method: "GET"
                };
                return '/';
              })
              .get('/')
              .reply(200, JSON.stringify({
                _type: 'myobject',
                _id: 'myid',
                key: 'value'
              }), {
                "Content-Type": "application/json"
              });
          }

          _result = _collection.get('myid');
        });
        it('should not throw an error', function () {
          return _result.should.be.fulfilled;
        });
        it('should return the correct object', function () {
          return _result.then(function (result) {
            result._type.should.eql('myobject');
            result._id.should.eql('myid');
            result.key.should.eql('value');
          });
        });
        it('should request from the correct url', function () {
          return _result.then(function () {
            _request.url.should.eql('https://data.hoi.io/myobject/myid');
            _request.method.should.eql("GET");
          });
        });
        after(function () {
          if (!server.respondWith) {
            server.restore();
          }
        });
      });
    });
    after(function () {
      if (sinon.fakeServer) {
        server.restore();
      } else if (require) {
        server.enableNetConnect();
      }
    });
  });
};



if (typeof define === "function" && define.amd) {
  define(['Hoist', 'chai', 'sinon'], testSuite);
} else if (typeof window === "object" && typeof window.document === "object") {
  testSuite(window.Hoist, window.chai, window.sinon);
} else if (typeof module === "object" && typeof module.exports === "object") {
  testSuite(
    require('../../'),
    require('chai'),
    require('sinon')
  );
}
