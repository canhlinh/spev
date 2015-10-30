var MouseDblPoint = function (x,y) {
  this.x = x;
  this.y = y;
};

MouseDblPoint.prototype.setPoint = function(x,y){
  this.x = x;
  this.y = y;
};

MouseDblPoint.prototype.getMouseX = function(){
  return (this.x - 60)+"px";
};

MouseDblPoint.prototype.getMouseY = function(){
  return (this.y + 12) +"px";
};

if( typeof(ContentScript) === undefined) var ContentScript = {};

ContentScript = {
  Init: function(){
    this.clickTimeout = 0;
    this.extension = {};
    this.word = null;
    this.divId = "vsdict_div_extension";
    this.mousePoint = new MouseDblPoint(0,0);
    document.body.onclick = this.MouseClickHandler;
    document.body.ondblclick = this.MouseDbclickHandler;
    var e = chrome.extension.getURL("");
    this.extension.id = /(\w{32})/.exec(e)[0];
    var t = window.document.createElement("meta");
    t.setAttribute("name", "vnstreamg-com-chrome-extension");
    t.setAttribute("id", this.extension.id);
    window.document.head.appendChild(t);
    this.TryConnectExtension();
  },
  TryConnectExtension: function(){
      this.extension.port = chrome.runtime.connect(this.extension.id);
      if (this.extension.port === null){
          this.extension.id = null;
          this.extension.port = null;
          return false;
      }
      console.log("connected to extension : "+this.extension.id);
      this.extension.port.onMessage.addListener(this.ExtensionMessageHandler);
      this.extension.port.onDisconnect.addListener(this.ExtensionDisconnectedHandler);
      return true;
  },
  ExtensionMessageHandler: function(event){
    console.log(event);
    switch(event.name){
      case CONNECTION_CHANGE:
        //do something
        break;
      case WORD_TRANSLATED:
        ContentScript.WordTranslatedHandler(event.data.result.meanings);
        break;
    }
  },
  WordTranslatedHandler: function(result){
    this.ShowDivTranslateUI(result);
  },
  ExtensionDisconnectedHandler: function(){
    console.log(event);
    if(this.extension.id !== undefined)
      setTimeout(this.TryConnectExtension, 3000);
  },
  SendToExtension: function(message){
      if (this.extension.port !== null){
          this.extension.port.postMessage(message);
      } else{
          console.log("Extension is not connected. Message cannot be sent.");
      }
  },
  MouseClickHandler: function(event){
    if(ContentScript.clickTimeout === 0)
      ContentScript.clickTimeout = setTimeout(ContentScript.ReleaseUI,250);
  },
  ReleaseUI: function(){
    console.log("release UI");
    var div = document.getElementById(ContentScript.divId);
    if(div !== null)
      document.body.removeChild(div);
  },
  MouseDbclickHandler: function(event){
    ContentScript.ReleaseUI();
    clearTimeout(ContentScript.clickTimeout);
    ContentScript.clickTimeout = 0;
    var lookupWord = ContentScript.GetSelectedText();
    lookupWord = lookupWord.replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ");
    lookupWord = lookupWord.replace(/\s+/g, " ");
    if (lookupWord !== null) {
      console.log(lookupWord);
      ContentScript.mousePoint.setPoint(event.pageX , event.pageY);
      var message = {};
      message.name = TRANSLATE_WORD;
      message.data = lookupWord;
      ContentScript.SendToExtension(message);
    }
  },
  GetSelectedText: function(){
      if(window.getSelection)
          return window.getSelection().toString();
      else if(document.getSelection)
          return document.getSelection();
      else if(document.selection)
          return document.selection.createRange().text;
      return "";
  },
  ShowDivTranslateUI: function(tWord){
    var div = document.createElement("div");
    div.id = this.divId;
    div.className = "vsdict_div";
    div.style.top = this.mousePoint.getMouseY();
    div.style.left = this.mousePoint.getMouseX();
    div.innerHTML = tWord;
    document.body.appendChild(div);
  }
};

if(!document.head.querySelector("meta[name=vnstreamg-com-chrome-extension]")){
  if (chrome.extension) {
    ContentScript.Init();
  }
}