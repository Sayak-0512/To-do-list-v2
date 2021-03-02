//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _=require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDb",{ useNewUrlParser: true ,useUnifiedTopology: true,useFindAndModify: false });
const todolistSchema=mongoose.Schema({
  name: String
});
const listSchema=mongoose.Schema({
  name: String,
  startingArray: [todolistSchema]
});
const List=mongoose.model("List",listSchema);
const ListItem=mongoose.model("ListItem",todolistSchema);
const item1=new ListItem({
  name: "Morning walk"
});
const item2=new ListItem({
  name:"Cook"
});
const item3=new ListItem({
  name: "Eat food"
});





app.get("/", function(req, res) {

  ListItem.find({},function(err, result){
    if(result.length===0)
    {
      ListItem.insertMany([item1,item2,item3],function(err){
        if(err)
        console.log(err);
        else
        console.log("Successfully inserted all the items");
      });
        res.redirect("/");
    }
    else
    {
        res.render("list", {listTitle: "Today", newListItems: result});
    }
  })



});

app.post("/", function(req, res){

  const item = req.body.newItem;
const itemTitle=req.body.list;
const newitem=new ListItem({
  name: item
})
if(itemTitle==="Today")
{
  newitem.save();
    res.redirect("/");
}
else
{
  List.findOne({name: itemTitle },function(err, result){
    if(!err)
    result.startingArray.push(newitem);
    result.save();
  res.redirect("/"+itemTitle);
  })

}
});


app.get('/favicon.ico', (req,res)=>{
 return 'your faveicon'
})

app.get("/:customListName", function(req,res){
const customListName=_.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,result){
    if(!err)
    {
      if(!result)
      {
        const list=new List({
          name: customListName,
          startingArray: [item1,item2,item3]
        });
        list.save();

        res.redirect("/"+customListName);

      }
      else
    {
    res.render("list",{listTitle: result.name, newListItems: result.startingArray });  
    }
    }





  });

});
app.post("/delete",function(req,res){
const itemToDelete=req.body.checkbox;
const titleName=req.body.titleName;
if(titleName==="Today")
{
  ListItem.findByIdAndDelete(itemToDelete,function(err){
    if(err)
    console.log(err);
    else
    console.log("Item deleted Successfully");
  })
  res.redirect("/");
}
else
{
  List.findOneAndUpdate({name: titleName},{$pull:{startingArray:{_id: itemToDelete}}},function(err,result){
    if(!err)
    res.redirect("/"+titleName);
  })
}

})
app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
