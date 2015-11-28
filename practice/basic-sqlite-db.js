var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined,{
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-db.sqlite'
});


var Todo = sequelize.define('todos', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			notEmpty: true,
			len: [2,100]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

sequelize.sync().then(function () {
	return Todo.findById(2);
	}).then(function (todo){
	if (todo){
		console.log(todo.toJSON());
	}
	else{
		console.log('ERROR');
	}

	// Todo.create({
	// 	description: "Take out"

	// }).then(function(todo) {
	// 	return Todo.create({
	// 		description: "Take one more out"
	// 	});
	// }).then(function() {
	// 	//return Todo.findById(1);
	// 	return Todo.findAll({
	// 		where: {
	// 			description: {
	// 				$like: '%more%'
	// 			} 
	// 		}
	// 	});
	// }).then(function(todo) {
	// 	if (todo) {
	// 		todo.forEach(function (todo){
	// 			console.log(todo.toJSON());
	// 		});
	// 	} else {
	// 		console.log("no todo found");
	// 	}

	// }).catch(function(e) {
	// 	console.log(e);
	// });
});


