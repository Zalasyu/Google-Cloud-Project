// Import boats model functions
const Boat = require('../models/boats_model');


// Get User ID from request id token
const extract_user_id = function(req) {

    // Get id token from request header or cookie
    let id_token = req.headers.authorization || req.cookies.id_token;

    let user_id = id_token.split('.')[1];

    // Decode User ID from base64
    const decoded_user_id = Buffer.from(user_id, 'base64').toString('ascii');

    // Get User id from sub key
    user_id = JSON.parse(decoded_user_id).sub;

    return user_id;
};


// Boat Controller Functions

// Get all boats for a user
const get_boats = async function(req, res) {
    try{
        const user_id = extract_user_id(req);

        const boats = await Boat.get_boats(req, user_id);
        console.log("Boats: ", boats)
        res.status(200).json(boats);
    } catch(err) {
        if(err.status === 404) {
            res.status(404).send(err);
        } else {
            res.status(500).send(err);
        }
    }
};

// Get a boat by id for a user
const get_boat = async function(req, res) {
    try{
        const user_id = extract_user_id(req);
        const id = req.params.id;

        const boat = await Boat.get_boat(req, id, user_id);
        res.status(200).json(boat);
    } catch(err) {
        if(err.status === 404) {
            res.status(404).send(err);
        } else if (err.status === 403) {
            res.status(403).send(err);
        } else {
            res.status(500).send(err);
        }
    }
};

// Get All Boats public
const get_all_boats = async function(req, res) {
    try{
        const boats = await Boat.get_all_boats(req);
        res.status(200).json(boats);
    } catch(err) {
        if(err.status === 404) {
            res.status(404).send(err);
        } else {
            res.status(500).send(err);
        }
    }
};

// Create a boat
const post_boat = async function(req, res) {
    try{
        const user_id = extract_user_id(req);

        const boat = await Boat.post_boat(req, req.body.name, req.body.type, req.body.length, user_id);

        res.status(201).json(boat);
    } catch(err) {
        if(err.status === 400) {
            res.status(400).send(err);
        } else {
            res.status(500).send(err);
        }
    }
};


// Update a boat
const put_boat = async function(req, res) {
    try{
        const user_id = extract_user_id(req);
        const boat_id = req.params.id;

        const boat = await Boat.update_boat(user_id, boat_id, req.body.name, req.body.type, req.body.length);
        res.status(200).json(boat);
    } catch(err) {
        if (err.status === 400) {
            res.status(400).send(err);
        } else if (err.status === 403) {
            res.status(403).send(err);
        } else if (err.status === 404) {
            res.status(404).send(err);
        } else {
            res.status(500).send(err);
        }
    }
};


// Delete a boat
const delete_boat = async function(req, res) {
    try{
        const user_id = extract_user_id(req);
        const boat_id = req.params.id;

        const boat = await Boat.delete_boat(req, user_id, boat_id);
        res.status(204)
        res.end();
    } catch(err) {
        if(err.status === 404) {
            res.status(404).send(err);
        } else if (err.status === 403) {
            res.status(403).send(err);
        } else {
            res.status(500).send(err);
        }
    }
};

    


// Export all functions as methods of exports object
module.exports = {
    get_boats,
    get_all_boats,
    get_boat,
    post_boat,
    put_boat,
    delete_boat
};