// graphite.js

function build_url(options) {
    var url = options.url + "?";

    // use random parameter to force image refresh
    options["_t"] = options["_t"] || Math.random();

    $.each(options, function (key, value) {
        if (key === "target") {
            $.each(value, function (index, value) {
                url += "&target=" + value;
            });
        } else if (value !== null && key !== "url") {
            url += "&" + key + "=" + value;
        }
    });

    url = url.replace(/\?&/, "?");
    return url;
};

(function ($) {
    $.fn.graphite = function (options) {
        if (options === "update") {
            $.fn.graphite.update(this, arguments[1]);
            return this;
        }

        // Initialize plugin //
        options = options || {};
        var settings = $.extend({}, $.fn.graphite.defaults, options);

        return this.each(function () {
            $this = $(this);

            $this.data("graphOptions", settings);
            $.fn.graphite.render($this, settings);
        });

    };

    $.fn.graphite.render = function($img, options) {
        $img.attr("src", build_url(options));
        $img.attr("height", options.height);
        $img.attr("width", options.width);
    };

    $.fn.graphite.update = function($img, options) {
        options = options || {};
        $img.each(function () {
            $this = $(this);
            var settings = $.extend({}, $this.data("graphOptions"), options);
            $this.data("graphOptions", settings);
            $.fn.graphite.render($this, settings);
        });
    };

    // Default settings. 
    // Override with the options argument for per-case setup
    // or set $.fn.graphite.defaults.<value> for global changes
    $.fn.graphite.defaults = {
        from: "-1hour",
        height: "300",
        until: "now",
        url: "/render/",
        width: "940"
    };

}(jQuery));
