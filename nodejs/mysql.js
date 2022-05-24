var mysql = require('mysql');

// 데이터베이스에 접속할 때 필요한 정보를 객체 형태로 mysql 모듈에 있는 createConnection 메서드에 인수로 전달
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '12341234',
	database: 'test'
});

// 데이터베이스에 접속
connection.connect();

/// 데이터베이스에 쿼리문을 전달
connection.query(`SELECT * FROM topic`, (error, results, fields) => {
	if (error) {
		console.log(error);
	}
	console.log(results);
});

// 데이터베이스와의 접속 끊기
connection.end();