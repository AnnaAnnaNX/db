const express = require('express');
const routes = require('./routes');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
var public = path.join(__dirname, 'public');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors({
    origin: '*'
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', routes);

app.get('/', function(req, res) {
    res.sendFile(path.join(public, 'index.html'));
});

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));