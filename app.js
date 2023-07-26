const express = require('express')
const axios = require('axios');
const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const app = express();


app.use(express.static(__dirname + '/'));

app.get('/', function (req, res){
    res.sendFile(__dirname + '/index.html')

});

app.get('/info', function (req, res){
    res.sendFile(__dirname + '/web/info.html')

});


const cerca1 = fs.readFileSync("./web/cerca1.html");
const cerca2 = fs.readFileSync("./web/cerca2.html");

var html = ""

app.get('/search', function (req, res){
   const url = 'https://www.animeworld.so/search?keyword=' + req.param('query');
axios.get(url)
  .then(response => {
    
	const dom = new JSDOM(response.data)
	
	let matches = dom.window.document.querySelectorAll(".item > .inner > a")
	
    matches.forEach(element => {
		if (!element.innerHTML.includes("Ricerca nel sito")){
			html+='<div class="titolo">' + element.outerHTML +"</div>"
		}
	});
	
	res.send(cerca1 + html + cerca2)
	html = ""
  })
  .catch(error => {
    console.error('Error fetching website:', error.message);
  });
	
	
});

console.log("Server is running on localhost8080")
app.listen(8080, function(){
    console.log("Server is running on localhost8080")
});
