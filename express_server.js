var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser');
app.use(cookieParser());

var urlDatabase = {
  'b2xVn2':{"longURL": "http://www.lighthouselabs.ca",'user_id':"jack",'shortURL':'b2xVn2'},
  '9sm5xk':{"longURL": "http://www.google.com",'user_id':"jack",'shortURL':'9sm5xk'}
};


const users={
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
//GET METHODS
app.get("/", (req, res) => {
  if(req.cookies['user_id']===undefined){
    res.render("partials/_header.ejs",{user_id:undefined});
  }else{
    res.render("partials/_header.ejs",{user_id:req.cookies['user_id']});
  }
});

 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.post("/register", (req, res) => {
  console.log(req.body);
  let nme = req.body['user_id'];
  let pwd = req.body['password'];
  let id = generateRandomUsername();
  res.cookie('user_id',id,{});
  if(nme!=="" && pwd!==""){
    users[id] = {id:id,email:nme,password:pwd}
    res.redirect('http://localhost:8080/urls');
  }else{
    res.send("invalid inputs");
  }
});
app.post("/urls", (req, res) => {
   if(req.cookies['user_id']===undefined ){
    res.render("partials/_header.ejs",{user_id:undefined});
  }
  //console.log(req.body);  // debug statement to see POST parameters
  let shortURL = generateRandomString();
  urlDatabase[shortURL]={'longURL':req.body['longURL'],'user_id':req.cookies['user_id'],'shortURL':shortURL};
  console.log(urlDatabase[shortURL]);
  let templateVars = { user_id: req.cookies["user_id"], urls: listLinks(req.cookies['user_id'])};
  res.render("urls_index",templateVars);       // Respond with 'Ok' (we will replace this)
});
app.post("/login", (req, res) => {
  
  let loggedin = false;
  for(var x in users){
    if(users[x]['email'] === req.body['user_id'] && users[x]['password']===req.body['password']){
      res.cookie('user_id',users[x][id],{});
      loggedin=true;
      }
  }
  
  if(loggedin){
    console.log(req.cookies['user_id']+ " is the cookie value!");
    //console.log(req.body)
    res.redirect('http://localhost:8080/');
  }else{
    res.status(403).send("No user found of that name, please register");
  }
  
  
});
app.post("/logout", (req, res) => {
  res.clearCookie("user_id",{});
  console.log("cookies cleared");
  res.redirect('http://localhost:8080/urls');
  
});
app.post("/urls/:id", (req, res) => {
  if(req.cookies['user_id']===undefined ){
    res.render("partials/_header.ejs",{user_id:undefined});
  }
  console.log("in Post urls/:id");
  urlDatabase[req.params.id]["longURL"]=req.body['longURL'];
  let templateVars = { user_id: req.cookies["user_id"], urls: listLinks[req.cookies['user_id']] };
  res.render("urls_index.ejs",templateVars);
});
app.post("/urls/:id/delete", (req, res) => {
  if(req.cookies['user_id']===undefined ){
    res.render("partials/_header.ejs",{user_id:undefined});
  }
  //console.log(req.params.id);
  console.log("HERE!");
  let templateVars = { user_id: req.cookies["user_id"], urls: listLinks[req.cookies['user_id']] };
    delete urlDatabase[req.params.id];
    console.log(urlDatabase[req.params.id]);
    res.render('urls_index',templateVars);
});
app.get("/urls.json", (req, res) => {
  if(req.cookies['user_id']===undefined ){
    res.render("partials/_header.ejs",{user_id:undefined});
  }
  res.json(urlDatabase[req.cookies['user_id']]);
});
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  if(req.cookies['user_id']===undefined ){
    res.render("partials/_header.ejs",{user_id:undefined});
  }
  console.log(req.cookies['user_id']);
    let templateVars = { user_id: req.cookies["user_id"], urls: listLinks(req.cookies["user_id"]) };
    res.render("urls_index.ejs",templateVars);
  
});
app.get("/urls/new", (req, res) => {
  
  if(req.cookies["user_id"]===undefined){
    res.redirect("http://localhost:8080/login");
  }else{
    res.render("urls_new");
  }
  
});
app.get("/urls/:id", (req, res) => {
  if(req.cookies['user_id']===undefined ){
    res.render("partials/_header.ejs",{user_id:undefined});
  }
  let id = req.params.id;
  let templateVars={};
  if(urlDatabase.hasOwnProperty(id){
    if(urlDatabase[id]['user_id']===req.cookies['user_id']){
    
    templateVars = { user_id: req.cookies["user_id"],response : 'Full URL:' +urlDatabase[id]['longURL']+"  Short form:"+id, shorturl:id,urlfound:true};
    }else{
     templateVars = { user_id: req.cookies["user_id"],response :'shorturl not found',urlfound:false}
    }
  }
  //console.log(templateVars);
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  var passed = false;
  var longURL ="http://localhost:8080";
  var sURL = req.params.shortURL;
 for(var x in urlDatabase){
   
   if(urlDatabase.hasOwnProperty(sURL)){
     console.log(x+" is  "+ sURL);
     if(x===sURL){
       console.log("Passed if statement");
       longURL=urlDatabase[x]['longURL'];
      
     }
   }
 }
 console.log("LONG URL =="+longURL);
 res.redirect(longURL);

});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
function generateRandomString() {
  let result = ""
  for(i=0;i<6;i++){
    result+=String.fromCharCode(42*Math.random()+48);
  }
  console.log(result);
    return result;
}
function generateRandomUsername() {
  let result = ""
  for(i=0;i<10;i++){
    result+=String.fromCharCode(42*Math.random()+48);
  }
  console.log(result);
    return 'usr'+result;
}
function listLinks(user_id){
  let result = [];
  //console.log("in listLinks");
  for(var x in urlDatabase){
    //console.log(x);
   /* if(x['user_id']===user_id){
      result.push(x);
    }*/
    
    if(urlDatabase[x]['user_id']===user_id){
      //console.log(x +"was added");
      result.push(urlDatabase[x]);
    }
    
  }
  //console.log(result);
  return result;
}