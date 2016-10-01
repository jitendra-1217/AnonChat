
// Route middleware for auth


// --------------------------------
// Example of how to use authMidlwr
// --------------------------------
//
// authMidlwr = require(__dirname + "/application/middlewares/auth");
// app.get("/secret", authMidlwr.isLoggedIn, function(req, res) {
//     res.send("Secret!")
// });

module.exports = {

    "isLoggedIn": function(req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.status(401).send("Auth required");
        }
    }
};
