const express = require('express')
const axios = require('axios');

const app = express();

app.use(express.static(__dirname + '/'));

app.get('/', function (req, res){
    res.sendFile(__dirname + '/index.html')

});

app.get('/info', function (req, res){
    res.sendFile(__dirname + '/web/info.html')

});

app.get('/search', function (req, res){
   console.log(req.param('query'))
   const url = 'https://www.animeworld.so/search?keyword=' + req.param('query');
   console.log(url)
axios.get(url)
  .then(response => {
    const htmlContent = response.data;
	
	const anipattern = /<div[^>]*class="inner"[^>]*>[\s\S]*?<\/div>/g;
	
    const matches = htmlContent.match(anipattern);
	
    matches.forEach(element => {
		console.log(element);
	});
  })
  .catch(error => {
    console.error('Error fetching website:', error.message);
  });
	res.send("search page")
});

console.log("Server is running on localhost8080")
app.listen(8080, function(){
    console.log("Server is running on localhost8080")
});
