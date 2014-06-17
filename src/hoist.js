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
				}
				catch (e) {
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
					}
					catch (e) {
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
				}
				catch (e) {
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
				}
				catch (e) {
					promise.reject(e);
				}
				
			} else {
				this.cbs.push([ success, error, promise ]);
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

		var xhr = new XMLHttpRequest();

		xhr.open(method, configs ? configs.protocol + opts.url : opts.url);

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

		if (configs) {
			xhr.setRequestHeader("Authorization", "Hoist " + configs.apikey);
		}

		if (opts.bucket) {
			xhr.setRequestHeader("x-bucket-key", opts.bucket);
		}

		xhr.withCredentials = true;
		
		var promise = new Promise();

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
					
					if (opts.process) response = opts.process(response);

					success && success.call(context, response, xhr);
					promise.resolve(response);
				} else {
					var message = xhr.statusText;
				
					if (opts.processError) message = opts.processError(message);
				
					error && error.call(context, message, xhr);
					promise.reject(message);
				}
			}
		};

		xhr.send(opts.data);
		
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
				return request(this.hoist._configs, { url: this.url + "/" + id, bucket: this.bucket }, success, error, context);
			} else {
				return request(this.hoist._configs, { url: this.url, bucket: this.bucket }, success, error, context);
			}
		},
		
		query: function (query) {
			return new QueryManager(this, { q: query });
		},
		
		where: function (key, value) {
			return new QueryManager(this, {}).where(key, value);
		},
		
		limit: function (limit) {
			return new QueryManager(this, { limit: limit });
		},
		
		skip: function (skip) {
			return new QueryManager(this, { skip: skip });
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
				return request(this.hoist._configs, { url: this.url + "/" + id, bucket: this.bucket, data: data }, success, error, context);
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
			return request(this.hoist._configs, { url: this.url, bucket: this.bucket, method: "DELETE" }, success, error, context);
		},

		remove: function (id, success, error, context) {
			if (!id) {
				return asyncError(error, context, "Cannot remove model with empty id", null);
			}

			return request(this.hoist._configs, { url: this.url + "/" + id, bucket: this.bucket, method: "DELETE" }, success, error, context);
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
			
			return request(this.dm.hoist._configs, { url: this.dm.url + "?" + parts.join('&'), bucket: this.dm.bucket }, success, error, context);
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
					sort.push([ args[i].slice(0, -4), 1 ]);
				} else if (args[i].slice(-5).toLowerCase() == " desc") {
					sort.push([ args[i].slice(0, -5), -1 ]);
				} else {
					sort.push([ args[i], 1 ]);
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
		"eq is equals":
			function (value) { this.qm = this.qm._where(this.key, value); return this; },
		"gt greaterThan":
			function (value) { this.qm = this.qm._whereAnd(this.key, "$gt",  value); return this; },
		"gte ge":
			function (value) { this.qm = this.qm._whereAnd(this.key, "$gte", value); return this; },
		"elem in":
			function (value) { this.qm = this.qm._whereAnd(this.key, "$in",  value); return this; },
		"lt lessThan":
			function (value) { this.qm = this.qm._whereAnd(this.key, "$lt",  value); return this; },
		"lte le":
			function (value) { this.qm = this.qm._whereAnd(this.key, "$lte", value); return this; },
		"neq ne isnt notEquals":
			function (value) { this.qm = this.qm._whereAnd(this.key, "$ne",  value); return this; },
		"nelem nin notIn notElem":
			function (value) { this.qm = this.qm._whereAnd(this.key, "$nin", value); return this; },
		"exists":
			function () { this.qm = this.qm._whereAnd(this.key, "$exists", true); return this; }
	});
	
	extend(PartialQueryManager.prototype, {
		where: function (key) { return this.qm.where(key); },
		limit: function (limit) { return this.qm.limit(limit); },
		skip: function (skip) { return this.qm.skip(skip); },
		sort: function () { return this.qm.sort.apply(this.qm, arguments); },
		sortBy: function () { return this.qm._sort(false, arguments); },
		thenBy: function () { return this.qm._sort(true, arguments); },
		
		get: function (success, error, context) {
			return this.qm.get(success, error, context);
		}
	});

	// complex data manager

	var tagRegex = /\[([^\]]+)\]/g;

	function ObjectDataManager(hoist, hash, bucket) {
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
				return request(this._configs, { url: "notify.hoi.io/notification/" + id, data: data }, success, error, context);
			} else {
				return asyncError(error, context, "data for notification must be an object");
			}
		},

		file: function (key, file, success, error, context) {
			if (file.jquery) file = file[0];

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

				return request(this._configs, { url: "file.hoi.io/" + key, responseType: "blob" }, success, error, context);
			} else if (type === "Undefined") {
				return request(this._configs, { url: "file.hoi.io/" + key, responseType: "blob" }, success, error, context);
			} else {
				return asyncError(error, context, "can't send file of type " + type);
			}

			return request(this._configs, { url: "file.hoi.io/" + key, data: data }, success, error, context);
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
				return request(this._hoist._configs, { url: "auth.hoi.io/bucket/" + id, data: data }, success, error, context);
			} else {
				return request(this._hoist._configs, { url: "auth.hoi.io/bucket", data: data }, success, error, context);
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
			return request(this._hoist._configs, { url: "auth.hoi.io/buckets" }, success, error, context);
		},

		invite: function (key, data, success, error, context) {
			if (typeof key == "object") {
				context = error;
				error = success;
				success = data;
				data = key;
				key = null;
			}

			var hoist = this._hoist;

			if (!key || hoist._bucket && hoist._bucket.key == key) {
				return request(hoist._configs, { url: "auth.hoi.io/invite", data: data }, success, error, context);
			} else {
				// switch bucket so you can invite the user into the right one -- this is suboptimal but works for now
				
				return this.set(key).then(function () {
					return request(hoist._configs, { url: "auth.hoi.io/invite", data: data }, success, context);
				}, function (message) {
					error && error.call(context, message);
				});
			}
		}
	};

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
		define("Hoist", [], function () { return Hoist; });
	}
	else if (typeof window === "object" && typeof window.document === "object") {
		window.Hoist = Hoist;
	}
	else if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = Hoist;
	}
})();
