function MouseDblPoint(x,y) {
  this.x = x;
  this.y = y;
}

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
    this.mousedownTime = 0;
    this.mouseupTime = 0;
    this.extension = {};
    this.word = null;
    this.mousePoint = new MouseDblPoint(0,0);
    document.body.onclick = this.MouseClickHandler.bind(this);
    document.body.ondblclick = this.MouseDbclickHandler.bind(this);
    document.body.onmouseup = this.MouseUpHandler.bind(this);
    document.body.onmousedown = this.MouseDownHandler.bind(this);
    window.onfocus = this.PageActiveEventHandler;
    window.onblur = this.PageDeactiveEventHandler;
    var e = chrome.extension.getURL("");
    this.extension.id = /(\w{32})/.exec(e)[0];
    var t = window.document.createElement("meta");
    t.setAttribute("name", HEADER_META);
    t.setAttribute("id", this.extension.id);
    window.document.head.appendChild(t);
    this.TryConnectExtension();
  },
  PageActiveEventHandler: function(){
    if(ContentScript.extension.port === null)
      ContentScript.TryConnectExtension();
  },
  PageDeactiveEventHandler: function(){
    if(ContentScript.extension.port !== null){
      ContentScript.extension.port.disconnect();
      ContentScript.extension.port = null;
    }
  },
  TryConnectExtension: function(){
      this.extension.port = chrome.runtime.connect(this.extension.id);
      if (this.extension.port === null){
        this.extension.id = null;
        this.extension.port = null;
        return false;
      }
      //console.log("connected to extension : "+this.extension.id);
      this.extension.port.onMessage.addListener(this.ExtensionMessageHandler);
      this.extension.port.onDisconnect.addListener(this.ExtensionDisconnectedHandler);
      return true;
  },
  ExtensionMessageHandler: function(event){
    switch(event.name){
      case CONNECTION_CHANGE:
        console.log(event.data);
        break;
      case WORD_TRANSLATED:
        ContentScript.WordTranslatedHandler(event.data.result);
        break;
    }
  },
  WordTranslatedHandler: function(result){
    var dContent = this.GetDivFromResult(result);
    this.ShowDivTranslateUI(dContent);
  },
  ExtensionDisconnectedHandler: function(){
    console.log("disconnected");
  },
  SendToExtension: function(message){
    if (this.extension.port !== null){
        this.extension.port.postMessage(message);
    } else{
        console.log("Extension is not connected. Message cannot be sent.");
    }
  },
  MouseUpHandler: function(event) {
    this.mouseupTime = new Date().getTime();
    if(this.mouseupTime - this.mousedownTime > 1000) {
      this.DetectTranslateContent(event);
    }
    event.preventDefault();
  },
  MouseDownHandler: function(event) {
    this.mousedownTime = new Date().getTime();
  },
  MouseClickHandler: function(event){
    if(this.clickTimeout === 0 && (this.mouseupTime - this.mousedownTime < 1000))
      this.clickTimeout = setTimeout(this.ReleaseUI.bind(this), 200);
  },
  ReleaseUI: function(){
    var div = document.getElementById(DIV_RS_UI);
    if(div !== null)
      document.body.removeChild(div);
  },
  MouseDbclickHandler: function(event){
    this.DetectTranslateContent(event);
  },
  DetectTranslateContent: function(event) {
    this.ReleaseUI();
    clearTimeout(this.clickTimeout);
    this.clickTimeout = 0;
    var lookupWord = this.GetSelectedText();
    lookupWord = lookupWord.replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ");
    lookupWord = lookupWord.replace(/\s+/g, " ");
    if (lookupWord !== null) {
      //console.log(lookupWord);
      this.mousePoint.setPoint(event.pageX , event.pageY);
      var message = {};
      message.name = TRANSLATE_WORD;
      message.data = lookupWord;
      this.SendToExtension(message);
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
  ShowDivTranslateUI: function(dContent){
    var div = document.createElement("div");
    div.id = DIV_RS_UI;
    div.className = DIV_RS_CSS;
    div.style.top = this.mousePoint.getMouseY();
    div.style.left = this.mousePoint.getMouseX();
	  div.style.position = "absolute";
    div.innerHTML = dContent;
    document.body.appendChild(div);
  },
  GetDivFromResult: function(result){
    var type = result.type;
    var phonetic = result.phonetic;
    var meanings = result.meanings;
    if(type == GAPI) {
      return this.CreatePtag(meanings);
    }
    var arrayOfStrings = meanings.split("\n");
    var div = this.CreatePtag("/"+phonetic+"/",0);
    for(var i = 0; i < arrayOfStrings.length; i++){
      var pText = arrayOfStrings[i];
      var fChar = pText.charAt(0);
      switch(fChar){
        case "*":
          pText = pText.substr(1);
          div +=  this.CreateBPtag(pText);
          break;
        case "-":
          div +=  this.CreatePtag(pText,1);
          break;
        case "=":
          pText = pText.replace("=","vd: ");
          //div +=  this.CreatePtag(pText,20);
          break;
      }
    }
    return div;
  },
  CreatePtag: function(value, px){
    return "<p style='margin-left: "+ px + "px;margin-bottom: 0px;margin-top: 0px;'>"+value+"</p>";
  },
  CreateBPtag: function(value){
    return "<p style='font-weight: bold;margin-bottom: 0px;margin-top: 0px;'>"+value+"</p>";
  }
};

if(!document.head.querySelector("meta[name="+HEADER_META+"]")){
  if (chrome.extension) {
    ContentScript.Init();
  }
}