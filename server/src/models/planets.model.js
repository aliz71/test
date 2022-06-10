/*
    Best practice is load the internal packages before th third parties
*/
const fs = require('fs');
const path = require('path');

const planets = require('./planets.mongo');
const { parse } = require('csv-parse');

/*
    Because we read the data from stream we do not have our data
    right away so we need to make a promise and load the data before
    server is being started.
*/
function loadPlanetsData() {
    const file = fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'));

    return new Promise((resolve, reject) => {
        file.pipe(parse({
            comment: "#",
            columns: true
        })).on('data', async (data) => {
            if (isThisPlanetHabitable(data)) {
                savePlanet(data);
            }
        }).on('end', async function() {
            const numberOfHabitablePlanets = (await getAllPlanets()).length;
            console.log(`${numberOfHabitablePlanets} planets are habitable planets.`);
            /*
                There is no need to pass something here
                in this case our data is stored in the array.
            */
            resolve();
        }).on('error', (err) => {
            console.log(err);
            reject(err);
        });
    });
}

function isThisPlanetHabitable(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

async function getAllPlanets() {
    return await planets.find({}, {
        '_id': 0, '__v': 0
    });
}

async function savePlanet(data) {
    try {
        await planets.updateOne({
            keplerName: data.kepler_name
        }, {
            keplerName: data.kepler_name
        }, {
            upsert: true
        });
    } catch(error) {
        console.log(`There is an ${error}`);
    }
}

module.exports = {
    loadPlanetsData,
    getAllPlanets,
};
