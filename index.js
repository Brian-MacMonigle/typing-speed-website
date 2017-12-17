const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'page/build')));

let visitors = 0;

app.get('/api/visitor', (req, res) => {
	visitors++;
	res.json({'visitors': visitors});
});

app.get('*', (req, res) => {
	res.sendFile(__dirname + "page/build/index.html");
});

app.listen(process.env.PORT || 5000);