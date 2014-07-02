module.exports = function(XHR) {
		XHR = XHR || require('xmlhttprequest').XMLHttpRequest;
		return require('./src/hoist')(function(){
			return new XHR();
		});
};
