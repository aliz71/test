const http = require('http');

require('dotenv').config();

const app = require('./app');
const mongoose = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');

/*
    With this pattern we can separate our express settings and server settings.
    We could use app.listen() instead of server.listen() but with this pattern
    our server settings is completely separated from express settings.
*/
const server = http.createServer(app);

const PORT = process.env.PORT || 7001;

async function startServer() {
    await mongoose.mongoConnect();

    await loadPlanetsData();

    await loadLaunchData();

    server.listen(PORT, () => {
        console.log(`Server is listening to port ${PORT}`);
    });
}

startServer();
