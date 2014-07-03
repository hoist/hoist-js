var testSuite = function (Hoist, chai, sinon) {
  'use strict';
  describe('Hoist SDK: File', function () {
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
    it('should expose the file method on Hoist', function () {
      Hoist.file.should.be.a('Function');
    });
    describe('#file', function () {
      describe('posting a new file', function () {});
      describe('getting an existing file', function () {
        var _response;
        var _request;
        before(function () {
          var imageBlob = "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NDkxMSwgMjAxMy8xMC8yOS0xMTo0NzoxNiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjc4RkQ0MjczRDI1QTExRTNCQTNERkVBRDkxMTQ2OTdBIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjc4RkQ0Mjc0RDI1QTExRTNCQTNERkVBRDkxMTQ2OTdBIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NzhGRDQyNzFEMjVBMTFFM0JBM0RGRUFEOTExNDY5N0EiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NzhGRDQyNzJEMjVBMTFFM0JBM0RGRUFEOTExNDY5N0EiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7if2qvAAAEO0lEQVR42mJkmNnOMJQBE8MQB6MeGPXAqAdGPTDqgVEPjHpg1AOjHhj1wKgHRj0w6oFRD4x6YNQDox6gqQcW61v+T6sI5RNEE08RFgeKA2WHfwyIMzE1yKt58/ANVQ/ES8jXuwdVmTrgV2bAylYnp4oZ1QPvgbPvXp68d3Pf/Vv4lalycjd6BDtKKxJpLAuNnKvMzPyHgeHh379wkb0/vu3dsx5TpSU7x7//DCd//SDPIup7oFhSLt3UXlVCGsi+8uTBlFMHZ755DmTbcXAt8YncfPV89vVzEJVJwuLVtu5KYlJA9uXH92ecOTzt9TNko+SYmB79+0cFD+yz8+ZgJUpluZRCh0/EjWePmndtYGJkCNc1nRoQ+3/DollvXrAwMckKifKxsUNUyjMz93qE/GdgaN29gZ2JJUzPZGpgXPqje/ffvwHKWsgqnZJWuPH6edzF41TwgJ6MnDAPP5DR5uCT9fHd99+/mJmYOVlY+Tk45YRF4cqEmJgKbN0ev3sdtGP19T+/2RgZv//+3eIVmmvmMGvbCjQzzbj5BLh515w7XnP/BpDbc/9arryav6aBj44RkGuooHL3xbOLr55SJxOrrZi59dIZIOPD92/CXDwqIhKy/EJ8HJyffv648OQBXJkvv7AEv9D6y2eBrgdyJ2gY1rsFfv7+VUdGwZqdA83Mq9++AKXcNfV6VXWBsi///QP6RHfbiug184CyM4/sVtm0qPf5I+rkgXf//r3//hXI6Dq5b/Wn92gVmYO6LoQtww0q42+9fw3NnfLKu65d2PPgZr9ftCIXz7OfKNn02p/fuVtWlFm5FDl6FzEwnLp3c9KZw0s/vPn3H5isGCDkwBSj/2F2v/j0UUNMCpi+IQ7S4RWAq9FgYZmna/7j31/trcsDl8+Yc3SvlpTsLP9oRw6ugazInn37AirIBUQg3FmXTwnwcHf4hIPYftET/WPgKtU5uBMtHe2lFIDsDZ8/pF49PeHQLi52TisRyYH0wM4Pr19/+hCgbaTFwgrkrv/8IXzdwm8/v998/rjv0K6s9YtASZaJGUj+/A8qHDXFEM5lZwaJf/vz+zc4AtlZWAagHnj271/voZ3AIF/jHrrx+gUWRqZAbVCR0nR4x7IPb4Ftod7fP9009ab/+O6mrv32y0dg5tn2+/fZZ48kefjCDM2Bxdfq1095GBl//fnlrWU4/c/f/wz/s2CVBi7AzODrQozjbPmE+NjYtj+4efvXT5QCio1DU1Dk8ounO9+9BHKPfv7w/skDfXFpP10TA2nZe29eVu/fuvzjW6DU1///2d+/t5RXMZJVOHj7euL+TRw/ftgqqXvrGKmJih+7e6vk4NZLv3+9+feP59MnSwUVQxn5h29fr33xGL/DGEfniUc9MOqBUQ+MemDUA6MeGPXAqAdGPTDqgVEPjHpg1AOjHhj1wKgHRqQHAAIMAGHGjHADirrUAAAAAElFTkSuQmCC";
          if (server.respondWith) {
            server.respondWith(function (request) {
              _request = request;
              request.respond(200, {
                  "Content-Type": "image/png"
                },
                imageBlob
              );

            });
          } else if (server) {
            server('https://file.hoi.io')
              .filteringPath(function (path) {
                _request = {
                  url: "https://file.hoi.io" + path,
                  method: "GET"
                };
                return '/';
              })
              .get('/')
              .reply(200, imageBlob, {
                "Content-Type": "image/png"
              });

          }

          _response = Hoist.file('my_image');
        });
        it('should make a successful call', function () {
          return _response.should.be.fulfilled;
        });
        it('should call correct uri', function () {
          return _response.then(function (response) {
            _request.url.should.eql('https://file.hoi.io/my_image');
          });
        });
        if (typeof Blob !== 'undefined') {
          //browser
          it('should return a Blob', function () {
            return _response.then(function (response) {
              response.should.be.instanceOf(Blob);
            });
          });
          it('should return a Blob of the correct length', function () {
            return _response.then(function (response) {
              response.size.should.eql(2656);
            });
          });

        } else {
          //nodejs which is not very tested at the moment
          it('should return a response', function () {
            return _response.then(function (response) {
              response.constructor.name.should.eql('Response');
            });
          });
          it.skip('should return the correct file length', function () {
            return _response.then(function (response) {
              //unsure how to test this yet
            });
          });
        }

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
