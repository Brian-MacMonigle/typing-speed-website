const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'page/build')));

app.get('*', (req, res) => {
	res.sendStatus(404);
});

app.listen(process.env.PORT || 5000, () => {
	console.log('Typing_Speed_Website listening on port 5000');
});