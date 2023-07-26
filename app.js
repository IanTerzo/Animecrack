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


app.get('/play', function (req, res){
    res.sendFile(__dirname + '/web/play.html')

});

const cerca1 = fs.readFileSync("./web/cerca1.html");
const cerca2 = fs.readFileSync("./web/cerca2.html");

var html = ""
app.get('/search', function (req, res){
   const url = 'https://www.animeworld.so/search?keyword=' + req.param('query');
axios.get(url)
  .then(response => {
    
	const dom = new JSDOM(response.data);
	
	let matches = dom.window.document.querySelectorAll(".item > .inner > a");
	
	// Weird but works fast
	
	var group = false
	var togroup = ""
    matches.forEach(element => {
			fixed = element.outerHTML
			if (fixed.includes('<div class="dub">DUB</div>')){fixed = fixed.replace('<div class="dub">DUB</div>',"")}
			
			if (fixed.includes('<div class="ova">OVA</div>')){fixed = fixed.replace('<div class="ova">OVA</div>',"")}
			
			if (fixed.includes('<div class="movie">Movie</div>')){fixed = fixed.replace('<div class="movie">Movie</div>',"")}
			
			if (fixed.includes('<div class="special">Special</div>')){fixed = fixed.replace('<div class="special">Special</div>',"")}
			
			
			if (group == false){
				togroup=fixed;
				group = true;
				
			}
			else{
				console.log(togroup + fixed)
				console.log("-----------------------------------------")
				html+='<div class="titolo">' + togroup + fixed + "</div>";
				group = false
				togroup = ""
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
