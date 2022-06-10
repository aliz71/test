const { 
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunch
 } = require('../../models/launches.model');

const { getPaginationInfo } = require('../../services/query');

async function httpGetAllLaunches(req, res) {
    const { skip, limit } = getPaginationInfo(req.query);
    const launches = await getAllLaunches(skip, limit);
    return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
    const launch = req.body;

    if(!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
        return res.status(400).json({
            error: 'Some of your data is missing.'
        });            
    }

    /**
     * In this case the valueOf() your date is a number and javascript
     * call it automatically when you are using isNaN function.
     */
    if(!(new Date(launch.launchDate)).getTime() > 0) {
        return res.status(400).json({
            error: 'Your date format is incorrect.'
        }); 
    }

    launch.launchDate = new Date(launch.launchDate);

    await scheduleNewLaunch(launch);

    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    const launchId = +req.params.id;

    const existsLaunch = await existsLaunchWithId(launchId);

    if (!existsLaunch) {
        return res.status(404).json({
            error: 'Your launch does not exist.'
        });
    }

    const launchIsDeleted = await abortLaunch(launchId);

    if (launchIsDeleted) {
        return res.status(200).json({
            ok: true
        });
    }

    return res.status(400).json({
        error: "there is no launch to delete"
    });
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
};
