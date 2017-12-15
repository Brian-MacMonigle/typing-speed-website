const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'page/build')));

app.get('*', (req, res) => {
	res.sendFile(__dirname + "page/build/index.html");
});

app.listen(process.env.PORT || 5000);