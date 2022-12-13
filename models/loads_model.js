// Import the datastore module
const { datastore, fromDatastore } = require('../db/db.js');

// LOAD is the kind of the entity
const BOAT = "Boat";
const LOAD = "load";

// Get load by id
const get_load = async function(id) {
    const key = datastore.key([LOAD, parseInt(id, 10)]);
    const load = await datastore.get(key);
    if (load[0] === undefined) {
        throw {message: "No load with this load_id exists", status: 404};
    }
    return load[0];
}


// Get all loads and paginate by 5
const get_all_loads = async function(req) {
    const q = datastore.createQuery(LOAD).limit(5);
    const results = {};
    if (Object.keys(req.query).includes("cursor")) {
        q = q.start(req.query.cursor);
    }

    let entities = await datastore.runQuery(q);
    results.items = entities[0].map(fromDatastore);
    if (entities[1].moreResults !== datastore.NO_MORE_RESULTS) {
        results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "/loads/" + "?cursor=" + entities[1].endCursor;
    }
    console.log(results);
    return results;
};

// Get all loads and paginate by 5 for a boat
const get_all_loads_for_boat = async function(id) {

    // Get Boat
    const key = datastore.key([BOAT, parseInt(id, 10)]);
    const boat = await datastore.get(key);
    
    // Check if boat exists
    if (boat[0] === undefined) {
        throw {message: "No boat with this boat_id exists", status: 404};
    }

    // Get loads for boat and paginate by 5
    const q = datastore.createQuery(LOAD).filter("carrier", "=", id).limit(5);
    const results = {};
    if (Object.keys(req.query).includes("cursor")) {
        q = q.start(req.query.cursor);
    }

    let entities = await datastore.runQuery(q);
    results.items = entities[0].map(fromDatastore);
    if (entities[1].moreResults !== datastore.NO_MORE_RESULTS) {
        results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "/loads/" + "?cursor=" + entities[1].endCursor;
    }
    console.log(results);
    return results;
};


// Save load to datastore
const post_load = async function(req, weight, content, carrier) {
    let self = "";

    // Check if missing required fields
    if (!weight || !content) {
        throw {message: "The request object is missing at least one of the required attributes", status: 400};
    }

    // Save load to datastore
    const key = datastore.key(LOAD);
    const new_load = {"id": key.id, "weight": weight, "content": content, "carrier": carrier, "self": self};
    await datastore.save({"key": key, "data": new_load});

    // Wait for datastore to save load, then get load key id for self link
    const load_key = key.id;
    self = req.protocol + "://" + req.get("host") + req.baseUrl + "/loads/" + load_key;

    // Update load with self link
    const load = {"id": key.id, "weight": weight, "content": content, "carrier": carrier, "self": self};
    await datastore.save({"key": key, "data": load});

    return load;
}

// Put load by id
const put_load = async function(load_id, boat_id, weight, content) {
    // Check if missing required fields
    if (!weight || !content || !boat_id || !load_id) {
        throw {message: "Missing required fields", status: 400};
    }

    // Get load by id
    const key = datastore.key([LOAD, parseInt(load_id, 10)]);
    const load = await datastore.get(key);

    // Get boat by id
    const boat_key = datastore.key([BOAT, parseInt(boat_id, 10)]);
    const boat = await datastore.get(boat_key);

    // Check if boat exists
    if (boat[0] === undefined) {
        throw {message: "No boat with this boat_id exists", status: 404};
    }

    // Check if load exists
    if (load[0] === undefined) {
        throw {message: "No load with this load_id exists", status: 404};
    }

    // Check if load already has a carrier
    if (load[0].carrier !== null) {
        throw {message: "Load already has a carrier", status: 403};
    }

    // Update load
    load[0].weight = weight;
    load[0].content = content;
    load[0].carrier = boat_id;
    await datastore.save({"key": key, "data": load[0]});

    console.log(load[0]);

    // Update boat
    boat[0].loads.push(load[0]);
    await datastore.save({"key": boat_key, "data": boat[0]});

    console.log(boat[0]);

    return load[0];
}


// Delete load by id and remove from boat
const delete_load = async function(load_id) {

    // Get load by id
    const key = datastore.key([LOAD, parseInt(load_id, 10)]);
    const load = await datastore.get(key);


    // Check if load exists
    if (load[0] === undefined) {
        throw {message: "No load with this load_id exists", status: 404};
    }

    // Extract boat id from load
    const boat_id = load[0].carrier;

    // Get boat by id
    const boat_key = datastore.key([BOAT, parseInt(boat_id, 10)]);
    const boat = await datastore.get(boat_key);

    // Check if boat exists
    if (boat[0] === undefined) {
        throw {message: "No boat with this boat_id exists", status: 404};
    }

    // Check if load is on boat
    if (load[0].carrier !== boat_id) {
        throw {message: "Load is not on boat", status: 404};
    }
    console.log(load[0]);
    console.log(boat[0]);

    // Remove load from boat
    boat[0].loads = boat[0].loads.filter(function(load) {
        return load.id !== load_id;
    });
    await datastore.save({"key": boat_key, "data": boat[0]});
    console.log(boat[0]);

    // Delete load
    await datastore.delete(key);

}

// Remove load from boat
const remove_load_from_boat = async function(boat_id, load_id) {

    // Get load by id
    const key = datastore.key([LOAD, parseInt(load_id, 10)]);
    const load = await datastore.get(key);

    // Get boat by id
    const boat_key = datastore.key([BOAT, parseInt(boat_id, 10)]);
    const boat = await datastore.get(boat_key);

    // Check if load exists
    if (load[0] === undefined) {
        throw {message: "No load with this load_id exists", status: 404};
    }

    // Check if boat exists
    if (boat[0] === undefined) {
        throw {message: "No boat with this boat_id exists", status: 404};
    }

    // Check if load is on boat
    if (load[0].carrier !== boat_id) {
        throw {message: "Load is not on boat", status: 404};
    }

    // Remove load from boat
    boat[0].loads = boat[0].loads.filter(function(load) {
        return load.id !== load_id;
    });
    await datastore.save({"key": boat_key, "data": boat[0]});
    console.log("After remove load from boat:");
    console.log(boat[0]);

    // Update load
    load[0].carrier = null;
    await datastore.save({"key": key, "data": load[0]});
    console.log(load[0]);

    return boat[0];

}


// Export the functions to be used in other files
module.exports = {
    get_load,
    get_all_loads,
    get_all_loads_for_boat,
    post_load,
    put_load,
    delete_load,
    remove_load_from_boat

};
