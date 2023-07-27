const express = require('express')
const axios = require('axios');
const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const puppeteer = require('puppeteer');

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
	// Animeworld by default redirects to the first episode on a working server
	// This is convenient so that the user doesn't need to find a working server themself
	(async () => {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
	
		await page.goto(url,{waitUntil: "domcontentloaded"})
			.catch((err) => console.log("error loading url", err));
		
		let bodyHTML = await page.evaluate(() => document.body.innerHTML);
	
		const dom = new JSDOM(bodyHTML);
			
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
		await browser.close();
		return 0;
	})();
} 

app.get('/play/:animeid/:epid', async (req, res) => {
	//Use the Animeworld api to get the video src url
	const url = 'https://www.animeworld.so/play/' + req.params.animeid + "/" + req.params.epid;
	  
    const browser = await puppeteer.launch();
	const page = await browser.newPage();
	
	await page.goto('https://www.animeworld.so/api/episode/info?id=' + req.params.epid, {waitUntil: "domcontentloaded"})
		.catch((err) => console.log("error loading url", err));
	
	let bodyHTML = await page.evaluate(() => document.getElementsByTagName("pre")[0].innerHTML);
	data = JSON.parse(bodyHTML)
	
	await browser.close();
	await playvid(url, res, data['grabber'])
});

app.get('/play/:animeid', async (req, res) => {
	// Animeworld by default redirects to the first episode on a working server
	// This is convenient so that the user doesn't need to find a working server themself
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	
	await page.goto('https://www.animeworld.so/play/' + req.params.animeid,{waitUntil: "domcontentloaded",})
		.catch((err) => console.log("error loading url", err));
	
	await page.waitForTimeout(2000);
	res.redirect(page.url().replace(/^.*\/\/[^\/]+/, ''));
	await browser.close();
	return 0;
	
});

const cerca1 = fs.readFileSync("./web/cerca1.html");
const cerca2 = fs.readFileSync("./web/cerca2.html");

var html = ""
app.get('/search', async (req, res) => {
	
	const url = 'https://www.animeworld.so/search?keyword=' + req.param('query');
   
	const puppeteer = require('puppeteer');

	(async () => {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
	
		await page.goto(url,{waitUntil: "domcontentloaded"})
			.catch((err) => console.log("error loading url", err));
		
		let bodyHTML = await page.evaluate(() => document.body.innerHTML);
	
		const dom = new JSDOM(bodyHTML);
		
		let matches = dom.window.document.querySelectorAll(".item > .inner > a");
	
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
		await browser.close();
	})();
});

app.listen(8080, function(){
    console.log("Server is running on localhost:8080")
});
