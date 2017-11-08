var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};
//GET METHODS
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.post("/urls/:id", (req, res) => {
  console.log(req.params.id);
  res.redirect('http://localhost:8080/urls/'+req.params.id);
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
  let templateVars = { urls: urlDatabase };
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
    templateVars = {response : 'Full URL:' +urlDatabase[id]+"  Short form:"+id, shorturl:urlDatabase[id]};
  }else{
   templateVars = {response :'shorturl not found'}
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
//POST METHODS
app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body['longURL'];
  res.send(shortURL);         // Respond with 'Ok' (we will replace this)
});
app.get("/urls/b2Vn2/delete", (req, res) => {
  console.log("IN HARD CODED DELETE");
  
});

function generateRandomString() {
  let result = ""
  for(i=0;i<6;i++){
    result+=String.fromCharCode(42*Math.random()+48);
  }
  console.log(result);
    return result;
}

