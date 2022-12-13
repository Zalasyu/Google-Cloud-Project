// Import Loads model functions
const Load = require('../models/loads_model');

// Import express
const express = require('express');

// Create a loadRouter
const loadRouter = express.Router();

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

// Get All Loads
const get_all_loads = async function(req, res) {
    try{
        const loads = await Load.get_all_loads(req);
        res.status(200).json(loads);
    } catch(err) {
        if(err.status === 404) {
            res.status(404).send(err);
        } else {
            res.status(500).send(err);
        }
    }
}

// Get all loads for boat
const get_all_loads_for_boat = async function(req, res) {
    try{
        const boat_id = req.params.boat_id;

        const loads = await Load.get_all_loads_for_boat(boat_id);
        res.status(200).json(loads);
    } catch(err) {
        if(err.status === 500) {
            res.status(500).send(err);
        }
    }
}

// Create a load
const post_load = async function(req, res) {
    try{

        const weight = req.body.weight;
        const content = req.body.content;
        const carrier = req.body.carrier;


        const load = await Load.post_load(req, weight, content, carrier);
        res.status(201).json(load);
    } catch(err) {
        if(err.status === 400) {
            res.status(400).send(err);
        }
        else if(err.status === 404) {
            res.status(404).send(err);
        }
        else {
            res.status(500).send(err);
        }
    }
}

// Put a load
const put_load = async function(req, res) {
    try{
        const weight = req.body.weight;
        const content = req.body.content;
        const boat_id = req.params.boat_id;
        const load_id = req.params.load_id;

        const load = await Load.put_load(load_id, boat_id, weight, content);
        res.status(200).json(load);
    } catch(err) {
        if(err.status === 404) {
            res.status(404).send(err);
        } else if(err.status === 403) {
            res.status(403).send(err);
        } else {
            res.status(500).send(err);
        }
    }
}

// Get a load by id
const get_load = async function(req, res) {
    try{
        const id = req.params.id;
        const load = await Load.get_load(id);
        res.status(200).json(load);
    } catch(err) {
        if(err.status === 404) {
            res.status(404).send(err);
        } else {
            res.status(500).send(err);
        }
    }
}

// Delete a load by id
const delete_load = async function(req, res) {
    try{
        const load_id = req.params.id;


        await Load.delete_load(load_id);
        res.status(204);
        res.end();
    } catch(err) {
        if(err.status == 400){
            res.status(400).send(err);
        } else if(err.status == 404) {
            res.status(404).send(err);
        } else if(err.status == 403) {
            res.status(403).send(err);
        } else {
            res.status(500).send(err);
        }
    }
}

// Remove load from boat
const remove_load_from_boat = async function(req, res) {
    try{
        const boat_id = req.params.boat_id;
        const load_id = req.params.load_id;
        const user_id = extract_user_id(req);

        await Load.remove_load_from_boat(boat_id, load_id);
        res.status(204);
        res.end();
    } catch(err) {
        if(err.status == 400){
            res.status(400).send(err);
        } else if(err.status == 404) {
            res.status(404).send(err);
        } else if(err.status == 403) {
            res.status(403).send(err);
        } else {
            res.status(500).send(err);
        }
    }
}

// Export all functions as methods of exports object
module.exports = {
    get_all_loads,
    get_all_loads_for_boat,
    post_load,
    put_load,
    get_load,
    delete_load,
    remove_load_from_boat
}