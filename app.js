


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

var config           = require(__dirname + "/application/configs/env")();
var authMidlwr       = require(__dirname + "/application/middlewares/auth");

var express          = require("express");
var app              = express();
var server           = require("http").createServer(app);
var io               = require("socket.io")(server);
var cookieParser     = require('cookie-parser');
var passport         = require("passport")
var FacebookStrategy = require("passport-facebook").Strategy;
var passportSocketIo = require("passport.socketio");
var session          = require("express-session")
var RedisStore       = require('connect-redis')(session);
var sessionStore     = new RedisStore({host: config.REDIS_HOST, port: config.REDIS_PORT});

app.use(cookieParser())
app.use(require('body-parser')());
app.use(session({
    secret: config.COOKIE_SECRET,
    store: sessionStore
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'jade');
app.set('views', [
    __dirname + '/application/views'
]);

io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    secret: config.COOKIE_SECRET,
    store: sessionStore,
    // TODO: Add proper handler methods
    success: function(data, accept) {
        console.log("Successful connection to socket.io");
        accept();
    },
    fail: function(data, message, error, accept) {
        if (error) accept(new Error(message));
        console.log("Failed to connect to socket.io");
        accept(null, false);
    },
}));

// io.sockets.on('connection', function(socket) {
//     console.log(socket.request.user);
// });

passport.use(new FacebookStrategy({
        clientID: config.FB_CLIENT_ID,
        clientSecret: config.FB_CLIENT_SECRET,
        callbackURL: config.FB_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, callback) {
        // TODO: Push accessToken to session
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
app.get("/login", authMidlwr.isLoggedOut, function(req, res) {
    res.render("unmanaged/login", {"title": "Login"});
})
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
    res.redirect("/public/?logoutSuccess");
});

// Starts server
server.listen(config.SERVER_PORT);
