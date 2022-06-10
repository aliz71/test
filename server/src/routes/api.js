const app = require('express');

const planetsRouter = require('./planets/planets.router');
const launchesRouter = require('./launches/launches.router');

const router = app.Router();

router.use('/planets', planetsRouter);
router.use('/launches', launchesRouter);

module.exports = router;
