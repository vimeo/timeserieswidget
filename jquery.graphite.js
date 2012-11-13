// graphite.js

function build_url(options) {
    var url = options.url + "?";

    // use random parameter to force image refresh
    options["_t"] = options["_t"] || Math.random();

    $.each(options, function (key, value) {
        if (key === "target") {
            $.each(value, function (index, value) {
                if (value.data) { // rickshaw's "target is a dictionary"
                    url += "&target=" + value.data;
                } else { // png's "target is a string
                    url += "&target=" + value;
                }
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

    $.fn.graphiteRick = function (options) {
        options = options || {};
        var settings = $.extend({}, $.fn.graphite.defaults, options);

        return this.each(function () {
            $this = $(this);

            $this.data("graphOptions", settings);
            $.fn.graphiteRick.render(this, settings);
        });
    };

    $.fn.graphiteRick.render = function(div, options, on_error) {
        $div = $(div);
        $div.attr("height", options.height);
        $div.attr("width", options.width);
        var drawRick = function(response) {
            if (response.length != options.target.length) {
                error = "num requested targets: " + options.target.length +
                        ", but # targets for which we received data: " + response.length;
                return or_error (error);
            }
            var all_targets = [];
            for (var t = 0; t < response.length; t++) {
                // create target objects from config we had, but the received datapoints merged in
                var target = options.target[t];
                target.data = [];
                for (var i in response[t].datapoints) {
                    target.data[i] = { x: response[t].datapoints[i][1], y: response[t].datapoints[i][0] || 0 };
                }
                all_targets.push(target);
            }
            var graph = new Rickshaw.Graph({
                element: div,
                height: options.height,
                width: options.width,
                series: all_targets
            });
            if(options['x_axis']) {
                var x_axis = new Rickshaw.Graph.Axis.Time( { graph: graph } );
            }
            if(options['y_axis']) {
                var y_axis = new Rickshaw.Graph.Axis.Y( {
                    graph: graph,
                    orientation: 'left',
                    tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
                    element: document.getElementById(options['y_axis']),
                });
            }
            if(options['hoover_details']) {
                var hoverDetail = new Rickshaw.Graph.HoverDetail( {
                    graph: graph
                } );
            }
            graph.render();
            if (options['legend']) {
                var legend = new Rickshaw.Graph.Legend({
                    graph: graph,
                    element: document.getElementById(options['legend'])
                });
                if(options['legend.toggle']) {
                    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
                        graph: graph,
                        legend: legend
                    });
                }
                if(options['legend.reorder']) {
                    var order = new Rickshaw.Graph.Behavior.Series.Order({
                        graph: graph,
                        legend: legend
                    });
                }
                if(options['legend.highlight']) {
                    var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
                    graph: graph,
                    legend: legend
                    });
                }
            }
        }
        $.ajax({
            accepts: {text: 'application/json'},
            cache: false,
            dataType: 'jsonp',
            jsonp: 'jsonp',
            url: build_url(options) + '&format=json',
            error: function(xhr, textStatus, errorThrown) { on_error(textStatus + ": " + errorThrown); }
          }).done(drawRick);
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
