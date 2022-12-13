const { datastore, fromDatastore } = require('../db/db.js');

const USER = "User";

// Save user to database
const create_user = async function(user) {

    // Check if user already exists
    const query = datastore.createQuery(USER).filter('id', '=', user.id);
    const [users] = await datastore.runQuery(query);

    // If user does not exist, create user
    if (users.length == 0) {
        const key = datastore.key(USER);
        const new_user = {
            "id": user.id,
            "name": user.name,
        };
        await datastore.save({"key": key, "data": new_user});
        return key;
    }
    // If user exists, return key
    else {

        console.log("User already exists");
        return users[0][datastore.KEY];
    }

}

// Get all users from database
const get_users = async function() {
    const query = datastore.createQuery(USER);
    const [users] = await datastore.runQuery(query);
    return users.map(fromDatastore);
}

// Get user from database
const get_user = async function(id) {
    const query = datastore.createQuery(USER).filter('id', '=', id);
    const [users] = await datastore.runQuery(query);
    return users.map(fromDatastore);
}


// Export all functions as methods of exports object
module.exports = {
    create_user,
    get_users,
    get_user
};