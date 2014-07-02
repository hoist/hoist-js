module.exports = function(XHR) {
		XHR = XHR || require('xmlhttprequest').XMLHttpRequest;
		require('./src/hoist')(function(){
			return new XHR();
		});
};
