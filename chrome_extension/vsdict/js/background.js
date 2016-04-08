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
        self.GetWordFromVnStreaming(event.data);
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

  this.GetWordFromVnStreaming = function(word){
    var xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState == 4 && xhr.status == 200)
        {
          if(xhr.response !== null){
            var result = {};
            result = xhr.response;
            result.type = VSAPI;
            self.ResponseWordTranslateHandler(word, result);
          }else {
            self.GetWordFromGoogle(word);
          }
        }
    };
    xhr.open("GET", VNSTREAM_API + "?word="+word);
    xhr.send(null);
  };

  this.GetWordFromGoogle = function(word){
    var xhr = new XMLHttpRequest();
    xhr.responseType = "text";
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState == 4 && xhr.status == 200)
        {
          if(xhr.responseText !== null){
            var respone = xhr.responseText;
            var json = respone.split('"');
            var result = {};
            result.meanings = json[1];
            result.phonetic = "";
            result.type = GAPI;
            self.ResponseWordTranslateHandler(word, result);
          }
        }
    };
    xhr.open("GET", GOOGLE_API+encodeURI(word));
    xhr.send();
  };

  chrome.runtime.onConnect.addListener(this.PortConnectedHandler);
  chrome.runtime.onConnectExternal.addListener(this.PortConnectedHandler);
}
new EnViExtension();
