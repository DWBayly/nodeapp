var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
// default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser');
app.use(cookieParser());
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


var urlDatabase = {
  'b2xVn2': {"longURL": "http://www.lighthouselabs.ca", 'userId': "jack", 'shortURL': 'b2xVn2'},
  '9sm5xk': {"longURL": "http://www.google.com", 'userId': "jack", 'shortURL': '9sm5xk'}
};


const users = {
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
};
function generateRandomString() {
  let result = "";
  for(var i = 0 ; i < 6 ; i++){
    result += String.fromCharCode( 42 * Math.random() + 48);
  }
  console.log(result);
  return result;
}
function generateRandomUsername() {
  let result = "";
  for(var i = 0 ; i < 10; i++){
    result += String.fromCharCode( 42 * Math.random() + 48);
  }
  console.log(result);
  return 'usr' + result;
}
function listLinks(userId){
  let result = [];
  for(var x in urlDatabase){
    if(urlDatabase[x]['userId'] === userId){
      result.push(urlDatabase[x]);
    }
  }
  return result;
}
app.get("/", (req, res) => {
  if(req.session.userId === undefined){
    res.render("partials/_header.ejs", {userId: undefined});
  }else{
    res.render("partials/_header.ejs", {userId: req.session.userId});
  }
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.post("/register", (req, res) => {
  console.log(req.body);
  let nme = req.body['userId'];
  let pwd = req.body['password'];
  let id = generateRandomUsername();
  req.session.userId = nme;
  if(nme !== "" && pwd !== ""){
    users[id] = {id: id, email: nme, password: bcrypt.hashSync(pwd, 10)};
    res.redirect('http://localhost:8080/urls');
  }else{
    res.send("invalid inputs");
  }
});
app.post("/urls", (req, res) => {
  if(req.session.userId === undefined){
    res.render("partials/_header.ejs", {userId: undefined});
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {'longURL': req.body['longURL'], 'userId': req.session.userId, 'shortURL': shortURL};
  console.log(urlDatabase[shortURL]);
  let templateVars = { userId: req.session.userId, urls: listLinks(req.session.userId)};
  res.render("urls_index", templateVars);
});
app.post("/login", (req, res) => {
  
  let loggedin = false;
  for(var x in users){
    if(users[x]['email'] === req.body['userId'] && bcrypt.compareSync((req.body['password']), users[x]['password'])){
      req.session.userId = req.body['userId'];
      loggedin = true;
    }
  }
  
  if(loggedin){
    //console.log(req.session.userId+ " is the cookie value!");
    //console.log(req.body)
    res.redirect('http://localhost:8080/');
  }else{
    res.status(403).send("No user found of that name, please register");
  }
  
  
});
app.post("/logout", (req, res) => {
  req.session.userId = "";
  console.log("cookies cleared");
  res.redirect('http://localhost:8080/urls');
  
});
app.post("/urls/:id", (req, res) => {
  if(req.session.userId === undefined){
    res.render("partials/_header.ejs", {userId: undefined});
  }
  urlDatabase[req.params.id]["longURL"] = req.body['longURL'];
  let templateVars = { userId: req.session.userId, urls: listLinks[req.session.userId] };
  res.render("urls_index.ejs", templateVars);
});
app.post("/urls/:id/delete", (req, res) => {
  if(req.session.userId === undefined ){
    res.render("partials/_header.ejs", {userId: undefined});
  }
  //console.log(req.params.id);
  console.log("HERE!");
  let templateVars = { userId: req.session.userId, urls: listLinks[req.session.userId] };
  delete urlDatabase[req.params.id];
  console.log(urlDatabase[req.params.id]);
  res.render('urls_index', templateVars);
});
app.get("/urls.json", (req, res) => {
  if(req.session.userId === undefined ){
    res.render("partials/_header.ejs", {userId: undefined});
  }
  res.json(urlDatabase[req.session.userId]);
});
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  if(req.session.userId === undefined ){
    res.render("partials/_header.ejs", {userId: undefined});
  }
  console.log(req.session.userId);
  let templateVars = { userId: req.session.userId, urls: listLinks(req.session.userId) };
  res.render("urls_index.ejs", templateVars);
});
app.get("/urls/new", (req, res) => {
  
  if(req.session.userId === undefined){
    res.redirect("http://localhost:8080/login");
  }else{
    res.render("urls_new");
  }
  
});
app.get("/urls/:id", (req, res) => {
  if(req.session.userId === undefined ){
    res.render("partials/_header.ejs", {userId: undefined});
  }
  let id = req.params.id;
  let templateVars = {};
  if(urlDatabase.hasOwnProperty(id)){
    if(urlDatabase[id]['userId'] === req.session.userId){
      templateVars = { userId: req.session.userId, response: 'Full URL:' + urlDatabase[id]['longURL'] + "  Short form:" + id, shorturl: id, urlfound: true};
    }else{
      templateVars = { userId: req.session.userId, response: 'shorturl not found', urlfound: false};
    }
  }
  //console.log(templateVars);
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  var passed = false;
  var longURL = "http://localhost:8080";
  var sURL = req.params.shortURL;
  for(var x in urlDatabase){
    if(urlDatabase.hasOwnProperty(sURL)){
      if(x === sURL){
        longURL = urlDatabase[x]['longURL'];
      }
    }
  }
  console.log("LONG URL ==" + longURL);
  res.redirect(longURL);

});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});

