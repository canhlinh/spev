chrome.runtime.onConnect.addListener(onPortConnected);
chrome.runtime.onConnectExternal.addListener(onPortConnected);
function onPortConnected(port){
	self.contentScriptPort = port;
	port.onDisconnect.addListener(function (){
		self.contentScriptPort = null;
		if (self.nativeHostPort){
			self.onNMHostDisconnected("");
		}
	});
	port.onMessage.addListener(function (message){
		var functionToCall = self[message.command];
		if (functionToCall === undefined || functionToCall === null){
			self.errorToContentScript("Extension received unknown message: " + JSON.stringify(message));
			return;
		}
		functionToCall(message);
	});
}

this.messageToContentScript = function(cookie, name, data){
	if (null === self.contentScriptPort){
	  return;
	}
	self.contentScriptPort.postMessage({ 'cookie': cookie, 'command': name, 'data': data });
};