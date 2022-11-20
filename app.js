//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-aj:king1111@beginnercluster.06uvcac.mongodb.net/todolistDB",{useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist"
});

const item2 = new Item({
  name: "item number 2"
});
const item3 = new Item({
  name: "item number 3"
});

const defaultItems = [item1, item2, item3];




Item.insertMany(defaultItems, function(err){
  if(err){
    console.log(err);
  }
  else{
    console.log("Successfully saved default items to DB");
  }
});

///////////////////////////////////////////////////////////////////////////////
//LIST itemsSchema
const listSchema ={
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);




//Home get request


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully saved default items to DB.");
      }
    });
    res.redirect("/")
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});

  }

  });

});

// get request for new parameters
app.get("/:customListName" ,function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/"+ customListName);

      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});

      }
    }

  });


});



// POST REQUESTS
// HOME POST REQUEST


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName  === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }


});



// DELETE POST REQUEST


app.post("/delete", function(req, res){
  const checker = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checker, function(err){
      if(!err){
        console.log("Deleted");
        res.redirect("/");

      }

    });
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: checker}}}, function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }


});


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
