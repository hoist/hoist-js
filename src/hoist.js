var Hoist = (function () {
	var configs = {},
		user,
		toString = Object.prototype.toString,
		splice = Array.prototype.splice,
		u;
		
	function extend(into, from) {
		for (var x in from) into[x] = from[x];
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
		
		xhr.open(method, opts.url);
		
		xhr.responseType = responseType = opts.responseType || "json";
		
		contentType && xhr.setRequestHeader("Content-Type", contentType);
		
		xhr.setRequestHeader("Authorization", "Hoist " + configs.apikey);
		
		xhr.withCredentials = true;
		
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 300) {
					if (typeof xhr.response === "string" && responseType === "json") {
						success && success.call(context, JSON.parse(xhr.response), xhr);
					} else {
						success && success.call(context, xhr.response, xhr);
					}
				} else {
					error && error.call(context, xhr.statusText, xhr);
				}
			}
		};
		
		xhr.send(opts.data);
	}
	
	var managers = {};
	
	function DataManager(type) {
		this.type = type;
		this.url = "https://data.hoi.io/" + type;
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
				context = error;
				error = success;
				success = data;
				data = id;
				
				if (data._id) {
					id = data._id;
				} else {
					request({ url: this.url, data: data }, success && function (resp, xhr) {
						success.call(this, resp[0], xhr);
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

	Hoist = function (type) {
		return managers[type] || (managers[type] = new DataManager(type));
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
			request({ url: "https://auth.hoi.io/status" }, function (resp, xhr) {
				// normalise response to that returned by /user and /login
				
				user = { id: resp._id, role: resp.role };
				
				success && success.call(this, user, xhr);
			}, error, context);
		},
		
		signup: function (member, success, error, context) {
			if (typeof member === "object") {
				request({ url: "https://auth.hoi.io/user", data: member }, function (resp) {
					user = resp;
					success && success.apply(this, arguments);
				}, error, context);
			}
		},
		
		login: function (member, success, error, context) {
			if (typeof member === "object") {
				request({ url: "https://auth.hoi.io/login", data: member }, function (resp) {
					user = resp;
					success && success.apply(this, arguments);
				}, error, context);
			}
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
				request({ url: "https://notify.hoi.io/notification/" + id, data: data }, success, error, context);
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

				request({ url: "https://file.hoi.io/" + key, responseType: "blob" }, success, error, context);
				return;
			} else if (type === "Undefined") {
				request({ url: "https://file.hoi.io/" + key, responseType: "blob" }, success, error, context);
				return;
			} else {
				return;
			}
			
			request({ url: "https://file.hoi.io/" + key, data: data }, success, error, context);
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