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

const video1 = fs.readFileSync("./web/video1.html");
const video2 = fs.readFileSync("./web/video2.html");
var playhtml = ""

async function playvid(url, res, epurl) { 

   await axios.get(url)
	.then(response => {

	  const dom = new JSDOM(response.data);
	  let matches = dom.window.document.querySelectorAll(".episode > a");
	  let title = dom.window.document.querySelector("#anime-title");
	  let episode = dom.window.document.querySelector(".episodeNum");
	  
	  var server = 1
	  var active = 0
	  var found = false
	  matches.forEach(element => {
		  currentelement = element.outerHTML
		  
		  if (element.innerHTML == "1"){
			
			playhtml+= '</div><div style="display: none" id="server' + server + '">' + currentelement;
			server +=1;
			if (playhtml.includes('class="active"')){

				if (!found){
					found = true
					active = server-1
				}
			} 
		  }
		  else{
			  playhtml+= currentelement;
		  }
	  });
	  
		if (!found){
			if (playhtml.includes('class="active"')){

					if (!found){
						found = true
						active = server-1
					}
				} 
		}
		

		playhtml = playhtml.replace('style="display: none" id="server' + active + '"','style="display: block" id="server' + active + '"' )

	  
	  res.send(video1.toString()
		.replace('{TITOLO}', title.innerHTML)
			.replace('{EPISODIO}', episode.innerHTML)
				.replace('{EPURL}', epurl)+ playhtml + video2);
				
	  playhtml = "";
	  return 0;
	})
	.catch(error => {
    console.error('Error fetching website:', error.message);
	});
	
} 

app.get('/play/:animeid/:epid', async (req, res) => {
	
	//Use the Animeworld api to get the video src url
	const url = 'https://www.animeworld.so/play/' + req.params.animeid + "/" + req.params.epid;
	const resp = await axios({
	  method: "GET",
	  url: 'https://www.animeworld.so/api/episode/info?id=' + req.params.epid,
	});
	const data = resp.data;


	await playvid(url, res, data['grabber'])
});

app.get('/play/:animeid', async (req, res) => {
	
	// Animeworld by default redirects to the first episode on a working server
	// This is convenient so that the user doesn't need to find a working server themself
	const response = await axios.get('https://www.animeworld.so/play/' + req.params.animeid);
	res.redirect(response.request._redirectable._currentUrl.replace(/^.*\/\/[^\/]+/, ''))
	return 0;
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

app.listen(8080,'0.0.0.0', function(){
	console.log("Il server è in esecuzione su localhost:8080")
	console.log("----------------------------------------------------------------------------")
	console.log("Per accedervi da altri dispositivi utilizza: [Il TUO INDIRIZZO IPV4]:8080")
	console.log('Per trovare il tuo indirizzo IPv4, utilizza il comando "ipconfig" su Windows')
});
