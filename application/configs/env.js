

var Config = function() {

    return {
        FB_CLIENT_ID: process.env.FB_CLIENT_ID,
        FB_CLIENT_SECRET: process.env.FB_CLIENT_SECRET,
        FB_CALLBACK_URL: process.env.FB_CALLBACK_URL,

        SERVER_PORT: process.env.SERVER_PORT
    };
};

module.exports = Config;
