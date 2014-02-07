/*jshint loopfunc: true */
var Hoist = (function () {
	var configs = {
			protocol: "https://"
		},
		user,
		toString = Object.prototype.toString,
		splice = Array.prototype.splice,
		u;
		
	// helpers

	function extend(into, from) {
		for (var x in from) into[x] = from[x];
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
	
	function request(opts, success, error, context) {
		var method, contentType, responseType;

		if ("data" in opts) {
			var type = classOf(opts.data);
		
			if (type === "String") {
				contentType = "application/json";
			} else if (type === "FormData") {
				method = "POST";
			} else {
				method = "POST";
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
					var response = xhr.response,
						type = classOf(response);
				
					if (type === "String" && responseType === "json") {
						response = JSON.parse(xhr.response);
					} else if (type === "ArrayBuffer" && responseType === "blob") {
						response = new Blob([xhr.response]);
					}
					
					success && success.call(context, response, xhr);
				} else {
					error && error.call(context, xhr.statusText, xhr);
				}
			}
		};
		
		xhr.send(opts.data);
	}
	
	var managers = {};
	
	// simple data manager
	
	function DataManager(type) {
		this.type = type;
		this.url = "data.hoi.io/" + type;
	}
	
	extend(DataManager.prototype, {
		get: function (id, success, error, context) {
			if (typeof id === "function" || id === undefined) {
				context = error;
				error = success;
				success = id;
				
				request({ url: this.url }, success, error, context);
			} else {
				request({ url: this.url + "/" + id }, success, error, context);
			}
		},
		
		post: function (id, data, success, error, context) {
			if (typeof id === "object") {
				var multiple = classOf(id) === "Array";
			
				context = error;
				error = success;
				success = data;
				data = id;
				
				if (data._id) {
					id = data._id;
				} else {
					request({ url: this.url, data: data }, success && function (resp, xhr) {
						success.call(this, multiple ? resp : resp[0], xhr);
					}, error, context);
					
					return;
				}
			}
			
			request({ url: this.url + "/" + id, data: data }, success, error, context);
		},
		
		clear: function (success, error, context) {
			request({ url: this.url, method: "DELETE" }, success, error, context);
		},
		
		remove: function (id, success, error, context) {
			if (!id) {
				return asyncError(error, context, "Cannot remove model with empty id", null);
			}
		
			request({ url: this.url + "/" + id, method: "DELETE" }, success, error, context);
		}
	});
	
	// complex data manager
	
	var tagRegex = /\[([^\]]+)\]/g;

	function ObjectDataManager(hash) {
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
	}
	
	extend(ObjectDataManager.prototype, {
		get: function (data, success, error, context) {
			var items = {},
				result = {},
				managers = {},
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
							(managers[item.key] = Hoist(path.slice(0, space))).get(path.slice(space + 1), succeed(item.key), fail(item.key));
						} else {
							(managers[item.key] = Hoist(path)).get(succeed(item.key), fail(item.key));
						}
					}
					
					loading++;
				}
			
				if (!loading) success.call(context, result, managers);
			}
			
			advance();
		}
	});

	Hoist = function (type) {
		if (classOf(type) === "Object") {
			return new ObjectDataManager(type);
		} else {
			return managers[type] || (managers[type] = new DataManager(type));
		}
	};
	
	extend(Hoist, {
		apiKey: function (v) {
			return this.config("apikey", v);
		},
		
		get: function (type, id, success, error, context) {
			Hoist(type).get(id, success, error, context);
		},
		
		post: function (type, id, data, success, error, context) {
			Hoist(type).post(id, data, success, error, context);
		},
		
		clear: function (type, success, error, context) {
			Hoist(type).clear(success, error, context);
		},
		
		remove: function (type, id, success, error, context) {
			Hoist(type).remove(id, success, error, context);
		},
	
		config: function (a, b) {
			if (b === u) {
				var type = typeof a;
			
				if (type === "string") {
					return configs[a];
				} else if (type === "object") {
					for (var x in a) {
						configs[x.toLowerCase()] = a[x];
					}
				}
			} else {
				configs[a.toLowerCase()] = b;
			}
		},
		
		status: function (success, error, context) {
			request({ url: "auth.hoi.io/status" }, function (resp) {
				user = resp;
				success && success.apply(this, arguments);
			}, error, context);
		},
		
		signup: function (member, success, error, context) {
			if (typeof member === "object") {
				request({ url: "auth.hoi.io/user", data: member }, function (resp) {
					user = resp;
					success && success.apply(this, arguments);
				}, error, context);
			}
		},
		
		login: function (member, success, error, context) {
			if (typeof member === "object") {
				request({ url: "auth.hoi.io/login", data: member }, function (resp) {
					user = resp;
					success && success.apply(this, arguments);
				}, error, context);
			}
		},
		
		logout: function (success, error, context) {
			request({ url: "auth.hoi.io/logout", method: "POST" }, success, error, context);
		},
		
		user: function () {
			return user;
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
				request({ url: "notify.hoi.io/notification/" + id, data: data }, success, error, context);
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

				request({ url: "file.hoi.io/" + key, responseType: "blob" }, success, error, context);
				return;
			} else if (type === "Undefined") {
				request({ url: "file.hoi.io/" + key, responseType: "blob" }, success, error, context);
				return;
			} else {
				return;
			}
			
			request({ url: "file.hoi.io/" + key, data: data }, success, error, context);
		}
	});
	
	Hoist.clone = arguments.callee;
	
	return Hoist;
})();


if (typeof define === "function" && define.amd) {
	define("Hoist", [], function() {
		return Hoist;
	});
}
else
{
	//put hoist on the global namespace
	window.Hoist = Hoist;
}