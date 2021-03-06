var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');

var db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '12341234',
	database: 'test'
});
db.connect();

var app = http.createServer((request, response) => {
    var _url = request.url;
    var pathname = url.parse(_url, true).pathname;
    var queryData = url.parse(_url, true).query;

    if (pathname === '/') {
        if (queryData.id === undefined) {
            db.query(`SELECT * FROM topic`, (error, topics) => {
                var title = 'Welcome';
                var description = '<p>Hello, NodeJS</p>';
                var list = template.list(topics);
                var html = template.HTML(title, list, description, '<a href="/create">create</a>');

                response.writeHead(200);
                response.end(html);
            });
        } else {
            db.query('SELECT * FROM topics', (error, topics) => {
                if (error) {
                    throw error;
                }
                db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], (err, topic) => {
                    if (err) {
                        throw err;
                    }

                    var title = topic[0].title;
                    var description = `<p>${topic[0].description}</p>`;
                    var list = template.list(topics);
                    var html = template.HTML(title, list, description, '</p>', `<a href="/create">create</a> <a href="/update?id=${queryData.id}">update</a>
                    <form action="/delete_process" method="post">
                        <input type="hidden" name="id" value="${queryData.id}">
                        <input type="submit" value="delete">
                    </form>`);

                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if (pathname === '/create') {
        db.query(`SELECT * FROM topic`, (error, topics) => {
            if (error) {
                throw error;
            }

            var title = 'WEB - create';
            var list = template.list(filelist);
            var description = `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
            `;
            var html = template.HTML(title, list, description, '');

            response.writeHead(200);
            response.end(html);
        });
    } else if (pathname === '/create_process') {
        var body = '';

        request.on('data', (data) => {
            // ?????? ?????? ????????? ???????????? ????????? ????????? ???????????? ?????? ??????
            // ???????????? ???????????? ????????? ??????
            body += data;
        });
        request.on('end', () => {
            // ????????? ????????? ????????? ????????? ???????????? ?????? ??????
            // ????????? ????????? ??????????????? ????????? ??????
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;

            // ????????????????????? ????????? ??????
            db.query(`INSET INTO topic (title, description, created, author_id) VALUES (?, ?, NOW(), ?)`, [title, description, 1], (error, result) => {
                if (error) {
                    throw error;
                }

                //.insertId ??? ????????? ?????? id??? ?????????
                response.writeHead(302, {Location: `/id=${result.insertId}`});
                response.end();
            });
        });
    } else if (pathname === '/update') {
        fs.readdir('./data', (err, filelist) => {
            var filteredId = path.parse(queryData.id).base;

            fs.readFile(`data/${filteredId}`, 'utf8', (error, description) => {
                var title = queryData.id;
                var list = template.HTML(filelist);
                var update = `
                <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${title}">
                    <p>
                        <input type="text" name="title" placeholder="title" value="${title}">
                    </p>
                    <p>
                        <textarea name="description" placeholder="description">${description}</textarea>    
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                `;
                var html = template.HTML(title, list, update, `<a href="/create">create</a>`);

                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathname === '/update_process') {
        var body = '';

        request.on('data', (data) => {
            body += data;
        });
        request.on('end', () => {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;

            // ???????????? ??????
            fs.rename(`data/${id}`, `data/${title}`, (err) => {
                fs.writeFile(`data/${title}`, description, 'utf8', (error) => {
                    response.writeHead(302, {Location: `/?id=${title}`});
                    response.end();
                });
            });
        });
    } else if (pathname === '/delete_process') {
        var body = '';

        request.on('data', (data) => {
            body += data;
        });
        request.on('end', () => {
            var post = qs.parse(body);
            var id = post.id;
            var filteredId = path.parse(id).base;

            fs.unlink(`data/${filteredId}`, (err) => {
                response.writeHead(302, {Location: '/'});
                response.end();
            });
        });
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);