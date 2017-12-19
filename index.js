const express = require('express');
const app = express();
const path = require('path');
const fetch = require('fetch-cookie')(require('node-fetch'));

app.use(express.static(path.join(__dirname, 'page/build')));

function saveIp(req, res, next) {
	fetch(api + '/write/ip', {
		headers: {'Content-Type': 'application/json'},
		method: 'POST',
		body: JSON.stringify({ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress, path: req.path})
	})
	.then(() => fetch(api + '/read?path=ip'))
	.then(r => r.json())
	.catch(err => console.log("Error: ", err))
	next();
}

app.use(saveIp);

const api = 'https://brian-user-account-service.herokuapp.com/api';
const pass = "7bc2e5d2-61e1-4e16-a04a-4ad8dee90f44";
var visitor = 0;

// login
fetch(api + '/login', {	
		headers: {'Content-Type': 'application/json'},
		method: 'POST',
		body: JSON.stringify({user: 'typing-speed-website',	pass: pass})
	})
	.then(res => res.json())
	.then(json => {
		if(json.status === 'error') {
			return Promise.reject(json);
		}
		return fetch(api + '/read?path=visitor')
			.catch(err => Promise.reject({status: 'error', message: err.toString()}))
			.then(r => r.json())
			.then(json => {
				if(json.status === 'error') {
					return Promise.reject(json);
				}
				console.log({status: 'success', message: 'Logged in and got visitor count.'});
				visitor = json.message;
			});
	})
	.catch(err => console.log(err));

app.get('/api/visitor', (req, res) => {
	res.json({status: 'success', message: visitor});
});

app.get('*', (req, res) => {
	fetch(api + '/write/ip', {
		headers: {'Content-Type': 'application/json'},
		method: 'POST',
		body: JSON.stringify({ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress, path: req.path})
	})
	.then(r => r.json())
	.then(json => res.json(json))
	.catch(e => res.json(e));
	//res.sendFile(__dirname + "page/build/index.html");
});

app.listen(process.env.PORT || 5000);