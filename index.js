const express = require('express');
const app = express();
const path = require('path');
const fetch = require('fetch-cookie')(require('node-fetch'));

app.use(express.static(path.join(__dirname, 'page/build')));

const api = 'https://brian-user-account-service.herokuapp.com/api';
const initPost = {
	headers: {
		'Content-Type': 'application/json'
	},
	method: 'post'
}
const pass = "7bc2e5d2-61e1-4e16-a04a-4ad8dee90f44";

function login() {
	return fetch(api + '/site/login', {	
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'post',
		body: JSON.stringify({
			site: 'typing-speed-website',
			pass: pass
		})
	})
	.then(res => {
		return res.json();
	})
	.then(json => {
		if(json.Success === undefined) {
			return Promise.reject(json);
		}
		console.log(json);
	})
	.then(() => {
		fetch(api + "/site/login/clear");
	})
	.catch(err => {
		console.log(err);
		return fetch(api + '/site/create', {	
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'post',
			body: JSON.stringify({
				site: 'typing-speed-website',
				pass: pass
			})
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

login()
.then(() => {
	fetch(api + '/cookie')
	.then(res => res.json())
	.then(json => console.log(json))
	.catch(err => console.log(err));
});

app.get('/api/visitor', (req, res) => {
	fetch(api + '/site/read', {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'post',
		body: JSON.stringify({name: 'visitor'})
	})
	.then(res => res.json())
	.then(val => {
		let myPost = JSON.parse(JSON.stringify(initPost));
		if(val === null) {
			res.json({"visitor": 1})
			myPost['body'] = JSON.stringify({
				name: 'visitor',
				value: 1
			})
		} else {
			res.json({"vistor": val + 1});
			myPost['body'] = JSON.stringify({
				name: 'visitor',
				value: val + 1
			})
		}

		fetch(api + '/site/write', myPost)
		.catch(err => console.log(err));
	})
	.catch(err => console.log(err));
})

app.get('*', (req, res) => {
	res.sendFile(__dirname + "page/build/index.html");
});

app.listen(process.env.PORT || 5000);