function Card(){
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
}

Card.prototype.getUI= function(){
  return this.ui;
};

Card.prototype.showAddButton = function(event){
   var target = event.target ? event.target : event.srcElement;
  if(target.tagName == "DIV" ){
    target.children[0].style.display = "block";
  }
};

Card.prototype.hideAddButton = function(){
   var target = event.target ? event.target : event.srcElement;
  if(target.tagName == "DIV" ){
    target.children[0].style.display = "none";
    target.children[1].style.display = "none";
  }
};

Card.prototype.deleteNote = function(event){
  var target = event.target ? event.target : event.srcElement;
  if(target.tagName == "BUTTON" ){
    document.body.removeChild(target.parentElement);
  }
};

Card.prototype.add = function(){
  this.nextNote = new Card();
};

Card.prototype.save = function(value){
  
};

Card.prototype.overturn = function(){
  
};

Card.prototype.mouseOver = function(){
  
};

Card.prototype.mouseOut = function(){
  
};

Object.defineProperty(this,"CardManager",{
  writable: false,
  value: Object.freeze( {
    cards: [],
    Init: function(){
      var card = new Card();
      this.AddCard(card);
    },
    CheckLogin: function(){
      
    },
    AddCard: function(card){
      this.cards.push(card);
      this.UpdateCard();
    },
    DelCard: function(){
      
    },
    UpdateCard: function(){
      console.log("number of card: "+this.cards.length);
    },
    UIprocessor: function(){
      
    }
  })
});

window.onload = init;
window.noteList = [];
function init(){
  CardManager.Init();
}