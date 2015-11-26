var express = require('express');
var app = express();

var PORT = process.env.PORT || 2020;

app.get('/', function(req,res){
	res.send('TODO API APP');
});


app.listen(PORT, function (){
	console.log('EXPRESS RUNNIG ON PORT');
});