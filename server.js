var express = require('express');
var app = express();

var PORT = process.env.PORT || 2020;

var todos = [{
	id: 1,
	description: 'Do something',
	completed: false
	},	{
	id: 2,
	description: 'Do something else',
	completed: false
},{
	id: 3,
	description: 'Do something more',
	completed: false
	}];

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
			//res.send('the id for the request is ' + req.params.id);
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

app.listen(PORT, function (){
	console.log('EXPRESS RUNNIG ON PORT');
});