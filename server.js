var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var PORT = process.env.PORT || 2020;

var _ = require('underscore');
var bcrypt = require('bcrypt');

var db = require('./db.js');

app.use(bodyParser.json());

var todos = [];
var middleware = require('./middleware.js')(db);

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

app.get('/', function(req, res) {
	res.send('TODO API APP');
});

//GET /todos?completed=true
//Get /todos?complete=true&description=description
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	//if the url has query parametersd
	//var queryParams = req.query;
	//var filteredTodos = todos;

	// if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: true
	// 	});
	// } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: false
	// 	});
	// }

	// if (queryParams.hasOwnProperty('description') && queryParams.description.length > 0) {
	// 	filteredTodos = _.filter(filteredTodos, function(todo) { //parse all the todo's in todos and 
	// 		//check if the description 
	// 		//is present
	// 		return todo.description.toLowerCase().indexOf(queryParams.description.toLowerCase()) > -1;
	// 	});
	// }

	// //res.json(todos); original case initial

	// res.json(filteredTodos);
	var query = req.query;
	var where = {
		userId: req.user.get('id')
	};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}
	if (query.hasOwnProperty('description') && query.description.length > 0) {
		where.description = {
			$like: '%' + query.description + '%'
		}
	}
	db.todo.findAll({
		where: where
	}).then(function(todo) {
		res.json(todo);
	}, function(e) {
		res.status(500);
	});



});

app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoId
	// });

	// todos.forEach(function(todo){
	// 	if (todoId === todo.id){
	// 		matchedTodo = todo;	
	// 	}					//Refactored using underscore
	// });
	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (todo) {
			res.json(todo.toJSON());
		} else {
			res.status(400).send();
		}
	}, function(e) {
		res.status(500).json(e);
	});
	// if (matchedTodo) {
	// 	res.json(matchedTodo);
	// } else {
	// 	res.status(404).send();
	// }
});

app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		//res.json(todo.toJSON());
		//req.user comes from the middleware
		req.user.addTodo(todo).then(function () {
			return todo.reload();
		}).then(function (todo){
			res.json(todo.toJSON());
		});
	}, function(e) {
		res.status(400).json(e);
	});

	// console.log('Description ' + body.description);


	// //trim in the line below body.description.trim().length 
	// //checks if the input is just space and remove all so it will be empty string
	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
	// 	return res.status(404).send();
	// }
	// body.id = todoNextId++;
	// body.description = body.description.trim();

	// todos.push(body);
	// res.json(todos);
	//res.json(body);
});

//post request to add new users
app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});

app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		if (token) {
			res.header('Auth', token).json(user.toPublicJSON());
		} else {
			res.status(401).send();
		}
	}, function(e) {
		res.status(401).send();
	});
	// if(typeof body.email !== 'string' && typeof body.password !== 'string'){
	// 	return res.status(400).send();
	// }

	// db.user.findOne({
	// 	where: {
	// 		email: body.email
	// 	}
	// }).then (function (user) {
	// 	if(!user || ! (bcrypt.compareSync(body.password,user.get('password_hash')))){
	// 		return res.status(401).send();
	// 	}
	// 	res.json(user.toPublicJSON());
	// }, function (e){
	// 	res.status(500).send();
	// })
});

app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var where = {};
	where.id = todoId;
	where.userId = req.user.get('id');
	db.todo.destroy({
		where: where
	}).then(function(rowsDeleted) {
		if (rowsDeleted == 0) {
			res.status(400).json({
				error: "Id doesn't exist"
			});
		} else {
			res.status(204).send();
		}
	}, function(e) {
		res.status(500).json(e);
	});

	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoId
	// });

	// if (!matchedTodo) {
	// 	res.status(404).json({
	// 		"ERROR": "NOT FOUND"
	// 	});
	// } else {
	// 	todos = _.without(todos, matchedTodo);
	// 	res.json(matchedTodo);
	// }

});

app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (todo) {
			return todo.update(attributes);
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	}).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});

	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoId
	// });


	// var validAttributes = {};

	// if (!matchedTodo) {
	// 	return res.status(404).send();
	// }
	// if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
	// 	validAttributes.completed = body.completed;
	// } else if (body.hasOwnProperty('completed')) {
	// 	return res.status(400).send();
	// }

	// if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
	// 	validAttributes.description = body.description;
	// } else if (body.hasOwnProperty('description')) {
	// 	return res.status(400).send();
	// }

	// _.extend(matchedTodo, validAttributes);

	// res.json(matchedTodo);
});


db.sequelize.sync({
	force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('EXPRESS RUNNIG ON PORT');
	});

});