const {OAuth2Client} = require('google-auth-library');

// Download your OAuth2 configuration from the Google
const keys = require('../credentials.json');



// Get a reference to the OAuth2 client
const oAuth2Client = new OAuth2Client(
    keys.web.client_id,
    keys.web.client_secret,
    keys.web.redirect_uris[1] // Redireect URI[0] is for local development
);

// Generate the url that will be used for the consent dialog
const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/userinfo.profile',
});


function get_id_token(req) {

    if(req.headers.authorization) {
        const bearerHeader = req.headers.authorization;
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];
        return token;
    } else{
        return req.cookies.id_token;
    }



}

// Check if user is authenticated
const authenticate = async (req, res, next) => {
    try {
        console.log("Authenticating user...");
        const id_token = get_id_token(req);
        if(id_token) {
            const ticket = await oAuth2Client.verifyIdToken({
                idToken: id_token,
                audience: keys.web.client_id
            });
            const payload = ticket.getPayload();
            const userid = payload['sub'];
            console.log("User authenticated");
            next();
        } else {
            res.status(401).send("User not authenticated");
        }
    }
    catch(err) {
        console.log("Error authenticating user: ", err);
        res.status(500).send(err);
    };
}


// Export all functions as methods of exports object
module.exports = {
    oAuth2Client,
    authorizeUrl,
    authenticate,
    get_id_token
};