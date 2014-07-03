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

    var promise = new Promise();

    var callback = function (err, res) {

      if (err) {
        console.log(err);
        throw err;
      }
      if (res.status >= 200 && res.status < 400) {
        var response = res;
        if (res.type === "application/json") {
          response = res.body;
        } else if (res.text && typeof Blob !== 'undefined') {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVm9sdW1lcy9TdG9yZS9Qcm9qZWN0cy9ob2lzdC9ob2lzdC1qcy9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1ZvbHVtZXMvU3RvcmUvUHJvamVjdHMvaG9pc3QvaG9pc3QtanMvbm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL2NsaWVudC5qcyIsIi9Wb2x1bWVzL1N0b3JlL1Byb2plY3RzL2hvaXN0L2hvaXN0LWpzL25vZGVfbW9kdWxlcy9zdXBlcmFnZW50L25vZGVfbW9kdWxlcy9jb21wb25lbnQtZW1pdHRlci9pbmRleC5qcyIsIi9Wb2x1bWVzL1N0b3JlL1Byb2plY3RzL2hvaXN0L2hvaXN0LWpzL25vZGVfbW9kdWxlcy9zdXBlcmFnZW50L25vZGVfbW9kdWxlcy9yZWR1Y2UtY29tcG9uZW50L2luZGV4LmpzIiwiL1ZvbHVtZXMvU3RvcmUvUHJvamVjdHMvaG9pc3QvaG9pc3QtanMvc3JjL2hvaXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3poQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJyk7XG52YXIgcmVkdWNlID0gcmVxdWlyZSgncmVkdWNlJyk7XG5cbi8qKlxuICogUm9vdCByZWZlcmVuY2UgZm9yIGlmcmFtZXMuXG4gKi9cblxudmFyIHJvb3QgPSAndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93XG4gID8gdGhpc1xuICA6IHdpbmRvdztcblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIFRPRE86IGZ1dHVyZSBwcm9vZiwgbW92ZSB0byBjb21wb2VudCBsYW5kXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSG9zdChvYmopIHtcbiAgdmFyIHN0ciA9IHt9LnRvU3RyaW5nLmNhbGwob2JqKTtcblxuICBzd2l0Y2ggKHN0cikge1xuICAgIGNhc2UgJ1tvYmplY3QgRmlsZV0nOlxuICAgIGNhc2UgJ1tvYmplY3QgQmxvYl0nOlxuICAgIGNhc2UgJ1tvYmplY3QgRm9ybURhdGFdJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbmZ1bmN0aW9uIGdldFhIUigpIHtcbiAgaWYgKHJvb3QuWE1MSHR0cFJlcXVlc3RcbiAgICAmJiAoJ2ZpbGU6JyAhPSByb290LmxvY2F0aW9uLnByb3RvY29sIHx8ICFyb290LkFjdGl2ZVhPYmplY3QpKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgfSBlbHNlIHtcbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciB0cmltID0gJycudHJpbVxuICA/IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMudHJpbSgpOyB9XG4gIDogZnVuY3Rpb24ocykgeyByZXR1cm4gcy5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csICcnKTsgfTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChudWxsICE9IG9ialtrZXldKSB7XG4gICAgICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpXG4gICAgICAgICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtrZXldKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogRXhwb3NlIHNlcmlhbGl6YXRpb24gbWV0aG9kLlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdCA9IHNlcmlhbGl6ZTtcblxuIC8qKlxuICAqIFBhcnNlIHRoZSBnaXZlbiB4LXd3dy1mb3JtLXVybGVuY29kZWQgYHN0cmAuXG4gICpcbiAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICogQHJldHVybiB7T2JqZWN0fVxuICAqIEBhcGkgcHJpdmF0ZVxuICAqL1xuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzdHIpIHtcbiAgdmFyIG9iaiA9IHt9O1xuICB2YXIgcGFpcnMgPSBzdHIuc3BsaXQoJyYnKTtcbiAgdmFyIHBhcnRzO1xuICB2YXIgcGFpcjtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgcGFydHMgPSBwYWlyLnNwbGl0KCc9Jyk7XG4gICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYXJ0c1swXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzFdKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICdhcHBsaWNhdGlvbi94bWwnLFxuICB1cmxlbmNvZGVkOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0nOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplID0ge1xuICAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHNlcmlhbGl6ZSxcbiAgICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5zdHJpbmdpZnlcbiB9O1xuXG4gLyoqXG4gICogRGVmYXVsdCBwYXJzZXJzLlxuICAqXG4gICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAgKiAgICAgICByZXR1cm4geyBvYmplY3QgcGFyc2VkIGZyb20gc3RyIH07XG4gICogICAgIH07XG4gICpcbiAgKi9cblxucmVxdWVzdC5wYXJzZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHBhcnNlU3RyaW5nLFxuICAnYXBwbGljYXRpb24vanNvbic6IEpTT04ucGFyc2Vcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGhlYWRlciBgc3RyYCBpbnRvXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFwcGVkIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcihzdHIpIHtcbiAgdmFyIGxpbmVzID0gc3RyLnNwbGl0KC9cXHI/XFxuLyk7XG4gIHZhciBmaWVsZHMgPSB7fTtcbiAgdmFyIGluZGV4O1xuICB2YXIgbGluZTtcbiAgdmFyIGZpZWxkO1xuICB2YXIgdmFsO1xuXG4gIGxpbmVzLnBvcCgpOyAvLyB0cmFpbGluZyBDUkxGXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHRyaW0obGluZS5zbGljZShpbmRleCArIDEpKTtcbiAgICBmaWVsZHNbZmllbGRdID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIG1pbWUgdHlwZSBmb3IgdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyYW1zKHN0cil7XG4gIHJldHVybiByZWR1Y2Uoc3RyLnNwbGl0KC8gKjsgKi8pLCBmdW5jdGlvbihvYmosIHN0cil7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKj0gKi8pXG4gICAgICAsIGtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgICwgdmFsID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChrZXkgJiYgdmFsKSBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm4gb2JqO1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMucmVxID0gcmVxO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgdGhpcy50ZXh0ID0gdGhpcy54aHIucmVzcG9uc2VUZXh0O1xuICB0aGlzLnNldFN0YXR1c1Byb3BlcnRpZXModGhpcy54aHIuc3RhdHVzKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLnNldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuICB0aGlzLmJvZHkgPSB0aGlzLnJlcS5tZXRob2QgIT0gJ0hFQUQnXG4gICAgPyB0aGlzLnBhcnNlQm9keSh0aGlzLnRleHQpXG4gICAgOiBudWxsO1xufVxuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLmhlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciByZWxhdGVkIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGAudHlwZWAgdGhlIGNvbnRlbnQgdHlwZSB3aXRob3V0IHBhcmFtc1xuICpcbiAqIEEgcmVzcG9uc2Ugb2YgXCJDb250ZW50LVR5cGU6IHRleHQvcGxhaW47IGNoYXJzZXQ9dXRmLThcIlxuICogd2lsbCBwcm92aWRlIHlvdSB3aXRoIGEgYC50eXBlYCBvZiBcInRleHQvcGxhaW5cIi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaGVhZGVyXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0SGVhZGVyUHJvcGVydGllcyA9IGZ1bmN0aW9uKGhlYWRlcil7XG4gIC8vIGNvbnRlbnQtdHlwZVxuICB2YXIgY3QgPSB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gfHwgJyc7XG4gIHRoaXMudHlwZSA9IHR5cGUoY3QpO1xuXG4gIC8vIHBhcmFtc1xuICB2YXIgb2JqID0gcGFyYW1zKGN0KTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikgdGhpc1trZXldID0gb2JqW2tleV07XG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBib2R5IGBzdHJgLlxuICpcbiAqIFVzZWQgZm9yIGF1dG8tcGFyc2luZyBvZiBib2RpZXMuIFBhcnNlcnNcbiAqIGFyZSBkZWZpbmVkIG9uIHRoZSBgc3VwZXJhZ2VudC5wYXJzZWAgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnBhcnNlQm9keSA9IGZ1bmN0aW9uKHN0cil7XG4gIHZhciBwYXJzZSA9IHJlcXVlc3QucGFyc2VbdGhpcy50eXBlXTtcbiAgcmV0dXJuIHBhcnNlXG4gICAgPyBwYXJzZShzdHIpXG4gICAgOiBudWxsO1xufTtcblxuLyoqXG4gKiBTZXQgZmxhZ3Mgc3VjaCBhcyBgLm9rYCBiYXNlZCBvbiBgc3RhdHVzYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSBhIDJ4eCByZXNwb25zZSB3aWxsIGdpdmUgeW91IGEgYC5va2Agb2YgX190cnVlX19cbiAqIHdoZXJlYXMgNXh4IHdpbGwgYmUgX19mYWxzZV9fIGFuZCBgLmVycm9yYCB3aWxsIGJlIF9fdHJ1ZV9fLiBUaGVcbiAqIGAuY2xpZW50RXJyb3JgIGFuZCBgLnNlcnZlckVycm9yYCBhcmUgYWxzbyBhdmFpbGFibGUgdG8gYmUgbW9yZVxuICogc3BlY2lmaWMsIGFuZCBgLnN0YXR1c1R5cGVgIGlzIHRoZSBjbGFzcyBvZiBlcnJvciByYW5naW5nIGZyb20gMS4uNVxuICogc29tZXRpbWVzIHVzZWZ1bCBmb3IgbWFwcGluZyByZXNwb25kIGNvbG9ycyBldGMuXG4gKlxuICogXCJzdWdhclwiIHByb3BlcnRpZXMgYXJlIGFsc28gZGVmaW5lZCBmb3IgY29tbW9uIGNhc2VzLiBDdXJyZW50bHkgcHJvdmlkaW5nOlxuICpcbiAqICAgLSAubm9Db250ZW50XG4gKiAgIC0gLmJhZFJlcXVlc3RcbiAqICAgLSAudW5hdXRob3JpemVkXG4gKiAgIC0gLm5vdEFjY2VwdGFibGVcbiAqICAgLSAubm90Rm91bmRcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc3RhdHVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuc2V0U3RhdHVzUHJvcGVydGllcyA9IGZ1bmN0aW9uKHN0YXR1cyl7XG4gIHZhciB0eXBlID0gc3RhdHVzIC8gMTAwIHwgMDtcblxuICAvLyBzdGF0dXMgLyBjbGFzc1xuICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgdGhpcy5zdGF0dXNUeXBlID0gdHlwZTtcblxuICAvLyBiYXNpY3NcbiAgdGhpcy5pbmZvID0gMSA9PSB0eXBlO1xuICB0aGlzLm9rID0gMiA9PSB0eXBlO1xuICB0aGlzLmNsaWVudEVycm9yID0gNCA9PSB0eXBlO1xuICB0aGlzLnNlcnZlckVycm9yID0gNSA9PSB0eXBlO1xuICB0aGlzLmVycm9yID0gKDQgPT0gdHlwZSB8fCA1ID09IHR5cGUpXG4gICAgPyB0aGlzLnRvRXJyb3IoKVxuICAgIDogZmFsc2U7XG5cbiAgLy8gc3VnYXJcbiAgdGhpcy5hY2NlcHRlZCA9IDIwMiA9PSBzdGF0dXM7XG4gIHRoaXMubm9Db250ZW50ID0gMjA0ID09IHN0YXR1cyB8fCAxMjIzID09IHN0YXR1cztcbiAgdGhpcy5iYWRSZXF1ZXN0ID0gNDAwID09IHN0YXR1cztcbiAgdGhpcy51bmF1dGhvcml6ZWQgPSA0MDEgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEFjY2VwdGFibGUgPSA0MDYgPT0gc3RhdHVzO1xuICB0aGlzLm5vdEZvdW5kID0gNDA0ID09IHN0YXR1cztcbiAgdGhpcy5mb3JiaWRkZW4gPSA0MDMgPT0gc3RhdHVzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYW4gYEVycm9yYCByZXByZXNlbnRhdGl2ZSBvZiB0aGlzIHJlc3BvbnNlLlxuICpcbiAqIEByZXR1cm4ge0Vycm9yfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUudG9FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciByZXEgPSB0aGlzLnJlcTtcbiAgdmFyIG1ldGhvZCA9IHJlcS5tZXRob2Q7XG4gIHZhciB1cmwgPSByZXEudXJsO1xuXG4gIHZhciBtc2cgPSAnY2Fubm90ICcgKyBtZXRob2QgKyAnICcgKyB1cmwgKyAnICgnICsgdGhpcy5zdGF0dXMgKyAnKSc7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IobXNnKTtcbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gbWV0aG9kO1xuICBlcnIudXJsID0gdXJsO1xuXG4gIHJldHVybiBlcnI7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVzcG9uc2VgLlxuICovXG5cbnJlcXVlc3QuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0YCB3aXRoIHRoZSBnaXZlbiBgbWV0aG9kYCBhbmQgYHVybGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgRW1pdHRlci5jYWxsKHRoaXMpO1xuICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5IHx8IFtdO1xuICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaGVhZGVyID0ge307XG4gIHRoaXMuX2hlYWRlciA9IHt9O1xuICB0aGlzLm9uKCdlbmQnLCBmdW5jdGlvbigpe1xuICAgIHZhciByZXMgPSBuZXcgUmVzcG9uc2Uoc2VsZik7XG4gICAgaWYgKCdIRUFEJyA9PSBtZXRob2QpIHJlcy50ZXh0ID0gbnVsbDtcbiAgICBzZWxmLmNhbGxiYWNrKG51bGwsIHJlcyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIE1peGluIGBFbWl0dGVyYC5cbiAqL1xuXG5FbWl0dGVyKFJlcXVlc3QucHJvdG90eXBlKTtcblxuLyoqXG4gKiBBbGxvdyBmb3IgZXh0ZW5zaW9uXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24oZm4pIHtcbiAgZm4odGhpcyk7XG4gIHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFNldCB0aW1lb3V0IHRvIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uKG1zKXtcbiAgdGhpcy5fdGltZW91dCA9IG1zO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ2xlYXIgcHJldmlvdXMgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fdGltZW91dCA9IDA7XG4gIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBYm9ydCB0aGUgcmVxdWVzdCwgYW5kIGNsZWFyIHBvdGVudGlhbCB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFib3J0ID0gZnVuY3Rpb24oKXtcbiAgaWYgKHRoaXMuYWJvcnRlZCkgcmV0dXJuO1xuICB0aGlzLmFib3J0ZWQgPSB0cnVlO1xuICB0aGlzLnhoci5hYm9ydCgpO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICB0aGlzLmVtaXQoJ2Fib3J0Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIGBmaWVsZGAgdG8gYHZhbGAsIG9yIG11bHRpcGxlIGZpZWxkcyB3aXRoIG9uZSBvYmplY3QuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLnNldCgnWC1BUEktS2V5JywgJ2Zvb2JhcicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KHsgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsICdYLUFQSS1LZXknOiAnZm9vYmFyJyB9KVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZmllbGRcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihmaWVsZCwgdmFsKXtcbiAgaWYgKGlzT2JqZWN0KGZpZWxkKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBmaWVsZCkge1xuICAgICAgdGhpcy5zZXQoa2V5LCBmaWVsZFtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldID0gdmFsO1xuICB0aGlzLmhlYWRlcltmaWVsZF0gPSB2YWw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBoZWFkZXIgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmdldEhlYWRlciA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IENvbnRlbnQtVHlwZSB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgnYXBwbGljYXRpb24veG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50eXBlID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdDb250ZW50LVR5cGUnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEFjY2VwdCB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy5qc29uID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWNjZXB0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdBY2NlcHQnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEF1dGhvcml6YXRpb24gZmllbGQgdmFsdWUgd2l0aCBgdXNlcmAgYW5kIGBwYXNzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlclxuICogQHBhcmFtIHtTdHJpbmd9IHBhc3NcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdXRoID0gZnVuY3Rpb24odXNlciwgcGFzcyl7XG4gIHZhciBzdHIgPSBidG9hKHVzZXIgKyAnOicgKyBwYXNzKTtcbiAgdGhpcy5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmFzaWMgJyArIHN0cik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4qIEFkZCBxdWVyeS1zdHJpbmcgYHZhbGAuXG4qXG4qIEV4YW1wbGVzOlxuKlxuKiAgIHJlcXVlc3QuZ2V0KCcvc2hvZXMnKVxuKiAgICAgLnF1ZXJ5KCdzaXplPTEwJylcbiogICAgIC5xdWVyeSh7IGNvbG9yOiAnYmx1ZScgfSlcbipcbiogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSB2YWxcbiogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4qIEBhcGkgcHVibGljXG4qL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5xdWVyeSA9IGZ1bmN0aW9uKHZhbCl7XG4gIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB2YWwgPSBzZXJpYWxpemUodmFsKTtcbiAgaWYgKHZhbCkgdGhpcy5fcXVlcnkucHVzaCh2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogV3JpdGUgdGhlIGZpZWxkIGBuYW1lYCBhbmQgYHZhbGAgZm9yIFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiXG4gKiByZXF1ZXN0IGJvZGllcy5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5maWVsZCgnZm9vJywgJ2JhcicpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfEJsb2J8RmlsZX0gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZmllbGQgPSBmdW5jdGlvbihuYW1lLCB2YWwpe1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB0aGlzLl9mb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQobmFtZSwgdmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFF1ZXVlIHRoZSBnaXZlbiBgZmlsZWAgYXMgYW4gYXR0YWNobWVudCB0byB0aGUgc3BlY2lmaWVkIGBmaWVsZGAsXG4gKiB3aXRoIG9wdGlvbmFsIGBmaWxlbmFtZWAuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuYXR0YWNoKG5ldyBCbG9iKFsnPGEgaWQ9XCJhXCI+PGIgaWQ9XCJiXCI+aGV5ITwvYj48L2E+J10sIHsgdHlwZTogXCJ0ZXh0L2h0bWxcIn0pKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtCbG9ifEZpbGV9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gIHRoaXMuX2Zvcm1EYXRhLmFwcGVuZChmaWVsZCwgZmlsZSwgZmlsZW5hbWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2VuZCBgZGF0YWAsIGRlZmF1bHRpbmcgdGhlIGAudHlwZSgpYCB0byBcImpzb25cIiB3aGVuXG4gKiBhbiBvYmplY3QgaXMgZ2l2ZW4uXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICAgLy8gcXVlcnlzdHJpbmdcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvc2VhcmNoJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtdWx0aXBsZSBkYXRhIFwid3JpdGVzXCJcbiAqICAgICAgIHJlcXVlc3QuZ2V0KCcvc2VhcmNoJylcbiAqICAgICAgICAgLnNlbmQoeyBzZWFyY2g6ICdxdWVyeScgfSlcbiAqICAgICAgICAgLnNlbmQoeyByYW5nZTogJzEuLjUnIH0pXG4gKiAgICAgICAgIC5zZW5kKHsgb3JkZXI6ICdkZXNjJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2pzb24nKVxuICogICAgICAgICAuc2VuZCgne1wibmFtZVwiOlwidGpcIn0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoJ25hbWU9dGonKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBkZWZhdWx0cyB0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgKiAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICAqICAgICAgICAuc2VuZCgnbmFtZT10b2JpJylcbiAgKiAgICAgICAgLnNlbmQoJ3NwZWNpZXM9ZmVycmV0JylcbiAgKiAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGRhdGFcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oZGF0YSl7XG4gIHZhciBvYmogPSBpc09iamVjdChkYXRhKTtcbiAgdmFyIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG5cbiAgLy8gbWVyZ2VcbiAgaWYgKG9iaiAmJiBpc09iamVjdCh0aGlzLl9kYXRhKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICB0aGlzLl9kYXRhW2tleV0gPSBkYXRhW2tleV07XG4gICAgfVxuICB9IGVsc2UgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBkYXRhKSB7XG4gICAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2Zvcm0nKTtcbiAgICB0eXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuICAgIGlmICgnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyA9PSB0eXBlKSB7XG4gICAgICB0aGlzLl9kYXRhID0gdGhpcy5fZGF0YVxuICAgICAgICA/IHRoaXMuX2RhdGEgKyAnJicgKyBkYXRhXG4gICAgICAgIDogZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGF0YSA9ICh0aGlzLl9kYXRhIHx8ICcnKSArIGRhdGE7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRoaXMuX2RhdGEgPSBkYXRhO1xuICB9XG5cbiAgaWYgKCFvYmopIHJldHVybiB0aGlzO1xuICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnanNvbicpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIHJlcyl7XG4gIHZhciBmbiA9IHRoaXMuX2NhbGxiYWNrO1xuICBpZiAoMiA9PSBmbi5sZW5ndGgpIHJldHVybiBmbihlcnIsIHJlcyk7XG4gIGlmIChlcnIpIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgZm4ocmVzKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggeC1kb21haW4gZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY3Jvc3NEb21haW5FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ09yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nKTtcbiAgZXJyLmNyb3NzRG9tYWluID0gdHJ1ZTtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB0aW1lb3V0IGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXRFcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcigndGltZW91dCBvZiAnICsgdGltZW91dCArICdtcyBleGNlZWRlZCcpO1xuICBlcnIudGltZW91dCA9IHRpbWVvdXQ7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogRW5hYmxlIHRyYW5zbWlzc2lvbiBvZiBjb29raWVzIHdpdGggeC1kb21haW4gcmVxdWVzdHMuXG4gKlxuICogTm90ZSB0aGF0IGZvciB0aGlzIHRvIHdvcmsgdGhlIG9yaWdpbiBtdXN0IG5vdCBiZVxuICogdXNpbmcgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiB3aXRoIGEgd2lsZGNhcmQsXG4gKiBhbmQgYWxzbyBtdXN0IHNldCBcIkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzXCJcbiAqIHRvIFwidHJ1ZVwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUud2l0aENyZWRlbnRpYWxzID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fd2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEluaXRpYXRlIHJlcXVlc3QsIGludm9raW5nIGNhbGxiYWNrIGBmbihyZXMpYFxuICogd2l0aCBhbiBpbnN0YW5jZW9mIGBSZXNwb25zZWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbihmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIHhociA9IHRoaXMueGhyID0gZ2V0WEhSKCk7XG4gIHZhciBxdWVyeSA9IHRoaXMuX3F1ZXJ5LmpvaW4oJyYnKTtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZGF0YSA9IHRoaXMuX2Zvcm1EYXRhIHx8IHRoaXMuX2RhdGE7XG5cbiAgLy8gc3RvcmUgY2FsbGJhY2tcbiAgdGhpcy5fY2FsbGJhY2sgPSBmbiB8fCBub29wO1xuXG4gIC8vIHN0YXRlIGNoYW5nZVxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtcbiAgICBpZiAoNCAhPSB4aHIucmVhZHlTdGF0ZSkgcmV0dXJuO1xuICAgIGlmICgwID09IHhoci5zdGF0dXMpIHtcbiAgICAgIGlmIChzZWxmLmFib3J0ZWQpIHJldHVybiBzZWxmLnRpbWVvdXRFcnJvcigpO1xuICAgICAgcmV0dXJuIHNlbGYuY3Jvc3NEb21haW5FcnJvcigpO1xuICAgIH1cbiAgICBzZWxmLmVtaXQoJ2VuZCcpO1xuICB9O1xuXG4gIC8vIHByb2dyZXNzXG4gIGlmICh4aHIudXBsb2FkKSB7XG4gICAgeGhyLnVwbG9hZC5vbnByb2dyZXNzID0gZnVuY3Rpb24oZSl7XG4gICAgICBlLnBlcmNlbnQgPSBlLmxvYWRlZCAvIGUudG90YWwgKiAxMDA7XG4gICAgICBzZWxmLmVtaXQoJ3Byb2dyZXNzJywgZSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIHRpbWVvdXRcbiAgaWYgKHRpbWVvdXQgJiYgIXRoaXMuX3RpbWVyKSB7XG4gICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBzZWxmLmFib3J0KCk7XG4gICAgfSwgdGltZW91dCk7XG4gIH1cblxuICAvLyBxdWVyeXN0cmluZ1xuICBpZiAocXVlcnkpIHtcbiAgICBxdWVyeSA9IHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0KHF1ZXJ5KTtcbiAgICB0aGlzLnVybCArPSB+dGhpcy51cmwuaW5kZXhPZignPycpXG4gICAgICA/ICcmJyArIHF1ZXJ5XG4gICAgICA6ICc/JyArIHF1ZXJ5O1xuICB9XG5cbiAgLy8gaW5pdGlhdGUgcmVxdWVzdFxuICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUpO1xuXG4gIC8vIENPUlNcbiAgaWYgKHRoaXMuX3dpdGhDcmVkZW50aWFscykgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgLy8gYm9keVxuICBpZiAoJ0dFVCcgIT0gdGhpcy5tZXRob2QgJiYgJ0hFQUQnICE9IHRoaXMubWV0aG9kICYmICdzdHJpbmcnICE9IHR5cGVvZiBkYXRhICYmICFpc0hvc3QoZGF0YSkpIHtcbiAgICAvLyBzZXJpYWxpemUgc3R1ZmZcbiAgICB2YXIgc2VyaWFsaXplID0gcmVxdWVzdC5zZXJpYWxpemVbdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpXTtcbiAgICBpZiAoc2VyaWFsaXplKSBkYXRhID0gc2VyaWFsaXplKGRhdGEpO1xuICB9XG5cbiAgLy8gc2V0IGhlYWRlciBmaWVsZHNcbiAgZm9yICh2YXIgZmllbGQgaW4gdGhpcy5oZWFkZXIpIHtcbiAgICBpZiAobnVsbCA9PSB0aGlzLmhlYWRlcltmaWVsZF0pIGNvbnRpbnVlO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGZpZWxkLCB0aGlzLmhlYWRlcltmaWVsZF0pO1xuICB9XG5cbiAgLy8gc2VuZCBzdHVmZlxuICB0aGlzLmVtaXQoJ3JlcXVlc3QnLCB0aGlzKTtcbiAgeGhyLnNlbmQoZGF0YSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlcXVlc3RgLlxuICovXG5cbnJlcXVlc3QuUmVxdWVzdCA9IFJlcXVlc3Q7XG5cbi8qKlxuICogSXNzdWUgYSByZXF1ZXN0OlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgIHJlcXVlc3QoJ0dFVCcsICcvdXNlcnMnKS5lbmQoY2FsbGJhY2spXG4gKiAgICByZXF1ZXN0KCcvdXNlcnMnKS5lbmQoY2FsbGJhY2spXG4gKiAgICByZXF1ZXN0KCcvdXNlcnMnLCBjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gdXJsIG9yIGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiByZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIC8vIGNhbGxiYWNrXG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiB1cmwpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCkuZW5kKHVybCk7XG4gIH1cblxuICAvLyB1cmwgZmlyc3RcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUmVxdWVzdChtZXRob2QsIHVybCk7XG59XG5cbi8qKlxuICogR0VUIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmdldCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnR0VUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEucXVlcnkoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEhFQUQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuaGVhZCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnSEVBRCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIERFTEVURSBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5kZWwgPSBmdW5jdGlvbih1cmwsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0RFTEVURScsIHVybCk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBBVENIIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucGF0Y2ggPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BBVENIJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUE9TVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BPU1QnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQVVQgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wdXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ1BVVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZXF1ZXN0O1xuIiwiXG4vKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59O1xuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPVxuRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgKHRoaXMuX2NhbGxiYWNrc1tldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgZnVuY3Rpb24gb24oKSB7XG4gICAgc2VsZi5vZmYoZXZlbnQsIG9uKTtcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgb24uZm4gPSBmbjtcbiAgdGhpcy5vbihldmVudCwgb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICAvLyBhbGxcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcblxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gIHZhciBjYjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW107XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG59O1xuIiwiXG4vKipcbiAqIFJlZHVjZSBgYXJyYCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtNaXhlZH0gaW5pdGlhbFxuICpcbiAqIFRPRE86IGNvbWJhdGlibGUgZXJyb3IgaGFuZGxpbmc/XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIGZuLCBpbml0aWFsKXsgIFxuICB2YXIgaWR4ID0gMDtcbiAgdmFyIGxlbiA9IGFyci5sZW5ndGg7XG4gIHZhciBjdXJyID0gYXJndW1lbnRzLmxlbmd0aCA9PSAzXG4gICAgPyBpbml0aWFsXG4gICAgOiBhcnJbaWR4KytdO1xuXG4gIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICBjdXJyID0gZm4uY2FsbChudWxsLCBjdXJyLCBhcnJbaWR4XSwgKytpZHgsIGFycik7XG4gIH1cbiAgXG4gIHJldHVybiBjdXJyO1xufTsiLCJ2YXIgYWdlbnQgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG5cbi8qanNoaW50IGxvb3BmdW5jOiB0cnVlICovXG4oZnVuY3Rpb24gKCkge1xuXG4gIHZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG4gICAgc3BsaWNlID0gQXJyYXkucHJvdG90eXBlLnNwbGljZSxcbiAgICB1O1xuXG4gIC8vIGhlbHBlcnNcblxuICBmdW5jdGlvbiBleHRlbmQoaW50bywgZnJvbSkge1xuICAgIGZvciAodmFyIHggaW4gZnJvbSkgaW50b1t4XSA9IGZyb21beF07XG4gICAgcmV0dXJuIGludG87XG4gIH1cblxuICBmdW5jdGlvbiBleHRlbmRBbGlhc2VzKGludG8sIGZyb20pIHtcbiAgICBmb3IgKHZhciB4IGluIGZyb20pIHtcbiAgICAgIHZhciB4cyA9IHguc3BsaXQoJyAnKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIGludG9beHNbaV1dID0gZnJvbVt4XTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZXQob2JqLCBrZXksIG5vdGhpbmcpIHtcblxuICAgIGlmIChrZXkuaW5kZXhPZignLicpID09IC0xKSB7XG4gICAgICByZXR1cm4gb2JqW2tleV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGtleSA9IGtleS5zcGxpdCgnLicpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleS5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgb2JqID0gb2JqW2tleVtpXV07XG4gICAgICAgIGlmICghb2JqKSByZXR1cm4gXCJcIjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9ialtrZXlbaV1dO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsYXNzT2YoZGF0YSkge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKGRhdGEpLnNsaWNlKDgsIC0xKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFzeW5jRXJyb3IoZXJyb3IsIGNvbnRleHQpIHtcbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCk7XG5cbiAgICB2YXIgYXJncyA9IHNwbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG5cbiAgICBwcm9taXNlLnJlamVjdChhcmdzWzBdKTtcblxuICAgIGlmICh0eXBlb2YgZXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgZXJyb3IuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBmdW5jdGlvbiBQcm9taXNlKCkge1xuICAgIHRoaXMuY2JzID0gW107XG4gIH1cblxuICBleHRlbmQoUHJvbWlzZS5wcm90b3R5cGUsIHtcbiAgICByZXNvbHZlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlKSByZXR1cm47XG5cbiAgICAgIHZhciB0aGVuID0gdmFsdWUgJiYgdmFsdWUudGhlbixcbiAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgIGNhbGxlZDtcblxuICAgICAgaWYgKHR5cGVvZiB0aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGVuLmNhbGwodmFsdWUsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgICAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgc2VsZi5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghY2FsbGVkKSB7XG4gICAgICAgICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgIHNlbGYucmVqZWN0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGlmICghY2FsbGVkKSB7XG4gICAgICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5yZWplY3QoZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnN0YXRlID0gMTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jYnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgc3VjY2VzcyA9IHRoaXMuY2JzW2ldWzBdLFxuICAgICAgICAgICAgcHJvbWlzZSA9IHRoaXMuY2JzW2ldWzJdO1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3VjY2VzcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgIHByb21pc2UucmVzb2x2ZShzdWNjZXNzKHZhbHVlKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBwcm9taXNlLnJlc29sdmUodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHByb21pc2UucmVqZWN0KGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2JzID0gbnVsbDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVqZWN0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlKSByZXR1cm47XG5cbiAgICAgIHRoaXMuc3RhdGUgPSAtMTtcbiAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNicy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZXJyb3IgPSB0aGlzLmNic1tpXVsxXSxcbiAgICAgICAgICBwcm9taXNlID0gdGhpcy5jYnNbaV1bMl07XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHByb21pc2UucmVzb2x2ZShlcnJvcih2YWx1ZSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9taXNlLnJlamVjdCh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcHJvbWlzZS5yZWplY3QoZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5jYnMgPSBudWxsO1xuICAgIH0sXG5cbiAgICB0aGVuOiBmdW5jdGlvbiAoc3VjY2VzcywgZXJyb3IpIHtcbiAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKTtcblxuICAgICAgaWYgKHRoaXMuc3RhdGUpIHtcbiAgICAgICAgdmFyIHJldDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICh0aGlzLnN0YXRlID09IDEpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3VjY2VzcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgIHByb21pc2UucmVzb2x2ZShzdWNjZXNzKHRoaXMudmFsdWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHByb21pc2UucmVzb2x2ZSh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgIHByb21pc2UucmVzb2x2ZShlcnJvcih0aGlzLnZhbHVlKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBwcm9taXNlLnJlamVjdCh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBwcm9taXNlLnJlamVjdChlKTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNicy5wdXNoKFtzdWNjZXNzLCBlcnJvciwgcHJvbWlzZV0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGFqYXggaGVscGVyXG5cbiAgZnVuY3Rpb24gcmVxdWVzdChjb25maWdzLCBvcHRzLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuXG4gICAgdmFyIG1ldGhvZCwgY29udGVudFR5cGUsIHJlc3BvbnNlVHlwZTtcblxuICAgIGlmIChcImRhdGFcIiBpbiBvcHRzKSB7XG4gICAgICB2YXIgdHlwZSA9IGNsYXNzT2Yob3B0cy5kYXRhKTtcbiAgICAgIGNvbnNvbGUubG9nKHR5cGUpO1xuICAgICAgaWYgKHR5cGUgPT09IFwiU3RyaW5nXCIpIHtcbiAgICAgICAgY29udGVudFR5cGUgPSBcImFwcGxpY2F0aW9uL2pzb25cIjtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJGb3JtRGF0YVwiKSB7XG4gICAgICAgIG1ldGhvZCA9IG9wdHMubWV0aG9kIHx8IFwiUE9TVFwiO1xuICAgICAgICAvL2NvbnRlbnRUeXBlID0gXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1ldGhvZCA9IG9wdHMubWV0aG9kIHx8IFwiUE9TVFwiO1xuICAgICAgICBjb250ZW50VHlwZSA9IFwiYXBwbGljYXRpb24vanNvblwiO1xuICAgICAgICBvcHRzLmRhdGEgPSBKU09OLnN0cmluZ2lmeShvcHRzLmRhdGEpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtZXRob2QgPSBvcHRzLm1ldGhvZCB8fCBcIkdFVFwiO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZXJyb3IgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgaWYgKCFjb250ZXh0KSBjb250ZXh0ID0gZXJyb3I7XG4gICAgICBlcnJvciA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZ3MgJiYgIWNvbmZpZ3MuYXBpa2V5KSB7XG4gICAgICByZXR1cm4gYXN5bmNFcnJvcihlcnJvciwgY29udGV4dCwgXCJBUEkga2V5IG5vdCBzZXRcIiwgbnVsbCk7XG4gICAgfVxuICAgIHZhciBmdW5jID0gbWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKGZ1bmMgPT09ICdkZWxldGUnKSB7XG4gICAgICBmdW5jID0gJ2RlbCc7XG4gICAgfVxuICAgIHZhciByZXEgPSBhZ2VudFtmdW5jXShjb25maWdzID8gY29uZmlncy5wcm90b2NvbCArIG9wdHMudXJsIDogb3B0cy51cmwpO1xuICAgIGlmIChjb250ZW50VHlwZSkge1xuICAgICAgcmVxID0gcmVxLnNldChcIkNvbnRlbnQtVHlwZVwiLCBjb250ZW50VHlwZSk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZ3MpIHtcbiAgICAgIHJlcSA9IHJlcS5zZXQoXCJBdXRob3JpemF0aW9uXCIsIFwiSG9pc3QgXCIgKyBjb25maWdzLmFwaWtleSk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMuYnVja2V0KSB7XG4gICAgICByZXEgPSByZXEuc2V0KFwieC1idWNrZXQta2V5XCIsIG9wdHMuYnVja2V0KTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy50b2tlbikge1xuICAgICAgcmVxID0gcmVxLnNldChcIk9BdXRoXCIsIFwiVG9rZW4gXCIgKyBvcHRzLnRva2VuKTtcbiAgICB9XG4gICAgaWYgKHJlcS53aXRoQ3JlZGVudGlhbHMpIHtcbiAgICAgIHJlcSA9IHJlcS53aXRoQ3JlZGVudGlhbHMoKTtcbiAgICB9XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCk7XG5cbiAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiAoZXJyLCByZXMpIHtcblxuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgICBpZiAocmVzLnN0YXR1cyA+PSAyMDAgJiYgcmVzLnN0YXR1cyA8IDQwMCkge1xuICAgICAgICB2YXIgcmVzcG9uc2UgPSByZXM7XG4gICAgICAgIGlmIChyZXMudHlwZSA9PT0gXCJhcHBsaWNhdGlvbi9qc29uXCIpIHtcbiAgICAgICAgICByZXNwb25zZSA9IHJlcy5ib2R5O1xuICAgICAgICB9IGVsc2UgaWYgKHJlcy50ZXh0ICYmIHR5cGVvZiBCbG9iICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJlc3BvbnNlID0gbmV3IEJsb2IoW3Jlcy50ZXh0XSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0cy5wcm9jZXNzKSB7XG4gICAgICAgICAgcmVzcG9uc2UgPSBvcHRzLnByb2Nlc3MocmVzcG9uc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICBzdWNjZXNzLmNhbGwoY29udGV4dCwgcmVzcG9uc2UsIHJlcy54aHIpO1xuICAgICAgICB9XG4gICAgICAgIHByb21pc2UucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbWVzc2FnZSA9IHJlcy50ZXh0O1xuXG4gICAgICAgIGlmIChvcHRzLnByb2Nlc3NFcnJvcikgbWVzc2FnZSA9IG9wdHMucHJvY2Vzc0Vycm9yKG1lc3NhZ2UpO1xuXG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIGVycm9yLmNhbGwoY29udGV4dCwgbWVzc2FnZSwgcmVzLnhocik7XG4gICAgICAgIH1cbiAgICAgICAgcHJvbWlzZS5yZWplY3QobWVzc2FnZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBpZiAob3B0cy5kYXRhKSB7XG4gICAgICBpZiAoY2xhc3NPZihvcHRzLmRhdGEpID09PSBcIkZvcm1EYXRhXCIpIHtcbiAgICAgICAgcmVxLl9mb3JtRGF0YSA9IG9wdHMuZGF0YTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcS5zZW5kKG9wdHMuZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlcS5lbmQoY2FsbGJhY2spO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICAvLyBzaW1wbGUgZGF0YSBtYW5hZ2VyXG5cbiAgZnVuY3Rpb24gRGF0YU1hbmFnZXIoaG9pc3QsIHR5cGUsIGJ1Y2tldCkge1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy51cmwgPSBcImRhdGEuaG9pLmlvL1wiICsgdHlwZTtcbiAgICB0aGlzLmhvaXN0ID0gaG9pc3Q7XG4gICAgdGhpcy5idWNrZXQgPSBidWNrZXQ7XG4gIH1cblxuICBleHRlbmQoRGF0YU1hbmFnZXIucHJvdG90eXBlLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoaWQsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG5cbiAgICAgIGlmICh0eXBlb2YgaWQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBjb250ZXh0ID0gZXJyb3I7XG4gICAgICAgIGVycm9yID0gc3VjY2VzcztcbiAgICAgICAgc3VjY2VzcyA9IGlkO1xuICAgICAgICBpZCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmIChpZCkge1xuXG4gICAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuaG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgICB1cmw6IHRoaXMudXJsICsgXCIvXCIgKyBpZCxcbiAgICAgICAgICBidWNrZXQ6IHRoaXMuYnVja2V0XG4gICAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuaG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgICB1cmw6IHRoaXMudXJsLFxuICAgICAgICAgIGJ1Y2tldDogdGhpcy5idWNrZXRcbiAgICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBxdWVyeTogZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gbmV3IFF1ZXJ5TWFuYWdlcih0aGlzLCB7XG4gICAgICAgIHE6IHF1ZXJ5XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgd2hlcmU6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gbmV3IFF1ZXJ5TWFuYWdlcih0aGlzLCB7fSkud2hlcmUoa2V5LCB2YWx1ZSk7XG4gICAgfSxcblxuICAgIGxpbWl0OiBmdW5jdGlvbiAobGltaXQpIHtcbiAgICAgIHJldHVybiBuZXcgUXVlcnlNYW5hZ2VyKHRoaXMsIHtcbiAgICAgICAgbGltaXQ6IGxpbWl0XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgc2tpcDogZnVuY3Rpb24gKHNraXApIHtcbiAgICAgIHJldHVybiBuZXcgUXVlcnlNYW5hZ2VyKHRoaXMsIHtcbiAgICAgICAgc2tpcDogc2tpcFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHNvcnRCeTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHFtID0gbmV3IFF1ZXJ5TWFuYWdlcih0aGlzLCB7fSk7XG4gICAgICByZXR1cm4gcW0uX3NvcnQoZmFsc2UsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIHBvc3Q6IGZ1bmN0aW9uIChpZCwgZGF0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIGlmICh0eXBlb2YgaWQgPT09IFwib2JqZWN0XCIgJiYgaWQgIT09IG51bGwpIHtcbiAgICAgICAgY29udGV4dCA9IGVycm9yO1xuICAgICAgICBlcnJvciA9IHN1Y2Nlc3M7XG4gICAgICAgIHN1Y2Nlc3MgPSBkYXRhO1xuICAgICAgICBkYXRhID0gaWQ7XG4gICAgICAgIGlkID0gZGF0YS5faWQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBzaW5nbGV0b24gPSBjbGFzc09mKGRhdGEpID09PSBcIkFycmF5XCIgJiYgZGF0YS5sZW5ndGggPT09IDE7XG5cbiAgICAgIGlmIChpZCkge1xuICAgICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLmhvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgICAgdXJsOiB0aGlzLnVybCArIFwiL1wiICsgaWQsXG4gICAgICAgICAgYnVja2V0OiB0aGlzLmJ1Y2tldCxcbiAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuaG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgICB1cmw6IHRoaXMudXJsLFxuICAgICAgICAgIGJ1Y2tldDogdGhpcy5idWNrZXQsXG4gICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICAgICAgcmV0dXJuIHNpbmdsZXRvbiA/IFtyZXNwXSA6IHJlc3A7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNsZWFyOiBmdW5jdGlvbiAoc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuaG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiB0aGlzLnVybCxcbiAgICAgICAgYnVja2V0OiB0aGlzLmJ1Y2tldCxcbiAgICAgICAgbWV0aG9kOiBcIkRFTEVURVwiXG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHJlbW92ZTogZnVuY3Rpb24gKGlkLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgaWYgKCFpZCkge1xuICAgICAgICByZXR1cm4gYXN5bmNFcnJvcihlcnJvciwgY29udGV4dCwgXCJDYW5ub3QgcmVtb3ZlIG1vZGVsIHdpdGggZW1wdHkgaWRcIiwgbnVsbCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuaG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiB0aGlzLnVybCArIFwiL1wiICsgaWQsXG4gICAgICAgIGJ1Y2tldDogdGhpcy5idWNrZXQsXG4gICAgICAgIG1ldGhvZDogXCJERUxFVEVcIlxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICB1c2U6IGZ1bmN0aW9uIChidWNrZXQpIHtcbiAgICAgIHJldHVybiB0aGlzLmhvaXN0KHRoaXMudHlwZSwgYnVja2V0KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIHF1ZXJ5IG1hbmFnZXJcblxuICBmdW5jdGlvbiBRdWVyeU1hbmFnZXIoZG0sIHF1ZXJ5KSB7XG4gICAgdGhpcy5kbSA9IGRtO1xuICAgIHRoaXMucXVlcnkgPSBxdWVyeTtcbiAgfVxuXG4gIGV4dGVuZChRdWVyeU1hbmFnZXIucHJvdG90eXBlLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgICBpZiAodGhpcy5xdWVyeS5xKSBwYXJ0cy5wdXNoKFwicT1cIiArIGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeSh0aGlzLnF1ZXJ5LnEpKSk7XG4gICAgICBpZiAodGhpcy5xdWVyeS5saW1pdCkgcGFydHMucHVzaChcImxpbWl0PVwiICsgdGhpcy5xdWVyeS5saW1pdCk7XG4gICAgICBpZiAodGhpcy5xdWVyeS5za2lwKSBwYXJ0cy5wdXNoKFwic2tpcD1cIiArIHRoaXMucXVlcnkuc2tpcCk7XG4gICAgICBpZiAodGhpcy5xdWVyeS5zb3J0KSBwYXJ0cy5wdXNoKFwic29ydD1cIiArIGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeSh0aGlzLnF1ZXJ5LnNvcnQpKSk7XG5cbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuZG0uaG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiB0aGlzLmRtLnVybCArIFwiP1wiICsgcGFydHMuam9pbignJicpLFxuICAgICAgICBidWNrZXQ6IHRoaXMuZG0uYnVja2V0XG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHdoZXJlOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgaWYgKHR5cGVvZiBrZXkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgaWYgKHZhbHVlID09PSB1KSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQYXJ0aWFsUXVlcnlNYW5hZ2VyKHRoaXMsIGtleSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3doZXJlKGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBxdWVyeSA9IGV4dGVuZCh7fSwgdGhpcy5xdWVyeSk7XG4gICAgICBxdWVyeS5xID0gcXVlcnkucSA/IGV4dGVuZCh7fSwgcXVlcnkucSkgOiB7fTtcbiAgICAgIGV4dGVuZChxdWVyeS5xLCBrZXkpO1xuICAgICAgcmV0dXJuIG5ldyBRdWVyeU1hbmFnZXIodGhpcy5kbSwgcXVlcnkpO1xuICAgIH0sXG5cbiAgICBfd2hlcmU6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICB2YXIgcXVlcnkgPSBleHRlbmQoe30sIHRoaXMucXVlcnkpO1xuICAgICAgcXVlcnkucSA9IHF1ZXJ5LnEgPyBleHRlbmQoe30sIHF1ZXJ5LnEpIDoge307XG4gICAgICBxdWVyeS5xW2tleV0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiBuZXcgUXVlcnlNYW5hZ2VyKHRoaXMuZG0sIHF1ZXJ5KTtcbiAgICB9LFxuXG4gICAgX3doZXJlQW5kOiBmdW5jdGlvbiAoa2V5LCBvcCwgdmFsdWUpIHtcbiAgICAgIHZhciBxdWVyeSA9IGV4dGVuZCh7fSwgdGhpcy5xdWVyeSk7XG4gICAgICBxdWVyeS5xID0gcXVlcnkucSA/IGV4dGVuZCh7fSwgcXVlcnkucSkgOiB7fTtcbiAgICAgIHF1ZXJ5LnFba2V5XSA9IHF1ZXJ5LnFba2V5XSA/IGV4dGVuZCh7fSwgcXVlcnkucVtrZXldKSA6IHt9O1xuICAgICAgcXVlcnkucVtrZXldW29wXSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIG5ldyBRdWVyeU1hbmFnZXIodGhpcy5kbSwgcXVlcnkpO1xuICAgIH0sXG5cbiAgICBsaW1pdDogZnVuY3Rpb24gKGxpbWl0KSB7XG4gICAgICB2YXIgcXVlcnkgPSBleHRlbmQoe30sIHRoaXMucXVlcnkpO1xuICAgICAgcXVlcnkubGltaXQgPSBsaW1pdDtcbiAgICAgIHJldHVybiBuZXcgUXVlcnlNYW5hZ2VyKHRoaXMuZG0sIHF1ZXJ5KTtcbiAgICB9LFxuXG4gICAgc2tpcDogZnVuY3Rpb24gKHNraXApIHtcbiAgICAgIHZhciBxdWVyeSA9IGV4dGVuZCh7fSwgdGhpcy5xdWVyeSk7XG4gICAgICBxdWVyeS5za2lwID0gc2tpcDtcbiAgICAgIHJldHVybiBuZXcgUXVlcnlNYW5hZ2VyKHRoaXMuZG0sIHF1ZXJ5KTtcbiAgICB9LFxuXG4gICAgX3NvcnQ6IGZ1bmN0aW9uIChhcHBlbmQsIGFyZ3MpIHtcbiAgICAgIHZhciBzb3J0ID0gYXBwZW5kICYmIHRoaXMucXVlcnkuc29ydCAmJiB0aGlzLnF1ZXJ5LnNvcnQuc2xpY2UoKSB8fCBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhcmdzW2ldLnNsaWNlKC00KS50b0xvd2VyQ2FzZSgpID09IFwiIGFzY1wiKSB7XG4gICAgICAgICAgc29ydC5wdXNoKFthcmdzW2ldLnNsaWNlKDAsIC00KSwgMV0pO1xuICAgICAgICB9IGVsc2UgaWYgKGFyZ3NbaV0uc2xpY2UoLTUpLnRvTG93ZXJDYXNlKCkgPT0gXCIgZGVzY1wiKSB7XG4gICAgICAgICAgc29ydC5wdXNoKFthcmdzW2ldLnNsaWNlKDAsIC01KSwgLTFdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzb3J0LnB1c2goW2FyZ3NbaV0sIDFdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgcXVlcnkgPSBleHRlbmQoe30sIHRoaXMucXVlcnkpO1xuICAgICAgcXVlcnkuc29ydCA9IHNvcnQ7XG4gICAgICByZXR1cm4gbmV3IFF1ZXJ5TWFuYWdlcih0aGlzLmRtLCBxdWVyeSk7XG4gICAgfSxcblxuICAgIHNvcnRCeTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3NvcnQoZmFsc2UsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIHRoZW5CeTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3NvcnQodHJ1ZSwgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgdXNlOiBmdW5jdGlvbiAoYnVja2V0KSB7XG4gICAgICByZXR1cm4gbmV3IFF1ZXJ5TWFuYWdlcih0aGlzLmRtLnVzZShidWNrZXQpLCB0aGlzLnF1ZXJ5KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIHBhcnRpYWwgcXVlcnkgbWFuYWdlciwgcHJveHlpbmcgbW9uZ28gcXVlcmllcyBzaW5jZSAyMDE0XG5cbiAgZnVuY3Rpb24gUGFydGlhbFF1ZXJ5TWFuYWdlcihxbSwga2V5KSB7XG4gICAgdGhpcy5xbSA9IHFtO1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICB9XG5cbiAgZXh0ZW5kQWxpYXNlcyhQYXJ0aWFsUXVlcnlNYW5hZ2VyLnByb3RvdHlwZSwge1xuICAgIFwiZXEgaXMgZXF1YWxzXCI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5xbSA9IHRoaXMucW0uX3doZXJlKHRoaXMua2V5LCB2YWx1ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIFwibmVxIG5lIGlzbnQgbm90RXF1YWxzXCI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5xbSA9IHRoaXMucW0uX3doZXJlQW5kKHRoaXMua2V5LCBcIiRuZVwiLCB2YWx1ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIFwiZ3QgZ3JlYXRlclRoYW5cIjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB0aGlzLnFtID0gdGhpcy5xbS5fd2hlcmVBbmQodGhpcy5rZXksIFwiJGd0XCIsIHZhbHVlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgXCJndGUgZ2UgYXRMZWFzdFwiOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHRoaXMucW0gPSB0aGlzLnFtLl93aGVyZUFuZCh0aGlzLmtleSwgXCIkZ3RlXCIsIHZhbHVlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgXCJsdCBsZXNzVGhhblwiOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHRoaXMucW0gPSB0aGlzLnFtLl93aGVyZUFuZCh0aGlzLmtleSwgXCIkbHRcIiwgdmFsdWUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBcImx0ZSBsZSBhdE1vc3RcIjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB0aGlzLnFtID0gdGhpcy5xbS5fd2hlcmVBbmQodGhpcy5rZXksIFwiJGx0ZVwiLCB2YWx1ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIFwiZWxlbSBpblwiOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHRoaXMucW0gPSB0aGlzLnFtLl93aGVyZUFuZCh0aGlzLmtleSwgXCIkaW5cIiwgdmFsdWUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBcIm5lbGVtIG5pbiBub3RJbiBub3RFbGVtXCI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5xbSA9IHRoaXMucW0uX3doZXJlQW5kKHRoaXMua2V5LCBcIiRuaW5cIiwgdmFsdWUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBcImV4aXN0c1wiOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnFtID0gdGhpcy5xbS5fd2hlcmVBbmQodGhpcy5rZXksIFwiJGV4aXN0c1wiLCB0cnVlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSk7XG5cbiAgZXh0ZW5kKFBhcnRpYWxRdWVyeU1hbmFnZXIucHJvdG90eXBlLCB7XG4gICAgd2hlcmU6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy5xbS53aGVyZShrZXksIHZhbHVlKTtcbiAgICB9LFxuICAgIGxpbWl0OiBmdW5jdGlvbiAobGltaXQpIHtcbiAgICAgIHJldHVybiB0aGlzLnFtLmxpbWl0KGxpbWl0KTtcbiAgICB9LFxuICAgIHNraXA6IGZ1bmN0aW9uIChza2lwKSB7XG4gICAgICByZXR1cm4gdGhpcy5xbS5za2lwKHNraXApO1xuICAgIH0sXG4gICAgc29ydDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMucW0uc29ydC5hcHBseSh0aGlzLnFtLCBhcmd1bWVudHMpO1xuICAgIH0sXG4gICAgc29ydEJ5OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5xbS5fc29ydChmYWxzZSwgYXJndW1lbnRzKTtcbiAgICB9LFxuICAgIHRoZW5CeTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMucW0uX3NvcnQodHJ1ZSwgYXJndW1lbnRzKTtcbiAgICB9LFxuICAgIHVzZTogZnVuY3Rpb24gKGJ1Y2tldCkge1xuICAgICAgcmV0dXJuIHRoaXMucW0udXNlKGJ1Y2tldCk7XG4gICAgfSxcblxuICAgIGdldDogZnVuY3Rpb24gKHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdGhpcy5xbS5nZXQoc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gY29tcGxleCBkYXRhIG1hbmFnZXJcblxuICB2YXIgdGFnUmVnZXggPSAvXFxbKFteXFxdXSspXFxdL2c7XG5cbiAgZnVuY3Rpb24gT2JqZWN0RGF0YU1hbmFnZXIoaG9pc3QsIGhhc2gsIGJ1Y2tldCkge1xuICAgIHZhciBpdGVtcyA9IHRoaXMuaXRlbXMgPSB7fTtcblxuICAgIGZvciAodmFyIHggaW4gaGFzaCkge1xuICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAga2V5OiB4LFxuICAgICAgICAgIHBhdGg6IGhhc2hbeF0sXG4gICAgICAgICAgcmVxdWlyZXM6IFtdXG4gICAgICAgIH0sXG4gICAgICAgIG1hdGNoO1xuXG4gICAgICBpZiAoaXRlbS5wYXRoW2l0ZW0ucGF0aC5sZW5ndGggLSAxXSA9PSAnPycpIHtcbiAgICAgICAgaXRlbS5wYXRoID0gaXRlbS5wYXRoLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgaXRlbS5vcHRpb25hbCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHdoaWxlICgobWF0Y2ggPSB0YWdSZWdleC5leGVjKGl0ZW0ucGF0aCkpICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBkb3QgPSBtYXRjaFsxXS5pbmRleE9mKCcuJyk7XG5cbiAgICAgICAgaWYgKGRvdCA+IC0xKSB7XG4gICAgICAgICAgaXRlbS5yZXF1aXJlcy5wdXNoKG1hdGNoWzFdLnNsaWNlKDAsIGRvdCkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGl0ZW1zW3hdID0gaXRlbTtcbiAgICB9XG5cbiAgICB0aGlzLmhvaXN0ID0gYnVja2V0ID8gaG9pc3QudXNlKGJ1Y2tldCkgOiBob2lzdDtcbiAgfVxuXG4gIGV4dGVuZChPYmplY3REYXRhTWFuYWdlci5wcm90b3R5cGUsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uIChkYXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgdmFyIGl0ZW1zID0ge30sXG4gICAgICAgIHJlc3VsdCA9IHt9LFxuICAgICAgICBtYW5hZ2VycyA9IHt9LFxuICAgICAgICBob2lzdCA9IHRoaXMuaG9pc3QsXG4gICAgICAgIGZhaWxlZCxcbiAgICAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCk7XG5cbiAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGNvbnRleHQgPSBlcnJvcjtcbiAgICAgICAgZXJyb3IgPSBzdWNjZXNzO1xuICAgICAgICBzdWNjZXNzID0gZGF0YTtcbiAgICAgICAgZGF0YSA9IHt9O1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBkYXRhID0ge1xuICAgICAgICAgIGlkOiBkYXRhXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGV4dGVuZChpdGVtcywgdGhpcy5pdGVtcyk7XG5cbiAgICAgIGlmICh0eXBlb2YgZXJyb3IgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBpZiAoIWNvbnRleHQpIGNvbnRleHQgPSBlcnJvcjtcbiAgICAgICAgZXJyb3IgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzdWNjZWVkKGtleSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICByZXN1bHRba2V5XSA9IGRhdGE7XG4gICAgICAgICAgZGVsZXRlIGl0ZW1zW2tleV07XG4gICAgICAgICAgYWR2YW5jZSgpO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBmYWlsKGtleSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG1zZywgeGhyKSB7XG4gICAgICAgICAgaWYgKGl0ZW1zW2tleV0ub3B0aW9uYWwpIHtcbiAgICAgICAgICAgIHN1Y2NlZWQoa2V5KShudWxsKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIG1zZyA9IGtleSArIFwiOiBcIiArIG1zZztcbiAgICAgICAgICAgIGVycm9yICYmIGVycm9yLmNhbGwoY29udGV4dCwgbXNnLCB4aHIpO1xuICAgICAgICAgICAgcHJvbWlzZS5yZWplY3QobXNnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGFkdmFuY2UoKSB7XG4gICAgICAgIGlmIChmYWlsZWQpIHJldHVybjtcblxuICAgICAgICB2YXIgbG9hZGluZyA9IDA7XG5cbiAgICAgICAgb3V0OiBmb3IgKHZhciB4IGluIGl0ZW1zKSB7XG4gICAgICAgICAgdmFyIGl0ZW0gPSBpdGVtc1t4XTtcblxuICAgICAgICAgIGlmICghbWFuYWdlcnNbeF0pIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbS5yZXF1aXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICBpZiAoaXRlbS5yZXF1aXJlc1tpXSBpbiBpdGVtcykge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlIG91dDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcGF0aCA9IGl0ZW0ucGF0aC5yZXBsYWNlKHRhZ1JlZ2V4LCBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIGlmIChiLmluZGV4T2YoJy4nKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZ2V0KHJlc3VsdCwgYik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhW2JdIHx8IFwiXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgc3BhY2UgPSBwYXRoLmluZGV4T2YoJyAnKTtcblxuICAgICAgICAgICAgaWYgKHNwYWNlID4gLTEpIHtcbiAgICAgICAgICAgICAgKG1hbmFnZXJzW2l0ZW0ua2V5XSA9IGhvaXN0KHBhdGguc2xpY2UoMCwgc3BhY2UpKSkuZ2V0KHBhdGguc2xpY2Uoc3BhY2UgKyAxKSwgc3VjY2VlZChpdGVtLmtleSksIGZhaWwoaXRlbS5rZXkpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIChtYW5hZ2Vyc1tpdGVtLmtleV0gPSBob2lzdChwYXRoKSkuZ2V0KHN1Y2NlZWQoaXRlbS5rZXkpLCBmYWlsKGl0ZW0ua2V5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbG9hZGluZysrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFsb2FkaW5nKSB7XG4gICAgICAgICAgc3VjY2VzcyAmJiBzdWNjZXNzLmNhbGwoY29udGV4dCwgcmVzdWx0LCBtYW5hZ2Vycyk7XG4gICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgYWR2YW5jZSgpO1xuXG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBidWNrZXRNYW5hZ2VyTWV0aG9kcyA9IHtcbiAgICBnZXQ6IGZ1bmN0aW9uICh0eXBlLCBpZCwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0aGlzLmhvaXN0KHR5cGUsIHRoaXMuYnVja2V0KS5nZXQoaWQsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgcG9zdDogZnVuY3Rpb24gKHR5cGUsIGlkLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXMuaG9pc3QodHlwZSwgdGhpcy5idWNrZXQpLnBvc3QoaWQsIGRhdGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgY2xlYXI6IGZ1bmN0aW9uICh0eXBlLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXMuaG9pc3QodHlwZSwgdGhpcy5idWNrZXQpLmNsZWFyKHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAodHlwZSwgaWQsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdGhpcy5ob2lzdCh0eXBlLCB0aGlzLmJ1Y2tldCkucmVtb3ZlKGlkLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIG1ldGE6IGZ1bmN0aW9uIChkYXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXMuaG9pc3QuYnVja2V0Lm1ldGEodGhpcy5idWNrZXQsIGRhdGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgaW52aXRlOiBmdW5jdGlvbiAoZGF0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0aGlzLmhvaXN0LmJ1Y2tldC5pbnZpdGUodGhpcy5idWNrZXQsIGRhdGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgZW50ZXI6IGZ1bmN0aW9uIChzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXMuaG9pc3QuYnVja2V0LnNldCh0aGlzLmJ1Y2tldCwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgaG9pc3RNZXRob2RzID0ge1xuICAgIGFwaUtleTogZnVuY3Rpb24gKHYpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbmZpZyhcImFwaWtleVwiLCB2KTtcbiAgICB9LFxuXG4gICAgZ2V0OiBmdW5jdGlvbiAodHlwZSwgaWQsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdGhpcyh0eXBlKS5nZXQoaWQsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgcG9zdDogZnVuY3Rpb24gKHR5cGUsIGlkLCBkYXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXModHlwZSkucG9zdChpZCwgZGF0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBjbGVhcjogZnVuY3Rpb24gKHR5cGUsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdGhpcyh0eXBlKS5jbGVhcihzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHJlbW92ZTogZnVuY3Rpb24gKHR5cGUsIGlkLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXModHlwZSkucmVtb3ZlKGlkLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIGNvbmZpZzogZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICAgIGlmIChiID09PSB1KSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIGE7XG5cbiAgICAgICAgaWYgKHR5cGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnc1thXTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgZm9yICh2YXIgeCBpbiBhKSB7XG4gICAgICAgICAgICB0aGlzLl9jb25maWdzW3gudG9Mb3dlckNhc2UoKV0gPSBhW3hdO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcImZ1bmN0aW9uXCIgfHwgdHlwZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIHZhciBob2lzdCA9IHRoaXM7XG5cbiAgICAgICAgICByZXR1cm4gcmVxdWVzdChudWxsLCB7XG4gICAgICAgICAgICB1cmw6IFwiL3NldHRpbmdzXCIsXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoc2V0dGluZ3MpIHtcbiAgICAgICAgICAgICAgaG9pc3QuY29uZmlnKHNldHRpbmdzKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHNldHRpbmdzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIGEsIGIsIGMpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9jb25maWdzW2EudG9Mb3dlckNhc2UoKV0gPSBiO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdGF0dXM6IGZ1bmN0aW9uIChzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgdmFyIGhvaXN0ID0gdGhpcztcblxuICAgICAgaWYgKHR5cGVvZiBlcnJvciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGlmICghY29udGV4dCkgY29udGV4dCA9IGVycm9yO1xuICAgICAgICBlcnJvciA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiBcImF1dGguaG9pLmlvL3N0YXR1c1wiLFxuICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICAgIGhvaXN0Ll91c2VyID0gcmVzcDtcbiAgICAgICAgICByZXR1cm4gcmVzcDtcbiAgICAgICAgfSxcbiAgICAgICAgcHJvY2Vzc0Vycm9yOiBmdW5jdGlvbiAobXNnKSB7XG4gICAgICAgICAgaG9pc3QuX3VzZXIgPSBudWxsO1xuICAgICAgICAgIHJldHVybiBtc2c7XG4gICAgICAgIH1cbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgc2lnbnVwOiBmdW5jdGlvbiAobWVtYmVyLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgdmFyIGhvaXN0ID0gdGhpcztcblxuICAgICAgaWYgKHR5cGVvZiBtZW1iZXIgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5fY29uZmlncywge1xuICAgICAgICAgIHVybDogXCJhdXRoLmhvaS5pby91c2VyXCIsXG4gICAgICAgICAgZGF0YTogbWVtYmVyLFxuICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChyZXNwKSB7XG4gICAgICAgICAgICBpZiAocmVzcC5yZWRpcmVjdFVybCkge1xuICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSByZXNwLnJlZGlyZWN0VXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaG9pc3QuX3VzZXIgPSByZXNwO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3A7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGxvZ2luOiBmdW5jdGlvbiAobWVtYmVyLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgdmFyIGhvaXN0ID0gdGhpcztcblxuICAgICAgaWYgKHR5cGVvZiBtZW1iZXIgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5fY29uZmlncywge1xuICAgICAgICAgIHVybDogXCJhdXRoLmhvaS5pby9sb2dpblwiLFxuICAgICAgICAgIGRhdGE6IG1lbWJlcixcbiAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICAgICAgaWYgKHJlc3AucmVkaXJlY3RVcmwpIHtcbiAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gcmVzcC5yZWRpcmVjdFVybDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhvaXN0Ll91c2VyID0gcmVzcDtcbiAgICAgICAgICAgIHJldHVybiByZXNwO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBsb2dvdXQ6IGZ1bmN0aW9uIChzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgdmFyIGhvaXN0ID0gdGhpcztcblxuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5fY29uZmlncywge1xuICAgICAgICB1cmw6IFwiYXV0aC5ob2kuaW8vbG9nb3V0XCIsXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChyZXNwKSB7XG4gICAgICAgICAgaG9pc3QuX3VzZXIgPSBudWxsO1xuICAgICAgICAgIGhvaXN0Ll9idWNrZXQgPSBudWxsO1xuICAgICAgICAgIHJldHVybiByZXNwO1xuICAgICAgICB9XG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIGFjY2VwdDogZnVuY3Rpb24gKGNvZGUsIGRhdGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICB2YXIgaG9pc3QgPSB0aGlzO1xuXG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLl9jb25maWdzLCB7XG4gICAgICAgIHVybDogXCJhdXRoLmhvaS5pby9pbnZpdGUvXCIgKyBjb2RlICsgXCIvdXNlclwiLFxuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICAgIGhvaXN0Ll91c2VyID0gcmVzcDtcbiAgICAgICAgICByZXR1cm4gcmVzcDtcbiAgICAgICAgfVxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICB1c2VyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdXNlciAmJiBleHRlbmQoe30sIHRoaXMuX3VzZXIpO1xuICAgIH0sXG5cbiAgICBub3RpZnk6IGZ1bmN0aW9uIChpZCwgZGF0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIGlmICh0eXBlb2YgaWQgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgY29udGV4dCA9IGVycm9yO1xuICAgICAgICBlcnJvciA9IHN1Y2Nlc3M7XG4gICAgICAgIHN1Y2Nlc3MgPSBkYXRhO1xuICAgICAgICBkYXRhID0gaWQuZGF0YTtcbiAgICAgICAgaWQgPSBpZC5pZDtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBkYXRhID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuX2NvbmZpZ3MsIHtcbiAgICAgICAgICB1cmw6IFwibm90aWZ5LmhvaS5pby9ub3RpZmljYXRpb24vXCIgKyBpZCxcbiAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBhc3luY0Vycm9yKGVycm9yLCBjb250ZXh0LCBcImRhdGEgZm9yIG5vdGlmaWNhdGlvbiBtdXN0IGJlIGFuIG9iamVjdFwiKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZmlsZTogZnVuY3Rpb24gKGtleSwgZmlsZSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIGlmIChmaWxlICYmIGZpbGUuanF1ZXJ5KSB7XG4gICAgICAgIGZpbGUgPSBmaWxlWzBdO1xuICAgICAgfVxuXG4gICAgICB2YXIgdHlwZSA9IGNsYXNzT2YoZmlsZSksXG4gICAgICAgIGRhdGE7XG5cbiAgICAgIGlmICh0eXBlID09PSBcIkZpbGVcIikge1xuICAgICAgICBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgIGRhdGEuYXBwZW5kKFwiZmlsZVwiLCBmaWxlKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJGb3JtRGF0YVwiKSB7XG4gICAgICAgIGRhdGEgPSBmaWxlO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcIkhUTUxJbnB1dEVsZW1lbnRcIikge1xuICAgICAgICBmaWxlID0gZmlsZS5maWxlcyAmJiBmaWxlLmZpbGVzWzBdO1xuXG4gICAgICAgIGlmICghZmlsZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGRhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgICAgZGF0YS5hcHBlbmQoXCJmaWxlXCIsIGZpbGUpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcIkZ1bmN0aW9uXCIpIHtcbiAgICAgICAgY29udGV4dCA9IGVycm9yO1xuICAgICAgICBlcnJvciA9IHN1Y2Nlc3M7XG4gICAgICAgIHN1Y2Nlc3MgPSBmaWxlO1xuXG4gICAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuX2NvbmZpZ3MsIHtcbiAgICAgICAgICB1cmw6IFwiZmlsZS5ob2kuaW8vXCIgKyBrZXksXG4gICAgICAgICAgcmVzcG9uc2VUeXBlOiBcImJsb2JcIlxuICAgICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgICAgIC8vdW5kZWZpbmVkIGlzIERPTVdpbmRvdyBpbiBwaGFudG9tIGZvciBzb21lIHJlYXNvblxuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcIlVuZGVmaW5lZFwiIHx8IHR5cGUgPT09IFwiRE9NV2luZG93XCIpIHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5fY29uZmlncywge1xuICAgICAgICAgIHVybDogXCJmaWxlLmhvaS5pby9cIiArIGtleSxcbiAgICAgICAgICByZXNwb25zZVR5cGU6IFwiYmxvYlwiXG4gICAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBhc3luY0Vycm9yKGVycm9yLCBjb250ZXh0LCBcImNhbid0IHNlbmQgZmlsZSBvZiB0eXBlIFwiICsgdHlwZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiBcImZpbGUuaG9pLmlvL1wiICsga2V5LFxuICAgICAgICBkYXRhOiBkYXRhXG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHVzZTogZnVuY3Rpb24gKGJ1Y2tldCkge1xuICAgICAgdmFyIGhvaXN0ID0gdGhpcztcblxuICAgICAgdmFyIG1hbmFnZXIgPSBleHRlbmQoZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgaWYgKGNsYXNzT2YodHlwZSkgPT09IFwiT2JqZWN0XCIpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IE9iamVjdERhdGFNYW5hZ2VyKG1hbmFnZXIsIHR5cGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBuZXcgRGF0YU1hbmFnZXIoaG9pc3QsIHR5cGUsIGJ1Y2tldCk7XG4gICAgICAgIH1cbiAgICAgIH0sIGJ1Y2tldE1hbmFnZXJNZXRob2RzKTtcblxuICAgICAgbWFuYWdlci5ob2lzdCA9IHRoaXM7XG4gICAgICBtYW5hZ2VyLmJ1Y2tldCA9IGJ1Y2tldDtcblxuICAgICAgcmV0dXJuIG1hbmFnZXI7XG4gICAgfSxcblxuICAgIGNvbm5lY3RvcjogZnVuY3Rpb24gKHR5cGUsIHRva2VuKSB7XG4gICAgICByZXR1cm4gbmV3IENvbm5lY3Rvck1hbmFnZXIodGhpcywgdHlwZSwgdG9rZW4pO1xuICAgIH0sXG5cbiAgICBjbG9uZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGhvaXN0ID0gZXh0ZW5kKG1ha2VIb2lzdCgpLCB7XG4gICAgICAgIF9jb25maWdzOiBleHRlbmQoe30sIHRoaXMuX2NvbmZpZ3MpLFxuICAgICAgICBfdXNlcjogbnVsbCxcbiAgICAgICAgX2J1Y2tldDogbnVsbCxcbiAgICAgICAgX21hbmFnZXJzOiB7fVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBob2lzdDtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGJ1Y2tldE1ldGhvZHMgPSB7XG4gICAgc3RhdHVzOiBmdW5jdGlvbiAoc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHZhciBob2lzdCA9IHRoaXMuX2hvaXN0O1xuICAgICAgaWYgKHR5cGVvZiBlcnJvciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGlmICghY29udGV4dCkgY29udGV4dCA9IGVycm9yO1xuICAgICAgICBlcnJvciA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuX2hvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgIHVybDogXCJhdXRoLmhvaS5pby9idWNrZXQvY3VycmVudFwiLFxuICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoYnVja2V0KSB7XG4gICAgICAgICAgaG9pc3QuX2J1Y2tldCA9IGJ1Y2tldDtcbiAgICAgICAgICByZXR1cm4gYnVja2V0O1xuICAgICAgICB9LFxuICAgICAgICBwcm9jZXNzRXJyb3I6IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgICAgICAgaG9pc3QuX2J1Y2tldCA9IG51bGw7XG4gICAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgIH1cbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgcG9zdDogZnVuY3Rpb24gKGlkLCBkYXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gXCJzdHJpbmdcIiAmJiBpZCAhPT0gbnVsbCkge1xuICAgICAgICBjb250ZXh0ID0gZXJyb3I7XG4gICAgICAgIGVycm9yID0gc3VjY2VzcztcbiAgICAgICAgc3VjY2VzcyA9IGRhdGE7XG4gICAgICAgIGRhdGEgPSBpZDtcbiAgICAgICAgaWQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGRhdGEgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBjb250ZXh0ID0gZXJyb3I7XG4gICAgICAgIGVycm9yID0gc3VjY2VzcztcbiAgICAgICAgc3VjY2VzcyA9IGRhdGE7XG4gICAgICAgIGRhdGEgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoaWQpIHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5faG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgICB1cmw6IFwiYXV0aC5ob2kuaW8vYnVja2V0L1wiICsgaWQsXG4gICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLl9ob2lzdC5fY29uZmlncywge1xuICAgICAgICAgIHVybDogXCJhdXRoLmhvaS5pby9idWNrZXRcIixcbiAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbWV0YTogZnVuY3Rpb24gKGtleSwgbWV0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHZhciBob2lzdCA9IHRoaXMuX2hvaXN0O1xuXG4gICAgICBpZiAodHlwZW9mIGtleSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICBjb250ZXh0ID0gZXJyb3I7XG4gICAgICAgIGVycm9yID0gc3VjY2VzcztcbiAgICAgICAgc3VjY2VzcyA9IG1ldGE7XG4gICAgICAgIG1ldGEgPSBrZXk7XG5cbiAgICAgICAgaWYgKCFob2lzdC5fYnVja2V0KSB7XG4gICAgICAgICAgcmV0dXJuIGFzeW5jRXJyb3IoZXJyb3IsIGNvbnRleHQsIFwiTm8gYnVja2V0IHRvIHBvc3QgbWV0YWRhdGEgYWdhaW5zdFwiLCBudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGtleSA9IGhvaXN0Ll9idWNrZXQua2V5O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVxdWVzdChob2lzdC5fY29uZmlncywge1xuICAgICAgICB1cmw6IFwiYXV0aC5ob2kuaW8vYnVja2V0L1wiICsga2V5ICsgXCIvbWV0YVwiLFxuICAgICAgICBkYXRhOiBtZXRhLFxuICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoYnVja2V0KSB7XG4gICAgICAgICAgaWYgKGhvaXN0Ll9idWNrZXQgJiYgaG9pc3QuX2J1Y2tldC5rZXkgPT0gYnVja2V0LmtleSkge1xuICAgICAgICAgICAgaG9pc3QuX2J1Y2tldCA9IGJ1Y2tldDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gYnVja2V0O1xuICAgICAgICB9XG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHNldDogZnVuY3Rpb24gKGtleSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHZhciBob2lzdCA9IHRoaXMuX2hvaXN0O1xuXG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLl9ob2lzdC5fY29uZmlncywge1xuICAgICAgICB1cmw6IFwiYXV0aC5ob2kuaW8vYnVja2V0L2N1cnJlbnQvXCIgKyAoa2V5IHx8IFwiZGVmYXVsdFwiKSxcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKGJ1Y2tldCkge1xuICAgICAgICAgIGhvaXN0Ll9idWNrZXQgPSBrZXkgPyBidWNrZXQgOiBudWxsO1xuICAgICAgICAgIHJldHVybiBidWNrZXQ7XG4gICAgICAgIH1cbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgbGlzdDogZnVuY3Rpb24gKHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLl9ob2lzdC5fY29uZmlncywge1xuICAgICAgICB1cmw6IFwiYXV0aC5ob2kuaW8vYnVja2V0c1wiXG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIGludml0ZTogZnVuY3Rpb24gKGtleSwgZGF0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIGlmICh0eXBlb2Yga2V5ID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgY29udGV4dCA9IGVycm9yO1xuICAgICAgICBlcnJvciA9IHN1Y2Nlc3M7XG4gICAgICAgIHN1Y2Nlc3MgPSBkYXRhO1xuICAgICAgICBkYXRhID0ga2V5O1xuICAgICAgICBrZXkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoa2V5KSBkYXRhID0gXy5leHRlbmQoe1xuICAgICAgICBidWNrZXQ6IGtleVxuICAgICAgfSwgZGF0YSk7XG5cbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuX2hvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgIHVybDogXCJhdXRoLmhvaS5pby9pbnZpdGVcIixcbiAgICAgICAgZGF0YTogZGF0YVxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBDb25uZWN0b3JNYW5hZ2VyKGhvaXN0LCB0eXBlLCB0b2tlbikge1xuICAgIHRoaXMuaG9pc3QgPSBob2lzdDtcbiAgICB0aGlzLnVybCA9IFwicHJveHkuaG9pLmlvL1wiICsgdHlwZTtcbiAgICB0aGlzLnRva2VuID0gdG9rZW47XG4gIH1cblxuICBleHRlbmQoQ29ubmVjdG9yTWFuYWdlci5wcm90b3R5cGUsIHtcblxuICAgIGF1dGhvcml6ZTogZnVuY3Rpb24gKG9wdGlvbnMsIGNvbnRleHQpIHtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKHtcbiAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZixcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uICgpIHt9LFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoKSB7fSxcbiAgICAgICAgcmVkaXJlY3Q6IGZ1bmN0aW9uIChyZWRpcmVjdF91cmwpIHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSByZWRpcmVjdF91cmw7XG4gICAgICAgIH1cbiAgICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLmhvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgIHVybDogdGhpcy51cmwgKyBcIi9jb25uZWN0XCIsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICByZXR1cm5fdXJsOiBvcHRpb25zLnVybFxuICAgICAgICB9XG4gICAgICB9LCBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIGlmIChyZXMudG9rZW4pIHtcbiAgICAgICAgICBzZWxmLnRva2VuID0gcmVzLnRva2VuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXMucmVkaXJlY3QpIHtcbiAgICAgICAgICBvcHRpb25zLnJlZGlyZWN0ICYmIG9wdGlvbnMucmVkaXJlY3QuYXBwbHkodGhpcywgW3Jlcy5yZWRpcmVjdF0pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBvcHRpb25zLnN1Y2Nlc3MgJiYgb3B0aW9ucy5zdWNjZXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9LCBvcHRpb25zLmVycm9yLCBjb250ZXh0KTtcblxuICAgIH0sXG5cbiAgICBkaXNjb25uZWN0OiBmdW5jdGlvbiAoc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuaG9pc3RfY29uZmlncywge1xuICAgICAgICB1cmw6IHRoaXMudXJsICsgXCIvZGlzY29ubmVjdFwiXG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcbiAgICByZW1vdmVGcm9tVXNlcjogZnVuY3Rpb24gKHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLmhvaXN0X2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiB0aGlzLnVybCArIFwiL3JlbW92ZUZyb21Vc2VyXCJcbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgZ2V0OiBmdW5jdGlvbiAocGF0aCwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcblxuICAgICAgaWYgKHBhdGhbMF0gIT09ICcvJykgcGF0aCA9ICcvJyArIHBhdGg7XG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLmhvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgIHVybDogdGhpcy51cmwgKyBwYXRoLFxuICAgICAgICB0b2tlbjogdGhpcy50b2tlblxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBwb3N0OiBmdW5jdGlvbiAocGF0aCwgZGF0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIGlmIChwYXRoWzBdICE9PSAnLycpIHBhdGggPSAnLycgKyBwYXRoO1xuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5ob2lzdC5fY29uZmlncywge1xuICAgICAgICB1cmw6IHRoaXMudXJsICsgcGF0aCxcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgdG9rZW46IHRoaXMudG9rZW5cbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgcHV0OiBmdW5jdGlvbiAocGF0aCwgZGF0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIGlmIChwYXRoWzBdICE9PSAnLycpIHBhdGggPSAnLycgKyBwYXRoO1xuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5ob2lzdC5fY29uZmlncywge1xuICAgICAgICB1cmw6IHRoaXMudXJsICsgcGF0aCxcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgbWV0aG9kOiBcIlBVVFwiLFxuICAgICAgICB0b2tlbjogdGhpcy50b2tlblxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uIChwYXRoLCBkYXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgaWYgKHR5cGVvZiBkYXRhID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgY29udGV4dCA9IGVycm9yO1xuICAgICAgICBlcnJvciA9IHN1Y2Nlc3M7XG4gICAgICAgIHN1Y2Nlc3MgPSBkYXRhO1xuICAgICAgICBkYXRhID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhdGhbMF0gIT09ICcvJykgcGF0aCA9ICcvJyArIHBhdGg7XG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLmhvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgIHVybDogdGhpcy51cmwgKyBwYXRoLFxuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBtZXRob2Q6IFwiREVMRVRFXCIsXG4gICAgICAgIHRva2VuOiB0aGlzLnRva2VuXG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBtYWtlSG9pc3QoKSB7XG4gICAgdmFyIGhvaXN0ID0gZXh0ZW5kKGZ1bmN0aW9uICh0eXBlLCBidWNrZXQpIHtcbiAgICAgIGlmIChjbGFzc09mKHR5cGUpID09PSBcIk9iamVjdFwiKSB7XG4gICAgICAgIHJldHVybiBuZXcgT2JqZWN0RGF0YU1hbmFnZXIoaG9pc3QsIHR5cGUsIGJ1Y2tldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IERhdGFNYW5hZ2VyKGhvaXN0LCB0eXBlLCBidWNrZXQpO1xuICAgICAgfVxuICAgIH0sIGhvaXN0TWV0aG9kcyk7XG5cbiAgICBob2lzdC5idWNrZXQgPSBleHRlbmQoZnVuY3Rpb24gKG1ldGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0LCBjeCkge1xuICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgbWV0YTtcblxuICAgICAgaWYgKHR5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBob2lzdC5idWNrZXQuc3RhdHVzKG1ldGEsIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJzdHJpbmdcIiAmJiB0eXBlb2Ygc3VjY2VzcyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBob2lzdC5idWNrZXQucG9zdChtZXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCwgY3gpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcInN0cmluZ1wiIHx8IG1ldGEgPT09IG51bGwpIHtcbiAgICAgICAgaG9pc3QuYnVja2V0LnNldChtZXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgaG9pc3QuYnVja2V0Lm1ldGEobWV0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGhvaXN0Ll9idWNrZXQ7XG4gICAgICB9XG4gICAgfSwgYnVja2V0TWV0aG9kcyk7XG5cbiAgICBob2lzdC5idWNrZXQuX2hvaXN0ID0gaG9pc3Q7XG5cbiAgICByZXR1cm4gaG9pc3Q7XG4gIH1cblxuICB2YXIgSG9pc3QgPSBleHRlbmQobWFrZUhvaXN0KCksIHtcbiAgICBfY29uZmlnczoge1xuICAgICAgcHJvdG9jb2w6IFwiaHR0cHM6Ly9cIlxuICAgIH0sXG4gICAgX3VzZXI6IG51bGwsXG4gICAgX2J1Y2tldDogbnVsbCxcbiAgICBfbWFuYWdlcnM6IHt9XG4gIH0pO1xuXG4gIC8vIHRocm93IEhvaXN0IGF0IHNvbWV0aGluZyBpdCB3aWxsIHN0aWNrIHRvXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShcIkhvaXN0XCIsIFsnJ10sIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBIb2lzdDtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiB3aW5kb3cuZG9jdW1lbnQgPT09IFwib2JqZWN0XCIpIHtcbiAgICB3aW5kb3cuSG9pc3QgPSBIb2lzdDtcbiAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gSG9pc3Q7XG4gIH1cbn0pKCk7XG4iXX0=
