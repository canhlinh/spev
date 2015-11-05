function Note(){
  this.word = null;
  this.phonetic = null;
  this.meanings = null;
  this.nextNote = {};
  this.presNote = {};
  this.ui = document.createElement("div");
  this.ui.className = "note";
  
  this.addBtn = document.createElement("button");
  this.addBtn.onclick = this.add;
  this.addBtn.innerHTML = "Add";
  this.addBtn.className = "noteAddButton";
  this.ui.appendChild(this.addBtn);
  
  this.delBtn = document.createElement("button");
  this.delBtn.onclick = this.deleteNote;
  this.delBtn.innerHTML = "Del";
  this.delBtn.className = "noteDelButton";
  this.ui.appendChild(this.delBtn);
  
  this.textArea = document.createElement("textarea");
  this.textArea.className = "noteTextArea";
  this.ui.appendChild(this.textArea);
  
  this.ui.onmouseenter = this.showAddButton;
  this.ui.onmouseleave = this.hideAddButton;
  this.ui.note = this;
  document.body.appendChild(this.ui);
  noteList.push(this);
}

Note.prototype.getUI= function(){
  return this.ui;
};

Note.prototype.showAddButton = function(event){
   var target = event.target ? event.target : event.srcElement;
  if(target.tagName == "DIV" ){
    target.children[0].style.display = "block";
    if(noteList.length > 1)
    target.children[1].style.display = "block";
  }
};

Note.prototype.hideAddButton = function(){
   var target = event.target ? event.target : event.srcElement;
  if(target.tagName == "DIV" ){
    target.children[0].style.display = "none";
    target.children[1].style.display = "none";
  }
};

Note.prototype.deleteNote = function(event){
  var target = event.target ? event.target : event.srcElement;
  if(target.tagName == "BUTTON" ){
    document.body.removeChild(target.parentElement);
  }
};

Note.prototype.add = function(){
  this.nextNote = new Note();
};

Note.prototype.save = function(value){
  
};

Note.prototype.overturn = function(){
  
};

Note.prototype.mouseOver = function(){
  
};

Note.prototype.mouseOut = function(){
  
};

window.onload = init;
window.noteList = [];
function init(){
  new Note();
}