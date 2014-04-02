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
		if (typeof error !== "function") return;
		
		var args = splice.call(arguments, 2);
		
		setTimeout(function () {
			error.apply(context, args);
		}, 0);
	}
	
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
		
		if (!configs.apikey) {
			return asyncError(error, context, "API key not set", null);
		}
		
		var xhr = new XMLHttpRequest();
		
		xhr.open(method, configs.protocol + opts.url);
		
		responseType = opts.responseType || "json";
		
		// Safari will error out (!) if we try to set a responseType of "json"
		
		if (responseType != "json") {
			xhr.responseType = responseType;
			
			// Safari before 6.1 does not support "blob" but does support "arraybuffer"
			
			if (responseType == "blob" && xhr.responseType != "blob") {
				xhr.responseType = "arraybuffer";
			}
		}
		
		contentType && xhr.setRequestHeader("Content-Type", contentType);
		
		xhr.setRequestHeader("Authorization", "Hoist " + configs.apikey);
		
		xhr.withCredentials = true;
		
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 400) {
					var response = xhr.response || xhr.responseText,
						type = classOf(response);
				
					if (type === "String" && responseType === "json") {
						response = JSON.parse(response);
					} else if (type === "ArrayBuffer" && responseType === "blob") {
						response = new Blob([response]);
					}
					
					success && success.call(context, response, xhr);
				} else {
					error && error.call(context, xhr.statusText, xhr);
				}
			}
		};
		
		xhr.send(opts.data);
	}
	
	// simple data manager
	
	function DataManager(hoist, type) {
		this.type = type;
		this.url = "data.hoi.io/" + type;
		this.hoist = hoist;
	}
	
	extend(DataManager.prototype, {
		get: function (id, success, error, context) {
			if (typeof id === "function" || id === u) {
				context = error;
				error = success;
				success = id;
				
				request(this.hoist._configs, { url: this.url }, success, error, context);
			} else {
				request(this.hoist._configs, { url: this.url + "/" + id }, success, error, context);
			}
		},
		
		post: function (id, data, success, error, context) {
			if (typeof id === "object") {
				var singleton = classOf(id) === "Array" && id.length === 1;

				context = error;
				error = success;
				success = data;
				data = id;

				if (data._id) {
					id = data._id;
				} else {
					request({ url: this.url, data: data }, success && function (resp, xhr) {
						success.call(this, singleton ? [resp] : resp, xhr);
					}, error, context);

					return;
				}
			}
			
			request(this.hoist._configs, { url: this.url + "/" + id, data: data }, success, error, context);
		},
		
		clear: function (success, error, context) {
			request(this.hoist._configs, { url: this.url, method: "DELETE" }, success, error, context);
		},
		
		remove: function (id, success, error, context) {
			if (!id) {
				return asyncError(error, context, "Cannot remove model with empty id", null);
			}
		
			request(this.hoist._configs, { url: this.url + "/" + id, method: "DELETE" }, success, error, context);
		}
	});
	
	// complex data manager
	
	var tagRegex = /\[([^\]]+)\]/g;

	function ObjectDataManager(hoist, hash) {
		var items = this.items = {};

		for (var x in hash) {
			var item = { key: x, path: hash[x], requires: [] },
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
		
		this.hoist = hoist;
	}
	
	extend(ObjectDataManager.prototype, {
		get: function (data, success, error, context) {
			var items = {},
				result = {},
				managers = {},
				hoist = this.hoist,
				failed;
				
			if (typeof data === "function") {
				context = error;
				error = success;
				success = data;
				data = {};
			} else if (typeof data === "string") {
				data = { id: data };
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
						error && error.call(context, key + ": " + msg, xhr);
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
			
				if (!loading) success.call(context, result, managers);
			}
			
			advance();
		}
	});
	
	function ProxyManager(hoist, type, token) {
		this.hoist = hoist;
		this.url = "proxy.hoi.io/" + type;
		this.token = token;
	}
	
	extend(ProxyManager.prototype, {
		get: function (path, success, error, context) {
			if (path[0] !== '/') path = '/' + path;
			request(this.hoist._configs, { url: this.url + path, token: this.token }, success, error, context);
		},
		
		post: function (path, data, success, error, context) {
			if (path[0] !== '/') path = '/' + path;
			request(this.hoist._configs, { url: this.url + path, data: data, token: this.token }, success, error, context);
		},
		
		put: function (path, data, success, error, context) {
			if (path[0] !== '/') path = '/' + path;
			request(this.hoist._configs, { url: this.url + path, data: data, method: "PUT", token: this.token }, success, error, context);
		},
		
		remove: function (path, data, success, error, context) {
			if (typeof data === "function") {
				context = error;
				error = success;
				success = data;
				data = null;
			}
		
			if (path[0] !== '/') path = '/' + path;
			request(this.hoist._configs, { url: this.url + path, data: data, method: "DELETE", token: this.token }, success, error, context);
		}
	});
	
	var hoistMethods = {
		apiKey: function (v) {
			return this.config("apikey", v);
		},
		
		get: function (type, id, success, error, context) {
			this(type).get(id, success, error, context);
		},
		
		post: function (type, id, data, success, error, context) {
			this(type).post(id, data, success, error, context);
		},
		
		clear: function (type, success, error, context) {
			this(type).clear(success, error, context);
		},
		
		remove: function (type, id, success, error, context) {
			this(type).remove(id, success, error, context);
		},
	
		config: function (a, b) {
			if (b === u) {
				var type = typeof a;
			
				if (type === "string") {
					return this._configs[a];
				} else if (type === "object") {
					for (var x in a) {
						this._configs[x.toLowerCase()] = a[x];
					}
				}
			} else {
				this._configs[a.toLowerCase()] = b;
			}
		},
		
		status: function (success, error, context) {
			var hoist = this;
			
			if (typeof error !== "function") {
				error = null;
				context = error;
			}
		
			request(this._configs, { url: "auth.hoi.io/status" }, function (resp) {
				hoist._user = resp;
				success && success.apply(this, arguments);
			}, function () {
				hoist._user = null;
				error && error.apply(this, arguments);
			}, context);
		},
		
		signup: function (member, success, error, context) {
			var hoist = this;
		
			if (typeof member === "object") {
				request(this._configs, { url: "auth.hoi.io/user", data: member }, function (resp) {
					hoist._user = resp;
					success && success.apply(this, arguments);
				}, error, context);
			}
		},
		
		login: function (member, success, error, context) {
			var hoist = this;
		
			if (typeof member === "object") {
				request(this._configs, { url: "auth.hoi.io/login", data: member }, function (resp) {
					hoist._user = resp;
					success && success.apply(this, arguments);
				}, error, context);
			}
		},
		
		logout: function (success, error, context) {
			var hoist = this;
		
			request(this._configs, { url: "auth.hoi.io/logout", method: "POST" }, function () {
				hoist._user = null;
				success && success.apply(this, arguments);
			}, error, context);
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
				request(this._configs, { url: "notify.hoi.io/notification/" + id, data: data }, success, error, context);
			}
		},
		
		file: function (key, file, success, error, context) {
			if (file.jQuery) file = file[0];
		
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

				request(this._configs, { url: "file.hoi.io/" + key, responseType: "blob" }, success, error, context);
				return;
			} else if (type === "Undefined") {
				request(this._configs, { url: "file.hoi.io/" + key, responseType: "blob" }, success, error, context);
				return;
			} else {
				return;
			}
			
			request(this._configs, { url: "file.hoi.io/" + key, data: data }, success, error, context);
		},
		
		connect: function (type, url, success, error, context) {
			if (typeof url !== "string") {
				context = error;
				error = success;
				success = url;
				url = window.location.href;
			}
		
			request(this._configs, { url: "proxy.hoi.io/" + type + "/connect", data: { redirect_url: url } }, success, error, context);
		},
		
		proxy: function (type, token) {
			return new ProxyManager(this, type, token);
		},
		
		xero: function (token) {
			return new ProxyManager(this, "xero", token);
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
		
			request(this._hoist._configs, { url: "auth.hoi.io/bucket/current" }, function (bucket) {
				hoist._bucket = bucket;
				success && success.apply(this, arguments);
			}, error, context);
		},
	
		post: function (id, data, success, error, context) {
			if (typeof data !== "object") {
				context = error;
				error = success;
				success = data;
				data = null;
			}
		
			request(this._hoist._configs, { url: "auth.hoi.io/bucket/" + id, data: data }, success, error, context);
		},
		
		set: function (id, success, error, context) {
			var hoist = this._hoist;
		
			if (id) {
				request(this._hoist._configs, { url: "auth.hoi.io/bucket/current/" + id, method: "POST" }, function (bucket) {
					hoist._bucket = bucket;
					success && success.apply(this, arguments);
				}, error, context);
			} else {
				request(this._hoist._configs, { url: "auth.hoi.io/bucket/current", method: "DELETE" }, function () {
					hoist._bucket = null;
					success && success.apply(this, arguments);
				}, error, context);
			}
		},
		
		list: function (success, error, context) {
			request(this._hoist._configs, { url: "auth.hoi.io/buckets" }, success, error, context);
		},
		
		invite: function (data, success, error, context) {
			request(this._hoist._configs, { url: "auth.hoi.io/invite", data: data }, success, error, context);
		}
	};
	
	function makeHoist() {
		var hoist = extend(function (type) {
			if (classOf(type) === "Object") {
				return new ObjectDataManager(hoist, type);
			} else {
				return hoist._managers[type] || (hoist._managers[type] = new DataManager(hoist, type));
			}
		}, hoistMethods);
		
		hoist.bucket = extend(function () {
			return hoist._bucket;
		}, bucketMethods);
		
		hoist.bucket._hoist = hoist;

		return hoist;
	};
	
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
		define("Hoist", [], function () { return Hoist; });
	}
	else if (typeof window === "object" && typeof window.document === "object") {
		window.Hoist = Hoist;
	}
	else if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = Hoist;
	}
})();



