var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var PORT = process.env.PORT || 2020;

app.use(bodyParser.json());

var todos = [];

var todoNextId = 1;
// var todos = [{
// 	id: 1,
// 	description: 'Do something',
// 	completed: false
// 	},	{
// 	id: 2,
// 	description: 'Do something else',
// 	completed: false
// },{
// 	id: 3,
// 	description: 'Do something more better',
// 	completed: false
// 	}];

app.get('/', function(req,res){
	res.send('TODO API APP');
});

app.get('/todos', function (req,res){
	res.json(todos);
});

app.get('/todos/:id', function (req,res){
	var todoId = parseInt(req.params.id,10);
	var matchedTodo;
	todos.forEach(function(todo){
		if (todoId === todo.id){
			matchedTodo = todo;	
		}
	});
		if(matchedTodo){
			res.json(matchedTodo);
		}
		else {
			res.status(404).send();
		}
});

app.post('/todos', function (req, res) {
	var body = req.body;
	console.log('Description ' + body.description);
	body.id = todoNextId++;
	todos.push(body);
	res.json(todos);
	//res.json(body);
});

app.listen(PORT, function (){
	console.log('EXPRESS RUNNIG ON PORT');
});