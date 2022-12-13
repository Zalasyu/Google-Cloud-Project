// Import Datastore
const { Datastore } = require('@google-cloud/datastore');

// Project ID
const projectID = "final-370717";

// Create a Datastore client
const datastore = new Datastore({ projectId: projectID });



const fromDatastore = function fromDatastore(item) {
    // Get the key from the Datastore item
    item.id = item[Datastore.KEY].id;

    // Return the Datastore item
    return item;
}

// Export datastore functions
module.exports = {
    datastore: datastore,
    fromDatastore: fromDatastore
};