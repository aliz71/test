const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const router = require('./routes/api');

const app = express();

/*
    We add all of the express middlewares here.
*/
app.use(cors({
    origin: 'http://localhost:3001',
}));

/**
 * We should add logging middlware after the security middlwares.
 */
app.use(morgan('combined'));
app.use(express.json());

/**
 * We can run our react application right along side of our node back-end 
 * and there is no need to load it separately from another port.
 * For gain it we should follow these steps:
 * 1) Build react application inside your node project [For example in public folder].
 * 2) Load your static files with express.static() function.
 * 3) Point the root route in your application by using res.sendFile() function.
 * For convenient you can create npm scripts in your package.json
 */
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/v1', router);

/**
 * For matching all of react routes here in express we should pass the request
 * to index.html where react application can response to it. In order to do that
 * we use (*) char like below.
 */
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
