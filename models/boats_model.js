// Import datastore functions from db.js
const { datastore, fromDatastore } = require('../db/db.js');
const { get_load } = require('./loads_model.js');



// Boats is the kind of the entity
const BOAT = "Boat";
const LOAD = "load";

// Get boats owned by user by user id with pagination of 5 boats per page
const get_boats = async function(req, user_id) {
    let q = datastore.createQuery(BOAT).filter("owner", "=", user_id).limit(5);
    const results = {};
    if (Object.keys(req.query).includes("cursor")) {
        q = q.start(req.query.cursor);
    }
    let entities = await datastore.runQuery(q);
    results.items = entities[0].map(fromDatastore);
    if (entities[1].moreResults !== datastore.NO_MORE_RESULTS) {
        results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "/boats/" + "?cursor=" + entities[1].endCursor;
    }
    console.log(results);
    return results;
};

// Get all boats
const get_all_boats = async function(req) {
    let q = datastore.createQuery(BOAT).limit(5);
    const results = {};
    if (Object.keys(req.query).includes("cursor")) {
        q = q.start(req.query.cursor);
    }
    let entities = await datastore.runQuery(q);
    results.items = entities[0].map(fromDatastore);
    if (entities[1].moreResults !== datastore.NO_MORE_RESULTS) {
        results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "/boats/" + "?cursor=" + entities[1].endCursor;
    }
    console.log(results);
    return results;
};

// Save boat to datastore
const post_boat = async function(req, name, type, length, owner) {
    let self = "";

    // Check if missing required fields
    if (!name || !type || !length || !owner) {
        throw {message: "The request object is missing at least one of the required attributes", status: 400};
    }

    // Save boat to datastore
    const key = datastore.key(BOAT);
    const new_boat = {"id": key.id, "name": name, "type": type, "length": length, "owner": owner, "loads": [], "self": self};
    await datastore.save({"key": key, "data": new_boat});

    // Wait for datastore to save boat, then get boat key id for self link
    const boat_key = key.id;
    self = req.protocol + "://" + req.get("host") + req.baseUrl + "/boats/" + boat_key;

    // Update boat with self link
    const boat = {"id": key.id, "name": name, "type": type, "length": length, "owner": owner, "loads": [], "self": self};
    await datastore.save({"key": key, "data": boat});

    return boat;
}

// Get boat by id if owned by user
const get_boat = async function(req, id, user_id) {
    const key = datastore.key([BOAT, parseInt(id, 10)]);
    const boat = await datastore.get(key);
    if (boat[0] === undefined) {
        throw {message: "No boat with this boat_id exists", status: 404};
    }
    if (boat[0].owner !== user_id) {
        throw {message: "Unauthorized to access this boat", status: 403};
    }
    return boat[0];
}

// Delete boat by id if owned by user and remove from loads
const delete_boat = async function(req, user_id, boat_id) {

    // Get boat by id
    const key = datastore.key([BOAT, parseInt(boat_id, 10)]);
    const boat = await datastore.get(key);

    // Check if boat exists
    if (boat[0] === undefined) {
        throw {message: "No boat with this boat_id exists", status: 404};
    }

    // Check if user is authorized to delete boat
    if (boat[0].owner !== user_id) {
        throw {message: "Unauthorized to access this boat", status: 403};
    }
    // Remove boat from loads
    for (let i = 0; i < boat[0].loads.length; i++) {
        const load = await get_load(boat[0].loads[i].id);
        load.carrier = null;
        const load_key = datastore.key([LOAD, parseInt(boat[0].loads[i].id, 10)]);
        await datastore.save({"key": load_key, "data": load});
    }

    // Delete boat
    await datastore.delete(key);
}


//Update boat by id if owned by user
const update_boat = async function(user_id, boat_id, name, type, length) {

    // Check if missing required fields
    if (!name || !type || !length) {
        throw {message: "The request object is missing at least one of the required attributes", status: 400};
    }

    const key = datastore.key([BOAT, parseInt(boat_id, 10)]);
    const boat = await datastore.get(key);

    // Check if boat exists
    if (boat[0] === undefined) {
        throw {message: "No boat with this boat_id exists", status: 404};
    }

    // Check if user is authorized to update boat
    if (boat[0].owner !== user_id) {
        throw {message: "Unauthorized to access this boat", status: 403};
    }

    // Update boat
    boat[0].name = name;
    boat[0].type = type;
    boat[0].length = length;
    await datastore.save({"key": key, "data": boat[0]});
    return boat[0];
}

// Export all functions as methods of exports object
module.exports = {
    get_boats,
    get_all_boats,
    post_boat,
    get_boat,
    delete_boat,
    update_boat
};