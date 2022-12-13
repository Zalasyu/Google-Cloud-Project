const User = require('../models/users_model');
const logger = require('morgan');

const utils = require('../oauth/utils');


// Authentication Controller Functions with Google OAuth2.0

// Login
const login = function(req, res) {
    try {
        const redirectUrl = utils.authorizeUrl;
        console.log(redirectUrl);
        res.redirect(redirectUrl);
    }
    catch(err) {
        res.status(500).send(err);
    }
};

// Auth Google
const auth_google = async function(req, res) {
    try {
        const code = req.query.code;
        if(code) {
            console.log("Getting tokens...")
            const {tokens} = await utils.oAuth2Client.getToken(code);

            // Set Credentials for oAuth2Client
            // This will be used to make requests to Google APIs
            // on behalf of the user
            utils.oAuth2Client.setCredentials(tokens);

            // Create cookie with id_token
            res.cookie('id_token', tokens.id_token);

            // Set Response Header
            res.setHeader("Authorization", "Bearer " + tokens.id_token);

            // Redirect to profile page
            res.redirect('/profile');
        }
    }
    catch(err) {
        res.status(500).send(err);
    }
};


// Logout
const logout = function(req, res) {
    res.clearCookie('id_token');
    res.redirect('/');
};


// User Controller Functions
const get_profile = async function(req, res) {
    // Get user info from Google
    const response = await utils.oAuth2Client.request({url: 'https://www.googleapis.com/oauth2/v1/userinfo'});

    const id_token = utils.get_id_token(req);

    let user = {}
    if (response) {
        user.id = response.data.id;
        user.name = response.data.name;
        user.id_token = id_token;
    } else {
        user.name = "Anonymous";
        user.email = "Anonymous";
        user.id_token = "Anonymous"
    }

    // Save user to database
    const user_key = await User.create_user(user);

    res.render('profile', {user: user});
};

const get_users = async function(req, res) {
    const users = await User.get_users();
    res.send(users);
};

// Put User: Update user info Method not allowed 405
const put_user = async function(req, res) {
    res.status(405).send("Method not allowed");
};


// Export all functions as methods of exports object
module.exports = {
    login,
    logout,
    auth_google,
    get_profile,
    get_users,
    put_user
};