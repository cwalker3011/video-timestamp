const express = require('express');
const path = require('path');

const app = express();
const PORT = 5002;

app.get('/', (req, res) => res.sendFile(path.join(__dirname, './index.html')));
app.get('/js/index.js', (req, res) => res.sendFile(path.join(__dirname, './js/index.js')));

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
