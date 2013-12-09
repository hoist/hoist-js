var Hoist = (function (u) {
	var configs = {},
		user,
		toString = Object.prototype.toString;
		
	function extend(into, from) {
		for (var x in from) into[x] = from[x];
	}
	
	function classOf(data) {
		return toString.call(data).slice(8, -1);
	}
	
	// ajax helper
	
	function request(url, data, success, error, context) {
		var type = classOf(data),
			method,
			contentType;
		
		if (type === "Object") {
			method = "POST";
			contentType = "application/json";
			data = JSON.stringify(data);
		} else if (type === "String") {
			method = "POST";
			contentType = "application/json";
		} else if (type === "FormData") {
			method = "POST";
			contentType = "multipart/form-data";
		} else if (type === "File") {
			method = "POST";
			contentType = data.type;
		} else {
			method = "GET";
			context = error;
			error = success;
			success = data;
			data = null;
		}
		
		if (typeof error !== "function") {
			context = error;
			error = null;
		}
		
		if (!configs.apikey) {
			error && setTimeout(function () {
				error.call(context, "API key not set", null); 
			}, 0);
		}
		
		var xhr = new XMLHttpRequest();
		
		xhr.open(method, url);
		
		if (method === "POST") {
			xhr.setRequestHeader("Content-Type", contentType);
		}
		
		xhr.setRequestHeader("Authorization", "Hoist " + configs.apikey);
		
		xhr.withCredentials = true;
		
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 300) {
					success && success.call(context, JSON.parse(xhr.responseText), xhr);
				} else {
					error && error.call(context, xhr.statusText, xhr);
				}
			}
		};
		
		xhr.send(data);
	}
	
	var managers = {};
	
	function DataManager(type) {
		this.type = type;
		this.url = "https://data.hoi.io/" + type;
	}
	
	extend(DataManager.prototype, {
		get: function (id, success, error, context) {
			if (typeof id === "function") {
				context = error;
				error = success;
				success = id;
				
				request(this.url, success, error, context);
			} else {
				request(this.url + "/" + id, success, error, context);
			}
		},
		
		post: function (id, data, success, error, context) {
			if (typeof id === "object") {
				context = error;
				error = success;
				success = data;
				data = id;
				
				if (data.x_id) {
					id = data.x_id;
				} else {
					request(this.url, data, success, error, context);
					return;
				}
			}
			
			request(this.url + "/" + id, data, success, error, context);
		}
	});

	Hoist = function (type) {
		return managers[type] || (managers[type] = new DataManager(type));
	};
	
	extend(Hoist, {
		apiKey: function (v) {
			return this.config("apikey", v);
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
			request("https://auth.hoi.io/status", success, error, context);
		},
		
		signup: function (member, success, error, context) {
			if (typeof member === "object") {
				request("https://auth.hoi.io/user", member, function (resp) {
					user = resp;
					success.apply(this, arguments);
				}, error, context);
			}
		},
		
		login: function (member, success, error, context) {
			if (typeof member === "object") {
				request("https://auth.hoi.io/login", member, function (resp) {
					user = resp;
					success.apply(this, arguments);
				}, error, context);
			}
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
				request("https://notify.hoi.io/notification/" + id, data, success, error, context);
			}
		},
		
		file: function (key, file, success, error, context) {
			if (file.jQuery) file = file[0];
		
			var type = classOf(file),
				data;
			
			if (type === "File") {
				data = new FormData();
				data.append("FILE", file);
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
			
				request("https://file.hoi.io/" + key, success, error, context);
				return;
			} else if (type === "Undefined") {
				request("https://file.hoi.io/" + key, success, error, context);
				return;
			} else {
				return;
			}
			
			request("https://file.hoi.io/" + key, data, success, error, context);
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