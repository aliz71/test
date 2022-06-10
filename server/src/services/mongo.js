const monogoose = require('mongoose');

require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;
/*
    This is the pattern if we want to check some actions or load
    something before listening to the server.
    Here as an example we just loaded the planets data but we can wait
    for any type of promises here.
*/

/**
 * These are events and they do not start to run before their event 
 * fire. So ut does not matter where to put them.
 */
monogoose.connection.once('open', () => {
    console.log('Mongo connection is ready...');
});

monogoose.connection.on('error', (err) => {
    console.error(err);
});

async function mongoConnect() {
    await monogoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
    await monogoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect
}
