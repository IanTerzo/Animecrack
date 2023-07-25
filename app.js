const express = require('express')


//const path = require('path');
//sconst __dirname = path.resolve();

const app = express();

app.use(express.static(__dirname + '/'));

app.get('/', function (req, res){
    res.sendFile(__dirname + '/index.html')

});

app.get('/info', function (req, res){
    res.sendFile(__dirname + '/web/info.html')

});
//codice crack roba
app.get('/search', function (req, res){
    console.log('hi')
    res.send ('test')

    const request = require('request')
    request('https://server23.animesaturnstream.com/DDL/ANIME/', function (
    error,
    response,
     body
    ){
    console.error('error:', error)
    console.log('body:', body)
    });

});

app.listen(8080, function(){
    console.log("Server is running on localhost8080")
});