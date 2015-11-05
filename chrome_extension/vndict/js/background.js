function EnViExtension(){
  var self = this;
  self.contentScriptPort = null;
  
  this.PortConnectedHandler = function(port){
  	self.contentScriptPort = port;
  	port.onDisconnect.addListener(function (){
  		self.contentScriptPort = null;
  	});
  	port.onMessage.addListener(self.MessageContentHandler);
    var message = {};
    message.name = CONNECTION_CHANGE;
    message.data = "Hey boss, TS ready";
    self.SendMessageToContent(message);
  };
  
  this.SendMessageToContent = function(message){
  	if (self.contentScriptPort === null){
  	  return;
  	}
  	self.contentScriptPort.postMessage(message);
  };
  
  this.MessageContentHandler = function(event){
    console.log(event);
    var mName = event.name;
    switch(mName){
      case TRANSLATE_WORD:
        self.GetWordFromServer(event.data, self.ResponseWordTranslateHandler);
        break;
    }
  };
  
  this.ResponseWordTranslateHandler = function(word, result) {
    var message = {};
    message.name = WORD_TRANSLATED;
    message.data = {};
    message.data.result = result;
    message.data.word = word;
    this.SendMessageToContent(message);
  };
  
  this.GetWordFromServer = function(word){
    var xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState == 4 && xhr.status == 200)
        {
          if(xhr.response !== null){
            self.ResponseWordTranslateHandler(word, xhr.response.result);
          }
        }
    }; 
    xhr.open("GET", "http://vnstreaming.com/vndict/api/searchEV?word="+word);
    xhr.send();
  };
  
  chrome.runtime.onConnect.addListener(this.PortConnectedHandler);
  chrome.runtime.onConnectExternal.addListener(this.PortConnectedHandler);
}
new EnViExtension();