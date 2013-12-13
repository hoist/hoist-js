#hoist-js

##Setting the API Key

	Hoist.apiKey(apiKey);
	Hoist.config("apiKey", apiKey);

##Completion actions
[...] is short for [success, error, context], [success, error], [success, context], [success] or []. The json response is the first argument of the success callback.

##Membership

	//Test status (logged in or not)
	Hoist.status([...])
	//Log user in
	Hoist.login(member, [...])
	//Create account for user
	Hoist.signup(member, [...])

##Notifications

	Hoist.notify(id, data, [...])
	//or
	Hoist.notify({id: id, data: data}, [...])

##Data

	//Pass the model name to the Hoist contstructor
	var fish = Hoist("fish")
	//For the whole collection
	fish.get([...])
	//For one item by id
	fish.get(id, [...])
	//Will create if data doesn't have _id, or else update
	fish.post(data, [...])
	fish.post(id, data, [...])


##Multiple API Keys

If you need multiple instances of Hoist in order to use multiple keys, simply use clone to create a new object.

	var otherHoist = Hoist.clone();
	otherHoist.apiKey(apiKey);