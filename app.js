


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
var kEvents          = require(__dirname + "/shared/utils/kEvents");
var utilFunc         = require(__dirname + "/shared/utils/func");

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
var sessionMidlwr    = session({ secret: config.COOKIE_SECRET, store: sessionStore, resave: true });

var redis            = require("redis");
var redis_client     = redis.createClient();

app.use(cookieParser())
app.use(require('body-parser')());
app.use(sessionMidlwr);
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'jade');
app.set('views', [
    __dirname + '/application/views'
]);
app.locals.serverHost = config.SERVER_HOST;
app.locals.serverPort = config.SERVER_PORT;

io.use(function(socket, next) {
    sessionMidlwr(socket.request, socket.request.res, next);
});
io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    secret: config.COOKIE_SECRET,
    store: sessionStore,
    // TODO: Add proper handler methods
    success: function(data, accept) {
        accept();
    },
    fail: function(data, message, error, accept) {
        if (error) accept(new Error(message));
        accept(null, false);
    },
}));

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


//                  _           _     _           _                       _   _
//  ___  ___   __  | |__  ___  | |_  (_)  ___    | |_    __ _   _ _    __| | | |  ___   _ _   ___
// (_-< / _ \ / _| | / / / -_) |  _| | | / _ \   | ' \  / _` | | ' \  / _` | | | / -_) | '_| (_-<
// /__/ \___/ \__| |_\_\ \___|  \__| |_| \___/   |_||_| \__,_| |_||_| \__,_| |_| \___| |_|   /__/
//

var gHandler = function(socket) {

    // Assing one anonId & color per session
    if (!socket.request.session.anonId) {
        socket.request.session.anonId = utilFunc.getRandomAnonId();
        socket.request.session.color  = utilFunc.getRandomColor();
        socket.request.session.save();
    }
    socket.anonId = socket.request.session.anonId;
    socket.color = socket.request.session.color;

    var userMeta = {anonId: socket.anonId, color: socket.color};

    // Sends self meta to connected socket & broadcasts to others
    socket.send(utilFunc.extend({type: "selfMeta"}, userMeta));
    socket.broadcast.emit(kEvents.G_USER_ENTERED, userMeta);

    redis_client.incr("UsersCount", function(err, count) {
        io.sockets.send({type: "usersCount", usersCount: count});
    });

    socket.on(kEvents.G_USER_MSG, function(message) {
        socket.broadcast.emit(kEvents.G_CLIENT_USER_MSG, utilFunc.extend({text: message}, userMeta));
    });

    // Attaching disconnect handler
    socket.on("disconnect", function() {
        redis_client.decr("UsersCount", function(err, count) {
            io.sockets.send({type: "usersCount", usersCount: count});
        });
        socket.broadcast.emit(kEvents.G_USER_GONE, userMeta);
    });
};

io.on("connection", gHandler);



//  ___                _
// | _ \  ___   _  _  | |_   ___   ___
// |   / / _ \ | || | |  _| / -_) (_-<
// |_|_\ \___/  \_,_|  \__| \___| /__/

// Static
app.use("/bower", express.static(__dirname + "/bower_components"));
app.use("/public", express.static(__dirname + "/public"));
app.use("/shared", express.static(__dirname + "/shared"));

// Auth
app.get("/login", authMidlwr.isLoggedOut, function(req, res) {
    res.render("unmanaged/login", {"title": "Login"});
});
app.get("/auth/facebook", passport.authenticate("facebook"));
app.get(
    "/auth/facebook/callback",
    passport.authenticate(
        "facebook",
        { successRedirect: "/g", failureRedirect: "/public/?loginFailed" }
    )
);
app.get("/logout", function(req, res) {
    req.logout();
    req.session.destroy();
    res.redirect("/public/?logoutSuccess");
});

// Global chat room
app.get("/g", authMidlwr.isLoggedIn, function(req, res) {
    res.render("unmanaged/commonRoom", {"title": "Common room"});
});

// Starts server
server.listen(config.SERVER_PORT);
