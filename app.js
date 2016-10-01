


//  ___                                         _   ___
// | __| __ __  _ __   _ _   ___   ___  ___  _ | | / __|
// | _|  \ \ / | '_ \ | '_| / -_) (_-< (_-< | || | \__ \
// |___| /_\_\ | .__/ |_|   \___| /__/ /__/  \__/  |___/
//             |_|

//  ___              _           _     ___    ___
// / __|  ___   __  | |__  ___  | |_  |_ _|  / _ \
// \__ \ / _ \ / _| | / / / -_) |  _|  | |  | (_) |
// |___/ \___/ \__| |_\_\ \___|  \__| |___|  \___/

//  ___                                       _        _   ___
// | _ \  __ _   ___  ___  _ __   ___   _ _  | |_   _ | | / __|
// |  _/ / _` | (_-< (_-< | '_ \ / _ \ | '_| |  _| | || | \__ \
// |_|   \__,_| /__/ /__/ | .__/ \___/ |_|    \__|  \__/  |___/
//                        |_|

var express          = require("express");
var app              = express();
var server           = require("http").createServer(app);
var io               = require("socket.io")(server);
var passport         = require("passport")
var FacebookStrategy = require("passport-facebook").Strategy;

app.use(require('cookie-parser')())
app.use(require('body-parser')());
app.use(require('express-session')({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

config = require(__dirname + "/application/configs/env")();

passport.use(new FacebookStrategy({
        clientID: config.FB_CLIENT_ID,
        clientSecret: config.FB_CLIENT_SECRET,
        callbackURL: config.FB_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, callback) {
        // console.log(accessToken);
        callback(null, {id: profile.id, displayName: profile.displayName});
    }
));
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});


//  ___                _
// | _ \  ___   _  _  | |_   ___   ___
// |   / / _ \ | || | |  _| / -_) (_-<
// |_|_\ \___/  \_,_|  \__| \___| /__/

// Static
app.use("/bower", express.static(__dirname + "/bower_components"));
app.use("/public", express.static(__dirname + "/public"));

// Auth
app.get("/auth/facebook", passport.authenticate("facebook"));
app.get(
    "/auth/facebook/callback",
    passport.authenticate(
        "facebook",
        { successRedirect: "/public/?loginSuccess", failureRedirect: "/public/?loginFailed" }
    )
);
app.get("/auth/logout", function(req, res) {
    req.logout();
    res.redirect("/public/?logout");
});

// Starts server
server.listen(config.SERVER_PORT);
