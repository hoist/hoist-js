#Hoist Javascript Library

##Setting the api key

The library must be given the api key for your application before any other actions are performed. This can be done in either of the following ways:

	Hoist.apiKey(apiKey);
	Hoist.config("apiKey", apiKey);
	
When your app is hosted on Hoist (as even-cushion.app.hoi.io, say), it has an endpoint /settings which knows the api key and the current environment. To read from the endpoint and set the Hoist config automatically, you can simply call

	Hoist.config(…)
	
providing a callback as discussed below. You may find it useful to create a json file called settings in your development environment to mimic this behaviour.

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

Any method that takes these callbacks will also return a Promises/A+ conforming promise. (If for some strange reason you are mixing these two conventions, the callback in the argument will be called before any callbacks attached to the promise.)

##Identity

Use `Hoist.status(…)` to check whether the user is logged in:

	Hoist.status(function (user) {
		console.log("Logged in as user with id " user.id);
	}, function () {
		console.log("Truly I tell you, I do not know you.");
	});

To log the user in or out or to create a new user, use the following, respectively:

	Hoist.login({ email: "bob@invalid", password: "password"}, …)
	Hoist.logout(…)
	Hoist.signup({ email: "bob@invalid", password: "password"}, …)

After any of these methods has been successfully called, the library will remember the user object returned. This can be accessed by calling `Hoist.user()`.

###Social Signup/Login
####To sign up new users with Google / Facebook

POST /user
	{"provider" : "facebook" | "google" }

returns

	{"redirectUrl": <some url> }

You should then redirect to that URL to complete the signup process; the user will then go to login / accept the
permissions on the provider website (both services request access to the users Email Address).

If the user accepts the permissions then they will be redirected to the origin of the /user call with the query string ?create=true
If the user refuses, then it will redirect to the origin of the call with the query string ?create=false

They will be logged in on the return if successful

####To login with Google / Facebook

POST /login

	{"provider" : "facebook" | "google" }

returns

	{"redirectUrl": <some url> }

You should then redirect to that Url

The user will then go to login / accept the permissions on the provider (both request access to the users Email Address)

If the user accepts the permissions then they will be redirected to the origin of the /user call with the query string ?login=true
If the user refuses then it will redirect to the orgin of the call with the query string ?login=false

NOTE: You are expected to redirect from the /login or /user in a timely fashion as the redirect contains a time sensitive token.

##Data

The data methods can be used in two ways. A "data manager" can be created by passing a model type to the Hoist
function, and then the methods can be called on the resulting object:

	var projects = Hoist("project");

	// get all projects

	projects.get(function (data) {
		console.log("Got " + data.length + " projects");
	});

	// get a single project by id

	projects.get(projectId, function (data) {

	});

	// save an object; the object returned will have an _id parameter.
	// anything passed to this method with an _id parameter will overwrite
	// the object with the given id.

	// You can post multiple objects by passing an array instead.

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
	
### Queries

The query represented by a data manager can be made more specific by using LINQ-style method chaining to add
where clauses, sorting and paging:

	Hoist("article").limit(10).skip(50).get(…) // return at most 10 articles and skip the first 50
	Hoist("person").sortBy("LastName", "FirstName asc").thenBy("DateOfBirth desc").get(…) // sort by properties
	Hoist("person").where("LastName").equals("Morrison").get(…) // where clauses
	
The predicates supported in where clauses (like `equals` in the last example above) are as follows:

- `equals`, `is` or `eq`: test equality
- `notEquals`, `isnt`, `neq` or `ne`: not equal
- `greaterThan` or `gt`: greater than
- `atLeast`, `gte` or `ge`: greater than or equal
- `lessThan` or `lt`: less than
- `atMost`, `lte` or `le`: less than or equal
- `elem` or `in`: test containment in an array
- `notElem`, `notIn`, `nelem` or `nin`: test non-containment
- `exists`: test property existence

At the moment the query manager object returned by these methods only supports the `get()` and `use()` methods.

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

## Switching buckets

Hoist provides buckets to allow different members access to different data. When the member logs in, they
start out in the default bucket. Use the following method to list the buckets the current member has access to.

	Hoist.bucket.list(…)

Use one of the following to create a new bucket, with key `key` and attached metadata `meta`. The bucket created
will be owned by the current user.

	Hoist.bucket.post(key, meta, …)
	Hoist.bucket(key, meta, …)

To update the metadata of the bucket with a given key, call the following:

	Hoist.bucket.meta(key, meta, …)

To set the current bucket, use one of

	Hoist.bucket.set(key, …)
	Hoist.bucket(key, …)

where `key` is the key for the bucket that you want to enter, or `null` for the default bucket.

To check what bucket the member is currently in, use one of the following. The `success` callback will be called
with the current bucket if there is one; otherwise the `error` callback will be called.

	Hoist.bucket.status(…)
	Hoist.bucket(…)

Once you're in a bucket, you can use the following to set the metadata of the current bucket.

	Hoist.bucket(meta, …)

After the bucket is set or the status is checked, the library will remember the current bucket with its metadata.
You can simply call `Hoist.bucket()` to get it. (Note that calling `Hoist.bucket()` without arguments does not return a promised call to get the bucket status. You must use the long form `Hoist.bucket.status()` in this case.)

Finally, to invite a user to the current bucket, do:

	Hoist.bucket.invite({ "email": "boris@daspem.com" }, …)
	
Many times it doesn't make sense to rely on state on the server to remember which bucket you're in. To get a
Hoist data manager whose calls are always scoped to a given bucket, use the `use()` method as in the following:

	var bucketHoist = Hoist.use("my-bucket-key");
	
	bucketHoist.get(…); // works as above for Hoist.get
	bucketHoist.post(…);
	bucketHoist.clear(…);
	bucketHoist.remove(…);
	
	bucketHoist.meta(data, …); // post metadata against this bucket
	bucketHoist.enter(…);
	
	var modelTypeManager = Hoist("model-type").use("bucket-key"); // or bucketHoist("model-type");
	
	modelTypeManager.get(…); // work as above for data managers
	modelTypeManager.post(…);
	modelTypeManager.clear(…);
	modelTypeManager.remove(…);

## Aggregating data calls

If your project is of a decent size, you will probably find that on page load you are getting a bunch of models of
different types in a fairly straightforward fashion. Instead of nesting a bunch of callbacks, you can provide the
`Hoist` function with a hash instead of a model type. For example, if you want to load all models of type "article"
and "section", you can use:

	Hoist({
		articles: "article",
		sections: "section"
	}).get(function (data) {
		doArticleStuff(data.articles);
		doSectionStuff(data.sections);
	});

Single models can be retrieved in this way by setting the value in the hash to be the model type and the model id,s
eparated by a space:

	Hoist.get({
		membership: "membership 63688436-9bd4-4fc6-8c2c-ab3398ec2961",
		companies: "company"
	}, function (data) {
		// do the things
	});

If the type or id of one model being retrieved depends on the property of another, use square brackets to indicate
these dependencies, and the library will make sure to request the data in the right order, then swap out the tags
before making the calls. You can also provide a string (accessible as `[id]`) or hash (accessible through its
property names) as the first argument of the `get(…)` function as additional context. This allows things like:

	var allData = Hoist({
		membership: "membership [id]",
		company: "company [membership.companyId]",
		employees: "[company._id]-employee"
	});

	Hoist.status(function (user) {
		allData.get(user, function (data) {
		  // do the things
		});
	});
