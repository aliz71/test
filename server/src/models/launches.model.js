const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planet = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_BASE_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunch() {
    console.log('Downloading all launches from spaceX ...');

    const response = await axios.post(SPACEX_BASE_URL, {
        query: {},
        options: {
                pagination: false,
                populate: [
                    {
                        path: 'rocket',
                        select: {
                            name: 1
                        }
                    }, 
                    {
                        path: 'payloads',
                        select: {
                            customers: 1
                        }
                    }
                ]
        }
    });

    const launchDocs = response.data.docs;

    for (const launchDoc of launchDocs) {
        const payloads = launchDoc.payloads;
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        });
        
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            customers: customers,
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success']
        };

        await saveLaunch(launch);
    }
}

async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1
    });

    if (firstLaunch) {
        console.log('The first launch is exists...');
    } else {
        await populateLaunch();
    }
}

async function getAllLaunches(skip, limit) {
    return await launchesDatabase
    .find({}, { '_id': 0, '__v': 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId
    });
}

async function abortLaunch(launchId) {
    const abort = await launchesDatabase.updateOne({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false
    });

    return abort.modifiedCount === 1;
}

async function saveLaunch(launch) {
    /**
     * It is similar to updateOne but here it returns just the necessary
     * fields and not built in fields that mongo creates automatically.
     */
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    });
}

async function scheduleNewLaunch(launch) {
    const planetName = await planet.findOne({
        keplerName: launch.target
    });

    if(!planetName) {
        throw new Error('There is no planet maching this one.');
    }

    const lastFlightNumber = await getLatestFlightNumber() + 1;

    const newLaunch = Object.assign(launch,{
            flightNumber: lastFlightNumber,
            customers: ['NASA', 'ALI'],
            upcoming: true,
            success: true,
        }
    );

    await saveLaunch(newLaunch); 
}

async function getLatestFlightNumber() {
    /**
     * - means DESC here
     */
    const lastLaunch = await launchesDatabase
    .findOne()
    .sort('-flightNumber');

    if(!lastLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return lastLaunch.flightNumber;
}

/**
 * It is best practice that you sort your function names
 * based on nameing them that you have done in the module.
 */
module.exports = {
    loadLaunchData,
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunch,
};
