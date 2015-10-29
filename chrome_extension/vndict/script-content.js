function tryConnectExtension(){
    extension.port = chrome.runtime.connect(extension.id);
    if (extension.port === null){
        extension.id = null;
        extension.port = null;
        return false;
    }
    console.log("connected to extension : "+extension.id);
    sendToExtension("message from content");
    extension.port.onMessage.addListener(onExtensionMessage);
    extension.port.onDisconnect.addListener(onExtensionDisconnected);
    return true;
}

function onExtensionMessage(event){
  console.log(event);
  switch(event.name){
    case CONNECTION_CHANGE:
      if(event.data === "ready")
        console.log("extension ready");
      break;
    case WORD_TRANSLATED:
      wordTranslatedHandler();
      break;
  }
}

function wordTranslatedHandler(){
  //Do something
}

function onExtensionDisconnected(){
  console.log(event);
  if(extension.id !== undefined)
    setTimeout(tryConnectExtension, 3000);
}

function sendToExtension(message){
    if (extension.port !== null){
        extension.port.postMessage(message);
    } else{
        sendErrorToWebPage("Extension is not connected. Message cannot be sent.");
    }
}

function initContentScript(){
  document.body.onclick = mouseClickHandler;
  document.body.ondblclick = mouseDbclickHandler;
  tryConnectExtension();
}

function mouseClickHandler(){
  if(clickTimeout === 0)
    clickTimeout = setTimeout(releaseUI,250);
}

function releaseUI(){
  console.log("releaseUI");
}

function mouseDbclickHandler(){
  console.log("mouseDbclickHandler");
  clearTimeout(clickTimeout);
  clickTimeout = 0;
  var lookupWord = getSelectedText();
  lookupWord = lookupWord.replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ");
  lookupWord = lookupWord.replace(/\s+/g, " ");
  if (lookupWord !== null) {
    console.log(lookupWord);
    var message = {};
    message.name = TRANSLATE_WORD;
    message.data = lookupWord;
    sendToExtension(message);
  }
}

function getSelectedText(){
    if(window.getSelection)
        return window.getSelection().toString();
    else if(document.getSelection)
        return document.getSelection();
    else if(document.selection)
        return document.selection.createRange().text;
    return "";
}

var clickTimeout = 0;
var extension = {};

if(!document.head.querySelector("meta[name=vnstreamg-com-chrome-extension]")){
  if (chrome.extension) {
    var e = chrome.extension.getURL("");
    extension.id = /(\w{32})/.exec(e)[0];
    var t = window.document.createElement("meta");
    t.setAttribute("name", "eMx-chrome-extension");
    t.setAttribute("id", extension.id);
    window.document.head.appendChild(t);
    initContentScript();
  }
}