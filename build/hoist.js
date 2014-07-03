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

      if (type === "String") {
        contentType = "application/json";
      } else if (type === "FormData") {
        method = opts.method || "POST";
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

    var req = agent[method.toLowerCase()](configs ? configs.protocol + opts.url : opts.url);
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
        if (res.headers['content-type'] === 'application/json') {
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
      req.send(opts.data);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVm9sdW1lcy9TdG9yZS9Qcm9qZWN0cy9ob2lzdC9ob2lzdC1qcy9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1ZvbHVtZXMvU3RvcmUvUHJvamVjdHMvaG9pc3QvaG9pc3QtanMvbm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL2NsaWVudC5qcyIsIi9Wb2x1bWVzL1N0b3JlL1Byb2plY3RzL2hvaXN0L2hvaXN0LWpzL25vZGVfbW9kdWxlcy9zdXBlcmFnZW50L25vZGVfbW9kdWxlcy9jb21wb25lbnQtZW1pdHRlci9pbmRleC5qcyIsIi9Wb2x1bWVzL1N0b3JlL1Byb2plY3RzL2hvaXN0L2hvaXN0LWpzL25vZGVfbW9kdWxlcy9zdXBlcmFnZW50L25vZGVfbW9kdWxlcy9yZWR1Y2UtY29tcG9uZW50L2luZGV4LmpzIiwiL1ZvbHVtZXMvU3RvcmUvUHJvamVjdHMvaG9pc3QvaG9pc3QtanMvc3JjL2hvaXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3poQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2VtaXR0ZXInKTtcbnZhciByZWR1Y2UgPSByZXF1aXJlKCdyZWR1Y2UnKTtcblxuLyoqXG4gKiBSb290IHJlZmVyZW5jZSBmb3IgaWZyYW1lcy5cbiAqL1xuXG52YXIgcm9vdCA9ICd1bmRlZmluZWQnID09IHR5cGVvZiB3aW5kb3dcbiAgPyB0aGlzXG4gIDogd2luZG93O1xuXG4vKipcbiAqIE5vb3AuXG4gKi9cblxuZnVuY3Rpb24gbm9vcCgpe307XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBob3N0IG9iamVjdCxcbiAqIHdlIGRvbid0IHdhbnQgdG8gc2VyaWFsaXplIHRoZXNlIDopXG4gKlxuICogVE9ETzogZnV0dXJlIHByb29mLCBtb3ZlIHRvIGNvbXBvZW50IGxhbmRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNIb3N0KG9iaikge1xuICB2YXIgc3RyID0ge30udG9TdHJpbmcuY2FsbChvYmopO1xuXG4gIHN3aXRjaCAoc3RyKSB7XG4gICAgY2FzZSAnW29iamVjdCBGaWxlXSc6XG4gICAgY2FzZSAnW29iamVjdCBCbG9iXSc6XG4gICAgY2FzZSAnW29iamVjdCBGb3JtRGF0YV0nOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluZSBYSFIuXG4gKi9cblxuZnVuY3Rpb24gZ2V0WEhSKCkge1xuICBpZiAocm9vdC5YTUxIdHRwUmVxdWVzdFxuICAgICYmICgnZmlsZTonICE9IHJvb3QubG9jYXRpb24ucHJvdG9jb2wgfHwgIXJvb3QuQWN0aXZlWE9iamVjdCkpIHtcbiAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICB9IGVsc2Uge1xuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuNi4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjMuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZSwgYWRkZWQgdG8gc3VwcG9ydCBJRS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIHRyaW0gPSAnJy50cmltXG4gID8gZnVuY3Rpb24ocykgeyByZXR1cm4gcy50cmltKCk7IH1cbiAgOiBmdW5jdGlvbihzKSB7IHJldHVybiBzLnJlcGxhY2UoLyheXFxzKnxcXHMqJCkvZywgJycpOyB9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGFuIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7XG4gIHJldHVybiBvYmogPT09IE9iamVjdChvYmopO1xufVxuXG4vKipcbiAqIFNlcmlhbGl6ZSB0aGUgZ2l2ZW4gYG9iamAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VyaWFsaXplKG9iaikge1xuICBpZiAoIWlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gIHZhciBwYWlycyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKG51bGwgIT0gb2JqW2tleV0pIHtcbiAgICAgIHBhaXJzLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSlcbiAgICAgICAgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQob2JqW2tleV0pKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhaXJzLmpvaW4oJyYnKTtcbn1cblxuLyoqXG4gKiBFeHBvc2Ugc2VyaWFsaXphdGlvbiBtZXRob2QuXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0ID0gc2VyaWFsaXplO1xuXG4gLyoqXG4gICogUGFyc2UgdGhlIGdpdmVuIHgtd3d3LWZvcm0tdXJsZW5jb2RlZCBgc3RyYC5cbiAgKlxuICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICogQGFwaSBwcml2YXRlXG4gICovXG5cbmZ1bmN0aW9uIHBhcnNlU3RyaW5nKHN0cikge1xuICB2YXIgb2JqID0ge307XG4gIHZhciBwYWlycyA9IHN0ci5zcGxpdCgnJicpO1xuICB2YXIgcGFydHM7XG4gIHZhciBwYWlyO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIHBhaXIgPSBwYWlyc1tpXTtcbiAgICBwYXJ0cyA9IHBhaXIuc3BsaXQoJz0nKTtcbiAgICBvYmpbZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzBdKV0gPSBkZWNvZGVVUklDb21wb25lbnQocGFydHNbMV0pO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBFeHBvc2UgcGFyc2VyLlxuICovXG5cbnJlcXVlc3QucGFyc2VTdHJpbmcgPSBwYXJzZVN0cmluZztcblxuLyoqXG4gKiBEZWZhdWx0IE1JTUUgdHlwZSBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICovXG5cbnJlcXVlc3QudHlwZXMgPSB7XG4gIGh0bWw6ICd0ZXh0L2h0bWwnLFxuICBqc29uOiAnYXBwbGljYXRpb24vanNvbicsXG4gIHhtbDogJ2FwcGxpY2F0aW9uL3htbCcsXG4gIHVybGVuY29kZWQ6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAnZm9ybSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAnZm9ybS1kYXRhJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbi8qKlxuICogRGVmYXVsdCBzZXJpYWxpemF0aW9uIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC5zZXJpYWxpemVbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24ob2JqKXtcbiAqICAgICAgIHJldHVybiAnZ2VuZXJhdGVkIHhtbCBoZXJlJztcbiAqICAgICB9O1xuICpcbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemUgPSB7XG4gICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogc2VyaWFsaXplLFxuICAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnN0cmluZ2lmeVxuIH07XG5cbiAvKipcbiAgKiBEZWZhdWx0IHBhcnNlcnMuXG4gICpcbiAgKiAgICAgc3VwZXJhZ2VudC5wYXJzZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihzdHIpe1xuICAqICAgICAgIHJldHVybiB7IG9iamVjdCBwYXJzZWQgZnJvbSBzdHIgfTtcbiAgKiAgICAgfTtcbiAgKlxuICAqL1xuXG5yZXF1ZXN0LnBhcnNlID0ge1xuICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogcGFyc2VTdHJpbmcsXG4gICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5wYXJzZVxufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gaGVhZGVyIGBzdHJgIGludG9cbiAqIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBtYXBwZWQgZmllbGRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlSGVhZGVyKHN0cikge1xuICB2YXIgbGluZXMgPSBzdHIuc3BsaXQoL1xccj9cXG4vKTtcbiAgdmFyIGZpZWxkcyA9IHt9O1xuICB2YXIgaW5kZXg7XG4gIHZhciBsaW5lO1xuICB2YXIgZmllbGQ7XG4gIHZhciB2YWw7XG5cbiAgbGluZXMucG9wKCk7IC8vIHRyYWlsaW5nIENSTEZcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gbGluZXMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBsaW5lID0gbGluZXNbaV07XG4gICAgaW5kZXggPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBmaWVsZCA9IGxpbmUuc2xpY2UoMCwgaW5kZXgpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdHJpbShsaW5lLnNsaWNlKGluZGV4ICsgMSkpO1xuICAgIGZpZWxkc1tmaWVsZF0gPSB2YWw7XG4gIH1cblxuICByZXR1cm4gZmllbGRzO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgbWltZSB0eXBlIGZvciB0aGUgZ2l2ZW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdHlwZShzdHIpe1xuICByZXR1cm4gc3RyLnNwbGl0KC8gKjsgKi8pLnNoaWZ0KCk7XG59O1xuXG4vKipcbiAqIFJldHVybiBoZWFkZXIgZmllbGQgcGFyYW1ldGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJhbXMoc3RyKXtcbiAgcmV0dXJuIHJlZHVjZShzdHIuc3BsaXQoLyAqOyAqLyksIGZ1bmN0aW9uKG9iaiwgc3RyKXtcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoLyAqPSAqLylcbiAgICAgICwga2V5ID0gcGFydHMuc2hpZnQoKVxuICAgICAgLCB2YWwgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgaWYgKGtleSAmJiB2YWwpIG9ialtrZXldID0gdmFsO1xuICAgIHJldHVybiBvYmo7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVzcG9uc2VgIHdpdGggdGhlIGdpdmVuIGB4aHJgLlxuICpcbiAqICAtIHNldCBmbGFncyAoLm9rLCAuZXJyb3IsIGV0YylcbiAqICAtIHBhcnNlIGhlYWRlclxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICBBbGlhc2luZyBgc3VwZXJhZ2VudGAgYXMgYHJlcXVlc3RgIGlzIG5pY2U6XG4gKlxuICogICAgICByZXF1ZXN0ID0gc3VwZXJhZ2VudDtcbiAqXG4gKiAgV2UgY2FuIHVzZSB0aGUgcHJvbWlzZS1saWtlIEFQSSwgb3IgcGFzcyBjYWxsYmFja3M6XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnLycpLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICogICAgICByZXF1ZXN0LmdldCgnLycsIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIFNlbmRpbmcgZGF0YSBjYW4gYmUgY2hhaW5lZDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAuc2VuZCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5wb3N0KClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBPciBmdXJ0aGVyIHJlZHVjZWQgdG8gYSBzaW5nbGUgY2FsbCBmb3Igc2ltcGxlIGNhc2VzOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIEBwYXJhbSB7WE1MSFRUUFJlcXVlc3R9IHhoclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIFJlc3BvbnNlKHJlcSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5yZXEgPSByZXE7XG4gIHRoaXMueGhyID0gdGhpcy5yZXEueGhyO1xuICB0aGlzLnRleHQgPSB0aGlzLnhoci5yZXNwb25zZVRleHQ7XG4gIHRoaXMuc2V0U3RhdHVzUHJvcGVydGllcyh0aGlzLnhoci5zdGF0dXMpO1xuICB0aGlzLmhlYWRlciA9IHRoaXMuaGVhZGVycyA9IHBhcnNlSGVhZGVyKHRoaXMueGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcbiAgLy8gZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIHNvbWV0aW1lcyBmYWxzZWx5IHJldHVybnMgXCJcIiBmb3IgQ09SUyByZXF1ZXN0cywgYnV0XG4gIC8vIGdldFJlc3BvbnNlSGVhZGVyIHN0aWxsIHdvcmtzLiBzbyB3ZSBnZXQgY29udGVudC10eXBlIGV2ZW4gaWYgZ2V0dGluZ1xuICAvLyBvdGhlciBoZWFkZXJzIGZhaWxzLlxuICB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gPSB0aGlzLnhoci5nZXRSZXNwb25zZUhlYWRlcignY29udGVudC10eXBlJyk7XG4gIHRoaXMuc2V0SGVhZGVyUHJvcGVydGllcyh0aGlzLmhlYWRlcik7XG4gIHRoaXMuYm9keSA9IHRoaXMucmVxLm1ldGhvZCAhPSAnSEVBRCdcbiAgICA/IHRoaXMucGFyc2VCb2R5KHRoaXMudGV4dClcbiAgICA6IG51bGw7XG59XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuaGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIHJlbGF0ZWQgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gYC50eXBlYCB0aGUgY29udGVudCB0eXBlIHdpdGhvdXQgcGFyYW1zXG4gKlxuICogQSByZXNwb25zZSBvZiBcIkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD11dGYtOFwiXG4gKiB3aWxsIHByb3ZpZGUgeW91IHdpdGggYSBgLnR5cGVgIG9mIFwidGV4dC9wbGFpblwiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRIZWFkZXJQcm9wZXJ0aWVzID0gZnVuY3Rpb24oaGVhZGVyKXtcbiAgLy8gY29udGVudC10eXBlXG4gIHZhciBjdCA9IHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSB8fCAnJztcbiAgdGhpcy50eXBlID0gdHlwZShjdCk7XG5cbiAgLy8gcGFyYW1zXG4gIHZhciBvYmogPSBwYXJhbXMoY3QpO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB0aGlzW2tleV0gPSBvYmpba2V5XTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGJvZHkgYHN0cmAuXG4gKlxuICogVXNlZCBmb3IgYXV0by1wYXJzaW5nIG9mIGJvZGllcy4gUGFyc2Vyc1xuICogYXJlIGRlZmluZWQgb24gdGhlIGBzdXBlcmFnZW50LnBhcnNlYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUucGFyc2VCb2R5ID0gZnVuY3Rpb24oc3RyKXtcbiAgdmFyIHBhcnNlID0gcmVxdWVzdC5wYXJzZVt0aGlzLnR5cGVdO1xuICByZXR1cm4gcGFyc2VcbiAgICA/IHBhcnNlKHN0cilcbiAgICA6IG51bGw7XG59O1xuXG4vKipcbiAqIFNldCBmbGFncyBzdWNoIGFzIGAub2tgIGJhc2VkIG9uIGBzdGF0dXNgLlxuICpcbiAqIEZvciBleGFtcGxlIGEgMnh4IHJlc3BvbnNlIHdpbGwgZ2l2ZSB5b3UgYSBgLm9rYCBvZiBfX3RydWVfX1xuICogd2hlcmVhcyA1eHggd2lsbCBiZSBfX2ZhbHNlX18gYW5kIGAuZXJyb3JgIHdpbGwgYmUgX190cnVlX18uIFRoZVxuICogYC5jbGllbnRFcnJvcmAgYW5kIGAuc2VydmVyRXJyb3JgIGFyZSBhbHNvIGF2YWlsYWJsZSB0byBiZSBtb3JlXG4gKiBzcGVjaWZpYywgYW5kIGAuc3RhdHVzVHlwZWAgaXMgdGhlIGNsYXNzIG9mIGVycm9yIHJhbmdpbmcgZnJvbSAxLi41XG4gKiBzb21ldGltZXMgdXNlZnVsIGZvciBtYXBwaW5nIHJlc3BvbmQgY29sb3JzIGV0Yy5cbiAqXG4gKiBcInN1Z2FyXCIgcHJvcGVydGllcyBhcmUgYWxzbyBkZWZpbmVkIGZvciBjb21tb24gY2FzZXMuIEN1cnJlbnRseSBwcm92aWRpbmc6XG4gKlxuICogICAtIC5ub0NvbnRlbnRcbiAqICAgLSAuYmFkUmVxdWVzdFxuICogICAtIC51bmF1dGhvcml6ZWRcbiAqICAgLSAubm90QWNjZXB0YWJsZVxuICogICAtIC5ub3RGb3VuZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0dXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRTdGF0dXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24oc3RhdHVzKXtcbiAgdmFyIHR5cGUgPSBzdGF0dXMgLyAxMDAgfCAwO1xuXG4gIC8vIHN0YXR1cyAvIGNsYXNzXG4gIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICB0aGlzLnN0YXR1c1R5cGUgPSB0eXBlO1xuXG4gIC8vIGJhc2ljc1xuICB0aGlzLmluZm8gPSAxID09IHR5cGU7XG4gIHRoaXMub2sgPSAyID09IHR5cGU7XG4gIHRoaXMuY2xpZW50RXJyb3IgPSA0ID09IHR5cGU7XG4gIHRoaXMuc2VydmVyRXJyb3IgPSA1ID09IHR5cGU7XG4gIHRoaXMuZXJyb3IgPSAoNCA9PSB0eXBlIHx8IDUgPT0gdHlwZSlcbiAgICA/IHRoaXMudG9FcnJvcigpXG4gICAgOiBmYWxzZTtcblxuICAvLyBzdWdhclxuICB0aGlzLmFjY2VwdGVkID0gMjAyID09IHN0YXR1cztcbiAgdGhpcy5ub0NvbnRlbnQgPSAyMDQgPT0gc3RhdHVzIHx8IDEyMjMgPT0gc3RhdHVzO1xuICB0aGlzLmJhZFJlcXVlc3QgPSA0MDAgPT0gc3RhdHVzO1xuICB0aGlzLnVuYXV0aG9yaXplZCA9IDQwMSA9PSBzdGF0dXM7XG4gIHRoaXMubm90QWNjZXB0YWJsZSA9IDQwNiA9PSBzdGF0dXM7XG4gIHRoaXMubm90Rm91bmQgPSA0MDQgPT0gc3RhdHVzO1xuICB0aGlzLmZvcmJpZGRlbiA9IDQwMyA9PSBzdGF0dXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRXJyb3JgIHJlcHJlc2VudGF0aXZlIG9mIHRoaXMgcmVzcG9uc2UuXG4gKlxuICogQHJldHVybiB7RXJyb3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS50b0Vycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHJlcSA9IHRoaXMucmVxO1xuICB2YXIgbWV0aG9kID0gcmVxLm1ldGhvZDtcbiAgdmFyIHVybCA9IHJlcS51cmw7XG5cbiAgdmFyIG1zZyA9ICdjYW5ub3QgJyArIG1ldGhvZCArICcgJyArIHVybCArICcgKCcgKyB0aGlzLnN0YXR1cyArICcpJztcbiAgdmFyIGVyciA9IG5ldyBFcnJvcihtc2cpO1xuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSBtZXRob2Q7XG4gIGVyci51cmwgPSB1cmw7XG5cbiAgcmV0dXJuIGVycjtcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZWAuXG4gKi9cblxucmVxdWVzdC5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlcXVlc3RgIHdpdGggdGhlIGdpdmVuIGBtZXRob2RgIGFuZCBgdXJsYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBFbWl0dGVyLmNhbGwodGhpcyk7XG4gIHRoaXMuX3F1ZXJ5ID0gdGhpcy5fcXVlcnkgfHwgW107XG4gIHRoaXMubWV0aG9kID0gbWV0aG9kO1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5oZWFkZXIgPSB7fTtcbiAgdGhpcy5faGVhZGVyID0ge307XG4gIHRoaXMub24oJ2VuZCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHJlcyA9IG5ldyBSZXNwb25zZShzZWxmKTtcbiAgICBpZiAoJ0hFQUQnID09IG1ldGhvZCkgcmVzLnRleHQgPSBudWxsO1xuICAgIHNlbGYuY2FsbGJhY2sobnVsbCwgcmVzKTtcbiAgfSk7XG59XG5cbi8qKlxuICogTWl4aW4gYEVtaXR0ZXJgLlxuICovXG5cbkVtaXR0ZXIoUmVxdWVzdC5wcm90b3R5cGUpO1xuXG4vKipcbiAqIEFsbG93IGZvciBleHRlbnNpb25cbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbihmbikge1xuICBmbih0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbi8qKlxuICogU2V0IHRpbWVvdXQgdG8gYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24obXMpe1xuICB0aGlzLl90aW1lb3V0ID0gbXM7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDbGVhciBwcmV2aW91cyB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbigpe1xuICB0aGlzLl90aW1lb3V0ID0gMDtcbiAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFib3J0IHRoZSByZXF1ZXN0LCBhbmQgY2xlYXIgcG90ZW50aWFsIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbigpe1xuICBpZiAodGhpcy5hYm9ydGVkKSByZXR1cm47XG4gIHRoaXMuYWJvcnRlZCA9IHRydWU7XG4gIHRoaXMueGhyLmFib3J0KCk7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIHRoaXMuZW1pdCgnYWJvcnQnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgYGZpZWxkYCB0byBgdmFsYCwgb3IgbXVsdGlwbGUgZmllbGRzIHdpdGggb25lIG9iamVjdC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuc2V0KCdYLUFQSS1LZXknLCAnZm9vYmFyJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoeyBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJywgJ1gtQVBJLUtleSc6ICdmb29iYXInIH0pXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBmaWVsZFxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGZpZWxkLCB2YWwpe1xuICBpZiAoaXNPYmplY3QoZmllbGQpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGZpZWxkKSB7XG4gICAgICB0aGlzLnNldChrZXksIGZpZWxkW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV0gPSB2YWw7XG4gIHRoaXMuaGVhZGVyW2ZpZWxkXSA9IHZhbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGhlYWRlciBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZ2V0SGVhZGVyID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgQ29udGVudC1UeXBlIHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgneG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi94bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnR5cGUgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0NvbnRlbnQtVHlwZScsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQWNjZXB0IHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLmpzb24gPSAnYXBwbGljYXRpb24vanNvbic7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdqc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhY2NlcHRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0FjY2VwdCcsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFzc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF1dGggPSBmdW5jdGlvbih1c2VyLCBwYXNzKXtcbiAgdmFyIHN0ciA9IGJ0b2EodXNlciArICc6JyArIHBhc3MpO1xuICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsICdCYXNpYyAnICsgc3RyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiogQWRkIHF1ZXJ5LXN0cmluZyBgdmFsYC5cbipcbiogRXhhbXBsZXM6XG4qXG4qICAgcmVxdWVzdC5nZXQoJy9zaG9lcycpXG4qICAgICAucXVlcnkoJ3NpemU9MTAnKVxuKiAgICAgLnF1ZXJ5KHsgY29sb3I6ICdibHVlJyB9KVxuKlxuKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHZhbFxuKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiogQGFwaSBwdWJsaWNcbiovXG5cblJlcXVlc3QucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24odmFsKXtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHZhbCA9IHNlcmlhbGl6ZSh2YWwpO1xuICBpZiAodmFsKSB0aGlzLl9xdWVyeS5wdXNoKHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBXcml0ZSB0aGUgZmllbGQgYG5hbWVgIGFuZCBgdmFsYCBmb3IgXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCJcbiAqIHJlcXVlc3QgYm9kaWVzLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmZpZWxkKCdmb28nLCAnYmFyJylcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd8QmxvYnxGaWxlfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5maWVsZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbCl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHRoaXMuX2Zvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gIHRoaXMuX2Zvcm1EYXRhLmFwcGVuZChuYW1lLCB2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUXVldWUgdGhlIGdpdmVuIGBmaWxlYCBhcyBhbiBhdHRhY2htZW50IHRvIHRoZSBzcGVjaWZpZWQgYGZpZWxkYCxcbiAqIHdpdGggb3B0aW9uYWwgYGZpbGVuYW1lYC5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5hdHRhY2gobmV3IEJsb2IoWyc8YSBpZD1cImFcIj48YiBpZD1cImJcIj5oZXkhPC9iPjwvYT4nXSwgeyB0eXBlOiBcInRleHQvaHRtbFwifSkpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcGFyYW0ge0Jsb2J8RmlsZX0gZmlsZVxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXR0YWNoID0gZnVuY3Rpb24oZmllbGQsIGZpbGUsIGZpbGVuYW1lKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kIGBkYXRhYCwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBxdWVyeXN0cmluZ1xuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG11bHRpcGxlIGRhdGEgXCJ3cml0ZXNcIlxuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuc2VuZCh7IHNlYXJjaDogJ3F1ZXJ5JyB9KVxuICogICAgICAgICAuc2VuZCh7IHJhbmdlOiAnMS4uNScgfSlcbiAqICAgICAgICAgLnNlbmQoeyBvcmRlcjogJ2Rlc2MnIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnanNvbicpXG4gKiAgICAgICAgIC5zZW5kKCd7XCJuYW1lXCI6XCJ0alwifSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAqICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gICogICAgICAgIC5zZW5kKCduYW1lPXRvYmknKVxuICAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICAqICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZGF0YVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIG9iaiA9IGlzT2JqZWN0KGRhdGEpO1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcblxuICAvLyBtZXJnZVxuICBpZiAob2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGRhdGEpIHtcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnID09IHR5cGUpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhXG4gICAgICAgID8gdGhpcy5fZGF0YSArICcmJyArIGRhdGFcbiAgICAgICAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIW9iaikgcmV0dXJuIHRoaXM7XG4gIGlmICghdHlwZSkgdGhpcy50eXBlKCdqc29uJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggYGVycmAgYW5kIGByZXNgXG4gKiBhbmQgaGFuZGxlIGFyaXR5IGNoZWNrLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtSZXNwb25zZX0gcmVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgdmFyIGZuID0gdGhpcy5fY2FsbGJhY2s7XG4gIGlmICgyID09IGZuLmxlbmd0aCkgcmV0dXJuIGZuKGVyciwgcmVzKTtcbiAgaWYgKGVycikgcmV0dXJuIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICBmbihyZXMpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB4LWRvbWFpbiBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jcm9zc0RvbWFpbkVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcignT3JpZ2luIGlzIG5vdCBhbGxvd2VkIGJ5IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicpO1xuICBlcnIuY3Jvc3NEb21haW4gPSB0cnVlO1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHRpbWVvdXQgZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dEVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCd0aW1lb3V0IG9mICcgKyB0aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyk7XG4gIGVyci50aW1lb3V0ID0gdGltZW91dDtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBFbmFibGUgdHJhbnNtaXNzaW9uIG9mIGNvb2tpZXMgd2l0aCB4LWRvbWFpbiByZXF1ZXN0cy5cbiAqXG4gKiBOb3RlIHRoYXQgZm9yIHRoaXMgdG8gd29yayB0aGUgb3JpZ2luIG11c3Qgbm90IGJlXG4gKiB1c2luZyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiIHdpdGggYSB3aWxkY2FyZCxcbiAqIGFuZCBhbHNvIG11c3Qgc2V0IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIlxuICogdG8gXCJ0cnVlXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbigpe1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhdGUgcmVxdWVzdCwgaW52b2tpbmcgY2FsbGJhY2sgYGZuKHJlcylgXG4gKiB3aXRoIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgeGhyID0gdGhpcy54aHIgPSBnZXRYSFIoKTtcbiAgdmFyIHF1ZXJ5ID0gdGhpcy5fcXVlcnkuam9pbignJicpO1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBkYXRhID0gdGhpcy5fZm9ybURhdGEgfHwgdGhpcy5fZGF0YTtcblxuICAvLyBzdG9yZSBjYWxsYmFja1xuICB0aGlzLl9jYWxsYmFjayA9IGZuIHx8IG5vb3A7XG5cbiAgLy8gc3RhdGUgY2hhbmdlXG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuICAgIGlmICg0ICE9IHhoci5yZWFkeVN0YXRlKSByZXR1cm47XG4gICAgaWYgKDAgPT0geGhyLnN0YXR1cykge1xuICAgICAgaWYgKHNlbGYuYWJvcnRlZCkgcmV0dXJuIHNlbGYudGltZW91dEVycm9yKCk7XG4gICAgICByZXR1cm4gc2VsZi5jcm9zc0RvbWFpbkVycm9yKCk7XG4gICAgfVxuICAgIHNlbGYuZW1pdCgnZW5kJyk7XG4gIH07XG5cbiAgLy8gcHJvZ3Jlc3NcbiAgaWYgKHhoci51cGxvYWQpIHtcbiAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihlKXtcbiAgICAgIGUucGVyY2VudCA9IGUubG9hZGVkIC8gZS50b3RhbCAqIDEwMDtcbiAgICAgIHNlbGYuZW1pdCgncHJvZ3Jlc3MnLCBlKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gdGltZW91dFxuICBpZiAodGltZW91dCAmJiAhdGhpcy5fdGltZXIpIHtcbiAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYuYWJvcnQoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgfVxuXG4gIC8vIHF1ZXJ5c3RyaW5nXG4gIGlmIChxdWVyeSkge1xuICAgIHF1ZXJ5ID0gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QocXVlcnkpO1xuICAgIHRoaXMudXJsICs9IH50aGlzLnVybC5pbmRleE9mKCc/JylcbiAgICAgID8gJyYnICsgcXVlcnlcbiAgICAgIDogJz8nICsgcXVlcnk7XG4gIH1cblxuICAvLyBpbml0aWF0ZSByZXF1ZXN0XG4gIHhoci5vcGVuKHRoaXMubWV0aG9kLCB0aGlzLnVybCwgdHJ1ZSk7XG5cbiAgLy8gQ09SU1xuICBpZiAodGhpcy5fd2l0aENyZWRlbnRpYWxzKSB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcblxuICAvLyBib2R5XG4gIGlmICgnR0VUJyAhPSB0aGlzLm1ldGhvZCAmJiAnSEVBRCcgIT0gdGhpcy5tZXRob2QgJiYgJ3N0cmluZycgIT0gdHlwZW9mIGRhdGEgJiYgIWlzSG9zdChkYXRhKSkge1xuICAgIC8vIHNlcmlhbGl6ZSBzdHVmZlxuICAgIHZhciBzZXJpYWxpemUgPSByZXF1ZXN0LnNlcmlhbGl6ZVt0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyldO1xuICAgIGlmIChzZXJpYWxpemUpIGRhdGEgPSBzZXJpYWxpemUoZGF0YSk7XG4gIH1cblxuICAvLyBzZXQgaGVhZGVyIGZpZWxkc1xuICBmb3IgKHZhciBmaWVsZCBpbiB0aGlzLmhlYWRlcikge1xuICAgIGlmIChudWxsID09IHRoaXMuaGVhZGVyW2ZpZWxkXSkgY29udGludWU7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoZmllbGQsIHRoaXMuaGVhZGVyW2ZpZWxkXSk7XG4gIH1cblxuICAvLyBzZW5kIHN0dWZmXG4gIHRoaXMuZW1pdCgncmVxdWVzdCcsIHRoaXMpO1xuICB4aHIuc2VuZChkYXRhKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdGAuXG4gKi9cblxucmVxdWVzdC5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBJc3N1ZSBhIHJlcXVlc3Q6XG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgcmVxdWVzdCgnR0VUJywgJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycsIGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSB1cmwgb3IgY2FsbGJhY2tcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgLy8gY2FsbGJhY2tcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHVybCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZXF1ZXN0KG1ldGhvZCwgdXJsKTtcbn1cblxuLyoqXG4gKiBHRVQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdHRVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5oZWFkID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdIRUFEJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogREVMRVRFIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmRlbCA9IGZ1bmN0aW9uKHVybCwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnREVMRVRFJywgdXJsKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUEFUQ0ggYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wYXRjaCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUEFUQ0gnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQT1NUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucG9zdCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUE9TVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBVVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnB1dCA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZm4pe1xuICB2YXIgcmVxID0gcmVxdWVzdCgnUFVUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogRXhwb3NlIGByZXF1ZXN0YC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVlc3Q7XG4iLCJcbi8qKlxuICogRXhwb3NlIGBFbWl0dGVyYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBFbWl0dGVyKG9iaikge1xuICBpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqKTtcbn07XG5cbi8qKlxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XG4gICAgb2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9XG5FbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAodGhpcy5fY2FsbGJhY2tzW2V2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW10pXG4gICAgLnB1c2goZm4pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICBmdW5jdGlvbiBvbigpIHtcbiAgICBzZWxmLm9mZihldmVudCwgb24pO1xuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBvbi5mbiA9IGZuO1xuICB0aGlzLm9uKGV2ZW50LCBvbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub2ZmID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIC8vIGFsbFxuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBzcGVjaWZpYyBldmVudFxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgaWYgKCFjYWxsYmFja3MpIHJldHVybiB0aGlzO1xuXG4gIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcbiAgdmFyIGNiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuICAgIGNiID0gY2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuXG4gIGlmIChjYWxsYmFja3MpIHtcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICByZXR1cm4gISEgdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aDtcbn07XG4iLCJcbi8qKlxuICogUmVkdWNlIGBhcnJgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsXG4gKlxuICogVE9ETzogY29tYmF0aWJsZSBlcnJvciBoYW5kbGluZz9cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4sIGluaXRpYWwpeyAgXG4gIHZhciBpZHggPSAwO1xuICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgdmFyIGN1cnIgPSBhcmd1bWVudHMubGVuZ3RoID09IDNcbiAgICA/IGluaXRpYWxcbiAgICA6IGFycltpZHgrK107XG5cbiAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgIGN1cnIgPSBmbi5jYWxsKG51bGwsIGN1cnIsIGFycltpZHhdLCArK2lkeCwgYXJyKTtcbiAgfVxuICBcbiAgcmV0dXJuIGN1cnI7XG59OyIsInZhciBhZ2VudCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKTtcblxuLypqc2hpbnQgbG9vcGZ1bmM6IHRydWUgKi9cbihmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyxcbiAgICBzcGxpY2UgPSBBcnJheS5wcm90b3R5cGUuc3BsaWNlLFxuICAgIHU7XG5cbiAgLy8gaGVscGVyc1xuXG4gIGZ1bmN0aW9uIGV4dGVuZChpbnRvLCBmcm9tKSB7XG4gICAgZm9yICh2YXIgeCBpbiBmcm9tKSBpbnRvW3hdID0gZnJvbVt4XTtcbiAgICByZXR1cm4gaW50bztcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dGVuZEFsaWFzZXMoaW50bywgZnJvbSkge1xuICAgIGZvciAodmFyIHggaW4gZnJvbSkge1xuICAgICAgdmFyIHhzID0geC5zcGxpdCgnICcpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykgaW50b1t4c1tpXV0gPSBmcm9tW3hdO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldChvYmosIGtleSwgbm90aGluZykge1xuXG4gICAgaWYgKGtleS5pbmRleE9mKCcuJykgPT0gLTEpIHtcbiAgICAgIHJldHVybiBvYmpba2V5XTtcbiAgICB9IGVsc2Uge1xuICAgICAga2V5ID0ga2V5LnNwbGl0KCcuJyk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5Lmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICBvYmogPSBvYmpba2V5W2ldXTtcbiAgICAgICAgaWYgKCFvYmopIHJldHVybiBcIlwiO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2JqW2tleVtpXV07XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2xhc3NPZihkYXRhKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoZGF0YSkuc2xpY2UoOCwgLTEpO1xuICB9XG5cbiAgZnVuY3Rpb24gYXN5bmNFcnJvcihlcnJvciwgY29udGV4dCkge1xuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKTtcblxuICAgIHZhciBhcmdzID0gc3BsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcblxuICAgIHByb21pc2UucmVqZWN0KGFyZ3NbMF0pO1xuXG4gICAgaWYgKHR5cGVvZiBlcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBlcnJvci5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIFByb21pc2UoKSB7XG4gICAgdGhpcy5jYnMgPSBbXTtcbiAgfVxuXG4gIGV4dGVuZChQcm9taXNlLnByb3RvdHlwZSwge1xuICAgIHJlc29sdmU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUpIHJldHVybjtcblxuICAgICAgdmFyIHRoZW4gPSB2YWx1ZSAmJiB2YWx1ZS50aGVuLFxuICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgY2FsbGVkO1xuXG4gICAgICBpZiAodHlwZW9mIHRoZW4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoZW4uY2FsbCh2YWx1ZSwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBzZWxmLnJlc29sdmUodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgICAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgc2VsZi5yZWplY3QodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnJlamVjdChlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSAxO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNicy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBzdWNjZXNzID0gdGhpcy5jYnNbaV1bMF0sXG4gICAgICAgICAgICBwcm9taXNlID0gdGhpcy5jYnNbaV1bMl07XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBzdWNjZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKHN1Y2Nlc3ModmFsdWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcHJvbWlzZS5yZWplY3QoZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYnMgPSBudWxsO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZWplY3Q6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUpIHJldHVybjtcblxuICAgICAgdGhpcy5zdGF0ZSA9IC0xO1xuICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBlcnJvciA9IHRoaXMuY2JzW2ldWzFdLFxuICAgICAgICAgIHByb21pc2UgPSB0aGlzLmNic1tpXVsyXTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICh0eXBlb2YgZXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKGVycm9yKHZhbHVlKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb21pc2UucmVqZWN0KHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBwcm9taXNlLnJlamVjdChlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmNicyA9IG51bGw7XG4gICAgfSxcblxuICAgIHRoZW46IGZ1bmN0aW9uIChzdWNjZXNzLCBlcnJvcikge1xuICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgpO1xuXG4gICAgICBpZiAodGhpcy5zdGF0ZSkge1xuICAgICAgICB2YXIgcmV0O1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKHRoaXMuc3RhdGUgPT0gMSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBzdWNjZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKHN1Y2Nlc3ModGhpcy52YWx1ZSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKGVycm9yKHRoaXMudmFsdWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHByb21pc2UucmVqZWN0KHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHByb21pc2UucmVqZWN0KGUpO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY2JzLnB1c2goW3N1Y2Nlc3MsIGVycm9yLCBwcm9taXNlXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gYWpheCBoZWxwZXJcblxuICBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZ3MsIG9wdHMsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG5cbiAgICB2YXIgbWV0aG9kLCBjb250ZW50VHlwZSwgcmVzcG9uc2VUeXBlO1xuXG4gICAgaWYgKFwiZGF0YVwiIGluIG9wdHMpIHtcbiAgICAgIHZhciB0eXBlID0gY2xhc3NPZihvcHRzLmRhdGEpO1xuXG4gICAgICBpZiAodHlwZSA9PT0gXCJTdHJpbmdcIikge1xuICAgICAgICBjb250ZW50VHlwZSA9IFwiYXBwbGljYXRpb24vanNvblwiO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcIkZvcm1EYXRhXCIpIHtcbiAgICAgICAgbWV0aG9kID0gb3B0cy5tZXRob2QgfHwgXCJQT1NUXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZXRob2QgPSBvcHRzLm1ldGhvZCB8fCBcIlBPU1RcIjtcbiAgICAgICAgY29udGVudFR5cGUgPSBcImFwcGxpY2F0aW9uL2pzb25cIjtcbiAgICAgICAgb3B0cy5kYXRhID0gSlNPTi5zdHJpbmdpZnkob3B0cy5kYXRhKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbWV0aG9kID0gb3B0cy5tZXRob2QgfHwgXCJHRVRcIjtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGVycm9yICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGlmICghY29udGV4dCkgY29udGV4dCA9IGVycm9yO1xuICAgICAgZXJyb3IgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChjb25maWdzICYmICFjb25maWdzLmFwaWtleSkge1xuICAgICAgcmV0dXJuIGFzeW5jRXJyb3IoZXJyb3IsIGNvbnRleHQsIFwiQVBJIGtleSBub3Qgc2V0XCIsIG51bGwpO1xuICAgIH1cblxuICAgIHZhciByZXEgPSBhZ2VudFttZXRob2QudG9Mb3dlckNhc2UoKV0oY29uZmlncyA/IGNvbmZpZ3MucHJvdG9jb2wgKyBvcHRzLnVybCA6IG9wdHMudXJsKTtcbiAgICBpZiAoY29udGVudFR5cGUpIHtcbiAgICAgIHJlcSA9IHJlcS5zZXQoXCJDb250ZW50LVR5cGVcIiwgY29udGVudFR5cGUpO1xuICAgIH1cblxuICAgIGlmIChjb25maWdzKSB7XG4gICAgICByZXEgPSByZXEuc2V0KFwiQXV0aG9yaXphdGlvblwiLCBcIkhvaXN0IFwiICsgY29uZmlncy5hcGlrZXkpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLmJ1Y2tldCkge1xuICAgICAgcmVxID0gcmVxLnNldChcIngtYnVja2V0LWtleVwiLCBvcHRzLmJ1Y2tldCk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMudG9rZW4pIHtcbiAgICAgIHJlcSA9IHJlcS5zZXQoXCJPQXV0aFwiLCBcIlRva2VuIFwiICsgb3B0cy50b2tlbik7XG4gICAgfVxuICAgIGlmIChyZXEud2l0aENyZWRlbnRpYWxzKSB7XG4gICAgICByZXEgPSByZXEud2l0aENyZWRlbnRpYWxzKCk7XG4gICAgfVxuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgpO1xuXG4gICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24gKGVyciwgcmVzKSB7XG5cbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgICAgaWYgKHJlcy5zdGF0dXMgPj0gMjAwICYmIHJlcy5zdGF0dXMgPCA0MDApIHtcbiAgICAgICAgdmFyIHJlc3BvbnNlID0gcmVzO1xuICAgICAgICBpZiAocmVzLmhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID09PSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICAgICAgICByZXNwb25zZSA9IHJlcy5ib2R5O1xuICAgICAgICB9IGVsc2UgaWYgKHJlcy50ZXh0ICYmIHR5cGVvZiBCbG9iICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJlc3BvbnNlID0gbmV3IEJsb2IoW3Jlcy50ZXh0XSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0cy5wcm9jZXNzKSB7XG4gICAgICAgICAgcmVzcG9uc2UgPSBvcHRzLnByb2Nlc3MocmVzcG9uc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICBzdWNjZXNzLmNhbGwoY29udGV4dCwgcmVzcG9uc2UsIHJlcy54aHIpO1xuICAgICAgICB9XG4gICAgICAgIHByb21pc2UucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbWVzc2FnZSA9IHJlcy50ZXh0O1xuXG4gICAgICAgIGlmIChvcHRzLnByb2Nlc3NFcnJvcikgbWVzc2FnZSA9IG9wdHMucHJvY2Vzc0Vycm9yKG1lc3NhZ2UpO1xuXG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIGVycm9yLmNhbGwoY29udGV4dCwgbWVzc2FnZSwgcmVzLnhocik7XG4gICAgICAgIH1cbiAgICAgICAgcHJvbWlzZS5yZWplY3QobWVzc2FnZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBpZiAob3B0cy5kYXRhKSB7XG4gICAgICByZXEuc2VuZChvcHRzLmRhdGEpO1xuICAgIH1cbiAgICByZXEuZW5kKGNhbGxiYWNrKTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgLy8gc2ltcGxlIGRhdGEgbWFuYWdlclxuXG4gIGZ1bmN0aW9uIERhdGFNYW5hZ2VyKGhvaXN0LCB0eXBlLCBidWNrZXQpIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMudXJsID0gXCJkYXRhLmhvaS5pby9cIiArIHR5cGU7XG4gICAgdGhpcy5ob2lzdCA9IGhvaXN0O1xuICAgIHRoaXMuYnVja2V0ID0gYnVja2V0O1xuICB9XG5cbiAgZXh0ZW5kKERhdGFNYW5hZ2VyLnByb3RvdHlwZSwge1xuICAgIGdldDogZnVuY3Rpb24gKGlkLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuXG4gICAgICBpZiAodHlwZW9mIGlkID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgY29udGV4dCA9IGVycm9yO1xuICAgICAgICBlcnJvciA9IHN1Y2Nlc3M7XG4gICAgICAgIHN1Y2Nlc3MgPSBpZDtcbiAgICAgICAgaWQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoaWQpIHtcblxuICAgICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLmhvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgICAgdXJsOiB0aGlzLnVybCArIFwiL1wiICsgaWQsXG4gICAgICAgICAgYnVja2V0OiB0aGlzLmJ1Y2tldFxuICAgICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLmhvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgICAgdXJsOiB0aGlzLnVybCxcbiAgICAgICAgICBidWNrZXQ6IHRoaXMuYnVja2V0XG4gICAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcXVlcnk6IGZ1bmN0aW9uIChxdWVyeSkge1xuICAgICAgcmV0dXJuIG5ldyBRdWVyeU1hbmFnZXIodGhpcywge1xuICAgICAgICBxOiBxdWVyeVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHdoZXJlOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIG5ldyBRdWVyeU1hbmFnZXIodGhpcywge30pLndoZXJlKGtleSwgdmFsdWUpO1xuICAgIH0sXG5cbiAgICBsaW1pdDogZnVuY3Rpb24gKGxpbWl0KSB7XG4gICAgICByZXR1cm4gbmV3IFF1ZXJ5TWFuYWdlcih0aGlzLCB7XG4gICAgICAgIGxpbWl0OiBsaW1pdFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHNraXA6IGZ1bmN0aW9uIChza2lwKSB7XG4gICAgICByZXR1cm4gbmV3IFF1ZXJ5TWFuYWdlcih0aGlzLCB7XG4gICAgICAgIHNraXA6IHNraXBcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzb3J0Qnk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBxbSA9IG5ldyBRdWVyeU1hbmFnZXIodGhpcywge30pO1xuICAgICAgcmV0dXJuIHFtLl9zb3J0KGZhbHNlLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICBwb3N0OiBmdW5jdGlvbiAoaWQsIGRhdGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICBpZiAodHlwZW9mIGlkID09PSBcIm9iamVjdFwiICYmIGlkICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnRleHQgPSBlcnJvcjtcbiAgICAgICAgZXJyb3IgPSBzdWNjZXNzO1xuICAgICAgICBzdWNjZXNzID0gZGF0YTtcbiAgICAgICAgZGF0YSA9IGlkO1xuICAgICAgICBpZCA9IGRhdGEuX2lkO1xuICAgICAgfVxuXG4gICAgICB2YXIgc2luZ2xldG9uID0gY2xhc3NPZihkYXRhKSA9PT0gXCJBcnJheVwiICYmIGRhdGEubGVuZ3RoID09PSAxO1xuXG4gICAgICBpZiAoaWQpIHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5ob2lzdC5fY29uZmlncywge1xuICAgICAgICAgIHVybDogdGhpcy51cmwgKyBcIi9cIiArIGlkLFxuICAgICAgICAgIGJ1Y2tldDogdGhpcy5idWNrZXQsXG4gICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLmhvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgICAgdXJsOiB0aGlzLnVybCxcbiAgICAgICAgICBidWNrZXQ6IHRoaXMuYnVja2V0LFxuICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgICAgIHJldHVybiBzaW5nbGV0b24gPyBbcmVzcF0gOiByZXNwO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjbGVhcjogZnVuY3Rpb24gKHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLmhvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgIHVybDogdGhpcy51cmwsXG4gICAgICAgIGJ1Y2tldDogdGhpcy5idWNrZXQsXG4gICAgICAgIG1ldGhvZDogXCJERUxFVEVcIlxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uIChpZCwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIGlmICghaWQpIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jRXJyb3IoZXJyb3IsIGNvbnRleHQsIFwiQ2Fubm90IHJlbW92ZSBtb2RlbCB3aXRoIGVtcHR5IGlkXCIsIG51bGwpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLmhvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgIHVybDogdGhpcy51cmwgKyBcIi9cIiArIGlkLFxuICAgICAgICBidWNrZXQ6IHRoaXMuYnVja2V0LFxuICAgICAgICBtZXRob2Q6IFwiREVMRVRFXCJcbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgdXNlOiBmdW5jdGlvbiAoYnVja2V0KSB7XG4gICAgICByZXR1cm4gdGhpcy5ob2lzdCh0aGlzLnR5cGUsIGJ1Y2tldCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBxdWVyeSBtYW5hZ2VyXG5cbiAgZnVuY3Rpb24gUXVlcnlNYW5hZ2VyKGRtLCBxdWVyeSkge1xuICAgIHRoaXMuZG0gPSBkbTtcbiAgICB0aGlzLnF1ZXJ5ID0gcXVlcnk7XG4gIH1cblxuICBleHRlbmQoUXVlcnlNYW5hZ2VyLnByb3RvdHlwZSwge1xuICAgIGdldDogZnVuY3Rpb24gKHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgICAgaWYgKHRoaXMucXVlcnkucSkgcGFydHMucHVzaChcInE9XCIgKyBlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkodGhpcy5xdWVyeS5xKSkpO1xuICAgICAgaWYgKHRoaXMucXVlcnkubGltaXQpIHBhcnRzLnB1c2goXCJsaW1pdD1cIiArIHRoaXMucXVlcnkubGltaXQpO1xuICAgICAgaWYgKHRoaXMucXVlcnkuc2tpcCkgcGFydHMucHVzaChcInNraXA9XCIgKyB0aGlzLnF1ZXJ5LnNraXApO1xuICAgICAgaWYgKHRoaXMucXVlcnkuc29ydCkgcGFydHMucHVzaChcInNvcnQ9XCIgKyBlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkodGhpcy5xdWVyeS5zb3J0KSkpO1xuXG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLmRtLmhvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgIHVybDogdGhpcy5kbS51cmwgKyBcIj9cIiArIHBhcnRzLmpvaW4oJyYnKSxcbiAgICAgICAgYnVja2V0OiB0aGlzLmRtLmJ1Y2tldFxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICB3aGVyZTogZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdSkge1xuICAgICAgICAgIHJldHVybiBuZXcgUGFydGlhbFF1ZXJ5TWFuYWdlcih0aGlzLCBrZXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLl93aGVyZShrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgcXVlcnkgPSBleHRlbmQoe30sIHRoaXMucXVlcnkpO1xuICAgICAgcXVlcnkucSA9IHF1ZXJ5LnEgPyBleHRlbmQoe30sIHF1ZXJ5LnEpIDoge307XG4gICAgICBleHRlbmQocXVlcnkucSwga2V5KTtcbiAgICAgIHJldHVybiBuZXcgUXVlcnlNYW5hZ2VyKHRoaXMuZG0sIHF1ZXJ5KTtcbiAgICB9LFxuXG4gICAgX3doZXJlOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgdmFyIHF1ZXJ5ID0gZXh0ZW5kKHt9LCB0aGlzLnF1ZXJ5KTtcbiAgICAgIHF1ZXJ5LnEgPSBxdWVyeS5xID8gZXh0ZW5kKHt9LCBxdWVyeS5xKSA6IHt9O1xuICAgICAgcXVlcnkucVtrZXldID0gdmFsdWU7XG4gICAgICByZXR1cm4gbmV3IFF1ZXJ5TWFuYWdlcih0aGlzLmRtLCBxdWVyeSk7XG4gICAgfSxcblxuICAgIF93aGVyZUFuZDogZnVuY3Rpb24gKGtleSwgb3AsIHZhbHVlKSB7XG4gICAgICB2YXIgcXVlcnkgPSBleHRlbmQoe30sIHRoaXMucXVlcnkpO1xuICAgICAgcXVlcnkucSA9IHF1ZXJ5LnEgPyBleHRlbmQoe30sIHF1ZXJ5LnEpIDoge307XG4gICAgICBxdWVyeS5xW2tleV0gPSBxdWVyeS5xW2tleV0gPyBleHRlbmQoe30sIHF1ZXJ5LnFba2V5XSkgOiB7fTtcbiAgICAgIHF1ZXJ5LnFba2V5XVtvcF0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiBuZXcgUXVlcnlNYW5hZ2VyKHRoaXMuZG0sIHF1ZXJ5KTtcbiAgICB9LFxuXG4gICAgbGltaXQ6IGZ1bmN0aW9uIChsaW1pdCkge1xuICAgICAgdmFyIHF1ZXJ5ID0gZXh0ZW5kKHt9LCB0aGlzLnF1ZXJ5KTtcbiAgICAgIHF1ZXJ5LmxpbWl0ID0gbGltaXQ7XG4gICAgICByZXR1cm4gbmV3IFF1ZXJ5TWFuYWdlcih0aGlzLmRtLCBxdWVyeSk7XG4gICAgfSxcblxuICAgIHNraXA6IGZ1bmN0aW9uIChza2lwKSB7XG4gICAgICB2YXIgcXVlcnkgPSBleHRlbmQoe30sIHRoaXMucXVlcnkpO1xuICAgICAgcXVlcnkuc2tpcCA9IHNraXA7XG4gICAgICByZXR1cm4gbmV3IFF1ZXJ5TWFuYWdlcih0aGlzLmRtLCBxdWVyeSk7XG4gICAgfSxcblxuICAgIF9zb3J0OiBmdW5jdGlvbiAoYXBwZW5kLCBhcmdzKSB7XG4gICAgICB2YXIgc29ydCA9IGFwcGVuZCAmJiB0aGlzLnF1ZXJ5LnNvcnQgJiYgdGhpcy5xdWVyeS5zb3J0LnNsaWNlKCkgfHwgW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYXJnc1tpXS5zbGljZSgtNCkudG9Mb3dlckNhc2UoKSA9PSBcIiBhc2NcIikge1xuICAgICAgICAgIHNvcnQucHVzaChbYXJnc1tpXS5zbGljZSgwLCAtNCksIDFdKTtcbiAgICAgICAgfSBlbHNlIGlmIChhcmdzW2ldLnNsaWNlKC01KS50b0xvd2VyQ2FzZSgpID09IFwiIGRlc2NcIikge1xuICAgICAgICAgIHNvcnQucHVzaChbYXJnc1tpXS5zbGljZSgwLCAtNSksIC0xXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc29ydC5wdXNoKFthcmdzW2ldLCAxXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHF1ZXJ5ID0gZXh0ZW5kKHt9LCB0aGlzLnF1ZXJ5KTtcbiAgICAgIHF1ZXJ5LnNvcnQgPSBzb3J0O1xuICAgICAgcmV0dXJuIG5ldyBRdWVyeU1hbmFnZXIodGhpcy5kbSwgcXVlcnkpO1xuICAgIH0sXG5cbiAgICBzb3J0Qnk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zb3J0KGZhbHNlLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICB0aGVuQnk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zb3J0KHRydWUsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIHVzZTogZnVuY3Rpb24gKGJ1Y2tldCkge1xuICAgICAgcmV0dXJuIG5ldyBRdWVyeU1hbmFnZXIodGhpcy5kbS51c2UoYnVja2V0KSwgdGhpcy5xdWVyeSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBwYXJ0aWFsIHF1ZXJ5IG1hbmFnZXIsIHByb3h5aW5nIG1vbmdvIHF1ZXJpZXMgc2luY2UgMjAxNFxuXG4gIGZ1bmN0aW9uIFBhcnRpYWxRdWVyeU1hbmFnZXIocW0sIGtleSkge1xuICAgIHRoaXMucW0gPSBxbTtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgfVxuXG4gIGV4dGVuZEFsaWFzZXMoUGFydGlhbFF1ZXJ5TWFuYWdlci5wcm90b3R5cGUsIHtcbiAgICBcImVxIGlzIGVxdWFsc1wiOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHRoaXMucW0gPSB0aGlzLnFtLl93aGVyZSh0aGlzLmtleSwgdmFsdWUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBcIm5lcSBuZSBpc250IG5vdEVxdWFsc1wiOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHRoaXMucW0gPSB0aGlzLnFtLl93aGVyZUFuZCh0aGlzLmtleSwgXCIkbmVcIiwgdmFsdWUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBcImd0IGdyZWF0ZXJUaGFuXCI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5xbSA9IHRoaXMucW0uX3doZXJlQW5kKHRoaXMua2V5LCBcIiRndFwiLCB2YWx1ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIFwiZ3RlIGdlIGF0TGVhc3RcIjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB0aGlzLnFtID0gdGhpcy5xbS5fd2hlcmVBbmQodGhpcy5rZXksIFwiJGd0ZVwiLCB2YWx1ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIFwibHQgbGVzc1RoYW5cIjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB0aGlzLnFtID0gdGhpcy5xbS5fd2hlcmVBbmQodGhpcy5rZXksIFwiJGx0XCIsIHZhbHVlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgXCJsdGUgbGUgYXRNb3N0XCI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5xbSA9IHRoaXMucW0uX3doZXJlQW5kKHRoaXMua2V5LCBcIiRsdGVcIiwgdmFsdWUpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBcImVsZW0gaW5cIjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB0aGlzLnFtID0gdGhpcy5xbS5fd2hlcmVBbmQodGhpcy5rZXksIFwiJGluXCIsIHZhbHVlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgXCJuZWxlbSBuaW4gbm90SW4gbm90RWxlbVwiOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHRoaXMucW0gPSB0aGlzLnFtLl93aGVyZUFuZCh0aGlzLmtleSwgXCIkbmluXCIsIHZhbHVlKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgXCJleGlzdHNcIjogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5xbSA9IHRoaXMucW0uX3doZXJlQW5kKHRoaXMua2V5LCBcIiRleGlzdHNcIiwgdHJ1ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH0pO1xuXG4gIGV4dGVuZChQYXJ0aWFsUXVlcnlNYW5hZ2VyLnByb3RvdHlwZSwge1xuICAgIHdoZXJlOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMucW0ud2hlcmUoa2V5LCB2YWx1ZSk7XG4gICAgfSxcbiAgICBsaW1pdDogZnVuY3Rpb24gKGxpbWl0KSB7XG4gICAgICByZXR1cm4gdGhpcy5xbS5saW1pdChsaW1pdCk7XG4gICAgfSxcbiAgICBza2lwOiBmdW5jdGlvbiAoc2tpcCkge1xuICAgICAgcmV0dXJuIHRoaXMucW0uc2tpcChza2lwKTtcbiAgICB9LFxuICAgIHNvcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnFtLnNvcnQuYXBwbHkodGhpcy5xbSwgYXJndW1lbnRzKTtcbiAgICB9LFxuICAgIHNvcnRCeTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMucW0uX3NvcnQoZmFsc2UsIGFyZ3VtZW50cyk7XG4gICAgfSxcbiAgICB0aGVuQnk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnFtLl9zb3J0KHRydWUsIGFyZ3VtZW50cyk7XG4gICAgfSxcbiAgICB1c2U6IGZ1bmN0aW9uIChidWNrZXQpIHtcbiAgICAgIHJldHVybiB0aGlzLnFtLnVzZShidWNrZXQpO1xuICAgIH0sXG5cbiAgICBnZXQ6IGZ1bmN0aW9uIChzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXMucW0uZ2V0KHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGNvbXBsZXggZGF0YSBtYW5hZ2VyXG5cbiAgdmFyIHRhZ1JlZ2V4ID0gL1xcWyhbXlxcXV0rKVxcXS9nO1xuXG4gIGZ1bmN0aW9uIE9iamVjdERhdGFNYW5hZ2VyKGhvaXN0LCBoYXNoLCBidWNrZXQpIHtcbiAgICB2YXIgaXRlbXMgPSB0aGlzLml0ZW1zID0ge307XG5cbiAgICBmb3IgKHZhciB4IGluIGhhc2gpIHtcbiAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgIGtleTogeCxcbiAgICAgICAgICBwYXRoOiBoYXNoW3hdLFxuICAgICAgICAgIHJlcXVpcmVzOiBbXVxuICAgICAgICB9LFxuICAgICAgICBtYXRjaDtcblxuICAgICAgaWYgKGl0ZW0ucGF0aFtpdGVtLnBhdGgubGVuZ3RoIC0gMV0gPT0gJz8nKSB7XG4gICAgICAgIGl0ZW0ucGF0aCA9IGl0ZW0ucGF0aC5zbGljZSgwLCAtMSk7XG4gICAgICAgIGl0ZW0ub3B0aW9uYWwgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICB3aGlsZSAoKG1hdGNoID0gdGFnUmVnZXguZXhlYyhpdGVtLnBhdGgpKSAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgZG90ID0gbWF0Y2hbMV0uaW5kZXhPZignLicpO1xuXG4gICAgICAgIGlmIChkb3QgPiAtMSkge1xuICAgICAgICAgIGl0ZW0ucmVxdWlyZXMucHVzaChtYXRjaFsxXS5zbGljZSgwLCBkb3QpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpdGVtc1t4XSA9IGl0ZW07XG4gICAgfVxuXG4gICAgdGhpcy5ob2lzdCA9IGJ1Y2tldCA/IGhvaXN0LnVzZShidWNrZXQpIDogaG9pc3Q7XG4gIH1cblxuICBleHRlbmQoT2JqZWN0RGF0YU1hbmFnZXIucHJvdG90eXBlLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoZGF0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHZhciBpdGVtcyA9IHt9LFxuICAgICAgICByZXN1bHQgPSB7fSxcbiAgICAgICAgbWFuYWdlcnMgPSB7fSxcbiAgICAgICAgaG9pc3QgPSB0aGlzLmhvaXN0LFxuICAgICAgICBmYWlsZWQsXG4gICAgICAgIHByb21pc2UgPSBuZXcgUHJvbWlzZSgpO1xuXG4gICAgICBpZiAodHlwZW9mIGRhdGEgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBjb250ZXh0ID0gZXJyb3I7XG4gICAgICAgIGVycm9yID0gc3VjY2VzcztcbiAgICAgICAgc3VjY2VzcyA9IGRhdGE7XG4gICAgICAgIGRhdGEgPSB7fTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICBpZDogZGF0YVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBleHRlbmQoaXRlbXMsIHRoaXMuaXRlbXMpO1xuXG4gICAgICBpZiAodHlwZW9mIGVycm9yICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgaWYgKCFjb250ZXh0KSBjb250ZXh0ID0gZXJyb3I7XG4gICAgICAgIGVycm9yID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc3VjY2VlZChrZXkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgcmVzdWx0W2tleV0gPSBkYXRhO1xuICAgICAgICAgIGRlbGV0ZSBpdGVtc1trZXldO1xuICAgICAgICAgIGFkdmFuY2UoKTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZmFpbChrZXkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChtc2csIHhocikge1xuICAgICAgICAgIGlmIChpdGVtc1trZXldLm9wdGlvbmFsKSB7XG4gICAgICAgICAgICBzdWNjZWVkKGtleSkobnVsbCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZhaWxlZCA9IHRydWU7XG4gICAgICAgICAgICBtc2cgPSBrZXkgKyBcIjogXCIgKyBtc2c7XG4gICAgICAgICAgICBlcnJvciAmJiBlcnJvci5jYWxsKGNvbnRleHQsIG1zZywgeGhyKTtcbiAgICAgICAgICAgIHByb21pc2UucmVqZWN0KG1zZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBhZHZhbmNlKCkge1xuICAgICAgICBpZiAoZmFpbGVkKSByZXR1cm47XG5cbiAgICAgICAgdmFyIGxvYWRpbmcgPSAwO1xuXG4gICAgICAgIG91dDogZm9yICh2YXIgeCBpbiBpdGVtcykge1xuICAgICAgICAgIHZhciBpdGVtID0gaXRlbXNbeF07XG5cbiAgICAgICAgICBpZiAoIW1hbmFnZXJzW3hdKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW0ucmVxdWlyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgaWYgKGl0ZW0ucmVxdWlyZXNbaV0gaW4gaXRlbXMpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZSBvdXQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHBhdGggPSBpdGVtLnBhdGgucmVwbGFjZSh0YWdSZWdleCwgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICBpZiAoYi5pbmRleE9mKCcuJykgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldChyZXN1bHQsIGIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YVtiXSB8fCBcIlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIHNwYWNlID0gcGF0aC5pbmRleE9mKCcgJyk7XG5cbiAgICAgICAgICAgIGlmIChzcGFjZSA+IC0xKSB7XG4gICAgICAgICAgICAgIChtYW5hZ2Vyc1tpdGVtLmtleV0gPSBob2lzdChwYXRoLnNsaWNlKDAsIHNwYWNlKSkpLmdldChwYXRoLnNsaWNlKHNwYWNlICsgMSksIHN1Y2NlZWQoaXRlbS5rZXkpLCBmYWlsKGl0ZW0ua2V5KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAobWFuYWdlcnNbaXRlbS5rZXldID0gaG9pc3QocGF0aCkpLmdldChzdWNjZWVkKGl0ZW0ua2V5KSwgZmFpbChpdGVtLmtleSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGxvYWRpbmcrKztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbG9hZGluZykge1xuICAgICAgICAgIHN1Y2Nlc3MgJiYgc3VjY2Vzcy5jYWxsKGNvbnRleHQsIHJlc3VsdCwgbWFuYWdlcnMpO1xuICAgICAgICAgIHByb21pc2UucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGFkdmFuY2UoKTtcblxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICB9KTtcblxuICB2YXIgYnVja2V0TWFuYWdlck1ldGhvZHMgPSB7XG4gICAgZ2V0OiBmdW5jdGlvbiAodHlwZSwgaWQsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdGhpcy5ob2lzdCh0eXBlLCB0aGlzLmJ1Y2tldCkuZ2V0KGlkLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHBvc3Q6IGZ1bmN0aW9uICh0eXBlLCBpZCwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0aGlzLmhvaXN0KHR5cGUsIHRoaXMuYnVja2V0KS5wb3N0KGlkLCBkYXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIGNsZWFyOiBmdW5jdGlvbiAodHlwZSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0aGlzLmhvaXN0KHR5cGUsIHRoaXMuYnVja2V0KS5jbGVhcihzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHJlbW92ZTogZnVuY3Rpb24gKHR5cGUsIGlkLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXMuaG9pc3QodHlwZSwgdGhpcy5idWNrZXQpLnJlbW92ZShpZCwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBtZXRhOiBmdW5jdGlvbiAoZGF0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0aGlzLmhvaXN0LmJ1Y2tldC5tZXRhKHRoaXMuYnVja2V0LCBkYXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIGludml0ZTogZnVuY3Rpb24gKGRhdGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gdGhpcy5ob2lzdC5idWNrZXQuaW52aXRlKHRoaXMuYnVja2V0LCBkYXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIGVudGVyOiBmdW5jdGlvbiAoc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0aGlzLmhvaXN0LmJ1Y2tldC5zZXQodGhpcy5idWNrZXQsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGhvaXN0TWV0aG9kcyA9IHtcbiAgICBhcGlLZXk6IGZ1bmN0aW9uICh2KSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25maWcoXCJhcGlrZXlcIiwgdik7XG4gICAgfSxcblxuICAgIGdldDogZnVuY3Rpb24gKHR5cGUsIGlkLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXModHlwZSkuZ2V0KGlkLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHBvc3Q6IGZ1bmN0aW9uICh0eXBlLCBpZCwgZGF0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0aGlzKHR5cGUpLnBvc3QoaWQsIGRhdGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgY2xlYXI6IGZ1bmN0aW9uICh0eXBlLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXModHlwZSkuY2xlYXIoc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uICh0eXBlLCBpZCwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiB0aGlzKHR5cGUpLnJlbW92ZShpZCwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBjb25maWc6IGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgICBpZiAoYiA9PT0gdSkge1xuICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBhO1xuXG4gICAgICAgIGlmICh0eXBlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZ3NbYV07XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgIGZvciAodmFyIHggaW4gYSkge1xuICAgICAgICAgICAgdGhpcy5fY29uZmlnc1t4LnRvTG93ZXJDYXNlKCldID0gYVt4XTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJmdW5jdGlvblwiIHx8IHR5cGUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICB2YXIgaG9pc3QgPSB0aGlzO1xuXG4gICAgICAgICAgcmV0dXJuIHJlcXVlc3QobnVsbCwge1xuICAgICAgICAgICAgdXJsOiBcIi9zZXR0aW5nc1wiLFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKHNldHRpbmdzKSB7XG4gICAgICAgICAgICAgIGhvaXN0LmNvbmZpZyhzZXR0aW5ncyk7XG4gICAgICAgICAgICAgIHJldHVybiBzZXR0aW5ncztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCBhLCBiLCBjKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY29uZmlnc1thLnRvTG93ZXJDYXNlKCldID0gYjtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RhdHVzOiBmdW5jdGlvbiAoc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHZhciBob2lzdCA9IHRoaXM7XG5cbiAgICAgIGlmICh0eXBlb2YgZXJyb3IgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBpZiAoIWNvbnRleHQpIGNvbnRleHQgPSBlcnJvcjtcbiAgICAgICAgZXJyb3IgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLl9jb25maWdzLCB7XG4gICAgICAgIHVybDogXCJhdXRoLmhvaS5pby9zdGF0dXNcIixcbiAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgICBob2lzdC5fdXNlciA9IHJlc3A7XG4gICAgICAgICAgcmV0dXJuIHJlc3A7XG4gICAgICAgIH0sXG4gICAgICAgIHByb2Nlc3NFcnJvcjogZnVuY3Rpb24gKG1zZykge1xuICAgICAgICAgIGhvaXN0Ll91c2VyID0gbnVsbDtcbiAgICAgICAgICByZXR1cm4gbXNnO1xuICAgICAgICB9XG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHNpZ251cDogZnVuY3Rpb24gKG1lbWJlciwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHZhciBob2lzdCA9IHRoaXM7XG5cbiAgICAgIGlmICh0eXBlb2YgbWVtYmVyID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuX2NvbmZpZ3MsIHtcbiAgICAgICAgICB1cmw6IFwiYXV0aC5ob2kuaW8vdXNlclwiLFxuICAgICAgICAgIGRhdGE6IG1lbWJlcixcbiAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICAgICAgaWYgKHJlc3AucmVkaXJlY3RVcmwpIHtcbiAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gcmVzcC5yZWRpcmVjdFVybDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhvaXN0Ll91c2VyID0gcmVzcDtcbiAgICAgICAgICAgIHJldHVybiByZXNwO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBsb2dpbjogZnVuY3Rpb24gKG1lbWJlciwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHZhciBob2lzdCA9IHRoaXM7XG5cbiAgICAgIGlmICh0eXBlb2YgbWVtYmVyID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuX2NvbmZpZ3MsIHtcbiAgICAgICAgICB1cmw6IFwiYXV0aC5ob2kuaW8vbG9naW5cIixcbiAgICAgICAgICBkYXRhOiBtZW1iZXIsXG4gICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgICAgIGlmIChyZXNwLnJlZGlyZWN0VXJsKSB7XG4gICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IHJlc3AucmVkaXJlY3RVcmw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBob2lzdC5fdXNlciA9IHJlc3A7XG4gICAgICAgICAgICByZXR1cm4gcmVzcDtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbG9nb3V0OiBmdW5jdGlvbiAoc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIHZhciBob2lzdCA9IHRoaXM7XG5cbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiBcImF1dGguaG9pLmlvL2xvZ291dFwiLFxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICAgIGhvaXN0Ll91c2VyID0gbnVsbDtcbiAgICAgICAgICBob2lzdC5fYnVja2V0ID0gbnVsbDtcbiAgICAgICAgICByZXR1cm4gcmVzcDtcbiAgICAgICAgfVxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBhY2NlcHQ6IGZ1bmN0aW9uIChjb2RlLCBkYXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgdmFyIGhvaXN0ID0gdGhpcztcblxuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5fY29uZmlncywge1xuICAgICAgICB1cmw6IFwiYXV0aC5ob2kuaW8vaW52aXRlL1wiICsgY29kZSArIFwiL3VzZXJcIixcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgICBob2lzdC5fdXNlciA9IHJlc3A7XG4gICAgICAgICAgcmV0dXJuIHJlc3A7XG4gICAgICAgIH1cbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgdXNlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3VzZXIgJiYgZXh0ZW5kKHt9LCB0aGlzLl91c2VyKTtcbiAgICB9LFxuXG4gICAgbm90aWZ5OiBmdW5jdGlvbiAoaWQsIGRhdGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICBpZiAodHlwZW9mIGlkID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIGNvbnRleHQgPSBlcnJvcjtcbiAgICAgICAgZXJyb3IgPSBzdWNjZXNzO1xuICAgICAgICBzdWNjZXNzID0gZGF0YTtcbiAgICAgICAgZGF0YSA9IGlkLmRhdGE7XG4gICAgICAgIGlkID0gaWQuaWQ7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLl9jb25maWdzLCB7XG4gICAgICAgICAgdXJsOiBcIm5vdGlmeS5ob2kuaW8vbm90aWZpY2F0aW9uL1wiICsgaWQsXG4gICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYXN5bmNFcnJvcihlcnJvciwgY29udGV4dCwgXCJkYXRhIGZvciBub3RpZmljYXRpb24gbXVzdCBiZSBhbiBvYmplY3RcIik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGZpbGU6IGZ1bmN0aW9uIChrZXksIGZpbGUsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICBpZiAoZmlsZSAmJiBmaWxlLmpxdWVyeSkge1xuICAgICAgICBmaWxlID0gZmlsZVswXTtcbiAgICAgIH1cblxuICAgICAgdmFyIHR5cGUgPSBjbGFzc09mKGZpbGUpLFxuICAgICAgICBkYXRhO1xuXG4gICAgICBpZiAodHlwZSA9PT0gXCJGaWxlXCIpIHtcbiAgICAgICAgZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICBkYXRhLmFwcGVuZChcImZpbGVcIiwgZmlsZSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiRm9ybURhdGFcIikge1xuICAgICAgICBkYXRhID0gZmlsZTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJIVE1MSW5wdXRFbGVtZW50XCIpIHtcbiAgICAgICAgZmlsZSA9IGZpbGUuZmlsZXMgJiYgZmlsZS5maWxlc1swXTtcblxuICAgICAgICBpZiAoIWZpbGUpIHJldHVybiBmYWxzZTtcblxuICAgICAgICBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgIGRhdGEuYXBwZW5kKFwiZmlsZVwiLCBmaWxlKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJGdW5jdGlvblwiKSB7XG4gICAgICAgIGNvbnRleHQgPSBlcnJvcjtcbiAgICAgICAgZXJyb3IgPSBzdWNjZXNzO1xuICAgICAgICBzdWNjZXNzID0gZmlsZTtcblxuICAgICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLl9jb25maWdzLCB7XG4gICAgICAgICAgdXJsOiBcImZpbGUuaG9pLmlvL1wiICsga2V5LFxuICAgICAgICAgIHJlc3BvbnNlVHlwZTogXCJibG9iXCJcbiAgICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgICAgICAvL3VuZGVmaW5lZCBpcyBET01XaW5kb3cgaW4gcGhhbnRvbSBmb3Igc29tZSByZWFzb25cbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJVbmRlZmluZWRcIiB8fCB0eXBlID09PSBcIkRPTVdpbmRvd1wiKSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuX2NvbmZpZ3MsIHtcbiAgICAgICAgICB1cmw6IFwiZmlsZS5ob2kuaW8vXCIgKyBrZXksXG4gICAgICAgICAgcmVzcG9uc2VUeXBlOiBcImJsb2JcIlxuICAgICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYXN5bmNFcnJvcihlcnJvciwgY29udGV4dCwgXCJjYW4ndCBzZW5kIGZpbGUgb2YgdHlwZSBcIiArIHR5cGUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLl9jb25maWdzLCB7XG4gICAgICAgIHVybDogXCJmaWxlLmhvaS5pby9cIiArIGtleSxcbiAgICAgICAgZGF0YTogZGF0YVxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICB1c2U6IGZ1bmN0aW9uIChidWNrZXQpIHtcbiAgICAgIHZhciBob2lzdCA9IHRoaXM7XG5cbiAgICAgIHZhciBtYW5hZ2VyID0gZXh0ZW5kKGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgIGlmIChjbGFzc09mKHR5cGUpID09PSBcIk9iamVjdFwiKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBPYmplY3REYXRhTWFuYWdlcihtYW5hZ2VyLCB0eXBlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbmV3IERhdGFNYW5hZ2VyKGhvaXN0LCB0eXBlLCBidWNrZXQpO1xuICAgICAgICB9XG4gICAgICB9LCBidWNrZXRNYW5hZ2VyTWV0aG9kcyk7XG5cbiAgICAgIG1hbmFnZXIuaG9pc3QgPSB0aGlzO1xuICAgICAgbWFuYWdlci5idWNrZXQgPSBidWNrZXQ7XG5cbiAgICAgIHJldHVybiBtYW5hZ2VyO1xuICAgIH0sXG5cbiAgICBjb25uZWN0b3I6IGZ1bmN0aW9uICh0eXBlLCB0b2tlbikge1xuICAgICAgcmV0dXJuIG5ldyBDb25uZWN0b3JNYW5hZ2VyKHRoaXMsIHR5cGUsIHRva2VuKTtcbiAgICB9LFxuXG4gICAgY2xvbmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBob2lzdCA9IGV4dGVuZChtYWtlSG9pc3QoKSwge1xuICAgICAgICBfY29uZmlnczogZXh0ZW5kKHt9LCB0aGlzLl9jb25maWdzKSxcbiAgICAgICAgX3VzZXI6IG51bGwsXG4gICAgICAgIF9idWNrZXQ6IG51bGwsXG4gICAgICAgIF9tYW5hZ2Vyczoge31cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gaG9pc3Q7XG4gICAgfVxuICB9O1xuXG4gIHZhciBidWNrZXRNZXRob2RzID0ge1xuICAgIHN0YXR1czogZnVuY3Rpb24gKHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICB2YXIgaG9pc3QgPSB0aGlzLl9ob2lzdDtcbiAgICAgIGlmICh0eXBlb2YgZXJyb3IgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBpZiAoIWNvbnRleHQpIGNvbnRleHQgPSBlcnJvcjtcbiAgICAgICAgZXJyb3IgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLl9ob2lzdC5fY29uZmlncywge1xuICAgICAgICB1cmw6IFwiYXV0aC5ob2kuaW8vYnVja2V0L2N1cnJlbnRcIixcbiAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKGJ1Y2tldCkge1xuICAgICAgICAgIGhvaXN0Ll9idWNrZXQgPSBidWNrZXQ7XG4gICAgICAgICAgcmV0dXJuIGJ1Y2tldDtcbiAgICAgICAgfSxcbiAgICAgICAgcHJvY2Vzc0Vycm9yOiBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICAgIGhvaXN0Ll9idWNrZXQgPSBudWxsO1xuICAgICAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgICAgICB9XG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHBvc3Q6IGZ1bmN0aW9uIChpZCwgZGF0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIGlmICh0eXBlb2YgaWQgIT09IFwic3RyaW5nXCIgJiYgaWQgIT09IG51bGwpIHtcbiAgICAgICAgY29udGV4dCA9IGVycm9yO1xuICAgICAgICBlcnJvciA9IHN1Y2Nlc3M7XG4gICAgICAgIHN1Y2Nlc3MgPSBkYXRhO1xuICAgICAgICBkYXRhID0gaWQ7XG4gICAgICAgIGlkID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBkYXRhID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgY29udGV4dCA9IGVycm9yO1xuICAgICAgICBlcnJvciA9IHN1Y2Nlc3M7XG4gICAgICAgIHN1Y2Nlc3MgPSBkYXRhO1xuICAgICAgICBkYXRhID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKGlkKSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuX2hvaXN0Ll9jb25maWdzLCB7XG4gICAgICAgICAgdXJsOiBcImF1dGguaG9pLmlvL2J1Y2tldC9cIiArIGlkLFxuICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5faG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgICB1cmw6IFwiYXV0aC5ob2kuaW8vYnVja2V0XCIsXG4gICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG1ldGE6IGZ1bmN0aW9uIChrZXksIG1ldGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICB2YXIgaG9pc3QgPSB0aGlzLl9ob2lzdDtcblxuICAgICAgaWYgKHR5cGVvZiBrZXkgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgY29udGV4dCA9IGVycm9yO1xuICAgICAgICBlcnJvciA9IHN1Y2Nlc3M7XG4gICAgICAgIHN1Y2Nlc3MgPSBtZXRhO1xuICAgICAgICBtZXRhID0ga2V5O1xuXG4gICAgICAgIGlmICghaG9pc3QuX2J1Y2tldCkge1xuICAgICAgICAgIHJldHVybiBhc3luY0Vycm9yKGVycm9yLCBjb250ZXh0LCBcIk5vIGJ1Y2tldCB0byBwb3N0IG1ldGFkYXRhIGFnYWluc3RcIiwgbnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICBrZXkgPSBob2lzdC5fYnVja2V0LmtleTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcXVlc3QoaG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiBcImF1dGguaG9pLmlvL2J1Y2tldC9cIiArIGtleSArIFwiL21ldGFcIixcbiAgICAgICAgZGF0YTogbWV0YSxcbiAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKGJ1Y2tldCkge1xuICAgICAgICAgIGlmIChob2lzdC5fYnVja2V0ICYmIGhvaXN0Ll9idWNrZXQua2V5ID09IGJ1Y2tldC5rZXkpIHtcbiAgICAgICAgICAgIGhvaXN0Ll9idWNrZXQgPSBidWNrZXQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGJ1Y2tldDtcbiAgICAgICAgfVxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBzZXQ6IGZ1bmN0aW9uIChrZXksIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICB2YXIgaG9pc3QgPSB0aGlzLl9ob2lzdDtcblxuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5faG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiBcImF1dGguaG9pLmlvL2J1Y2tldC9jdXJyZW50L1wiICsgKGtleSB8fCBcImRlZmF1bHRcIiksXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChidWNrZXQpIHtcbiAgICAgICAgICBob2lzdC5fYnVja2V0ID0ga2V5ID8gYnVja2V0IDogbnVsbDtcbiAgICAgICAgICByZXR1cm4gYnVja2V0O1xuICAgICAgICB9XG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIGxpc3Q6IGZ1bmN0aW9uIChzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5faG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiBcImF1dGguaG9pLmlvL2J1Y2tldHNcIlxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG5cbiAgICBpbnZpdGU6IGZ1bmN0aW9uIChrZXksIGRhdGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICBpZiAodHlwZW9mIGtleSA9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIGNvbnRleHQgPSBlcnJvcjtcbiAgICAgICAgZXJyb3IgPSBzdWNjZXNzO1xuICAgICAgICBzdWNjZXNzID0gZGF0YTtcbiAgICAgICAgZGF0YSA9IGtleTtcbiAgICAgICAga2V5ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKGtleSkgZGF0YSA9IF8uZXh0ZW5kKHtcbiAgICAgICAgYnVja2V0OiBrZXlcbiAgICAgIH0sIGRhdGEpO1xuXG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLl9ob2lzdC5fY29uZmlncywge1xuICAgICAgICB1cmw6IFwiYXV0aC5ob2kuaW8vaW52aXRlXCIsXG4gICAgICAgIGRhdGE6IGRhdGFcbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gQ29ubmVjdG9yTWFuYWdlcihob2lzdCwgdHlwZSwgdG9rZW4pIHtcbiAgICB0aGlzLmhvaXN0ID0gaG9pc3Q7XG4gICAgdGhpcy51cmwgPSBcInByb3h5LmhvaS5pby9cIiArIHR5cGU7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICB9XG5cbiAgZXh0ZW5kKENvbm5lY3Rvck1hbmFnZXIucHJvdG90eXBlLCB7XG5cbiAgICBhdXRob3JpemU6IGZ1bmN0aW9uIChvcHRpb25zLCBjb250ZXh0KSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgb3B0aW9ucyA9IGV4dGVuZCh7XG4gICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWYsXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbiAoKSB7fSxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKCkge30sXG4gICAgICAgIHJlZGlyZWN0OiBmdW5jdGlvbiAocmVkaXJlY3RfdXJsKSB7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gcmVkaXJlY3RfdXJsO1xuICAgICAgICB9XG4gICAgICB9LCBvcHRpb25zKTtcblxuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5ob2lzdC5fY29uZmlncywge1xuICAgICAgICB1cmw6IHRoaXMudXJsICsgXCIvY29ubmVjdFwiLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgcmV0dXJuX3VybDogb3B0aW9ucy51cmxcbiAgICAgICAgfVxuICAgICAgfSwgZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBpZiAocmVzLnRva2VuKSB7XG4gICAgICAgICAgc2VsZi50b2tlbiA9IHJlcy50b2tlbjtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzLnJlZGlyZWN0KSB7XG4gICAgICAgICAgb3B0aW9ucy5yZWRpcmVjdCAmJiBvcHRpb25zLnJlZGlyZWN0LmFwcGx5KHRoaXMsIFtyZXMucmVkaXJlY3RdKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgb3B0aW9ucy5zdWNjZXNzICYmIG9wdGlvbnMuc3VjY2Vzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfSwgb3B0aW9ucy5lcnJvciwgY29udGV4dCk7XG5cbiAgICB9LFxuXG4gICAgZGlzY29ubmVjdDogZnVuY3Rpb24gKHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLmhvaXN0X2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiB0aGlzLnVybCArIFwiL2Rpc2Nvbm5lY3RcIlxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH0sXG4gICAgcmVtb3ZlRnJvbVVzZXI6IGZ1bmN0aW9uIChzdWNjZXNzLCBlcnJvciwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5ob2lzdF9jb25maWdzLCB7XG4gICAgICAgIHVybDogdGhpcy51cmwgKyBcIi9yZW1vdmVGcm9tVXNlclwiXG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIGdldDogZnVuY3Rpb24gKHBhdGgsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG5cbiAgICAgIGlmIChwYXRoWzBdICE9PSAnLycpIHBhdGggPSAnLycgKyBwYXRoO1xuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5ob2lzdC5fY29uZmlncywge1xuICAgICAgICB1cmw6IHRoaXMudXJsICsgcGF0aCxcbiAgICAgICAgdG9rZW46IHRoaXMudG9rZW5cbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgcG9zdDogZnVuY3Rpb24gKHBhdGgsIGRhdGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICBpZiAocGF0aFswXSAhPT0gJy8nKSBwYXRoID0gJy8nICsgcGF0aDtcbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuaG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiB0aGlzLnVybCArIHBhdGgsXG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIHRva2VuOiB0aGlzLnRva2VuXG4gICAgICB9LCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIHB1dDogZnVuY3Rpb24gKHBhdGgsIGRhdGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KSB7XG4gICAgICBpZiAocGF0aFswXSAhPT0gJy8nKSBwYXRoID0gJy8nICsgcGF0aDtcbiAgICAgIHJldHVybiByZXF1ZXN0KHRoaXMuaG9pc3QuX2NvbmZpZ3MsIHtcbiAgICAgICAgdXJsOiB0aGlzLnVybCArIHBhdGgsXG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIG1ldGhvZDogXCJQVVRcIixcbiAgICAgICAgdG9rZW46IHRoaXMudG9rZW5cbiAgICAgIH0sIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAocGF0aCwgZGF0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpIHtcbiAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGNvbnRleHQgPSBlcnJvcjtcbiAgICAgICAgZXJyb3IgPSBzdWNjZXNzO1xuICAgICAgICBzdWNjZXNzID0gZGF0YTtcbiAgICAgICAgZGF0YSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXRoWzBdICE9PSAnLycpIHBhdGggPSAnLycgKyBwYXRoO1xuICAgICAgcmV0dXJuIHJlcXVlc3QodGhpcy5ob2lzdC5fY29uZmlncywge1xuICAgICAgICB1cmw6IHRoaXMudXJsICsgcGF0aCxcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgbWV0aG9kOiBcIkRFTEVURVwiLFxuICAgICAgICB0b2tlbjogdGhpcy50b2tlblxuICAgICAgfSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gbWFrZUhvaXN0KCkge1xuICAgIHZhciBob2lzdCA9IGV4dGVuZChmdW5jdGlvbiAodHlwZSwgYnVja2V0KSB7XG4gICAgICBpZiAoY2xhc3NPZih0eXBlKSA9PT0gXCJPYmplY3RcIikge1xuICAgICAgICByZXR1cm4gbmV3IE9iamVjdERhdGFNYW5hZ2VyKGhvaXN0LCB0eXBlLCBidWNrZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRhTWFuYWdlcihob2lzdCwgdHlwZSwgYnVja2V0KTtcbiAgICAgIH1cbiAgICB9LCBob2lzdE1ldGhvZHMpO1xuXG4gICAgaG9pc3QuYnVja2V0ID0gZXh0ZW5kKGZ1bmN0aW9uIChtZXRhLCBzdWNjZXNzLCBlcnJvciwgY29udGV4dCwgY3gpIHtcbiAgICAgIHZhciB0eXBlID0gdHlwZW9mIG1ldGE7XG5cbiAgICAgIGlmICh0eXBlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgaG9pc3QuYnVja2V0LnN0YXR1cyhtZXRhLCBzdWNjZXNzLCBlcnJvcik7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIHN1Y2Nlc3MgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgaG9pc3QuYnVja2V0LnBvc3QobWV0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQsIGN4KTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJzdHJpbmdcIiB8fCBtZXRhID09PSBudWxsKSB7XG4gICAgICAgIGhvaXN0LmJ1Y2tldC5zZXQobWV0YSwgc3VjY2VzcywgZXJyb3IsIGNvbnRleHQpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIGhvaXN0LmJ1Y2tldC5tZXRhKG1ldGEsIHN1Y2Nlc3MsIGVycm9yLCBjb250ZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBob2lzdC5fYnVja2V0O1xuICAgICAgfVxuICAgIH0sIGJ1Y2tldE1ldGhvZHMpO1xuXG4gICAgaG9pc3QuYnVja2V0Ll9ob2lzdCA9IGhvaXN0O1xuXG4gICAgcmV0dXJuIGhvaXN0O1xuICB9XG5cbiAgdmFyIEhvaXN0ID0gZXh0ZW5kKG1ha2VIb2lzdCgpLCB7XG4gICAgX2NvbmZpZ3M6IHtcbiAgICAgIHByb3RvY29sOiBcImh0dHBzOi8vXCJcbiAgICB9LFxuICAgIF91c2VyOiBudWxsLFxuICAgIF9idWNrZXQ6IG51bGwsXG4gICAgX21hbmFnZXJzOiB7fVxuICB9KTtcblxuICAvLyB0aHJvdyBIb2lzdCBhdCBzb21ldGhpbmcgaXQgd2lsbCBzdGljayB0b1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoXCJIb2lzdFwiLCBbJyddLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gSG9pc3Q7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2Ygd2luZG93LmRvY3VtZW50ID09PSBcIm9iamVjdFwiKSB7XG4gICAgd2luZG93LkhvaXN0ID0gSG9pc3Q7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEhvaXN0O1xuICB9XG59KSgpO1xuIl19
