var testSuite = function (Hoist, chai, sinon) {
  'use strict';
  describe('Hoist SDK: Search', function () {
    var server;
    before(function () {
      Hoist.apiKey('TESTAPIKEY');
      if (sinon.fakeServer) {
        server = sinon.fakeServer.create();
        server.autoRespond = true;
        server.autoRespondAfter = 2;
      } else if (require) {
        server = require('nock');
        if (!server.isActive()) {
          server.activate();
        }
        server.disableNetConnect();
      }
    });
    after(function () {
      if (sinon.fakeServer) {
        server.restore();
      } else if (require) {
        server.enableNetConnect();
      }
    });
    it('should expose the index function', function () {
      Hoist.index.should.be.a('Function');
    });
    it('should expose the getIndex function', function () {
      Hoist.getIndex.should.be.a('Function');
    });
    it('should expose the deIndex function', function () {
      Hoist.deIndex.should.be.a('Function');
    });
    describe('#index', function () {
      describe('posting a single page', function () {
        var _request;
        var _result;

        before(function () {
          if (server.respondWith) {
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 2;
            server.respondWith(function (request) {
              _request = request;
              request.respond(200, {
                  "Content-Type": "application/json"
                },
                JSON.stringify({
                  path: '/#!mypath',
                  content: 'mycontent',
                  _id: 'myid'
                })
              );
            });
          } else if (server) {
            server('https://search.hoi.io')
              .filteringPath(function (path) {
                _request = {
                  url: "https://search.hoi.io" + path,
                  method: "POST"
                };
                return '/post1';
              })
              .post('/post1')
              .reply(200, JSON.stringify({
                path: '/#!mypath',
                content: 'mycontent',
                _id: 'myid'
              }), {
                "Content-Type": "application/json"
              });
          }

          _result = Hoist.index('/#!mypath', 'mycontent');
        });
        it('should not throw an error', function () {
          return _result.should.be.fulfilled;
        });
        it('should return the correct object', function () {
          return _result.then(function (result) {
            result.path.should.eql('/#!mypath');
            result.content.should.eql('mycontent');
            result._id.should.eql('myid');
          });
        });
        it('should request from the correct url', function () {
          return _result.then(function () {
            _request.url.should.eql('https://search.hoi.io/index');
            _request.method.should.eql("POST");
          });
        });
        after(function () {
          if (!server.respondWith) {
            server.cleanAll();
          }
        });
      });
      describe('posting an array of pages', function () {
        var _request;
        var _result;
        before(function () {
          if (server.respondWith) {
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 2;
            server.respondWith(function (request) {
              _request = request;
              request.respond(200, {
                  "Content-Type": "application/json"
                },
                JSON.stringify([{
                  path: '/#!mypath',
                  content: 'mycontent',
                  _id: 'myid'
                }, {
                  path: '/#!mypath1',
                  content: 'mycontent1',
                  _id: 'myid1'
                }, {
                  path: '/#!mypath2',
                  content: 'mycontent2',
                  _id: 'myid2'
                }])
              );
            });
          } else if (server) {
            server('https://search.hoi.io')
              .filteringPath(function (path) {
                _request = {
                  url: "https://search.hoi.io" + path,
                  method: "POST"
                };
                return '/post2';
              })
              .post('/post2')
              .reply(200, JSON.stringify([{
                path: '/#!mypath',
                content: 'mycontent',
                _id: 'myid'
              }, {
                path: '/#!mypath1',
                content: 'mycontent1',
                _id: 'myid1'
              }, {
                path: '/#!mypath2',
                content: 'mycontent2',
                _id: 'myid2'
              }]), {
                "Content-Type": "application/json"
              });
          }

          _result = Hoist.index([{
            path: '/#!mypath',
            content: 'mycontent'
          }, {
            path: '/#!mypath1',
            content: 'mycontent1'
          }, {
            path: '/#!mypath2',
            content: 'mycontent2'
          }]);
        });
        it('should not throw an error', function () {
          return _result.should.be.fulfilled;
        });
        it('should return the correct object', function () {
          return _result.then(function (result) {
            result.should.eql([{
              path: '/#!mypath',
              content: 'mycontent',
              _id: 'myid'
            }, {
              path: '/#!mypath1',
              content: 'mycontent1',
              _id: 'myid1'
            }, {
              path: '/#!mypath2',
              content: 'mycontent2',
              _id: 'myid2'
            }]);
          });
        });
        it('should request from the correct url', function () {
          return _result.then(function () {
            _request.url.should.eql('https://search.hoi.io/index');
            _request.method.should.eql("POST");
          });
        });
        after(function () {
          if (!server.respondWith) {
            server.cleanAll();
          }
        });
      });
    });
    describe('#getIndex', function () {
      describe('getting a page', function () {
        var _request;
        var _result;
        before(function () {
          if (server.respondWith) {
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 2;
            server.respondWith(function (request) {
              _request = request;
              request.respond(200, {
                "Content-Type": "text/html"
              }, '<!DOCTYPE html><html><head><meta charset="utf-8"><title>test</title></head><body>some content</body></html>');
            });
          } else if (server) {
            server('https://search.hoi.io')
              .filteringPath(function (path) {
                _request = {
                  url: "https://search.hoi.io" + path,
                  method: "GET"
                };
                return '/get1';
              })
              .get('/get1')
              .reply(200, '<!DOCTYPE html><html><head><meta charset="utf-8"><title>test</title></head><body>some content</body></html>', {
                "Content-Type": "text/html"
              });
          }

          _result = Hoist.getIndex('/#!mypath');
        });
        it('should not throw an error', function () {
          return _result.should.be.fulfilled;
        });
        it('should call correct uri', function () {
          return _result.then(function (result) {
            decodeURIComponent(_request.url).should.eql('https://search.hoi.io/index?path=/?_escaped_fragment_=mypath');
            _request.method.should.eql("GET");
          });
        });
        it('should return the correct object', function () {
          return _result.then(function (result) {
            result.text.should.eql('<!DOCTYPE html><html><head><meta charset="utf-8"><title>test</title></head><body>some content</body></html>');
          });
        });
        after(function () {
          if (!server.respondWith) {
            server.cleanAll();
          }
        });
      });
    });
    describe('#deIndex', function () {
      describe('deleting a single page', function () {
        var _request;
        var _result;

        before(function () {
          if (server.respondWith) {
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 2;
            server.respondWith(function (request) {
              _request = request;
              request.respond(200, {
                  "Content-Type": "application/json"
                },
                JSON.stringify({
                  removed: 1
                })
              );
            });
          } else if (server) {
            server('https://search.hoi.io')
              .filteringPath(function (path) {
                _request = {
                  url: "https://search.hoi.io" + path,
                  method: "DELETE"
                };
                return '/del1';
              })
              .delete('/del1')
              .reply(200, JSON.stringify({
                removed: 1
              }), {
                "Content-Type": "application/json"
              });
          }

          _result = Hoist.deIndex('/#!mypath');
        });
        it('should not throw an error', function () {
          return _result.should.be.fulfilled;
        });
        it('should return the correct object', function () {
          return _result.then(function (result) {
            result.removed.should.eql(1);
          });
        });
        it('should request from the correct url', function () {
          return _result.then(function () {
            _request.url.should.eql('https://search.hoi.io/index');
            _request.method.should.eql("DELETE");
          });
        });
        after(function () {
          if (!server.respondWith) {
            server.cleanAll();
          }
        });
      });
      describe('deleting pages with regex', function () {
        var _request;
        var _result;

        before(function () {
          if (server.respondWith) {
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 2;
            server.respondWith(function (request) {
              _request = request;
              request.respond(200, {
                  "Content-Type": "application/json"
                },
                JSON.stringify({
                  removed: 2
                })
              );
            });
          } else if (server) {
            server('https://search.hoi.io')
              .filteringPath(function (path) {
                _request = {
                  url: "https://search.hoi.io" + path,
                  method: "DELETE"
                };
                return '/del1';
              })
              .delete('/del1')
              .reply(200, JSON.stringify({
                removed: 2
              }), {
                "Content-Type": "application/json"
              });
          }

          _result = Hoist.deIndex('/#!mypath/*', true);
        });
        it('should not throw an error', function () {
          return _result.should.be.fulfilled;
        });
        it('should return the correct object', function () {
          return _result.then(function (result) {
            result.removed.should.eql(2);
          });
        });
        it('should request from the correct url', function () {
          return _result.then(function () {
            _request.url.should.eql('https://search.hoi.io/index');
            _request.method.should.eql("DELETE");
          });
        });
        after(function () {
          if (!server.respondWith) {
            server.cleanAll();
          }
        });
      });
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