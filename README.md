#Hoist Javascript Library

##Setting the api key

The library must be given the api key for your application before any other actions are performed. This can be done in either of the following ways:

	Hoist.apiKey(apiKey);
	Hoist.config("apiKey", apiKey);
	
You might want to be able to talk to multiple Hoist applications. In this case, you should call `Hoist.clone()` and set the api key for the new copy:

	var OtherHoist = Hoist.clone();
	OtherHoist.apiKey(otherApiKey);

##Callback syntax

Calls to the Hoist api are by nature asynchronous. All methods provided by the client library take a `success` callback (which will be called with the response passed as the first argument). an `error` callback (which will be called with an error message), and an optional value to be used as the `context` when these functions are called.

The raw XMLHttpRequest object is always passed as the second argument, if you're into that sort of thing.

In the api methods listed below, the argument list can be terminated with any of the following:

- `success, error, context`
- `success, error`
- `success, context`
- `success`
- &#248;

##Membership

Use `Hoist.status(…)` to check whether the user is logged in:

	Hoist.status(function (user) {
		console.log("Logged in as user with id " user.id);
	}, function () {
		console.log("Truly I tell you, I do not know you.");
	});

To log the user in or to create a new user, use the following, respectively:

	Hoist.login({ email: "bob@invalid", password: "password"}, …)
	Hoist.signup({ email: "bob@invalid", password: "password"}, …)
	
After any of these methods has been successfully called, the library will remember the user object returned. This can be accessed by calling `Hoist.user()`.

##Data

The data methods can be used in two ways. A "data manager" can be created by passing a model type to the Hoist function, and then the methods can be called on the resulting object:

	var projects = Hoist("project");
	
	// get all projects

	projects.get(function (data) {
		console.log("Got " + data.length + " projects");
	});
	
	// get a single project by id
	
	projects.get(projectId, function (data) {
	
	});
	
	// save an object; the object returned will have an _id parameter.
	// anything passed to this method with an _id parameter will
	// overwriting the object with the given id.
	
	projects.post({
		name: "Cool Project",
		coolness: "Very Cool"
	}, function (data) {
		console.log("Project " + data.name + " has been saved with id " + data._id);
	});
	
	// save an object by id
	
	projects.post("cool-project", {
		name: "Cool Project",
		coolness: "Super Cool"
	});
	
	// delete all projects
	
	projects.clear(function () {
		console.log("No more projects.");
	});
	
	// delete a single project
	
	projects.remove("cool-project", function () {
		console.log("no more cool project.");
	});
	
A shorthand can be used if you have no need for the "data manager" pattern:

	Hoist.get(modelType, id, …)
	Hoist.post(modelType, id, data, …)
	Hoist.post(modelType, data, …)
	Hoist.clear(modelType, …)
	Hoist.remove(modelType, id, …)

##File

To upload a file, call `Hoist.file(id, file, …)` with an id for the file, where `file` can be any of the following:

- A `File` object
- An HTML file input element
- A jQuery wrapper HTML file input element
- A `FormData` object (this must be in the format required by the Hoist api)

To retrieve a file, call `Hoist.file(id, …)`. The response will be a javascript `Blob` object.

##Notifications

To send the notification with template id `id`, populated with the data `data`, use either of the following:

	Hoist.notify(id, data, …)
	Hoist.notify({id: id, data: data}, …)
