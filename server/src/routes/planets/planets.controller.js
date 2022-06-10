const { getAllPlanets } = require('../../models/planets.model');

async function httpGetAllPlanets(req, res) {
    // Usually we add the return key plus status for our API
    return res.status(200).json(await getAllPlanets());
}

module.exports = {
    httpGetAllPlanets
};
