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
  var Hoist;
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

        return Hoist._request(this.hoist._configs, {
          url: this.url + "/" + id,
          bucket: this.bucket
        }, success, error, context);
      } else {
        return Hoist._request(this.hoist._configs, {
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
        return Hoist._request(this.hoist._configs, {
          url: this.url + "/" + id,
          bucket: this.bucket,
          data: data
        }, success, error, context);
      } else {
        return Hoist._request(this.hoist._configs, {
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
      return Hoist._request(this.hoist._configs, {
        url: this.url,
        bucket: this.bucket,
        method: "DELETE"
      }, success, error, context);
    },

    remove: function (id, success, error, context) {
      if (!id) {
        return asyncError(error, context, "Cannot remove model with empty id", null);
      }

      return Hoist._request(this.hoist._configs, {
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

      return Hoist._request(this.dm.hoist._configs, {
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

          return Hoist._request(null, {
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

      return Hoist._request(this._configs, {
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
        return Hoist._request(this._configs, {
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
    forgotPassword: function (email, success, error, context) {
      var hoist = this;

      return Hoist._request(this._configs, {
        url: "auth.hoi.io/forgottenPassword",
        data: {
          email: email
        }
      }, success, error, context);

    },
    login: function (member, success, error, context) {
      var hoist = this;

      if (typeof member === "object") {
        return Hoist._request(this._configs, {
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

      return Hoist._request(this._configs, {
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

      return Hoist._request(this._configs, {
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
        return Hoist._request(this._configs, {
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

        return Hoist._request(this._configs, {
          url: "file.hoi.io/" + key,
          responseType: "blob"
        }, success, error, context);
        //undefined is DOMWindow in phantom for some reason
      } else if (type === "Undefined" || type === "DOMWindow") {
        return Hoist._request(this._configs, {
          url: "file.hoi.io/" + key,
          responseType: "blob"
        }, success, error, context);
      } else {
        return asyncError(error, context, "can't send file of type " + type);
      }

      return Hoist._request(this._configs, {
        url: "file.hoi.io/" + key,
        data: data
      }, success, error, context);
    },

    index: function (path, content, success, error, context) {
      if (!content || typeof content === "function") {
        context = error;
        error = success;
        success = content;
        var data = path;
        if (classOf(path) === "Array") {
          data = {
            pages: path
          };
        }
        return request(this._configs, {
          url: "search.hoi.io/index",
          data: data,
          method: 'POST'
        }, success, error, context);
      }

      return request(this._configs, {
        url: "search.hoi.io/index",
        data: {
          path: path,
          content: content
        },
        method: 'POST'
      }, success, error, context);
    },

    getIndex: function (path, success, error, context) {
      path = path.replace(/#!/, '?_escaped_fragment_=');
      return request(this._configs, {
        url: "search.hoi.io/index?path=" + path,
        method: 'GET',
        responseType: 'text/html'
      }, success, error, context);
    },

    deIndex: function (path, regex, success, error, context) {
      if (typeof regex === "function") {
        context = error;
        error = success;
        success = regex;
        regex = false;
      } else {
        regex = !!regex;
      }
      return request(this._configs, {
        url: "search.hoi.io/index",
        data: {
          path: path,
          regex: regex
        },
        method: 'DELETE'
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

      return Hoist._request(this._hoist._configs, {
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
        return Hoist._request(this._hoist._configs, {
          url: "auth.hoi.io/bucket/" + id,
          data: data
        }, success, error, context);
      } else {
        return Hoist._request(this._hoist._configs, {
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

      return Hoist._request(hoist._configs, {
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

      return Hoist._request(this._hoist._configs, {
        url: "auth.hoi.io/bucket/current/" + (key || "default"),
        method: "POST",
        process: function (bucket) {
          hoist._bucket = key ? bucket : null;
          return bucket;
        }
      }, success, error, context);
    },

    list: function (success, error, context) {
      return Hoist._request(this._hoist._configs, {
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

      return Hoist._request(this._hoist._configs, {
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

      return Hoist._request(this.hoist._configs, {
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
      return Hoist._request(this.hoist._configs, {
        url: this.url + "/disconnect"
      }, success, error, context);
    },
    removeFromUser: function (success, error, context) {
      return Hoist._request(this.hoist._configs, {
        url: this.url + "/removeFromUser"
      }, success, error, context);
    },

    get: function (path, success, error, context) {

      if (path[0] !== '/') path = '/' + path;
      return Hoist._request(this.hoist._configs, {
        url: this.url + path,
        token: this.token
      }, success, error, context);
    },

    post: function (path, data, success, error, context) {
      if (path[0] !== '/') path = '/' + path;
      return Hoist._request(this.hoist._configs, {
        url: this.url + path,
        data: data,
        token: this.token
      }, success, error, context);
    },

    put: function (path, data, success, error, context) {
      if (path[0] !== '/') path = '/' + path;
      return Hoist._request(this.hoist._configs, {
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
      return Hoist._request(this.hoist._configs, {
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

  Hoist = extend(makeHoist(), {
    _configs: {
      protocol: "https://"
    },
    _user: null,
    _bucket: null,
    _managers: {},
    _request: request,
    _agent: agent
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

},{"superagent":1}]},{},[4]);