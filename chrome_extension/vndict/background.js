function onPortConnected(port){
	contentScriptPort = port;
	port.onDisconnect.addListener(function (){
		contentScriptPort = null;
	});
	port.onMessage.addListener(messageContentHandler);
  sendMessageToContent("Message from extension : Hey boss, i'm ready");
}

function sendMessageToContent(message){
	if (self.contentScriptPort === null){
	  return;
	}
	contentScriptPort.postMessage(message);
}

function messageContentHandler(event){
  console.log(event);
  var mName = event.name;
  switch(mName){
    case TRANSLATE_WORD:
      getWordFromServer(event.data, responseWordTranslateHandler);
      break;
  }
}

function responseWordTranslateHandler (word, result) {
  var message = {};
  message.name = WORD_TRANSLATED;
  message.data = {};
  message.data.result = result;
  message.data.word = word;
  sendMessageToContent(message);
}

function getWordFromServer(word){
  var xhr = new XMLHttpRequest();
  xhr.responseType = "json";
  xhr.onreadystatechange = function()
  {
      if (xhr.readyState == 4 && xhr.status == 200)
      {
        if(this.response !== null){
          responseWordTranslateHandler(word, this.response.result);
        }
      }
  }; 
  xhr.open("GET", "http://vnstreaming.com/vndict/api/searchEV?word="+word);
  xhr.send();
}

var contentScriptPort = {};

chrome.runtime.onConnect.addListener(onPortConnected);
chrome.runtime.onConnectExternal.addListener(onPortConnected);