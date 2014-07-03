(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.xhr.responseText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var res = new Response(self);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":2,"reduce":3}],2:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],3:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],4:[function(require,module,exports){
var agent = require('superagent');

/*jshint loopfunc: true */
(function () {

  var toString = Object.prototype.toString,
    splice = Array.prototype.splice,
    u;

  // helpers

  function extend(into, from) {
    for (var x in from) into[x] = from[x];
    return into;
  }

  function extendAliases(into, from) {
    for (var x in from) {
      var xs = x.split(' ');
      for (var i = 0; i < xs.length; i++) into[xs[i]] = from[x];
    }
  }

  function get(obj, key, nothing) {

    if (key.indexOf('.') == -1) {
      return obj[key];
    } else {
      key = key.split('.');

      for (var i = 0; i < key.length - 1; i++) {
        obj = obj[key[i]];
        if (!obj) return "";
      }

      return obj[key[i]];
    }
  }

  function classOf(data) {
    return toString.call(data).slice(8, -1);
  }

  function asyncError(error, context) {
    var promise = new Promise();

    var args = splice.call(arguments, 2);

    promise.reject(args[0]);

    if (typeof error === "function") {
      error.apply(context, args);
    }

    return promise;
  }

  function Promise() {
    this.cbs = [];
  }

  extend(Promise.prototype, {
    resolve: function (value) {
      if (this.state) return;

      var then = value && value.then,
        self = this,
        called;

      if (typeof then === "function") {
        try {
          then.call(value, function (value) {
            if (!called) {
              called = true;
              self.resolve(value);
            }
          }, function (value) {
            if (!called) {
              called = true;
              self.reject(value);
            }
          });
        } catch (e) {
          if (!called) {
            called = true;
            this.reject(e);
          }
        }
      } else {
        this.state = 1;
        this.value = value;

        for (var i = 0; i < this.cbs.length; i++) {
          var success = this.cbs[i][0],
            promise = this.cbs[i][2];

          try {
            if (typeof success === "function") {
              promise.resolve(success(value));
            } else {
              promise.resolve(value);
            }
          } catch (e) {
            promise.reject(e);
          }
        }

        this.cbs = null;
      }
    },

    reject: function (value) {
      if (this.state) return;

      this.state = -1;
      this.value = value;

      for (var i = 0; i < this.cbs.length; i++) {
        var error = this.cbs[i][1],
          promise = this.cbs[i][2];

        try {
          if (typeof error === "function") {
            promise.resolve(error(value));
          } else {
            promise.reject(value);
          }
        } catch (e) {
          promise.reject(e);
        }
      }

      this.cbs = null;
    },

    then: function (success, error) {
      var promise = new Promise();

      if (this.state) {
        var ret;

        try {
          if (this.state == 1) {
            if (typeof success === "function") {
              promise.resolve(success(this.value));
            } else {
              promise.resolve(this.value);
            }
          } else {
            if (typeof error === "function") {
              promise.resolve(error(this.value));
            } else {
              promise.reject(this.value);
            }
          }
        } catch (e) {
          promise.reject(e);
        }

      } else {
        this.cbs.push([success, error, promise]);
      }

      return promise;
    }
  });

  // ajax helper

  function request(configs, opts, success, error, context) {

    var method, contentType, responseType;

    if ("data" in opts) {
      var type = classOf(opts.data);
      console.log(type);
      if (type === "String") {
        contentType = "application/json";
      } else if (type === "FormData") {
        method = opts.method || "POST";
        //contentType = "application/x-www-form-urlencoded";
      } else {
        method = opts.method || "POST";
        contentType = "application/json";
        opts.data = JSON.stringify(opts.data);
      }
    } else {
      method = opts.method || "GET";
    }

    if (typeof error !== "function") {
      if (!context) context = error;
      error = null;
    }

    if (configs && !configs.apikey) {
      return asyncError(error, context, "API key not set", null);
    }
    var func = method.toLowerCase();
    if (func === 'delete') {
      func = 'del';
    }
    var req = agent[func](configs ? configs.protocol + opts.url : opts.url);
    if (contentType) {
      req = req.set("Content-Type", contentType);
    }

    if (configs) {
      req = req.set("Authorization", "Hoist " + configs.apikey);
    }

    if (opts.bucket) {
      req = req.set("x-bucket-key", opts.bucket);
    }

    if (opts.token) {
      req = req.set("OAuth", "Token " + opts.token);
    }
    if (req.withCredentials) {
      req = req.withCredentials();
    }
    responseType = opts.responseType || "json";

    var promise = new Promise();

    var callback = function (err, res) {

      if (err) {
        console.log(err);
        throw err;
      }
      if (res.status >= 200 && res.status < 400) {
        var response = res;
        if ((res.body || res.text) && responseType === 'json') {
          if (res.body) {
            response = res.body;
          } else {
            response = JSON.parse(res.text);
          }
        } else if (responseType === 'blob' && res.text && typeof Blob !== 'undefined') {
          response = new Blob([res.text]);
        }

        if (opts.process) {
          response = opts.process(response);
        }

        if (success) {
          success.call(context, response, res.xhr);
        }
        promise.resolve(response);
      } else {
        var message = res.text;

        if (opts.processError) message = opts.processError(message);

        if (error) {
          error.call(context, message, res.xhr);
        }
        promise.reject(message);
      }
    };
    if (opts.data) {
      if (classOf(opts.data) === "FormData") {
        req._formData = opts.data;
      } else {
        req.send(opts.data);
      }
    }
    req.end(callback);

    return promise;
  }

  // simple data manager

  function DataManager(hoist, type, bucket) {
    this.type = type;
    this.url = "data.hoi.io/" + type;
    this.hoist = hoist;
    this.bucket = bucket;
  }

  extend(DataManager.prototype, {
    get: function (id, success, error, context) {

      if (typeof id === "function") {
        context = error;
        error = success;
        success = id;
        id = null;
      }

      if (id) {

        return request(this.hoist._configs, {
          url: this.url + "/" + id,
          bucket: this.bucket
        }, success, error, context);
      } else {
        return request(this.hoist._configs, {
          url: this.url,
          bucket: this.bucket
        }, success, error, context);
      }
    },

    query: function (query) {
      return new QueryManager(this, {
        q: query
      });
    },

    where: function (key, value) {
      return new QueryManager(this, {}).where(key, value);
    },

    limit: function (limit) {
      return new QueryManager(this, {
        limit: limit
      });
    },

    skip: function (skip) {
      return new QueryManager(this, {
        skip: skip
      });
    },

    sortBy: function () {
      var qm = new QueryManager(this, {});
      return qm._sort(false, arguments);
    },

    post: function (id, data, success, error, context) {
      if (typeof id === "object" && id !== null) {
        context = error;
        error = success;
        success = data;
        data = id;
        id = data._id;
      }

      var singleton = classOf(data) === "Array" && data.length === 1;

      if (id) {
        return request(this.hoist._configs, {
          url: this.url + "/" + id,
          bucket: this.bucket,
          data: data
        }, success, error, context);
      } else {
        return request(this.hoist._configs, {
          url: this.url,
          bucket: this.bucket,
          data: data,
          process: function (resp) {
            return singleton ? [resp] : resp;
          }
        }, success, error, context);
      }
    },

    clear: function (success, error, context) {
      return request(this.hoist._configs, {
        url: this.url,
        bucket: this.bucket,
        method: "DELETE"
      }, success, error, context);
    },

    remove: function (id, success, error, context) {
      if (!id) {
        return asyncError(error, context, "Cannot remove model with empty id", null);
      }

      return request(this.hoist._configs, {
        url: this.url + "/" + id,
        bucket: this.bucket,
        method: "DELETE"
      }, success, error, context);
    },

    use: function (bucket) {
      return this.hoist(this.type, bucket);
    }
  });

  // query manager

  function QueryManager(dm, query) {
    this.dm = dm;
    this.query = query;
  }

  extend(QueryManager.prototype, {
    get: function (success, error, context) {
      var parts = [];

      if (this.query.q) parts.push("q=" + encodeURIComponent(JSON.stringify(this.query.q)));
      if (this.query.limit) parts.push("limit=" + this.query.limit);
      if (this.query.skip) parts.push("skip=" + this.query.skip);
      if (this.query.sort) parts.push("sort=" + encodeURIComponent(JSON.stringify(this.query.sort)));

      return request(this.dm.hoist._configs, {
        url: this.dm.url + "?" + parts.join('&'),
        bucket: this.dm.bucket
      }, success, error, context);
    },

    where: function (key, value) {
      if (typeof key === "string") {
        if (value === u) {
          return new PartialQueryManager(this, key);
        } else {
          return this._where(key, value);
        }
      }

      var query = extend({}, this.query);
      query.q = query.q ? extend({}, query.q) : {};
      extend(query.q, key);
      return new QueryManager(this.dm, query);
    },

    _where: function (key, value) {
      var query = extend({}, this.query);
      query.q = query.q ? extend({}, query.q) : {};
      query.q[key] = value;
      return new QueryManager(this.dm, query);
    },

    _whereAnd: function (key, op, value) {
      var query = extend({}, this.query);
      query.q = query.q ? extend({}, query.q) : {};
      query.q[key] = query.q[key] ? extend({}, query.q[key]) : {};
      query.q[key][op] = value;
      return new QueryManager(this.dm, query);
    },

    limit: function (limit) {
      var query = extend({}, this.query);
      query.limit = limit;
      return new QueryManager(this.dm, query);
    },

    skip: function (skip) {
      var query = extend({}, this.query);
      query.skip = skip;
      return new QueryManager(this.dm, query);
    },

    _sort: function (append, args) {
      var sort = append && this.query.sort && this.query.sort.slice() || [];

      for (var i = 0; i < args.length; i++) {
        if (args[i].slice(-4).toLowerCase() == " asc") {
          sort.push([args[i].slice(0, -4), 1]);
        } else if (args[i].slice(-5).toLowerCase() == " desc") {
          sort.push([args[i].slice(0, -5), -1]);
        } else {
          sort.push([args[i], 1]);
        }
      }

      var query = extend({}, this.query);
      query.sort = sort;
      return new QueryManager(this.dm, query);
    },

    sortBy: function () {
      return this._sort(false, arguments);
    },

    thenBy: function () {
      return this._sort(true, arguments);
    },

    use: function (bucket) {
      return new QueryManager(this.dm.use(bucket), this.query);
    }
  });

  // partial query manager, proxying mongo queries since 2014

  function PartialQueryManager(qm, key) {
    this.qm = qm;
    this.key = key;
  }

  extendAliases(PartialQueryManager.prototype, {
    "eq is equals": function (value) {
      this.qm = this.qm._where(this.key, value);
      return this;
    },
    "neq ne isnt notEquals": function (value) {
      this.qm = this.qm._whereAnd(this.key, "$ne", value);
      return this;
    },
    "gt greaterThan": function (value) {
      this.qm = this.qm._whereAnd(this.key, "$gt", value);
      return this;
    },
    "gte ge atLeast": function (value) {
      this.qm = this.qm._whereAnd(this.key, "$gte", value);
      return this;
    },
    "lt lessThan": function (value) {
      this.qm = this.qm._whereAnd(this.key, "$lt", value);
      return this;
    },
    "lte le atMost": function (value) {
      this.qm = this.qm._whereAnd(this.key, "$lte", value);
      return this;
    },
    "elem in": function (value) {
      this.qm = this.qm._whereAnd(this.key, "$in", value);
      return this;
    },
    "nelem nin notIn notElem": function (value) {
      this.qm = this.qm._whereAnd(this.key, "$nin", value);
      return this;
    },
    "exists": function () {
      this.qm = this.qm._whereAnd(this.key, "$exists", true);
      return this;
    }
  });

  extend(PartialQueryManager.prototype, {
    where: function (key, value) {
      return this.qm.where(key, value);
    },
    limit: function (limit) {
      return this.qm.limit(limit);
    },
    skip: function (skip) {
      return this.qm.skip(skip);
    },
    sort: function () {
      return this.qm.sort.apply(this.qm, arguments);
    },
    sortBy: function () {
      return this.qm._sort(false, arguments);
    },
    thenBy: function () {
      return this.qm._sort(true, arguments);
    },
    use: function (bucket) {
      return this.qm.use(bucket);
    },

    get: function (success, error, context) {
      return this.qm.get(success, error, context);
    }
  });

  // complex data manager

  var tagRegex = /\[([^\]]+)\]/g;

  function ObjectDataManager(hoist, hash, bucket) {
    var items = this.items = {};

    for (var x in hash) {
      var item = {
          key: x,
          path: hash[x],
          requires: []
        },
        match;

      if (item.path[item.path.length - 1] == '?') {
        item.path = item.path.slice(0, -1);
        item.optional = true;
      }

      while ((match = tagRegex.exec(item.path)) !== null) {
        var dot = match[1].indexOf('.');

        if (dot > -1) {
          item.requires.push(match[1].slice(0, dot));
        }
      }

      items[x] = item;
    }

    this.hoist = bucket ? hoist.use(bucket) : hoist;
  }

  extend(ObjectDataManager.prototype, {
    get: function (data, success, error, context) {
      var items = {},
        result = {},
        managers = {},
        hoist = this.hoist,
        failed,
        promise = new Promise();

      if (typeof data === "function") {
        context = error;
        error = success;
        success = data;
        data = {};
      } else if (typeof data === "string") {
        data = {
          id: data
        };
      }

      extend(items, this.items);

      if (typeof error !== "function") {
        if (!context) context = error;
        error = null;
      }

      function succeed(key) {
        return function (data) {
          result[key] = data;
          delete items[key];
          advance();
        };
      }

      function fail(key) {
        return function (msg, xhr) {
          if (items[key].optional) {
            succeed(key)(null);
          } else {
            failed = true;
            msg = key + ": " + msg;
            error && error.call(context, msg, xhr);
            promise.reject(msg);
          }
        };
      }

      function advance() {
        if (failed) return;

        var loading = 0;

        out: for (var x in items) {
          var item = items[x];

          if (!managers[x]) {
            for (var i = 0; i < item.requires.length; i++) {
              if (item.requires[i] in items) {
                continue out;
              }
            }

            var path = item.path.replace(tagRegex, function (a, b) {
                if (b.indexOf('.') > -1) {
                  return get(result, b);
                } else {
                  return data[b] || "";
                }
              }),
              space = path.indexOf(' ');

            if (space > -1) {
              (managers[item.key] = hoist(path.slice(0, space))).get(path.slice(space + 1), succeed(item.key), fail(item.key));
            } else {
              (managers[item.key] = hoist(path)).get(succeed(item.key), fail(item.key));
            }
          }

          loading++;
        }

        if (!loading) {
          success && success.call(context, result, managers);
          promise.resolve(result);
        }
      }

      advance();

      return promise;
    }
  });

  var bucketManagerMethods = {
    get: function (type, id, success, error, context) {
      return this.hoist(type, this.bucket).get(id, success, error, context);
    },

    post: function (type, id, success, error, context) {
      return this.hoist(type, this.bucket).post(id, data, success, error, context);
    },

    clear: function (type, success, error, context) {
      return this.hoist(type, this.bucket).clear(success, error, context);
    },

    remove: function (type, id, success, error, context) {
      return this.hoist(type, this.bucket).remove(id, success, error, context);
    },

    meta: function (data, success, error, context) {
      return this.hoist.bucket.meta(this.bucket, data, success, error, context);
    },

    invite: function (data, success, error, context) {
      return this.hoist.bucket.invite(this.bucket, data, success, error, context);
    },

    enter: function (success, error, context) {
      return this.hoist.bucket.set(this.bucket, success, error, context);
    }
  };

  var hoistMethods = {
    apiKey: function (v) {
      return this.config("apikey", v);
    },

    get: function (type, id, success, error, context) {
      return this(type).get(id, success, error, context);
    },

    post: function (type, id, data, success, error, context) {
      return this(type).post(id, data, success, error, context);
    },

    clear: function (type, success, error, context) {
      return this(type).clear(success, error, context);
    },

    remove: function (type, id, success, error, context) {
      return this(type).remove(id, success, error, context);
    },

    config: function (a, b, c) {
      if (b === u) {
        var type = typeof a;

        if (type === "string") {
          return this._configs[a];
        } else if (type === "object") {
          for (var x in a) {
            this._configs[x.toLowerCase()] = a[x];
          }
        } else if (type === "function" || type === "undefined") {
          var hoist = this;

          return request(null, {
            url: "/settings",
            process: function (settings) {
              hoist.config(settings);
              return settings;
            }
          }, a, b, c);
        }
      } else {
        this._configs[a.toLowerCase()] = b;
      }
    },

    status: function (success, error, context) {
      var hoist = this;

      if (typeof error !== "function") {
        if (!context) context = error;
        error = null;
      }

      return request(this._configs, {
        url: "auth.hoi.io/status",
        process: function (resp) {
          hoist._user = resp;
          return resp;
        },
        processError: function (msg) {
          hoist._user = null;
          return msg;
        }
      }, success, error, context);
    },

    signup: function (member, success, error, context) {
      var hoist = this;

      if (typeof member === "object") {
        return request(this._configs, {
          url: "auth.hoi.io/user",
          data: member,
          process: function (resp) {
            if (resp.redirectUrl) {
              window.location = resp.redirectUrl;
            }
            hoist._user = resp;
            return resp;
          }
        }, success, error, context);
      }
    },

    login: function (member, success, error, context) {
      var hoist = this;

      if (typeof member === "object") {
        return request(this._configs, {
          url: "auth.hoi.io/login",
          data: member,
          process: function (resp) {
            if (resp.redirectUrl) {
              window.location = resp.redirectUrl;
            }
            hoist._user = resp;
            return resp;
          }
        }, success, error, context);
      }
    },

    logout: function (success, error, context) {
      var hoist = this;

      return request(this._configs, {
        url: "auth.hoi.io/logout",
        method: "POST",
        process: function (resp) {
          hoist._user = null;
          hoist._bucket = null;
          return resp;
        }
      }, success, error, context);
    },

    accept: function (code, data, success, error, context) {
      var hoist = this;

      return request(this._configs, {
        url: "auth.hoi.io/invite/" + code + "/user",
        data: data,
        process: function (resp) {
          hoist._user = resp;
          return resp;
        }
      }, success, error, context);
    },

    user: function () {
      return this._user && extend({}, this._user);
    },

    notify: function (id, data, success, error, context) {
      if (typeof id === "object") {
        context = error;
        error = success;
        success = data;
        data = id.data;
        id = id.id;
      }

      if (typeof data === "object") {
        return request(this._configs, {
          url: "notify.hoi.io/notification/" + id,
          data: data
        }, success, error, context);
      } else {
        return asyncError(error, context, "data for notification must be an object");
      }
    },

    file: function (key, file, success, error, context) {
      if (file && file.jquery) {
        file = file[0];
      }

      var type = classOf(file),
        data;

      if (type === "File") {
        data = new FormData();
        data.append("file", file);
      } else if (type === "FormData") {
        data = file;
      } else if (type === "HTMLInputElement") {
        file = file.files && file.files[0];

        if (!file) return false;

        data = new FormData();
        data.append("file", file);
      } else if (type === "Function") {
        context = error;
        error = success;
        success = file;

        return request(this._configs, {
          url: "file.hoi.io/" + key,
          responseType: "blob"
        }, success, error, context);
        //undefined is DOMWindow in phantom for some reason
      } else if (type === "Undefined" || type === "DOMWindow") {
        return request(this._configs, {
          url: "file.hoi.io/" + key,
          responseType: "blob"
        }, success, error, context);
      } else {
        return asyncError(error, context, "can't send file of type " + type);
      }

      return request(this._configs, {
        url: "file.hoi.io/" + key,
        data: data
      }, success, error, context);
    },

    use: function (bucket) {
      var hoist = this;

      var manager = extend(function (type) {
        if (classOf(type) === "Object") {
          return new ObjectDataManager(manager, type);
        } else {
          return new DataManager(hoist, type, bucket);
        }
      }, bucketManagerMethods);

      manager.hoist = this;
      manager.bucket = bucket;

      return manager;
    },

    connector: function (type, token) {
      return new ConnectorManager(this, type, token);
    },

    clone: function () {
      var hoist = extend(makeHoist(), {
        _configs: extend({}, this._configs),
        _user: null,
        _bucket: null,
        _managers: {}
      });

      return hoist;
    }
  };

  var bucketMethods = {
    status: function (success, error, context) {
      var hoist = this._hoist;
      if (typeof error !== "function") {
        if (!context) context = error;
        error = null;
      }

      return request(this._hoist._configs, {
        url: "auth.hoi.io/bucket/current",
        process: function (bucket) {
          hoist._bucket = bucket;
          return bucket;
        },
        processError: function (message) {
          hoist._bucket = null;
          return message;
        }
      }, success, error, context);
    },

    post: function (id, data, success, error, context) {
      if (typeof id !== "string" && id !== null) {
        context = error;
        error = success;
        success = data;
        data = id;
        id = null;
      }

      if (typeof data === "function") {
        context = error;
        error = success;
        success = data;
        data = null;
      }

      if (id) {
        return request(this._hoist._configs, {
          url: "auth.hoi.io/bucket/" + id,
          data: data
        }, success, error, context);
      } else {
        return request(this._hoist._configs, {
          url: "auth.hoi.io/bucket",
          data: data
        }, success, error, context);
      }
    },

    meta: function (key, meta, success, error, context) {
      var hoist = this._hoist;

      if (typeof key !== "string") {
        context = error;
        error = success;
        success = meta;
        meta = key;

        if (!hoist._bucket) {
          return asyncError(error, context, "No bucket to post metadata against", null);
        }

        key = hoist._bucket.key;
      }

      return request(hoist._configs, {
        url: "auth.hoi.io/bucket/" + key + "/meta",
        data: meta,
        process: function (bucket) {
          if (hoist._bucket && hoist._bucket.key == bucket.key) {
            hoist._bucket = bucket;
          }

          return bucket;
        }
      }, success, error, context);
    },

    set: function (key, success, error, context) {
      var hoist = this._hoist;

      return request(this._hoist._configs, {
        url: "auth.hoi.io/bucket/current/" + (key || "default"),
        method: "POST",
        process: function (bucket) {
          hoist._bucket = key ? bucket : null;
          return bucket;
        }
      }, success, error, context);
    },

    list: function (success, error, context) {
      return request(this._hoist._configs, {
        url: "auth.hoi.io/buckets"
      }, success, error, context);
    },

    invite: function (key, data, success, error, context) {
      if (typeof key == "object") {
        context = error;
        error = success;
        success = data;
        data = key;
        key = null;
      }

      if (key) data = _.extend({
        bucket: key
      }, data);

      return request(this._hoist._configs, {
        url: "auth.hoi.io/invite",
        data: data
      }, success, error, context);
    }
  };

  function ConnectorManager(hoist, type, token) {
    this.hoist = hoist;
    this.url = "proxy.hoi.io/" + type;
    this.token = token;
  }

  extend(ConnectorManager.prototype, {

    authorize: function (options, context) {

      var self = this;

      options = extend({
        url: window.location.href,
        error: function () {},
        success: function () {},
        redirect: function (redirect_url) {
          window.location = redirect_url;
        }
      }, options);

      return request(this.hoist._configs, {
        url: this.url + "/connect",
        data: {
          return_url: options.url
        }
      }, function (res) {
        if (res.token) {
          self.token = res.token;
        }
        if (res.redirect) {
          options.redirect && options.redirect.apply(this, [res.redirect]);
          return;
        }
        options.success && options.success.apply(this, arguments);
      }, options.error, context);

    },

    disconnect: function (success, error, context) {
      return request(this.hoist_configs, {
        url: this.url + "/disconnect"
      }, success, error, context);
    },
    removeFromUser: function (success, error, context) {
      return request(this.hoist_configs, {
        url: this.url + "/removeFromUser"
      }, success, error, context);
    },

    get: function (path, success, error, context) {

      if (path[0] !== '/') path = '/' + path;
      return request(this.hoist._configs, {
        url: this.url + path,
        token: this.token
      }, success, error, context);
    },

    post: function (path, data, success, error, context) {
      if (path[0] !== '/') path = '/' + path;
      return request(this.hoist._configs, {
        url: this.url + path,
        data: data,
        token: this.token
      }, success, error, context);
    },

    put: function (path, data, success, error, context) {
      if (path[0] !== '/') path = '/' + path;
      return request(this.hoist._configs, {
        url: this.url + path,
        data: data,
        method: "PUT",
        token: this.token
      }, success, error, context);
    },

    remove: function (path, data, success, error, context) {
      if (typeof data === "function") {
        context = error;
        error = success;
        success = data;
        data = null;
      }

      if (path[0] !== '/') path = '/' + path;
      return request(this.hoist._configs, {
        url: this.url + path,
        data: data,
        method: "DELETE",
        token: this.token
      }, success, error, context);
    }
  });

  function makeHoist() {
    var hoist = extend(function (type, bucket) {
      if (classOf(type) === "Object") {
        return new ObjectDataManager(hoist, type, bucket);
      } else {
        return new DataManager(hoist, type, bucket);
      }
    }, hoistMethods);

    hoist.bucket = extend(function (meta, success, error, context, cx) {
      var type = typeof meta;

      if (type === "function") {
        hoist.bucket.status(meta, success, error);
      } else if (type === "string" && typeof success === "object") {
        hoist.bucket.post(meta, success, error, context, cx);
      } else if (type === "string" || meta === null) {
        hoist.bucket.set(meta, success, error, context);
      } else if (type === "object") {
        hoist.bucket.meta(meta, success, error, context);
      } else {
        return hoist._bucket;
      }
    }, bucketMethods);

    hoist.bucket._hoist = hoist;

    return hoist;
  }

  var Hoist = extend(makeHoist(), {
    _configs: {
      protocol: "https://"
    },
    _user: null,
    _bucket: null,
    _managers: {}
  });

  // throw Hoist at something it will stick to
  if (typeof define === "function" && define.amd) {
    define("Hoist", [''], function () {
      return Hoist;
    });
  } else if (typeof window === "object" && typeof window.document === "object") {
    window.Hoist = Hoist;
  } else if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = Hoist;
  }
})();

},{"superagent":1}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVm9sdW1lcy9TdG9yZS9Qcm9qZWN0cy9ob2lzdC9ob2lzdC1qcy9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1ZvbHVtZXMvU3RvcmUvUHJvamVjdHMvaG9pc3QvaG9pc3QtanMvbm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL2NsaWVudC5qcyIsIi9Wb2x1bWVzL1N0b3JlL1Byb2plY3RzL2hvaXN0L2hvaXN0LWpzL25vZGVfbW9kdWxlcy9zdXBlcmFnZW50L25vZGVfbW9kdWxlcy9jb21wb25lbnQtZW1pdHRlci9pbmRleC5qcyIsIi9Wb2x1bWVzL1N0b3JlL1Byb2plY3RzL2hvaXN0L2hvaXN0LWpzL25vZGVfbW9kdWxlcy9zdXBlcmFnZW50L25vZGVfbW9kdWxlcy9yZWR1Y2UtY29tcG9uZW50L2luZGV4LmpzIiwiL1ZvbHVtZXMvU3RvcmUvUHJvamVjdHMvaG9pc3QvaG9pc3QtanMvc3JjL2hvaXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3poQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnZW1pdHRlcicpO1xudmFyIHJlZHVjZSA9IHJlcXVpcmUoJ3JlZHVjZScpO1xuXG4vKipcbiAqIFJvb3QgcmVmZXJlbmNlIGZvciBpZnJhbWVzLlxuICovXG5cbnZhciByb290ID0gJ3VuZGVmaW5lZCcgPT0gdHlwZW9mIHdpbmRvd1xuICA/IHRoaXNcbiAgOiB3aW5kb3c7XG5cbi8qKlxuICogTm9vcC5cbiAqL1xuXG5mdW5jdGlvbiBub29wKCl7fTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhIGhvc3Qgb2JqZWN0LFxuICogd2UgZG9uJ3Qgd2FudCB0byBzZXJpYWxpemUgdGhlc2UgOilcbiAqXG4gKiBUT0RPOiBmdXR1cmUgcHJvb2YsIG1vdmUgdG8gY29tcG9lbnQgbGFuZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc0hvc3Qob2JqKSB7XG4gIHZhciBzdHIgPSB7fS50b1N0cmluZy5jYWxsKG9iaik7XG5cbiAgc3dpdGNoIChzdHIpIHtcbiAgICBjYXNlICdbb2JqZWN0IEZpbGVdJzpcbiAgICBjYXNlICdbb2JqZWN0IEJsb2JdJzpcbiAgICBjYXNlICdbb2JqZWN0IEZvcm1EYXRhXSc6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIFhIUi5cbiAqL1xuXG5mdW5jdGlvbiBnZXRYSFIoKSB7XG4gIGlmIChyb290LlhNTEh0dHBSZXF1ZXN0XG4gICAgJiYgKCdmaWxlOicgIT0gcm9vdC5sb2NhdGlvbi5wcm90b2NvbCB8fCAhcm9vdC5BY3RpdmVYT2JqZWN0KSkge1xuICAgIHJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3Q7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC42LjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuMy4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLCBhZGRlZCB0byBzdXBwb3J0IElFLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgdHJpbSA9ICcnLnRyaW1cbiAgPyBmdW5jdGlvbihzKSB7IHJldHVybiBzLnRyaW0oKTsgfVxuICA6IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMucmVwbGFjZSgvKF5cXHMqfFxccyokKS9nLCAnJyk7IH07XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG59XG5cbi8qKlxuICogU2VyaWFsaXplIHRoZSBnaXZlbiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUob2JqKSB7XG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgdmFyIHBhaXJzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAobnVsbCAhPSBvYmpba2V5XSkge1xuICAgICAgcGFpcnMucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KVxuICAgICAgICArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChvYmpba2V5XSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFpcnMuam9pbignJicpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBzZXJpYWxpemF0aW9uIG1ldGhvZC5cbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QgPSBzZXJpYWxpemU7XG5cbiAvKipcbiAgKiBQYXJzZSB0aGUgZ2l2ZW4geC13d3ctZm9ybS11cmxlbmNvZGVkIGBzdHJgLlxuICAqXG4gICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICAqIEByZXR1cm4ge09iamVjdH1cbiAgKiBAYXBpIHByaXZhdGVcbiAgKi9cblxuZnVuY3Rpb24gcGFyc2VTdHJpbmcoc3RyKSB7XG4gIHZhciBvYmogPSB7fTtcbiAgdmFyIHBhaXJzID0gc3RyLnNwbGl0KCcmJyk7XG4gIHZhciBwYXJ0cztcbiAgdmFyIHBhaXI7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgcGFpciA9IHBhaXJzW2ldO1xuICAgIHBhcnRzID0gcGFpci5zcGxpdCgnPScpO1xuICAgIG9ialtkZWNvZGVVUklDb21wb25lbnQocGFydHNbMF0pXSA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJ0c1sxXSk7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEV4cG9zZSBwYXJzZXIuXG4gKi9cblxucmVxdWVzdC5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xuXG4vKipcbiAqIERlZmF1bHQgTUlNRSB0eXBlIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKi9cblxucmVxdWVzdC50eXBlcyA9IHtcbiAgaHRtbDogJ3RleHQvaHRtbCcsXG4gIGpzb246ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgeG1sOiAnYXBwbGljYXRpb24veG1sJyxcbiAgdXJsZW5jb2RlZDogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtLWRhdGEnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuLyoqXG4gKiBEZWZhdWx0IHNlcmlhbGl6YXRpb24gbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihvYmope1xuICogICAgICAgcmV0dXJuICdnZW5lcmF0ZWQgeG1sIGhlcmUnO1xuICogICAgIH07XG4gKlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZSA9IHtcbiAgICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBzZXJpYWxpemUsXG4gICAnYXBwbGljYXRpb24vanNvbic6IEpTT04uc3RyaW5naWZ5XG4gfTtcblxuIC8qKlxuICAqIERlZmF1bHQgcGFyc2Vycy5cbiAgKlxuICAqICAgICBzdXBlcmFnZW50LnBhcnNlWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKHN0cil7XG4gICogICAgICAgcmV0dXJuIHsgb2JqZWN0IHBhcnNlZCBmcm9tIHN0ciB9O1xuICAqICAgICB9O1xuICAqXG4gICovXG5cbnJlcXVlc3QucGFyc2UgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBwYXJzZVN0cmluZyxcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnBhcnNlXG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBoZWFkZXIgYHN0cmAgaW50b1xuICogYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1hcHBlZCBmaWVsZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXIoc3RyKSB7XG4gIHZhciBsaW5lcyA9IHN0ci5zcGxpdCgvXFxyP1xcbi8pO1xuICB2YXIgZmllbGRzID0ge307XG4gIHZhciBpbmRleDtcbiAgdmFyIGxpbmU7XG4gIHZhciBmaWVsZDtcbiAgdmFyIHZhbDtcblxuICBsaW5lcy5wb3AoKTsgLy8gdHJhaWxpbmcgQ1JMRlxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGxpbmUgPSBsaW5lc1tpXTtcbiAgICBpbmRleCA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGZpZWxkID0gbGluZS5zbGljZSgwLCBpbmRleCkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB0cmltKGxpbmUuc2xpY2UoaW5kZXggKyAxKSk7XG4gICAgZmllbGRzW2ZpZWxkXSA9IHZhbDtcbiAgfVxuXG4gIHJldHVybiBmaWVsZHM7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBtaW1lIHR5cGUgZm9yIHRoZSBnaXZlbiBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0eXBlKHN0cil7XG4gIHJldHVybiBzdHIuc3BsaXQoLyAqOyAqLykuc2hpZnQoKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGhlYWRlciBmaWVsZCBwYXJhbWV0ZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcmFtcyhzdHIpe1xuICByZXR1cm4gcmVkdWNlKHN0ci5zcGxpdCgvICo7ICovKSwgZnVuY3Rpb24ob2JqLCBzdHIpe1xuICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgvICo9ICovKVxuICAgICAgLCBrZXkgPSBwYXJ0cy5zaGlmdCgpXG4gICAgICAsIHZhbCA9IHBhcnRzLnNoaWZ0KCk7XG5cbiAgICBpZiAoa2V5ICYmIHZhbCkgb2JqW2tleV0gPSB2YWw7XG4gICAgcmV0dXJuIG9iajtcbiAgfSwge30pO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXNwb25zZWAgd2l0aCB0aGUgZ2l2ZW4gYHhocmAuXG4gKlxuICogIC0gc2V0IGZsYWdzICgub2ssIC5lcnJvciwgZXRjKVxuICogIC0gcGFyc2UgaGVhZGVyXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogIEFsaWFzaW5nIGBzdXBlcmFnZW50YCBhcyBgcmVxdWVzdGAgaXMgbmljZTpcbiAqXG4gKiAgICAgIHJlcXVlc3QgPSBzdXBlcmFnZW50O1xuICpcbiAqICBXZSBjYW4gdXNlIHRoZSBwcm9taXNlLWxpa2UgQVBJLCBvciBwYXNzIGNhbGxiYWNrczpcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJykuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJywgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgU2VuZGluZyBkYXRhIGNhbiBiZSBjaGFpbmVkOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5zZW5kKClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnBvc3QoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIE9yIGZ1cnRoZXIgcmVkdWNlZCB0byBhIHNpbmdsZSBjYWxsIGZvciBzaW1wbGUgY2FzZXM6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogQHBhcmFtIHtYTUxIVFRQUmVxdWVzdH0geGhyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gUmVzcG9uc2UocmVxLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB0aGlzLnJlcSA9IHJlcTtcbiAgdGhpcy54aHIgPSB0aGlzLnJlcS54aHI7XG4gIHRoaXMudGV4dCA9IHRoaXMueGhyLnJlc3BvbnNlVGV4dDtcbiAgdGhpcy5zZXRTdGF0dXNQcm9wZXJ0aWVzKHRoaXMueGhyLnN0YXR1cyk7XG4gIHRoaXMuaGVhZGVyID0gdGhpcy5oZWFkZXJzID0gcGFyc2VIZWFkZXIodGhpcy54aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuICAvLyBnZXRBbGxSZXNwb25zZUhlYWRlcnMgc29tZXRpbWVzIGZhbHNlbHkgcmV0dXJucyBcIlwiIGZvciBDT1JTIHJlcXVlc3RzLCBidXRcbiAgLy8gZ2V0UmVzcG9uc2VIZWFkZXIgc3RpbGwgd29ya3MuIHNvIHdlIGdldCBjb250ZW50LXR5cGUgZXZlbiBpZiBnZXR0aW5nXG4gIC8vIG90aGVyIGhlYWRlcnMgZmFpbHMuXG4gIHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSA9IHRoaXMueGhyLmdldFJlc3BvbnNlSGVhZGVyKCdjb250ZW50LXR5cGUnKTtcbiAgdGhpcy5zZXRIZWFkZXJQcm9wZXJ0aWVzKHRoaXMuaGVhZGVyKTtcbiAgdGhpcy5ib2R5ID0gdGhpcy5yZXEubWV0aG9kICE9ICdIRUFEJ1xuICAgID8gdGhpcy5wYXJzZUJvZHkodGhpcy50ZXh0KVxuICAgIDogbnVsbDtcbn1cblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgcmVsYXRlZCBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBgLnR5cGVgIHRoZSBjb250ZW50IHR5cGUgd2l0aG91dCBwYXJhbXNcbiAqXG4gKiBBIHJlc3BvbnNlIG9mIFwiQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PXV0Zi04XCJcbiAqIHdpbGwgcHJvdmlkZSB5b3Ugd2l0aCBhIGAudHlwZWAgb2YgXCJ0ZXh0L3BsYWluXCIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhlYWRlclxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldEhlYWRlclByb3BlcnRpZXMgPSBmdW5jdGlvbihoZWFkZXIpe1xuICAvLyBjb250ZW50LXR5cGVcbiAgdmFyIGN0ID0gdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddIHx8ICcnO1xuICB0aGlzLnR5cGUgPSB0eXBlKGN0KTtcblxuICAvLyBwYXJhbXNcbiAgdmFyIG9iaiA9IHBhcmFtcyhjdCk7XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHRoaXNba2V5XSA9IG9ialtrZXldO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYm9keSBgc3RyYC5cbiAqXG4gKiBVc2VkIGZvciBhdXRvLXBhcnNpbmcgb2YgYm9kaWVzLiBQYXJzZXJzXG4gKiBhcmUgZGVmaW5lZCBvbiB0aGUgYHN1cGVyYWdlbnQucGFyc2VgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5wYXJzZUJvZHkgPSBmdW5jdGlvbihzdHIpe1xuICB2YXIgcGFyc2UgPSByZXF1ZXN0LnBhcnNlW3RoaXMudHlwZV07XG4gIHJldHVybiBwYXJzZVxuICAgID8gcGFyc2Uoc3RyKVxuICAgIDogbnVsbDtcbn07XG5cbi8qKlxuICogU2V0IGZsYWdzIHN1Y2ggYXMgYC5va2AgYmFzZWQgb24gYHN0YXR1c2AuXG4gKlxuICogRm9yIGV4YW1wbGUgYSAyeHggcmVzcG9uc2Ugd2lsbCBnaXZlIHlvdSBhIGAub2tgIG9mIF9fdHJ1ZV9fXG4gKiB3aGVyZWFzIDV4eCB3aWxsIGJlIF9fZmFsc2VfXyBhbmQgYC5lcnJvcmAgd2lsbCBiZSBfX3RydWVfXy4gVGhlXG4gKiBgLmNsaWVudEVycm9yYCBhbmQgYC5zZXJ2ZXJFcnJvcmAgYXJlIGFsc28gYXZhaWxhYmxlIHRvIGJlIG1vcmVcbiAqIHNwZWNpZmljLCBhbmQgYC5zdGF0dXNUeXBlYCBpcyB0aGUgY2xhc3Mgb2YgZXJyb3IgcmFuZ2luZyBmcm9tIDEuLjVcbiAqIHNvbWV0aW1lcyB1c2VmdWwgZm9yIG1hcHBpbmcgcmVzcG9uZCBjb2xvcnMgZXRjLlxuICpcbiAqIFwic3VnYXJcIiBwcm9wZXJ0aWVzIGFyZSBhbHNvIGRlZmluZWQgZm9yIGNvbW1vbiBjYXNlcy4gQ3VycmVudGx5IHByb3ZpZGluZzpcbiAqXG4gKiAgIC0gLm5vQ29udGVudFxuICogICAtIC5iYWRSZXF1ZXN0XG4gKiAgIC0gLnVuYXV0aG9yaXplZFxuICogICAtIC5ub3RBY2NlcHRhYmxlXG4gKiAgIC0gLm5vdEZvdW5kXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHN0YXR1c1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldFN0YXR1c1Byb3BlcnRpZXMgPSBmdW5jdGlvbihzdGF0dXMpe1xuICB2YXIgdHlwZSA9IHN0YXR1cyAvIDEwMCB8IDA7XG5cbiAgLy8gc3RhdHVzIC8gY2xhc3NcbiAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gIHRoaXMuc3RhdHVzVHlwZSA9IHR5cGU7XG5cbiAgLy8gYmFzaWNzXG4gIHRoaXMuaW5mbyA9IDEgPT0gdHlwZTtcbiAgdGhpcy5vayA9IDIgPT0gdHlwZTtcbiAgdGhpcy5jbGllbnRFcnJvciA9IDQgPT0gdHlwZTtcbiAgdGhpcy5zZXJ2ZXJFcnJvciA9IDUgPT0gdHlwZTtcbiAgdGhpcy5lcnJvciA9ICg0ID09IHR5cGUgfHwgNSA9PSB0eXBlKVxuICAgID8gdGhpcy50b0Vycm9yKClcbiAgICA6IGZhbHNlO1xuXG4gIC8vIHN1Z2FyXG4gIHRoaXMuYWNjZXB0ZWQgPSAyMDIgPT0gc3RhdHVzO1xuICB0aGlzLm5vQ29udGVudCA9IDIwNCA9PSBzdGF0dXMgfHwgMTIyMyA9PSBzdGF0dXM7XG4gIHRoaXMuYmFkUmVxdWVzdCA9IDQwMCA9PSBzdGF0dXM7XG4gIHRoaXMudW5hdXRob3JpemVkID0gNDAxID09IHN0YXR1cztcbiAgdGhpcy5ub3RBY2NlcHRhYmxlID0gNDA2ID09IHN0YXR1cztcbiAgdGhpcy5ub3RGb3VuZCA9IDQwNCA9PSBzdGF0dXM7XG4gIHRoaXMuZm9yYmlkZGVuID0gNDAzID09IHN0YXR1cztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGBFcnJvcmAgcmVwcmVzZW50YXRpdmUgb2YgdGhpcyByZXNwb25zZS5cbiAqXG4gKiBAcmV0dXJuIHtFcnJvcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnRvRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgcmVxID0gdGhpcy5yZXE7XG4gIHZhciBtZXRob2QgPSByZXEubWV0aG9kO1xuICB2YXIgdXJsID0gcmVxLnVybDtcblxuICB2YXIgbXNnID0gJ2Nhbm5vdCAnICsgbWV0aG9kICsgJyAnICsgdXJsICsgJyAoJyArIHRoaXMuc3RhdHVzICsgJyknO1xuICB2YXIgZXJyID0gbmV3IEVycm9yKG1zZyk7XG4gIGVyci5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgZXJyLm1ldGhvZCA9IG1ldGhvZDtcbiAgZXJyLnVybCA9IHVybDtcblxuICByZXR1cm4gZXJyO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5yZXF1ZXN0LlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdGAgd2l0aCB0aGUgZ2l2ZW4gYG1ldGhvZGAgYW5kIGB1cmxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdChtZXRob2QsIHVybCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIEVtaXR0ZXIuY2FsbCh0aGlzKTtcbiAgdGhpcy5fcXVlcnkgPSB0aGlzLl9xdWVyeSB8fCBbXTtcbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmhlYWRlciA9IHt9O1xuICB0aGlzLl9oZWFkZXIgPSB7fTtcbiAgdGhpcy5vbignZW5kJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgcmVzID0gbmV3IFJlc3BvbnNlKHNlbGYpO1xuICAgIGlmICgnSEVBRCcgPT0gbWV0aG9kKSByZXMudGV4dCA9IG51bGw7XG4gICAgc2VsZi5jYWxsYmFjayhudWxsLCByZXMpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBNaXhpbiBgRW1pdHRlcmAuXG4gKi9cblxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogQWxsb3cgZm9yIGV4dGVuc2lvblxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIGZuKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBTZXQgdGltZW91dCB0byBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbihtcyl7XG4gIHRoaXMuX3RpbWVvdXQgPSBtcztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENsZWFyIHByZXZpb3VzIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3RpbWVvdXQgPSAwO1xuICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWJvcnQgdGhlIHJlcXVlc3QsIGFuZCBjbGVhciBwb3RlbnRpYWwgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCl7XG4gIGlmICh0aGlzLmFib3J0ZWQpIHJldHVybjtcbiAgdGhpcy5hYm9ydGVkID0gdHJ1ZTtcbiAgdGhpcy54aHIuYWJvcnQoKTtcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgdGhpcy5lbWl0KCdhYm9ydCcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciBgZmllbGRgIHRvIGB2YWxgLCBvciBtdWx0aXBsZSBmaWVsZHMgd2l0aCBvbmUgb2JqZWN0LlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5zZXQoJ1gtQVBJLUtleScsICdmb29iYXInKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCh7IEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLCAnWC1BUEktS2V5JzogJ2Zvb2JhcicgfSlcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZmllbGQsIHZhbCl7XG4gIGlmIChpc09iamVjdChmaWVsZCkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZmllbGQpIHtcbiAgICAgIHRoaXMuc2V0KGtleSwgZmllbGRba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXSA9IHZhbDtcbiAgdGhpcy5oZWFkZXJbZmllbGRdID0gdmFsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgaGVhZGVyIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5nZXRIZWFkZXIgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQ29udGVudC1UeXBlJywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBY2NlcHQgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMuanNvbiA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFjY2VwdFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQWNjZXB0JywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBdXRob3JpemF0aW9uIGZpZWxkIHZhbHVlIHdpdGggYHVzZXJgIGFuZCBgcGFzc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXNzXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uKHVzZXIsIHBhc3Mpe1xuICB2YXIgc3RyID0gYnRvYSh1c2VyICsgJzonICsgcGFzcyk7XG4gIHRoaXMuc2V0KCdBdXRob3JpemF0aW9uJywgJ0Jhc2ljICcgKyBzdHIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuKiBBZGQgcXVlcnktc3RyaW5nIGB2YWxgLlxuKlxuKiBFeGFtcGxlczpcbipcbiogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiogICAgIC5xdWVyeSgnc2l6ZT0xMCcpXG4qICAgICAucXVlcnkoeyBjb2xvcjogJ2JsdWUnIH0pXG4qXG4qIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gdmFsXG4qIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuKiBAYXBpIHB1YmxpY1xuKi9cblxuUmVxdWVzdC5wcm90b3R5cGUucXVlcnkgPSBmdW5jdGlvbih2YWwpe1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkgdmFsID0gc2VyaWFsaXplKHZhbCk7XG4gIGlmICh2YWwpIHRoaXMuX3F1ZXJ5LnB1c2godmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdyaXRlIHRoZSBmaWVsZCBgbmFtZWAgYW5kIGB2YWxgIGZvciBcIm11bHRpcGFydC9mb3JtLWRhdGFcIlxuICogcmVxdWVzdCBib2RpZXMuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoJ2ZvbycsICdiYXInKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ3xCbG9ifEZpbGV9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmZpZWxkID0gZnVuY3Rpb24obmFtZSwgdmFsKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKG5hbWUsIHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBRdWV1ZSB0aGUgZ2l2ZW4gYGZpbGVgIGFzIGFuIGF0dGFjaG1lbnQgdG8gdGhlIHNwZWNpZmllZCBgZmllbGRgLFxuICogd2l0aCBvcHRpb25hbCBgZmlsZW5hbWVgLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmF0dGFjaChuZXcgQmxvYihbJzxhIGlkPVwiYVwiPjxiIGlkPVwiYlwiPmhleSE8L2I+PC9hPiddLCB7IHR5cGU6IFwidGV4dC9odG1sXCJ9KSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEBwYXJhbSB7QmxvYnxGaWxlfSBmaWxlXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdHRhY2ggPSBmdW5jdGlvbihmaWVsZCwgZmlsZSwgZmlsZW5hbWUpe1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB0aGlzLl9mb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQoZmllbGQsIGZpbGUsIGZpbGVuYW1lKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNlbmQgYGRhdGFgLCBkZWZhdWx0aW5nIHRoZSBgLnR5cGUoKWAgdG8gXCJqc29uXCIgd2hlblxuICogYW4gb2JqZWN0IGlzIGdpdmVuLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgIC8vIHF1ZXJ5c3RyaW5nXG4gKiAgICAgICByZXF1ZXN0LmdldCgnL3NlYXJjaCcpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbXVsdGlwbGUgZGF0YSBcIndyaXRlc1wiXG4gKiAgICAgICByZXF1ZXN0LmdldCgnL3NlYXJjaCcpXG4gKiAgICAgICAgIC5zZW5kKHsgc2VhcmNoOiAncXVlcnknIH0pXG4gKiAgICAgICAgIC5zZW5kKHsgcmFuZ2U6ICcxLi41JyB9KVxuICogICAgICAgICAuc2VuZCh7IG9yZGVyOiAnZGVzYycgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdqc29uJylcbiAqICAgICAgICAgLnNlbmQoJ3tcIm5hbWVcIjpcInRqXCJ9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8ganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKCduYW1lPXRqJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gZGVmYXVsdHMgdG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICogICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAgKiAgICAgICAgLnNlbmQoJ25hbWU9dG9iaScpXG4gICogICAgICAgIC5zZW5kKCdzcGVjaWVzPWZlcnJldCcpXG4gICogICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpe1xuICB2YXIgb2JqID0gaXNPYmplY3QoZGF0YSk7XG4gIHZhciB0eXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuXG4gIC8vIG1lcmdlXG4gIGlmIChvYmogJiYgaXNPYmplY3QodGhpcy5fZGF0YSkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgICAgdGhpcy5fZGF0YVtrZXldID0gZGF0YVtrZXldO1xuICAgIH1cbiAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgZGF0YSkge1xuICAgIGlmICghdHlwZSkgdGhpcy50eXBlKCdmb3JtJyk7XG4gICAgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAoJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcgPT0gdHlwZSkge1xuICAgICAgdGhpcy5fZGF0YSA9IHRoaXMuX2RhdGFcbiAgICAgICAgPyB0aGlzLl9kYXRhICsgJyYnICsgZGF0YVxuICAgICAgICA6IGRhdGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2RhdGEgPSAodGhpcy5fZGF0YSB8fCAnJykgKyBkYXRhO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9kYXRhID0gZGF0YTtcbiAgfVxuXG4gIGlmICghb2JqKSByZXR1cm4gdGhpcztcbiAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2pzb24nKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludm9rZSB0aGUgY2FsbGJhY2sgd2l0aCBgZXJyYCBhbmQgYHJlc2BcbiAqIGFuZCBoYW5kbGUgYXJpdHkgY2hlY2suXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1Jlc3BvbnNlfSByZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNhbGxiYWNrID0gZnVuY3Rpb24oZXJyLCByZXMpe1xuICB2YXIgZm4gPSB0aGlzLl9jYWxsYmFjaztcbiAgaWYgKDIgPT0gZm4ubGVuZ3RoKSByZXR1cm4gZm4oZXJyLCByZXMpO1xuICBpZiAoZXJyKSByZXR1cm4gdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gIGZuKHJlcyk7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHgtZG9tYWluIGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCdPcmlnaW4gaXMgbm90IGFsbG93ZWQgYnkgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJyk7XG4gIGVyci5jcm9zc0RvbWFpbiA9IHRydWU7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggdGltZW91dCBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0RXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3RpbWVvdXQgb2YgJyArIHRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnKTtcbiAgZXJyLnRpbWVvdXQgPSB0aW1lb3V0O1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0cmFuc21pc3Npb24gb2YgY29va2llcyB3aXRoIHgtZG9tYWluIHJlcXVlc3RzLlxuICpcbiAqIE5vdGUgdGhhdCBmb3IgdGhpcyB0byB3b3JrIHRoZSBvcmlnaW4gbXVzdCBub3QgYmVcbiAqIHVzaW5nIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIgd2l0aCBhIHdpbGRjYXJkLFxuICogYW5kIGFsc28gbXVzdCBzZXQgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiXG4gKiB0byBcInRydWVcIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLndpdGhDcmVkZW50aWFscyA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3dpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbml0aWF0ZSByZXF1ZXN0LCBpbnZva2luZyBjYWxsYmFjayBgZm4ocmVzKWBcbiAqIHdpdGggYW4gaW5zdGFuY2VvZiBgUmVzcG9uc2VgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciB4aHIgPSB0aGlzLnhociA9IGdldFhIUigpO1xuICB2YXIgcXVlcnkgPSB0aGlzLl9xdWVyeS5qb2luKCcmJyk7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGRhdGEgPSB0aGlzLl9mb3JtRGF0YSB8fCB0aGlzLl9kYXRhO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICAvLyBzdGF0ZSBjaGFuZ2VcbiAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKDQgIT0geGhyLnJlYWR5U3RhdGUpIHJldHVybjtcbiAgICBpZiAoMCA9PSB4aHIuc3RhdHVzKSB7XG4gICAgICBpZiAoc2VsZi5hYm9ydGVkKSByZXR1cm4gc2VsZi50aW1lb3V0RXJyb3IoKTtcbiAgICAgIHJldHVybiBzZWxmLmNyb3NzRG9tYWluRXJyb3IoKTtcbiAgICB9XG4gICAgc2VsZi5lbWl0KCdlbmQnKTtcbiAgfTtcblxuICAvLyBwcm9ncmVzc1xuICBpZiAoeGhyLnVwbG9hZCkge1xuICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsICogMTAwO1xuICAgICAgc2VsZi5lbWl0KCdwcm9ncmVzcycsIGUpO1xuICAgIH07XG4gIH1cblxuICAvLyB0aW1lb3V0XG4gIGlmICh0aW1lb3V0ICYmICF0aGlzLl90aW1lcikge1xuICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgc2VsZi5hYm9ydCgpO1xuICAgIH0sIHRpbWVvdXQpO1xuICB9XG5cbiAgLy8gcXVlcnlzdHJpbmdcbiAgaWYgKHF1ZXJ5KSB7XG4gICAgcXVlcnkgPSByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdChxdWVyeSk7XG4gICAgdGhpcy51cmwgKz0gfnRoaXMudXJsLmluZGV4T2YoJz8nKVxuICAgICAgPyAnJicgKyBxdWVyeVxuICAgICAgOiAnPycgKyBxdWVyeTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcblxuICAvLyBDT1JTXG4gIGlmICh0aGlzLl93aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuXG4gIC8vIGJvZHlcbiAgaWYgKCdHRVQnICE9IHRoaXMubWV0aG9kICYmICdIRUFEJyAhPSB0aGlzLm1ldGhvZCAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgZGF0YSAmJiAhaXNIb3N0KGRhdGEpKSB7XG4gICAgLy8gc2VyaWFsaXplIHN0dWZmXG4gICAgdmFyIHNlcmlhbGl6ZSA9IHJlcXVlc3Quc2VyaWFsaXplW3RoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKV07XG4gICAgaWYgKHNlcmlhbGl6ZSkgZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcbiAgfVxuXG4gIC8vIHNldCBoZWFkZXIgZmllbGRzXG4gIGZvciAodmFyIGZpZWxkIGluIHRoaXMuaGVhZGVyKSB7XG4gICAgaWYgKG51bGwgPT0gdGhpcy5oZWFkZXJbZmllbGRdKSBjb250aW51ZTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihmaWVsZCwgdGhpcy5oZWFkZXJbZmllbGRdKTtcbiAgfVxuXG4gIC8vIHNlbmQgc3R1ZmZcbiAgdGhpcy5lbWl0KCdyZXF1ZXN0JywgdGhpcyk7XG4gIHhoci5zZW5kKGRhdGEpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXF1ZXN0YC5cbiAqL1xuXG5yZXF1ZXN0LlJlcXVlc3QgPSBSZXF1ZXN0O1xuXG4vKipcbiAqIElzc3VlIGEgcmVxdWVzdDpcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICByZXF1ZXN0KCdHRVQnLCAnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJywgY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IHVybCBvciBjYWxsYmFja1xuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcmVxdWVzdChtZXRob2QsIHVybCkge1xuICAvLyBjYWxsYmFja1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdXJsKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpLmVuZCh1cmwpO1xuICB9XG5cbiAgLy8gdXJsIGZpcnN0XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCk7XG4gIH1cblxuICByZXR1cm4gbmV3IFJlcXVlc3QobWV0aG9kLCB1cmwpO1xufVxuXG4vKipcbiAqIEdFVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5nZXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0dFVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBIRUFEIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmhlYWQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0hFQUQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBERUxFVEUgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZGVsID0gZnVuY3Rpb24odXJsLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQQVRDSCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBhdGNoID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQQVRDSCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBPU1QgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQT1NUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUFVUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucHV0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQVVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYHJlcXVlc3RgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWVzdDtcbiIsIlxuLyoqXG4gKiBFeHBvc2UgYEVtaXR0ZXJgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBFbWl0dGVyYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIEVtaXR0ZXIob2JqKSB7XG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xufTtcblxuLyoqXG4gKiBNaXhpbiB0aGUgZW1pdHRlciBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1peGluKG9iaikge1xuICBmb3IgKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtcbiAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uID1cbkVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gICh0aGlzLl9jYWxsYmFja3NbZXZlbnRdID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXSlcbiAgICAucHVzaChmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIGZ1bmN0aW9uIG9uKCkge1xuICAgIHNlbGYub2ZmKGV2ZW50LCBvbik7XG4gICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIG9uLmZuID0gZm47XG4gIHRoaXMub24oZXZlbnQsIG9uKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGBldmVudGAgb3IgYWxsXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vZmYgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgLy8gYWxsXG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHNwZWNpZmljIGV2ZW50XG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICBpZiAoIWNhbGxiYWNrcykgcmV0dXJuIHRoaXM7XG5cbiAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxuICB2YXIgY2I7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2IgPSBjYWxsYmFja3NbaV07XG4gICAgaWYgKGNiID09PSBmbiB8fCBjYi5mbiA9PT0gZm4pIHtcbiAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaSwgMSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVtaXQgYGV2ZW50YCB3aXRoIHRoZSBnaXZlbiBhcmdzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtNaXhlZH0gLi4uXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAsIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG5cbiAgaWYgKGNhbGxiYWNrcykge1xuICAgIGNhbGxiYWNrcyA9IGNhbGxiYWNrcy5zbGljZSgwKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICBjYWxsYmFja3NbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHJldHVybiB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGlzIGVtaXR0ZXIgaGFzIGBldmVudGAgaGFuZGxlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHJldHVybiAhISB0aGlzLmxpc3RlbmVycyhldmVudCkubGVuZ3RoO1xufTtcbiIsIlxuLyoqXG4gKiBSZWR1Y2UgYGFycmAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7TWl4ZWR9IGluaXRpYWxcbiAqXG4gKiBUT0RPOiBjb21iYXRpYmxlIGVycm9yIGhhbmRsaW5nP1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbiwgaW5pdGlhbCl7ICBcbiAgdmFyIGlkeCA9IDA7XG4gIHZhciBsZW4gPSBhcnIubGVuZ3RoO1xuICB2YXIgY3VyciA9IGFyZ3VtZW50cy5sZW5ndGggPT0gM1xuICAgID8gaW5pdGlhbFxuICAgIDogYXJyW2lkeCsrXTtcblxuICB3aGlsZSAoaWR4IDwgbGVuKSB7XG4gICAgY3VyciA9IGZuLmNhbGwobnVsbCwgY3VyciwgYXJyW2lkeF0sICsraWR4LCBhcnIpO1xuICB9XG4gIFxuICByZXR1cm4gY3Vycjtcbn07IiwidmFyIGFnZW50ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpO1xuXG4vKmpzaGludCBsb29wZnVuYzogdHJ1ZSAqL1xuKGZ1bmN0aW9uICgpIHtcblxuICB2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgIHNwbGljZSA9IEFycmF5LnByb3RvdHlwZS5zcGxpY2UsXG4gICAgdTtcblxuICAvLyBoZWxwZXJzXG5cbiAgZnVuY3Rpb24gZXh0ZW5kKGludG8sIGZyb20pIHtcbiAgICBmb3IgKHZhciB4IGluIGZyb20pIGludG9beF0gPSBmcm9tW3hdO1xuICAgIHJldHVybiBpbnRvO1xuICB9XG5cbiAgZnVuY3Rpb24gZXh0ZW5kQWxpYXNlcyhpbnRvLCBmcm9tKSB7XG4gICAgZm9yICh2YXIgeCBpbiBmcm9tKSB7XG4gICAgICB2YXIgeHMgPSB4LnNwbGl0KCcgJyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSBpbnRvW3hzW2ldXSA9IGZyb21beF07XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0KG9iaiwga2V5LCBub3RoaW5nKSB7XG5cbiAgICBpZiAoa2V5LmluZGV4T2YoJy4nKSA9PSAtMSkge1xuICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICBrZXkgPSBrZXkuc3BsaXQoJy4nKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXkubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIG9iaiA9IG9ialtrZXlbaV1dO1xuICAgICAgICBpZiAoIW9iaikgcmV0dXJuIFwiXCI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmpba2V5W2ldXTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjbGFzc09mKGRhdGEpIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChkYXRhKS5zbGljZSg4LCAtMSk7XG4gIH1cblxuICBmdW5jdGlvbiBhc3luY0Vycm9yKGVycm9yLCBjb250ZXh0KSB7XG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgpO1xuXG4gICAgdmFyIGFyZ3MgPSBzcGxpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuXG4gICAgcHJvbWlzZS5yZWplY3QoYXJnc1swXSk7XG5cbiAgICBpZiAodHlwZW9mIGVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGVycm9yLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgZnVuY3Rpb24gUHJvbWlzZSgpIHtcbiAgICB0aGlzLmNicyA9IFtdO1xuICB9XG5cbiAgZXh0ZW5kKFByb21pc2UucHJvdG90eXBlLCB7XG4gICAgcmVzb2x2ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZSkgcmV0dXJuO1xuXG4gICAgICB2YXIgdGhlbiA9IHZhbHVlICYmIHZhbHVlLnRoZW4sXG4gICAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgICBjYWxsZWQ7XG5cbiAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghY2FsbGVkKSB7XG4gICAgICAgICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgIHNlbGYucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBzZWxmLnJlamVjdCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMucmVqZWN0KGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IDE7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIHN1Y2Nlc3MgPSB0aGlzLmNic1tpXVswXSxcbiAgICAgICAgICAgIHByb21pc2UgPSB0aGlzLmNic1tpXVsyXTtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHN1Y2Nlc3MgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICBwcm9taXNlLnJlc29sdmUoc3VjY2Vzcyh2YWx1ZSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBwcm9taXNlLnJlamVjdChlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNicyA9IG51bGw7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlamVjdDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZSkgcmV0dXJuO1xuXG4gICAgICB0aGlzLnN0YXRlID0gLTE7XG4gICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jYnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGVycm9yID0gdGhpcy5jYnNbaV1bMV0sXG4gICAgICAgICAgcHJvbWlzZSA9IHRoaXMuY2JzW2ldWzJdO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBlcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBwcm9taXNlLnJlc29sdmUoZXJyb3IodmFsdWUpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvbWlzZS5yZWplY3QodmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHByb21pc2UucmVqZWN0KGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2JzID0gbnVsbDtcbiAgICB9LFxuXG4gICAgdGhlbjogZnVuY3Rpb24gKHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCk7XG5cbiAgICAgIGlmICh0aGlzLnN0YXRlKSB7XG4gICAgICAgIHZhciByZXQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAodGhpcy5zdGF0ZSA9PSAxKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHN1Y2Nlc3MgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICBwcm9taXNlLnJlc29sdmUoc3VjY2Vzcyh0aGlzLnZhbHVlKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBwcm9taXNlLnJlc29sdmUodGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICBwcm9taXNlLnJlc29sdmUoZXJyb3IodGhpcy52YWx1ZSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcHJvbWlzZS5yZWplY3QodGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcHJvbWlzZS5yZWplY3QoZSk7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jYnMucHVzaChbc3VjY2VzcywgZXJyb3IsIHByb21pc2VdKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICB9KTtcblxuICAvLyBhamF4IGhlbHBlclxuXG4gIGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlncywgb3B0cywgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcblxuICAgIHZhciBtZXRob2QsIGNvbnRlbnRUeXBlLCByZXNwb25zZVR5cGU7XG5cbiAgICBpZiAoXCJkYXRhXCIgaW4gb3B0cykge1xuICAgICAgdmFyIHR5cGUgPSBjbGFzc09mKG9wdHMuZGF0YSk7XG4gICAgICBjb25zb2xlLmxvZyh0eXBlKTtcbiAgICAgIGlmICh0eXBlID09PSBcIlN0cmluZ1wiKSB7XG4gICAgICAgIGNvbnRlbnRUeXBlID0gXCJhcHBsaWNhdGlvbi9qc29uXCI7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiRm9ybURhdGFcIikge1xuICAgICAgICBtZXRob2QgPSBvcHRzLm1ldGhvZCB8fCBcIlBPU1RcIjtcbiAgICAgICAgLy9jb250ZW50VHlwZSA9IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZXRob2QgPSBvcHRzLm1ldGhvZCB8fCBcIlBPU1RcIjtcbiAgICAgICAgY29udGVudFR5cGUgPSBcImFwcGxpY2F0aW9uL2pzb25cIjtcbiAgICAgICAgb3B0cy5kYXRhID0gSlNPTi5zdHJpbmdpZnkob3B0cy5kYXRhKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbWV0aG9kID0gb3B0cy5tZXRob2QgfHwgXCJHRVRcIjtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGVycm9yICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGlmICghY29udGV4dCkgY29udGV4dCA9IGVycm9yO1xuICAgICAgZXJyb3IgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChjb25maWdzICYmICFjb25maWdzLmFwaWtleSkge1xuICAgICAgcmV0dXJuIGFzeW5jRXJyb3IoZXJyb3IsIGNvbnRleHQsIFwiQVBJIGtleSBub3Qgc2V0XCIsIG51bGwpO1xuICAgIH1cbiAgICB2YXIgZnVuYyA9IG1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChmdW5jID09PSAnZGVsZXRlJykge1xuICAgICAgZnVuYyA9ICdkZWwnO1xuICAgIH1cbiAgICB2YXIgcmVxID0gYWdlbnRbZnVuY10oY29uZmlncyA/IGNvbmZpZ3MucHJvdG9jb2wgKyBvcHRzLnVybCA6IG9wdHMudXJsKTtcbiAgICBpZiAoY29udGVudFR5cGUpIHtcbiAgICAgIHJlcSA9IHJlcS5zZXQoXCJDb250ZW50LVR5cGVcIiwgY29udGVudFR5cGUpO1xuICAgIH1cblxuICAgIGlmIChjb25maWdzKSB7XG4gICAgICByZXEgPSByZXEuc2V0KFwiQXV0aG9yaXphdGlvblwiLCBcIkhvaXN0IFwiICsgY29uZmlncy5hcGlrZXkpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLmJ1Y2tldCkge1xuICAgICAgcmVxID0gcmVxLnNldChcIngtYnVja2V0LWtleVwiLCBvcHRzLmJ1Y2tldCk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMudG9rZW4pIHtcbiAgICAgIHJlcSA9IHJlcS5zZXQoXCJPQXV0aFwiLCBcIlRva2VuIFwiICsgb3B0cy50b2tlbik7XG4gICAgfVxuICAgIGlmIChyZXEud2l0aENyZWRlbnRpYWxzKSB7XG4gICAgICByZXEgPSByZXEud2l0aENyZWRlbnRpYWxzKCk7XG4gICAgfVxuICAgIHJlc3BvbnNlVHlwZSA9IG9wdHMucmVzcG9uc2VUeXBlIHx8IFwianNvblwiO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgpO1xuXG4gICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24gKGVyciwgcmVzKSB7XG5cbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgICAgaWYgKHJlcy5zdGF0dXMgPj0gMjAwICYmIHJlcy5zdGF0dXMgPCA0MDApIHtcbiAgICAgICAgdmFyIHJlc3BvbnNlID0gcmVzO1xuICAgICAgICBpZiAoKHJlcy5ib2R5IHx8IHJlcy50ZXh0KSAmJiByZXNwb25zZVR5cGUgPT09ICdqc29uJykge1xuICAgICAgICAgIGlmIChyZXMuYm9keSkge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSByZXMuYm9keTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlcy50ZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2VUeXBlID09PSAnYmxvYicgJiYgcmVzLnRleHQgJiYgdHlwZW9mIEJsb2IgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmVzcG9uc2UgPSBuZXcgQmxvYihbcmVzLnRleHRdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRzLnByb2Nlc3MpIHtcbiAgICAgICAgICByZXNwb25zZSA9IG9wdHMucHJvY2VzcyhyZXNwb25zZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgIHN1Y2Nlc3MuY2FsbChjb250ZXh0LCByZXNwb25zZSwgcmVzLnhocik7XG4gICAgICAgIH1cbiAgICAgICAgcHJvbWlzZS5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBtZXNzYWdlID0gcmVzLnRleHQ7XG5cbiAgICAgICAgaWYgKG9wdHMucHJvY2Vzc0Vycm9yKSBtZXNzYWdlID0gb3B0cy5wcm9jZXNzRXJyb3IobWVzc2FnZSk7XG5cbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgZXJyb3IuY2FsbChjb250ZXh0LCBtZXNzYWdlLCByZXMueGhyKTtcbiAgICAgICAgfVxuICAgICAgICBwcm9taXNlLnJlamVjdChtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGlmIChvcHRzLmRhdGEpIHtcbiAgICAgIGlmIChjbGFzc09mKG9wdHMuZGF0YSkgPT09IFwiRm9ybURhdGFcIikge1xuICAgICAgICByZXEuX2Zvcm1EYXRhID0gb3B0cy5kYXRhO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxLnNlbmQob3B0cy5kYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVxLmVuZChjYWxsYmFjayk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIC8vIHNpbXBsZSBkYXRhIG1hbmFnZXJcblxuICBmdW5jdGlvbiBEYXRhTWFuYWdlcihob2lzdCwgdHlwZSwgYnVja2V0KSB7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLnVybCA9IFwiZGF0YS5ob2kuaW8vXCIgKyB0eXBlO1xuICAgIHRoaXMuaG9pc3QgPSBob2lzdDtcbiAgICB0aGlzLmJ1Y2tldCA9IGJ1Y2tldDtcbiAgfVxuXG4gIGV4dGVuZChEYXRhTWFuYWdlci5wcm90b3R5cGUsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uIChpZCwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcblxuICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGNvbnRleHQgPSBlcnJvcjtcbiAgICAgICAgZXJyb3IgPSBzdWNjZXNzO1xuICAgICAgICBzdWNjZXNzID0gaWQ7XG4gICAgICAgIGlkID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKGlkKSB7XG5cbiAgICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5ob2lzdC5fY29uZmlncywge1xuICAgICAgICAgIHVybDogdGhpcy51cmwgKyBcIi9cIiArIGlkLFxuICAgICAgICAgIGJ1Y2tldDogdGhpcy5idWNrZXRcbiAgICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5ob2lzdC5fY29uZmlncywge1xuICAgICAgICAgIHVybDogdGhpcy51cmwsXG4gICAgICAgICAgYnVja2V0OiB0aGlzLmJ1Y2tldFxuICAgICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHF1ZXJ5OiBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICAgIHJldHVybiBuZXcgUXVlcnlNYW5hZ2VyKHRoaXMsIHtcbiAgICAgICAgcTogcXVlcnlcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB3aGVyZTogZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBuZXcgUXVlcnlNYW5hZ2VyKHRoaXMsIHt9KS53aGVyZShrZXksIHZhbHVlKTtcbiAgICB9LFxuXG4gICAgbGltaXQ6IGZ1bmN0aW9uIChsaW1pdCkge1xuICAgICAgcmV0dXJuIG5ldyBRdWVyeU1hbmFnZXIodGhpcywge1xuICAgICAgICBsaW1pdDogbGltaXRcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBza2lwOiBmdW5jdGlvbiAoc2tpcCkge1xuICAgICAgcmV0dXJuIG5ldyBRdWVyeU1hbmFnZXIodGhpcywge1xuICAgICAgICBza2lwOiBza2lwXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgc29ydEJ5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcW0gPSBuZXcgUXVlcnlNYW5hZ2VyKHRoaXMsIHt9KTtcbiAgICAgIHJldHVybiBxbS5fc29ydChmYWxzZSwgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgcG9zdDogZnVuY3Rpb24gKGlkLCBkYXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gXCJvYmplY3RcIiAmJiBpZCAhPT0gbnVsbCkge1xuICAgICAgICBjb250ZXh0ID0gZXJyb3I7XG4gICAgICAgIGVycm9yID0gc3VjY2VzcztcbiAgICAgICAgc3VjY2VzcyA9IGRhdGE7XG4gICAgICAgIGRhdGEgPSBpZDtcbiAgICAgICAgaWQgPSBkYXRhLl9pZDtcbiAgICAgIH1cblxuICAgICAgdmFyIHNpbmdsZXRvbiA9IGNsYXNzT2YoZGF0YSkgPT09IFwiQXJyYXlcIiAmJiBkYXRhLmxlbmd0aCA9PT0gMTtcblxuICAgICAgaWYgKGlkKSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuaG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgICB1cmw6IHRoaXMudXJsICsgXCIvXCIgKyBpZCxcbiAgICAgICAgICBidWNrZXQ6IHRoaXMuYnVja2V0LFxuICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5ob2lzdC5fY29uZmlncywge1xuICAgICAgICAgIHVybDogdGhpcy51cmwsXG4gICAgICAgICAgYnVja2V0OiB0aGlzLmJ1Y2tldCxcbiAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChyZXNwKSB7XG4gICAgICAgICAgICByZXR1cm4gc2luZ2xldG9uID8gW3Jlc3BdIDogcmVzcDtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY2xlYXI6IGZ1bmN0aW9uIChzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5ob2lzdC5fY29uZmlncywge1xuICAgICAgICB1cmw6IHRoaXMudXJsLFxuICAgICAgICBidWNrZXQ6IHRoaXMuYnVja2V0LFxuICAgICAgICBtZXRob2Q6IFwiREVMRVRFXCJcbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAoaWQsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICBpZiAoIWlkKSB7XG4gICAgICAgIHJldHVybiBhc3luY0Vycm9yKGVycm9yLCBjb250ZXh0LCBcIkNhbm5vdCByZW1vdmUgbW9kZWwgd2l0aCBlbXB0eSBpZFwiLCBudWxsKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5ob2lzdC5fY29uZmlncywge1xuICAgICAgICB1cmw6IHRoaXMudXJsICsgXCIvXCIgKyBpZCxcbiAgICAgICAgYnVja2V0OiB0aGlzLmJ1Y2tldCxcbiAgICAgICAgbWV0aG9kOiBcIkRFTEVURVwiXG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHVzZTogZnVuY3Rpb24gKGJ1Y2tldCkge1xuICAgICAgcmV0dXJuIHRoaXMuaG9pc3QodGhpcy50eXBlLCBidWNrZXQpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gcXVlcnkgbWFuYWdlclxuXG4gIGZ1bmN0aW9uIFF1ZXJ5TWFuYWdlcihkbSwgcXVlcnkpIHtcbiAgICB0aGlzLmRtID0gZG07XG4gICAgdGhpcy5xdWVyeSA9IHF1ZXJ5O1xuICB9XG5cbiAgZXh0ZW5kKFF1ZXJ5TWFuYWdlci5wcm90b3R5cGUsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uIChzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgdmFyIHBhcnRzID0gW107XG5cbiAgICAgIGlmICh0aGlzLnF1ZXJ5LnEpIHBhcnRzLnB1c2goXCJxPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHRoaXMucXVlcnkucSkpKTtcbiAgICAgIGlmICh0aGlzLnF1ZXJ5LmxpbWl0KSBwYXJ0cy5wdXNoKFwibGltaXQ9XCIgKyB0aGlzLnF1ZXJ5LmxpbWl0KTtcbiAgICAgIGlmICh0aGlzLnF1ZXJ5LnNraXApIHBhcnRzLnB1c2goXCJza2lwPVwiICsgdGhpcy5xdWVyeS5za2lwKTtcbiAgICAgIGlmICh0aGlzLnF1ZXJ5LnNvcnQpIHBhcnRzLnB1c2goXCJzb3J0PVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHRoaXMucXVlcnkuc29ydCkpKTtcblxuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5kbS5ob2lzdC5fY29uZmlncywge1xuICAgICAgICB1cmw6IHRoaXMuZG0udXJsICsgXCI/XCIgKyBwYXJ0cy5qb2luKCcmJyksXG4gICAgICAgIGJ1Y2tldDogdGhpcy5kbS5idWNrZXRcbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgd2hlcmU6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBpZiAodmFsdWUgPT09IHUpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFBhcnRpYWxRdWVyeU1hbmFnZXIodGhpcywga2V5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fd2hlcmUoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHF1ZXJ5ID0gZXh0ZW5kKHt9LCB0aGlzLnF1ZXJ5KTtcbiAgICAgIHF1ZXJ5LnEgPSBxdWVyeS5xID8gZXh0ZW5kKHt9LCBxdWVyeS5xKSA6IHt9O1xuICAgICAgZXh0ZW5kKHF1ZXJ5LnEsIGtleSk7XG4gICAgICByZXR1cm4gbmV3IFF1ZXJ5TWFuYWdlcih0aGlzLmRtLCBxdWVyeSk7XG4gICAgfSxcblxuICAgIF93aGVyZTogZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgIHZhciBxdWVyeSA9IGV4dGVuZCh7fSwgdGhpcy5xdWVyeSk7XG4gICAgICBxdWVyeS5xID0gcXVlcnkucSA/IGV4dGVuZCh7fSwgcXVlcnkucSkgOiB7fTtcbiAgICAgIHF1ZXJ5LnFba2V5XSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIG5ldyBRdWVyeU1hbmFnZXIodGhpcy5kbSwgcXVlcnkpO1xuICAgIH0sXG5cbiAgICBfd2hlcmVBbmQ6IGZ1bmN0aW9uIChrZXksIG9wLCB2YWx1ZSkge1xuICAgICAgdmFyIHF1ZXJ5ID0gZXh0ZW5kKHt9LCB0aGlzLnF1ZXJ5KTtcbiAgICAgIHF1ZXJ5LnEgPSBxdWVyeS5xID8gZXh0ZW5kKHt9LCBxdWVyeS5xKSA6IHt9O1xuICAgICAgcXVlcnkucVtrZXldID0gcXVlcnkucVtrZXldID8gZXh0ZW5kKHt9LCBxdWVyeS5xW2tleV0pIDoge307XG4gICAgICBxdWVyeS5xW2tleV1bb3BdID0gdmFsdWU7XG4gICAgICByZXR1cm4gbmV3IFF1ZXJ5TWFuYWdlcih0aGlzLmRtLCBxdWVyeSk7XG4gICAgfSxcblxuICAgIGxpbWl0OiBmdW5jdGlvbiAobGltaXQpIHtcbiAgICAgIHZhciBxdWVyeSA9IGV4dGVuZCh7fSwgdGhpcy5xdWVyeSk7XG4gICAgICBxdWVyeS5saW1pdCA9IGxpbWl0O1xuICAgICAgcmV0dXJuIG5ldyBRdWVyeU1hbmFnZXIodGhpcy5kbSwgcXVlcnkpO1xuICAgIH0sXG5cbiAgICBza2lwOiBmdW5jdGlvbiAoc2tpcCkge1xuICAgICAgdmFyIHF1ZXJ5ID0gZXh0ZW5kKHt9LCB0aGlzLnF1ZXJ5KTtcbiAgICAgIHF1ZXJ5LnNraXAgPSBza2lwO1xuICAgICAgcmV0dXJuIG5ldyBRdWVyeU1hbmFnZXIodGhpcy5kbSwgcXVlcnkpO1xuICAgIH0sXG5cbiAgICBfc29ydDogZnVuY3Rpb24gKGFwcGVuZCwgYXJncykge1xuICAgICAgdmFyIHNvcnQgPSBhcHBlbmQgJiYgdGhpcy5xdWVyeS5zb3J0ICYmIHRoaXMucXVlcnkuc29ydC5zbGljZSgpIHx8IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFyZ3NbaV0uc2xpY2UoLTQpLnRvTG93ZXJDYXNlKCkgPT0gXCIgYXNjXCIpIHtcbiAgICAgICAgICBzb3J0LnB1c2goW2FyZ3NbaV0uc2xpY2UoMCwgLTQpLCAxXSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJnc1tpXS5zbGljZSgtNSkudG9Mb3dlckNhc2UoKSA9PSBcIiBkZXNjXCIpIHtcbiAgICAgICAgICBzb3J0LnB1c2goW2FyZ3NbaV0uc2xpY2UoMCwgLTUpLCAtMV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNvcnQucHVzaChbYXJnc1tpXSwgMV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBxdWVyeSA9IGV4dGVuZCh7fSwgdGhpcy5xdWVyeSk7XG4gICAgICBxdWVyeS5zb3J0ID0gc29ydDtcbiAgICAgIHJldHVybiBuZXcgUXVlcnlNYW5hZ2VyKHRoaXMuZG0sIHF1ZXJ5KTtcbiAgICB9LFxuXG4gICAgc29ydEJ5OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc29ydChmYWxzZSwgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgdGhlbkJ5OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc29ydCh0cnVlLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICB1c2U6IGZ1bmN0aW9uIChidWNrZXQpIHtcbiAgICAgIHJldHVybiBuZXcgUXVlcnlNYW5hZ2VyKHRoaXMuZG0udXNlKGJ1Y2tldCksIHRoaXMucXVlcnkpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gcGFydGlhbCBxdWVyeSBtYW5hZ2VyLCBwcm94eWluZyBtb25nbyBxdWVyaWVzIHNpbmNlIDIwMTRcblxuICBmdW5jdGlvbiBQYXJ0aWFsUXVlcnlNYW5hZ2VyKHFtLCBrZXkpIHtcbiAgICB0aGlzLnFtID0gcW07XG4gICAgdGhpcy5rZXkgPSBrZXk7XG4gIH1cblxuICBleHRlbmRBbGlhc2VzKFBhcnRpYWxRdWVyeU1hbmFnZXIucHJvdG90eXBlLCB7XG4gICAgXCJlcSBpcyBlcXVhbHNcIjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB0aGlzLnFtID0gdGhpcy5xbS5fd2hlcmUodGhpcy5rZXksIHZhbHVlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgXCJuZXEgbmUgaXNudCBub3RFcXVhbHNcIjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB0aGlzLnFtID0gdGhpcy5xbS5fd2hlcmVBbmQodGhpcy5rZXksIFwiJG5lXCIsIHZhbHVlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgXCJndCBncmVhdGVyVGhhblwiOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHRoaXMucW0gPSB0aGlzLnFtLl93aGVyZUFuZCh0aGlzLmtleSwgXCIkZ3RcIiwgdmFsdWUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBcImd0ZSBnZSBhdExlYXN0XCI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5xbSA9IHRoaXMucW0uX3doZXJlQW5kKHRoaXMua2V5LCBcIiRndGVcIiwgdmFsdWUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBcImx0IGxlc3NUaGFuXCI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5xbSA9IHRoaXMucW0uX3doZXJlQW5kKHRoaXMua2V5LCBcIiRsdFwiLCB2YWx1ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIFwibHRlIGxlIGF0TW9zdFwiOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHRoaXMucW0gPSB0aGlzLnFtLl93aGVyZUFuZCh0aGlzLmtleSwgXCIkbHRlXCIsIHZhbHVlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgXCJlbGVtIGluXCI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5xbSA9IHRoaXMucW0uX3doZXJlQW5kKHRoaXMua2V5LCBcIiRpblwiLCB2YWx1ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIFwibmVsZW0gbmluIG5vdEluIG5vdEVsZW1cIjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB0aGlzLnFtID0gdGhpcy5xbS5fd2hlcmVBbmQodGhpcy5rZXksIFwiJG5pblwiLCB2YWx1ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIFwiZXhpc3RzXCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMucW0gPSB0aGlzLnFtLl93aGVyZUFuZCh0aGlzLmtleSwgXCIkZXhpc3RzXCIsIHRydWUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9KTtcblxuICBleHRlbmQoUGFydGlhbFF1ZXJ5TWFuYWdlci5wcm90b3R5cGUsIHtcbiAgICB3aGVyZTogZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLnFtLndoZXJlKGtleSwgdmFsdWUpO1xuICAgIH0sXG4gICAgbGltaXQ6IGZ1bmN0aW9uIChsaW1pdCkge1xuICAgICAgcmV0dXJuIHRoaXMucW0ubGltaXQobGltaXQpO1xuICAgIH0sXG4gICAgc2tpcDogZnVuY3Rpb24gKHNraXApIHtcbiAgICAgIHJldHVybiB0aGlzLnFtLnNraXAoc2tpcCk7XG4gICAgfSxcbiAgICBzb3J0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5xbS5zb3J0LmFwcGx5KHRoaXMucW0sIGFyZ3VtZW50cyk7XG4gICAgfSxcbiAgICBzb3J0Qnk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnFtLl9zb3J0KGZhbHNlLCBhcmd1bWVudHMpO1xuICAgIH0sXG4gICAgdGhlbkJ5OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5xbS5fc29ydCh0cnVlLCBhcmd1bWVudHMpO1xuICAgIH0sXG4gICAgdXNlOiBmdW5jdGlvbiAoYnVja2V0KSB7XG4gICAgICByZXR1cm4gdGhpcy5xbS51c2UoYnVja2V0KTtcbiAgICB9LFxuXG4gICAgZ2V0OiBmdW5jdGlvbiAoc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0aGlzLnFtLmdldChzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBjb21wbGV4IGRhdGEgbWFuYWdlclxuXG4gIHZhciB0YWdSZWdleCA9IC9cXFsoW15cXF1dKylcXF0vZztcblxuICBmdW5jdGlvbiBPYmplY3REYXRhTWFuYWdlcihob2lzdCwgaGFzaCwgYnVja2V0KSB7XG4gICAgdmFyIGl0ZW1zID0gdGhpcy5pdGVtcyA9IHt9O1xuXG4gICAgZm9yICh2YXIgeCBpbiBoYXNoKSB7XG4gICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICBrZXk6IHgsXG4gICAgICAgICAgcGF0aDogaGFzaFt4XSxcbiAgICAgICAgICByZXF1aXJlczogW11cbiAgICAgICAgfSxcbiAgICAgICAgbWF0Y2g7XG5cbiAgICAgIGlmIChpdGVtLnBhdGhbaXRlbS5wYXRoLmxlbmd0aCAtIDFdID09ICc/Jykge1xuICAgICAgICBpdGVtLnBhdGggPSBpdGVtLnBhdGguc2xpY2UoMCwgLTEpO1xuICAgICAgICBpdGVtLm9wdGlvbmFsID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKChtYXRjaCA9IHRhZ1JlZ2V4LmV4ZWMoaXRlbS5wYXRoKSkgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIGRvdCA9IG1hdGNoWzFdLmluZGV4T2YoJy4nKTtcblxuICAgICAgICBpZiAoZG90ID4gLTEpIHtcbiAgICAgICAgICBpdGVtLnJlcXVpcmVzLnB1c2gobWF0Y2hbMV0uc2xpY2UoMCwgZG90KSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaXRlbXNbeF0gPSBpdGVtO1xuICAgIH1cblxuICAgIHRoaXMuaG9pc3QgPSBidWNrZXQgPyBob2lzdC51c2UoYnVja2V0KSA6IGhvaXN0O1xuICB9XG5cbiAgZXh0ZW5kKE9iamVjdERhdGFNYW5hZ2VyLnByb3RvdHlwZSwge1xuICAgIGdldDogZnVuY3Rpb24gKGRhdGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICB2YXIgaXRlbXMgPSB7fSxcbiAgICAgICAgcmVzdWx0ID0ge30sXG4gICAgICAgIG1hbmFnZXJzID0ge30sXG4gICAgICAgIGhvaXN0ID0gdGhpcy5ob2lzdCxcbiAgICAgICAgZmFpbGVkLFxuICAgICAgICBwcm9taXNlID0gbmV3IFByb21pc2UoKTtcblxuICAgICAgaWYgKHR5cGVvZiBkYXRhID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgY29udGV4dCA9IGVycm9yO1xuICAgICAgICBlcnJvciA9IHN1Y2Nlc3M7XG4gICAgICAgIHN1Y2Nlc3MgPSBkYXRhO1xuICAgICAgICBkYXRhID0ge307XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgaWQ6IGRhdGFcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgZXh0ZW5kKGl0ZW1zLCB0aGlzLml0ZW1zKTtcblxuICAgICAgaWYgKHR5cGVvZiBlcnJvciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGlmICghY29udGV4dCkgY29udGV4dCA9IGVycm9yO1xuICAgICAgICBlcnJvciA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHN1Y2NlZWQoa2V5KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gZGF0YTtcbiAgICAgICAgICBkZWxldGUgaXRlbXNba2V5XTtcbiAgICAgICAgICBhZHZhbmNlKCk7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGZhaWwoa2V5KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAobXNnLCB4aHIpIHtcbiAgICAgICAgICBpZiAoaXRlbXNba2V5XS5vcHRpb25hbCkge1xuICAgICAgICAgICAgc3VjY2VlZChrZXkpKG51bGwpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmYWlsZWQgPSB0cnVlO1xuICAgICAgICAgICAgbXNnID0ga2V5ICsgXCI6IFwiICsgbXNnO1xuICAgICAgICAgICAgZXJyb3IgJiYgZXJyb3IuY2FsbChjb250ZXh0LCBtc2csIHhocik7XG4gICAgICAgICAgICBwcm9taXNlLnJlamVjdChtc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYWR2YW5jZSgpIHtcbiAgICAgICAgaWYgKGZhaWxlZCkgcmV0dXJuO1xuXG4gICAgICAgIHZhciBsb2FkaW5nID0gMDtcblxuICAgICAgICBvdXQ6IGZvciAodmFyIHggaW4gaXRlbXMpIHtcbiAgICAgICAgICB2YXIgaXRlbSA9IGl0ZW1zW3hdO1xuXG4gICAgICAgICAgaWYgKCFtYW5hZ2Vyc1t4XSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtLnJlcXVpcmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIGlmIChpdGVtLnJlcXVpcmVzW2ldIGluIGl0ZW1zKSB7XG4gICAgICAgICAgICAgICAgY29udGludWUgb3V0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwYXRoID0gaXRlbS5wYXRoLnJlcGxhY2UodGFnUmVnZXgsIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGIuaW5kZXhPZignLicpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBnZXQocmVzdWx0LCBiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFbYl0gfHwgXCJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICBzcGFjZSA9IHBhdGguaW5kZXhPZignICcpO1xuXG4gICAgICAgICAgICBpZiAoc3BhY2UgPiAtMSkge1xuICAgICAgICAgICAgICAobWFuYWdlcnNbaXRlbS5rZXldID0gaG9pc3QocGF0aC5zbGljZSgwLCBzcGFjZSkpKS5nZXQocGF0aC5zbGljZShzcGFjZSArIDEpLCBzdWNjZWVkKGl0ZW0ua2V5KSwgZmFpbChpdGVtLmtleSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgKG1hbmFnZXJzW2l0ZW0ua2V5XSA9IGhvaXN0KHBhdGgpKS5nZXQoc3VjY2VlZChpdGVtLmtleSksIGZhaWwoaXRlbS5rZXkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsb2FkaW5nKys7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWxvYWRpbmcpIHtcbiAgICAgICAgICBzdWNjZXNzICYmIHN1Y2Nlc3MuY2FsbChjb250ZXh0LCByZXN1bHQsIG1hbmFnZXJzKTtcbiAgICAgICAgICBwcm9taXNlLnJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBhZHZhbmNlKCk7XG5cbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGJ1Y2tldE1hbmFnZXJNZXRob2RzID0ge1xuICAgIGdldDogZnVuY3Rpb24gKHR5cGUsIGlkLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXMuaG9pc3QodHlwZSwgdGhpcy5idWNrZXQpLmdldChpZCwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBwb3N0OiBmdW5jdGlvbiAodHlwZSwgaWQsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdGhpcy5ob2lzdCh0eXBlLCB0aGlzLmJ1Y2tldCkucG9zdChpZCwgZGF0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBjbGVhcjogZnVuY3Rpb24gKHR5cGUsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdGhpcy5ob2lzdCh0eXBlLCB0aGlzLmJ1Y2tldCkuY2xlYXIoc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uICh0eXBlLCBpZCwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0aGlzLmhvaXN0KHR5cGUsIHRoaXMuYnVja2V0KS5yZW1vdmUoaWQsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgbWV0YTogZnVuY3Rpb24gKGRhdGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdGhpcy5ob2lzdC5idWNrZXQubWV0YSh0aGlzLmJ1Y2tldCwgZGF0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBpbnZpdGU6IGZ1bmN0aW9uIChkYXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXMuaG9pc3QuYnVja2V0Lmludml0ZSh0aGlzLmJ1Y2tldCwgZGF0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBlbnRlcjogZnVuY3Rpb24gKHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdGhpcy5ob2lzdC5idWNrZXQuc2V0KHRoaXMuYnVja2V0LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBob2lzdE1ldGhvZHMgPSB7XG4gICAgYXBpS2V5OiBmdW5jdGlvbiAodikge1xuICAgICAgcmV0dXJuIHRoaXMuY29uZmlnKFwiYXBpa2V5XCIsIHYpO1xuICAgIH0sXG5cbiAgICBnZXQ6IGZ1bmN0aW9uICh0eXBlLCBpZCwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0aGlzKHR5cGUpLmdldChpZCwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBwb3N0OiBmdW5jdGlvbiAodHlwZSwgaWQsIGRhdGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdGhpcyh0eXBlKS5wb3N0KGlkLCBkYXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIGNsZWFyOiBmdW5jdGlvbiAodHlwZSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0aGlzKHR5cGUpLmNsZWFyKHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAodHlwZSwgaWQsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdGhpcyh0eXBlKS5yZW1vdmUoaWQsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgY29uZmlnOiBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgaWYgKGIgPT09IHUpIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgYTtcblxuICAgICAgICBpZiAodHlwZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9jb25maWdzW2FdO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICBmb3IgKHZhciB4IGluIGEpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbmZpZ3NbeC50b0xvd2VyQ2FzZSgpXSA9IGFbeF07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiZnVuY3Rpb25cIiB8fCB0eXBlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgdmFyIGhvaXN0ID0gdGhpcztcblxuICAgICAgICAgIHJldHVybiByZXF1ZXN0KG51bGwsIHtcbiAgICAgICAgICAgIHVybDogXCIvc2V0dGluZ3NcIixcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChzZXR0aW5ncykge1xuICAgICAgICAgICAgICBob2lzdC5jb25maWcoc2V0dGluZ3MpO1xuICAgICAgICAgICAgICByZXR1cm4gc2V0dGluZ3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgYSwgYiwgYyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2NvbmZpZ3NbYS50b0xvd2VyQ2FzZSgpXSA9IGI7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0YXR1czogZnVuY3Rpb24gKHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICB2YXIgaG9pc3QgPSB0aGlzO1xuXG4gICAgICBpZiAodHlwZW9mIGVycm9yICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgaWYgKCFjb250ZXh0KSBjb250ZXh0ID0gZXJyb3I7XG4gICAgICAgIGVycm9yID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5fY29uZmlncywge1xuICAgICAgICB1cmw6IFwiYXV0aC5ob2kuaW8vc3RhdHVzXCIsXG4gICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChyZXNwKSB7XG4gICAgICAgICAgaG9pc3QuX3VzZXIgPSByZXNwO1xuICAgICAgICAgIHJldHVybiByZXNwO1xuICAgICAgICB9LFxuICAgICAgICBwcm9jZXNzRXJyb3I6IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgICBob2lzdC5fdXNlciA9IG51bGw7XG4gICAgICAgICAgcmV0dXJuIG1zZztcbiAgICAgICAgfVxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBzaWdudXA6IGZ1bmN0aW9uIChtZW1iZXIsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICB2YXIgaG9pc3QgPSB0aGlzO1xuXG4gICAgICBpZiAodHlwZW9mIG1lbWJlciA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLl9jb25maWdzLCB7XG4gICAgICAgICAgdXJsOiBcImF1dGguaG9pLmlvL3VzZXJcIixcbiAgICAgICAgICBkYXRhOiBtZW1iZXIsXG4gICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgICAgIGlmIChyZXNwLnJlZGlyZWN0VXJsKSB7XG4gICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IHJlc3AucmVkaXJlY3RVcmw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBob2lzdC5fdXNlciA9IHJlc3A7XG4gICAgICAgICAgICByZXR1cm4gcmVzcDtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbG9naW46IGZ1bmN0aW9uIChtZW1iZXIsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICB2YXIgaG9pc3QgPSB0aGlzO1xuXG4gICAgICBpZiAodHlwZW9mIG1lbWJlciA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLl9jb25maWdzLCB7XG4gICAgICAgICAgdXJsOiBcImF1dGguaG9pLmlvL2xvZ2luXCIsXG4gICAgICAgICAgZGF0YTogbWVtYmVyLFxuICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChyZXNwKSB7XG4gICAgICAgICAgICBpZiAocmVzcC5yZWRpcmVjdFVybCkge1xuICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSByZXNwLnJlZGlyZWN0VXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaG9pc3QuX3VzZXIgPSByZXNwO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3A7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGxvZ291dDogZnVuY3Rpb24gKHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICB2YXIgaG9pc3QgPSB0aGlzO1xuXG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLl9jb25maWdzLCB7XG4gICAgICAgIHVybDogXCJhdXRoLmhvaS5pby9sb2dvdXRcIixcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgICBob2lzdC5fdXNlciA9IG51bGw7XG4gICAgICAgICAgaG9pc3QuX2J1Y2tldCA9IG51bGw7XG4gICAgICAgICAgcmV0dXJuIHJlc3A7XG4gICAgICAgIH1cbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgYWNjZXB0OiBmdW5jdGlvbiAoY29kZSwgZGF0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHZhciBob2lzdCA9IHRoaXM7XG5cbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiBcImF1dGguaG9pLmlvL2ludml0ZS9cIiArIGNvZGUgKyBcIi91c2VyXCIsXG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChyZXNwKSB7XG4gICAgICAgICAgaG9pc3QuX3VzZXIgPSByZXNwO1xuICAgICAgICAgIHJldHVybiByZXNwO1xuICAgICAgICB9XG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHVzZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLl91c2VyICYmIGV4dGVuZCh7fSwgdGhpcy5fdXNlcik7XG4gICAgfSxcblxuICAgIG5vdGlmeTogZnVuY3Rpb24gKGlkLCBkYXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBjb250ZXh0ID0gZXJyb3I7XG4gICAgICAgIGVycm9yID0gc3VjY2VzcztcbiAgICAgICAgc3VjY2VzcyA9IGRhdGE7XG4gICAgICAgIGRhdGEgPSBpZC5kYXRhO1xuICAgICAgICBpZCA9IGlkLmlkO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGRhdGEgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5fY29uZmlncywge1xuICAgICAgICAgIHVybDogXCJub3RpZnkuaG9pLmlvL25vdGlmaWNhdGlvbi9cIiArIGlkLFxuICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jRXJyb3IoZXJyb3IsIGNvbnRleHQsIFwiZGF0YSBmb3Igbm90aWZpY2F0aW9uIG11c3QgYmUgYW4gb2JqZWN0XCIpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBmaWxlOiBmdW5jdGlvbiAoa2V5LCBmaWxlLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgaWYgKGZpbGUgJiYgZmlsZS5qcXVlcnkpIHtcbiAgICAgICAgZmlsZSA9IGZpbGVbMF07XG4gICAgICB9XG5cbiAgICAgIHZhciB0eXBlID0gY2xhc3NPZihmaWxlKSxcbiAgICAgICAgZGF0YTtcblxuICAgICAgaWYgKHR5cGUgPT09IFwiRmlsZVwiKSB7XG4gICAgICAgIGRhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgICAgZGF0YS5hcHBlbmQoXCJmaWxlXCIsIGZpbGUpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcIkZvcm1EYXRhXCIpIHtcbiAgICAgICAgZGF0YSA9IGZpbGU7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiSFRNTElucHV0RWxlbWVudFwiKSB7XG4gICAgICAgIGZpbGUgPSBmaWxlLmZpbGVzICYmIGZpbGUuZmlsZXNbMF07XG5cbiAgICAgICAgaWYgKCFmaWxlKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICBkYXRhLmFwcGVuZChcImZpbGVcIiwgZmlsZSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiRnVuY3Rpb25cIikge1xuICAgICAgICBjb250ZXh0ID0gZXJyb3I7XG4gICAgICAgIGVycm9yID0gc3VjY2VzcztcbiAgICAgICAgc3VjY2VzcyA9IGZpbGU7XG5cbiAgICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5fY29uZmlncywge1xuICAgICAgICAgIHVybDogXCJmaWxlLmhvaS5pby9cIiArIGtleSxcbiAgICAgICAgICByZXNwb25zZVR5cGU6IFwiYmxvYlwiXG4gICAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICAgICAgLy91bmRlZmluZWQgaXMgRE9NV2luZG93IGluIHBoYW50b20gZm9yIHNvbWUgcmVhc29uXG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiVW5kZWZpbmVkXCIgfHwgdHlwZSA9PT0gXCJET01XaW5kb3dcIikge1xuICAgICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLl9jb25maWdzLCB7XG4gICAgICAgICAgdXJsOiBcImZpbGUuaG9pLmlvL1wiICsga2V5LFxuICAgICAgICAgIHJlc3BvbnNlVHlwZTogXCJibG9iXCJcbiAgICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jRXJyb3IoZXJyb3IsIGNvbnRleHQsIFwiY2FuJ3Qgc2VuZCBmaWxlIG9mIHR5cGUgXCIgKyB0eXBlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5fY29uZmlncywge1xuICAgICAgICB1cmw6IFwiZmlsZS5ob2kuaW8vXCIgKyBrZXksXG4gICAgICAgIGRhdGE6IGRhdGFcbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgdXNlOiBmdW5jdGlvbiAoYnVja2V0KSB7XG4gICAgICB2YXIgaG9pc3QgPSB0aGlzO1xuXG4gICAgICB2YXIgbWFuYWdlciA9IGV4dGVuZChmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICBpZiAoY2xhc3NPZih0eXBlKSA9PT0gXCJPYmplY3RcIikge1xuICAgICAgICAgIHJldHVybiBuZXcgT2JqZWN0RGF0YU1hbmFnZXIobWFuYWdlciwgdHlwZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBEYXRhTWFuYWdlcihob2lzdCwgdHlwZSwgYnVja2V0KTtcbiAgICAgICAgfVxuICAgICAgfSwgYnVja2V0TWFuYWdlck1ldGhvZHMpO1xuXG4gICAgICBtYW5hZ2VyLmhvaXN0ID0gdGhpcztcbiAgICAgIG1hbmFnZXIuYnVja2V0ID0gYnVja2V0O1xuXG4gICAgICByZXR1cm4gbWFuYWdlcjtcbiAgICB9LFxuXG4gICAgY29ubmVjdG9yOiBmdW5jdGlvbiAodHlwZSwgdG9rZW4pIHtcbiAgICAgIHJldHVybiBuZXcgQ29ubmVjdG9yTWFuYWdlcih0aGlzLCB0eXBlLCB0b2tlbik7XG4gICAgfSxcblxuICAgIGNsb25lOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgaG9pc3QgPSBleHRlbmQobWFrZUhvaXN0KCksIHtcbiAgICAgICAgX2NvbmZpZ3M6IGV4dGVuZCh7fSwgdGhpcy5fY29uZmlncyksXG4gICAgICAgIF91c2VyOiBudWxsLFxuICAgICAgICBfYnVja2V0OiBudWxsLFxuICAgICAgICBfbWFuYWdlcnM6IHt9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGhvaXN0O1xuICAgIH1cbiAgfTtcblxuICB2YXIgYnVja2V0TWV0aG9kcyA9IHtcbiAgICBzdGF0dXM6IGZ1bmN0aW9uIChzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgdmFyIGhvaXN0ID0gdGhpcy5faG9pc3Q7XG4gICAgICBpZiAodHlwZW9mIGVycm9yICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgaWYgKCFjb250ZXh0KSBjb250ZXh0ID0gZXJyb3I7XG4gICAgICAgIGVycm9yID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5faG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiBcImF1dGguaG9pLmlvL2J1Y2tldC9jdXJyZW50XCIsXG4gICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChidWNrZXQpIHtcbiAgICAgICAgICBob2lzdC5fYnVja2V0ID0gYnVja2V0O1xuICAgICAgICAgIHJldHVybiBidWNrZXQ7XG4gICAgICAgIH0sXG4gICAgICAgIHByb2Nlc3NFcnJvcjogZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgICAgICAgICBob2lzdC5fYnVja2V0ID0gbnVsbDtcbiAgICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBwb3N0OiBmdW5jdGlvbiAoaWQsIGRhdGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICBpZiAodHlwZW9mIGlkICE9PSBcInN0cmluZ1wiICYmIGlkICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnRleHQgPSBlcnJvcjtcbiAgICAgICAgZXJyb3IgPSBzdWNjZXNzO1xuICAgICAgICBzdWNjZXNzID0gZGF0YTtcbiAgICAgICAgZGF0YSA9IGlkO1xuICAgICAgICBpZCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGNvbnRleHQgPSBlcnJvcjtcbiAgICAgICAgZXJyb3IgPSBzdWNjZXNzO1xuICAgICAgICBzdWNjZXNzID0gZGF0YTtcbiAgICAgICAgZGF0YSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmIChpZCkge1xuICAgICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLl9ob2lzdC5fY29uZmlncywge1xuICAgICAgICAgIHVybDogXCJhdXRoLmhvaS5pby9idWNrZXQvXCIgKyBpZCxcbiAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuX2hvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgICAgdXJsOiBcImF1dGguaG9pLmlvL2J1Y2tldFwiLFxuICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBtZXRhOiBmdW5jdGlvbiAoa2V5LCBtZXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgdmFyIGhvaXN0ID0gdGhpcy5faG9pc3Q7XG5cbiAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGNvbnRleHQgPSBlcnJvcjtcbiAgICAgICAgZXJyb3IgPSBzdWNjZXNzO1xuICAgICAgICBzdWNjZXNzID0gbWV0YTtcbiAgICAgICAgbWV0YSA9IGtleTtcblxuICAgICAgICBpZiAoIWhvaXN0Ll9idWNrZXQpIHtcbiAgICAgICAgICByZXR1cm4gYXN5bmNFcnJvcihlcnJvciwgY29udGV4dCwgXCJObyBidWNrZXQgdG8gcG9zdCBtZXRhZGF0YSBhZ2FpbnN0XCIsIG51bGwpO1xuICAgICAgICB9XG5cbiAgICAgICAga2V5ID0gaG9pc3QuX2J1Y2tldC5rZXk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXF1ZXN0KGhvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgIHVybDogXCJhdXRoLmhvaS5pby9idWNrZXQvXCIgKyBrZXkgKyBcIi9tZXRhXCIsXG4gICAgICAgIGRhdGE6IG1ldGEsXG4gICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChidWNrZXQpIHtcbiAgICAgICAgICBpZiAoaG9pc3QuX2J1Y2tldCAmJiBob2lzdC5fYnVja2V0LmtleSA9PSBidWNrZXQua2V5KSB7XG4gICAgICAgICAgICBob2lzdC5fYnVja2V0ID0gYnVja2V0O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBidWNrZXQ7XG4gICAgICAgIH1cbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgc2V0OiBmdW5jdGlvbiAoa2V5LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgdmFyIGhvaXN0ID0gdGhpcy5faG9pc3Q7XG5cbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuX2hvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgIHVybDogXCJhdXRoLmhvaS5pby9idWNrZXQvY3VycmVudC9cIiArIChrZXkgfHwgXCJkZWZhdWx0XCIpLFxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoYnVja2V0KSB7XG4gICAgICAgICAgaG9pc3QuX2J1Y2tldCA9IGtleSA/IGJ1Y2tldCA6IG51bGw7XG4gICAgICAgICAgcmV0dXJuIGJ1Y2tldDtcbiAgICAgICAgfVxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBsaXN0OiBmdW5jdGlvbiAoc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuX2hvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgIHVybDogXCJhdXRoLmhvaS5pby9idWNrZXRzXCJcbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgaW52aXRlOiBmdW5jdGlvbiAoa2V5LCBkYXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgaWYgKHR5cGVvZiBrZXkgPT0gXCJvYmplY3RcIikge1xuICAgICAgICBjb250ZXh0ID0gZXJyb3I7XG4gICAgICAgIGVycm9yID0gc3VjY2VzcztcbiAgICAgICAgc3VjY2VzcyA9IGRhdGE7XG4gICAgICAgIGRhdGEgPSBrZXk7XG4gICAgICAgIGtleSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmIChrZXkpIGRhdGEgPSBfLmV4dGVuZCh7XG4gICAgICAgIGJ1Y2tldDoga2V5XG4gICAgICB9LCBkYXRhKTtcblxuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5faG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiBcImF1dGguaG9pLmlvL2ludml0ZVwiLFxuICAgICAgICBkYXRhOiBkYXRhXG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIENvbm5lY3Rvck1hbmFnZXIoaG9pc3QsIHR5cGUsIHRva2VuKSB7XG4gICAgdGhpcy5ob2lzdCA9IGhvaXN0O1xuICAgIHRoaXMudXJsID0gXCJwcm94eS5ob2kuaW8vXCIgKyB0eXBlO1xuICAgIHRoaXMudG9rZW4gPSB0b2tlbjtcbiAgfVxuXG4gIGV4dGVuZChDb25uZWN0b3JNYW5hZ2VyLnByb3RvdHlwZSwge1xuXG4gICAgYXV0aG9yaXplOiBmdW5jdGlvbiAob3B0aW9ucywgY29udGV4dCkge1xuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIG9wdGlvbnMgPSBleHRlbmQoe1xuICAgICAgICB1cmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24gKCkge30sXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uICgpIHt9LFxuICAgICAgICByZWRpcmVjdDogZnVuY3Rpb24gKHJlZGlyZWN0X3VybCkge1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IHJlZGlyZWN0X3VybDtcbiAgICAgICAgfVxuICAgICAgfSwgb3B0aW9ucyk7XG5cbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuaG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiB0aGlzLnVybCArIFwiL2Nvbm5lY3RcIixcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHJldHVybl91cmw6IG9wdGlvbnMudXJsXG4gICAgICAgIH1cbiAgICAgIH0sIGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgaWYgKHJlcy50b2tlbikge1xuICAgICAgICAgIHNlbGYudG9rZW4gPSByZXMudG9rZW47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlcy5yZWRpcmVjdCkge1xuICAgICAgICAgIG9wdGlvbnMucmVkaXJlY3QgJiYgb3B0aW9ucy5yZWRpcmVjdC5hcHBseSh0aGlzLCBbcmVzLnJlZGlyZWN0XSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMuc3VjY2VzcyAmJiBvcHRpb25zLnN1Y2Nlc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH0sIG9wdGlvbnMuZXJyb3IsIGNvbnRleHQpO1xuXG4gICAgfSxcblxuICAgIGRpc2Nvbm5lY3Q6IGZ1bmN0aW9uIChzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5ob2lzdF9jb25maWdzLCB7XG4gICAgICAgIHVybDogdGhpcy51cmwgKyBcIi9kaXNjb25uZWN0XCJcbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuICAgIHJlbW92ZUZyb21Vc2VyOiBmdW5jdGlvbiAoc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuaG9pc3RfY29uZmlncywge1xuICAgICAgICB1cmw6IHRoaXMudXJsICsgXCIvcmVtb3ZlRnJvbVVzZXJcIlxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBnZXQ6IGZ1bmN0aW9uIChwYXRoLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuXG4gICAgICBpZiAocGF0aFswXSAhPT0gJy8nKSBwYXRoID0gJy8nICsgcGF0aDtcbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuaG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiB0aGlzLnVybCArIHBhdGgsXG4gICAgICAgIHRva2VuOiB0aGlzLnRva2VuXG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHBvc3Q6IGZ1bmN0aW9uIChwYXRoLCBkYXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgaWYgKHBhdGhbMF0gIT09ICcvJykgcGF0aCA9ICcvJyArIHBhdGg7XG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLmhvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgIHVybDogdGhpcy51cmwgKyBwYXRoLFxuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICB0b2tlbjogdGhpcy50b2tlblxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBwdXQ6IGZ1bmN0aW9uIChwYXRoLCBkYXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgaWYgKHBhdGhbMF0gIT09ICcvJykgcGF0aCA9ICcvJyArIHBhdGg7XG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLmhvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgIHVybDogdGhpcy51cmwgKyBwYXRoLFxuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBtZXRob2Q6IFwiUFVUXCIsXG4gICAgICAgIHRva2VuOiB0aGlzLnRva2VuXG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHJlbW92ZTogZnVuY3Rpb24gKHBhdGgsIGRhdGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICBpZiAodHlwZW9mIGRhdGEgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBjb250ZXh0ID0gZXJyb3I7XG4gICAgICAgIGVycm9yID0gc3VjY2VzcztcbiAgICAgICAgc3VjY2VzcyA9IGRhdGE7XG4gICAgICAgIGRhdGEgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAocGF0aFswXSAhPT0gJy8nKSBwYXRoID0gJy8nICsgcGF0aDtcbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuaG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiB0aGlzLnVybCArIHBhdGgsXG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIG1ldGhvZDogXCJERUxFVEVcIixcbiAgICAgICAgdG9rZW46IHRoaXMudG9rZW5cbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIG1ha2VIb2lzdCgpIHtcbiAgICB2YXIgaG9pc3QgPSBleHRlbmQoZnVuY3Rpb24gKHR5cGUsIGJ1Y2tldCkge1xuICAgICAgaWYgKGNsYXNzT2YodHlwZSkgPT09IFwiT2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBPYmplY3REYXRhTWFuYWdlcihob2lzdCwgdHlwZSwgYnVja2V0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0YU1hbmFnZXIoaG9pc3QsIHR5cGUsIGJ1Y2tldCk7XG4gICAgICB9XG4gICAgfSwgaG9pc3RNZXRob2RzKTtcblxuICAgIGhvaXN0LmJ1Y2tldCA9IGV4dGVuZChmdW5jdGlvbiAobWV0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQsIGN4KSB7XG4gICAgICB2YXIgdHlwZSA9IHR5cGVvZiBtZXRhO1xuXG4gICAgICBpZiAodHlwZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGhvaXN0LmJ1Y2tldC5zdGF0dXMobWV0YSwgc3VjY2VzcywgZXJyb3IpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcInN0cmluZ1wiICYmIHR5cGVvZiBzdWNjZXNzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIGhvaXN0LmJ1Y2tldC5wb3N0KG1ldGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0LCBjeCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwic3RyaW5nXCIgfHwgbWV0YSA9PT0gbnVsbCkge1xuICAgICAgICBob2lzdC5idWNrZXQuc2V0KG1ldGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBob2lzdC5idWNrZXQubWV0YShtZXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaG9pc3QuX2J1Y2tldDtcbiAgICAgIH1cbiAgICB9LCBidWNrZXRNZXRob2RzKTtcblxuICAgIGhvaXN0LmJ1Y2tldC5faG9pc3QgPSBob2lzdDtcblxuICAgIHJldHVybiBob2lzdDtcbiAgfVxuXG4gIHZhciBIb2lzdCA9IGV4dGVuZChtYWtlSG9pc3QoKSwge1xuICAgIF9jb25maWdzOiB7XG4gICAgICBwcm90b2NvbDogXCJodHRwczovL1wiXG4gICAgfSxcbiAgICBfdXNlcjogbnVsbCxcbiAgICBfYnVja2V0OiBudWxsLFxuICAgIF9tYW5hZ2Vyczoge31cbiAgfSk7XG5cbiAgLy8gdGhyb3cgSG9pc3QgYXQgc29tZXRoaW5nIGl0IHdpbGwgc3RpY2sgdG9cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFwiSG9pc3RcIiwgWycnXSwgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIEhvaXN0O1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHdpbmRvdy5kb2N1bWVudCA9PT0gXCJvYmplY3RcIikge1xuICAgIHdpbmRvdy5Ib2lzdCA9IEhvaXN0O1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBIb2lzdDtcbiAgfVxufSkoKTtcbiJdfQ==
