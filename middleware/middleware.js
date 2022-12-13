
// View Middleware: GET /boats and /loads: Content-Type: text/html or application/json
function resContentType(req, res, next) {
    if (req.accepts(['text/html', 'application/json'])) {
        next();
    } else {
        res.status(406).send('Not Acceptable');
    }
}

// Reject requests that do not accept JSON
function resContentTypeJson(req, res, next) {
    if (req.accepts('application/json')) {
        next();
    } else {
        res.status(406).send('Not Acceptable');
    }
}



// Export all functions as methods of exports object
module.exports = {
    resContentType,
    resContentTypeJson,
};