function MouseDblPoint(x,y) {
  this.x = x;
  this.y = y;
}

MouseDblPoint.prototype.setPoint = function(x,y){
  this.x = x;
  this.y = y;
};

MouseDblPoint.prototype.getMouseX = function(){
  return this.x;
};

MouseDblPoint.prototype.getMouseY = function(){
  return (this.y + 12);
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
    //document.body.onclick = this.MouseClickHandler.bind(this);
    document.body.ondblclick = this.MouseDbclickHandler.bind(this);
    document.body.onmouseup = this.MouseUpHandler.bind(this);
    document.body.onmousedown = this.MouseDownHandler.bind(this);
    document.body.onmousewheel = this.MouseDownHandler.bind(this);
    window.onfocus = this.PageActiveEventHandler.bind(this);
    window.onblur = this.PageDeactiveEventHandler.bind(this);
    var e = chrome.extension.getURL("");
    this.extension.id = /(\w{32})/.exec(e)[0];
    var t = window.document.createElement("meta");
    t.setAttribute("name", HEADER_META);
    t.setAttribute("id", this.extension.id);
    window.document.head.appendChild(t);
    this.div = document.createElement("div");
    this.div.id = DIV_RS_UI;
    this.div.className = DIV_RS_CSS;
    this.div.addEventListener("DOMNodeInserted", this.DivloadedHandler.bind(this));
    this.TryConnectExtension();
  },
  DivloadedHandler: function(event) {
    var w = this.div.offsetWidth;
    if(w !== 0) {
      this.div.style.left = (this.mousePoint.getMouseX() - (w/2)) + "px";
    }
  },
  PageActiveEventHandler: function(){
    if(this.extension.port === null || this.extension.port === undefined)
      this.TryConnectExtension();
  },
  PageDeactiveEventHandler: function(){
    if(this.extension.port !== null && this.extension.port !== undefined){
      this.extension.port.disconnect();
      this.extension.port = null;
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
      this.extension.port.onMessage.addListener(this.ExtensionMessageHandler.bind(this));
      this.extension.port.onDisconnect.addListener(this.ExtensionDisconnectedHandler.bind(this));
      return true;
  },
  ExtensionMessageHandler: function(event){
    switch(event.name){
      case CONNECTION_CHANGE:
        console.log(event.data);
        break;
      case WORD_TRANSLATED:
        this.WordTranslatedHandler(event.data.result);
        break;
    }
  },
  WordTranslatedHandler: function(result){
    var dContent = this.GetDivFromResult(result);
    this.ShowDivTranslateUI(dContent);
  },
  ExtensionDisconnectedHandler: function(){
    console.log("disconnected");
    this.extension.id = null;
    this.extension.port = null;
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
    if(this.mouseupTime - this.mousedownTime > 500) {
      this.DetectTranslateContent(event);
    }
    event.preventDefault();
  },
  MouseDownHandler: function(event) {
    var right = false;
    if(event.which === 3) {
      right = true;
    }
    this.ReleaseUI(right);
    this.mousedownTime = new Date().getTime();
  },
  MouseClickHandler: function(event) {
    //@FIXME: I'm checking click event
    if(this.clickTimeout === 0 && (this.mouseupTime - this.mousedownTime < 1000))
      this.clickTimeout = setTimeout(this.ReleaseUI.bind(this), 200);
  },
  ReleaseUI: function(isRightMouse) {
    if(!isRightMouse) {
      if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
      } else if (document.selection) {  // IE?
        document.selection.empty();
      }
    }
    var div = document.getElementById(DIV_RS_UI);
    if(div !== null)
      document.body.removeChild(div);
  },
  MouseDbclickHandler: function(event){
    this.DetectTranslateContent(event);
  },
  DetectTranslateContent: function(event) {
    clearTimeout(this.clickTimeout);
    this.clickTimeout = 0;
    var lookupWord = this.GetSelectedText();
    lookupWord = lookupWord.replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ");
    lookupWord = lookupWord.replace(/\s+/g, " ");
    if (lookupWord !== null && lookupWord !== " " && lookupWord !== "") {
      this.mousePoint.setPoint(event.clientX , event.clientY);
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
    this.div.style.top = this.mousePoint.getMouseY() + "px";
    this.div.style.left = this.mousePoint.getMouseX() + "px";
    this.div.innerHTML = dContent;
    document.body.appendChild(this.div);
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
          // Not used
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