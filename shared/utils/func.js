
// Common usage utilities

(function(exports) {

    exports.getRandomAnonId = function() {
        return Math.random().toString(36).slice(2).toUpperCase();
    },

    exports.getRandomColor = function() {
        // return "#" + ('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6);
        colors = [
            "black",
            "blue",
            "red",
            "green",
            "white"
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    // Ref: https://plainjs.com/javascript/utilities/merge-two-javascript-objects-19/
    exports.extend = function(obj, src) {
        Object.keys(src).forEach(function(key) { obj[key] = src[key]; });

        return obj;
    }

}(typeof exports === "undefined" ? this.kEvents = {} : exports));
