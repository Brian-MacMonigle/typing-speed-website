const express = require('express');
const app = express();
const path = require('path');
const fetch = require('fetch-cookie')(require('node-fetch'));

app.use(express.static(path.join(__dirname, 'page/build')));

const api = 'https://brian-user-account-service.herokuapp.com/api';
const pass = "7bc2e5d2-61e1-4e16-a04a-4ad8dee90f44";

function login() {
	return fetch(api + '/login', {	
		headers: {'Content-Type': 'application/json'},
		method: 'POST',
		body: JSON.stringify({user: 'typing-speed-website',	pass: pass})
	})
	.then(res => res.json())
	.then(json => {
		if(json.status === 'error') {
			return Promise.reject(json);
		}
	})
	.catch(err => {
		console.log(err);
		// Try to create account
		return fetch(api + '/create', {	
			headers: {'Content-Type': 'application/json'},
			method: 'POST',
			body: JSON.stringify({user: 'typing-speed-website',	pass: pass})
		})
		.then(res => res.json())
		.then(json => {
			if(json.Success === undefined) {
				return Promise.reject(json);
			}
			return json;
		})
	})
}

login();

function saveIp(req, res, next) {
	fetch(api + '/write/ip', {
		headers: {'Content-Type': 'application/json'},
		method: 'POST',
		body: JSON.stringify({ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress, path: req.path})
	})
	next();
}

app.use(saveIp);

app.get('/api/visitor', (req, res) => {
	fetch(api + '/read?path=visitor')
	.then(res => res.json())
	.then(val => {
		val.message++;
		res.json(val.message);
		fetch(api + '/write', {
			headers: {'Content-Type': 'application/json'},
			method: 'POST',
			body: JSON.stringify({path: 'visitor', data: val.message})
		})
		.then(res => res.json())
		.then(val => {
			if(val.status === 'error') {
				return Promise.reject(val);
			}
			console.log(val);
		})
		.catch(err => console.log(err));
	})
	.catch(err => console.log(err));
})

app.get('*', (req, res) => {
	res.sendFile(__dirname + "page/build/index.html");
});

app.listen(process.env.PORT || 5000);