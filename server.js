var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var PORT = process.env.PORT || 2020;

var _ = require('underscore');

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
	//if the url has query parameters
	var queryParams = req.query;
	var filteredTodos = todos;

	if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true'){
		filteredTodos =  _.where(filteredTodos,{completed: true});
	}
	else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false'){
		filteredTodos = _.where(filteredTodos,{completed: false});
	}

	//res.json(todos); original case initial

	res.json(filteredTodos);

});

app.get('/todos/:id', function (req,res){
	var todoId = parseInt(req.params.id,10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	
	// todos.forEach(function(todo){
	// 	if (todoId === todo.id){
	// 		matchedTodo = todo;	
	// 	}					//Refactored using underscore
	// });
	
		if(matchedTodo){
			res.json(matchedTodo);
		}
		else {
			res.status(404).send();
		}
});

app.post('/todos', function (req, res) {
	var body = _.pick(req.body,'description','completed');
	console.log('Description ' + body.description);


	//trim in the line below body.description.trim().length 
	//checks if the input is just space and remove all so it will be empty string
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
		return res.status(404).send();
	}	
	body.id = todoNextId++;
	body.description = body.description.trim();

	todos.push(body);
	res.json(todos);
	//res.json(body);
});

app.delete('/todos/:id', function (req, res){
	var todoId = parseInt(req.params.id,10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if(!matchedTodo){
		res.status(404).json({"ERROR" : "NOT FOUND"});
	}
	else{
		todos = _.without(todos,matchedTodo);
		res.json(matchedTodo);
	}

});

app.put('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id,10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	var body = _.pick(req.body,'description','completed');
	var validAttributes = {};

	if(!matchedTodo){
		return res.status(404).send();
	}
	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
		validAttributes.completed = body.completed;
	} else if(body.hasOwnProperty('completed')){
		return res.status(400).send();
	} 

	if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
		validAttributes.description = body.description;
	} else if(body.hasOwnProperty('description')){
		return res.status(400).send();
	}

	_.extend(matchedTodo,validAttributes);

	res.json(matchedTodo);
});

app.listen(PORT, function (){
	console.log('EXPRESS RUNNIG ON PORT');
});



