var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser');
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
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
  res.end("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.post("/register", (req, res) => {
  console.log(req.body);
  res.cookie('user_id',req.body['user_id'],{});
  let nme = req.body['user_id'];
  let pwd = req.body['password'];
  let id = generateRandomUsername();
  if(nme!=="" && pwd!==""){
    users[id] = {id:id,email:nme,password:pwd}
    res.redirect('http://localhost:8080/urls');
  }else{
    res.send("invalid inputs");
  }
});
app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body['longURL'];
  res.send(shortURL);         // Respond with 'Ok' (we will replace this)
});
app.post("/login", (req, res) => {
  
  let loggedin = false;
  for(var x in users){
    if(users[x]['email'] === req.body['user_id'] && users[x]['password']===req.body['password']){
      res.cookie('user_id',req.body['user_id'],{});
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
  console.log(req.body);
  urlDatabase[req.params.id]=req.body['longURL'];
    let templateVars = { user_id: req.cookies["user_id"], urls: urlDatabase };
    res.redirect('http://localhost:8080/urls')
  res.render("urls_index.ejs",templateVars);
});
app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params.id);
  console.log("HERE!");
  if(urlDatabase.hasOwnProperty(req.params.id)){
    delete urlDatabase[req.params.id];
    console.log(urlDatabase);
    res.redirect('http://localhost:8080/urls/new');
  }
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"], urls: urlDatabase };
  res.render("urls_index.ejs",templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:id", (req, res) => {
  //let templateVars = { shortURL: req.params.id,urls:urlDatabase};
  let id = req.params.id;
  let templateVars={};
  if(urlDatabase.hasOwnProperty(id)){
    templateVars = { user_id: req.cookies["user_id"],response : 'Full URL:' +urlDatabase[id]+"  Short form:"+id, shorturl:id,urlfound:true};
  }else{
   templateVars = { user_id: req.cookies["user_id"],response :'shorturl not found',urlfound:false}
  }
  //console.log(templateVars);
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  let longURL  = 'localhost:8080/urls';
  if(urlDatabase.hasOwnProperty(req.params.shortURL)){
      //console.log("FOUND!");
      longURL= urlDatabase[req.params.shortURL];
  }
  //console.log(longURL);
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

