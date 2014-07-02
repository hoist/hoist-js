var chai = require('chai');
chai.use(require('chai-as-promised'));

var fs = require('fs');
var Glob = require("glob").Glob;
var match = new Glob("./tests/*/*.js", {
	sync: true
});


match.found.forEach(function(file) {
	console.log("requiring ", file);
	require(fs.realpathSync(file));
});
