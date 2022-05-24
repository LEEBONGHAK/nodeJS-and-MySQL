var mysql = require('mysql');
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '12341234',
	database: 'test'
});

connection.connect();

connection.query(`SELECT * FROM topic`, (error, results, fields) => {
	if (error) {
		console.log(error);
	}
	console.log(results);
});

connection.end();