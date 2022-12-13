const express = require('express');

const router = express.Router();


// Import Boat Controller
const boatController = require('../controllers/boats_controller');
// Import Load Controller
const loadController = require('../controllers/loads_controller');
// Import User Controller
const userController = require('../controllers/users_controller');

// Aunthentication Middleware
 const auth = require('../oauth/utils');

 // Import Middleware
const mid = require('../middleware/middleware');



// Home Route
router.get('/', async function(req, res) {
    res.render('welcome');
});

// Unprotected Boat Routes
router.get('/boatspublic', mid.resContentTypeJson, boatController.get_all_boats);

// Boat Routes Protected by Authentication
router.get('/boats', auth.authenticate, mid.resContentTypeJson, boatController.get_boats);
router.get('/boats/:id', auth.authenticate, mid.resContentType, boatController.get_boat);
router.post('/boats', auth.authenticate, mid.resContentType,  boatController.post_boat);
router.delete('/boats/:id', auth.authenticate, mid.resContentType,  boatController.delete_boat);
router.put('/boats/:id', auth.authenticate, mid.resContentType,  boatController.put_boat);

// Unprotected Load Routes
router.get('/loads', mid.resContentTypeJson, loadController.get_all_loads);

// Load Routes Protected by Authentication
router.get('/loads/:id', auth.authenticate, loadController.get_load);
router.get('/boats/:boat_id/loads', auth.authenticate, loadController.get_all_loads_for_boat);
router.post('/loads', auth.authenticate, loadController.post_load);
router.delete('/boats/:boat_id/loads/:load_id', auth.authenticate, loadController.remove_load_from_boat);
router.delete('/loads/:id', auth.authenticate, loadController.delete_load);
router.put('/boats/:boat_id/loads/:load_id', auth.authenticate, loadController.put_load);
router.get('/boats/:boat_id/loads', auth.authenticate, loadController.get_all_loads_for_boat);

// User Routes
router.get('/users', userController.get_users);
router.get('/profile', auth.authenticate, userController.get_profile);
// Authentication Routes
router.get('/login', userController.login);
router.get('/logout', userController.logout);
router.get('/auth/google', userController.auth_google);


module.exports = router;