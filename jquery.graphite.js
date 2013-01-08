// graphite.js

function build_graphite_url(options, raw) {
    raw = raw || false;
    var url = options.graphite_url + "?";

    // use random parameter to force image refresh
    options["_t"] = options["_t"] || Math.random();

    $.each(options, function (key, value) {
        if (key === "targets") {
            $.each(value, function (index, value) {
                    if (raw) {
                        url += "&target=" + encodeURIComponent(value.target);
                    } else {
                        url += "&target=alias(color(" +encodeURIComponent(value.target) + ",'" + value.color +"'),'" + value.name +"')";
                    }
            });
        } else if (value !== null && key !== "url") {
            if (key === 'fgcolor' && raw) {
                // let's leave out these options, it's not needed, but looks cleaner.
            } else {
                url += "&" + key + "=" + encodeURIComponent(value);
           }
        }
    });
    if(raw) {
        url += '&format=json';
    }

    url = url.replace(/\?&/, "?");
    return url;
};

function build_anthracite_url(options) {
    return options.anthracite_url + '/jsonp';
}


function is_rgb_without_hash(str) {
    return (/^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/i.test(str));
}
// convert a colorspec from graphite into something that flot/rickshaw likes
function color_from_graphite(str) {
    if (is_rgb_without_hash(str)) {
        return '#' + str;
    }
    return str;
}

function find_definition (target_graphite, options) {
    var matching_i = undefined;
    for (var cfg_i = 0; cfg_i < options.targets.length && matching_i == undefined; cfg_i++) {
        // alias in config
        // currently this is not needed because we don't actually send aliases to graphite (yet)
        if(options.targets[cfg_i].name != undefined && options.targets[cfg_i].name == target_graphite.target) {
            matching_i = cfg_i;
        }
        // string match (no globbing)
        else if(options.targets[cfg_i].target == target_graphite.target) {
            matching_i = cfg_i;
        }
        // glob match?
        else if(target_graphite.target.graphiteGlob(options.targets[cfg_i].target)) {
            matching_i = cfg_i;
        }
    }
    if (matching_i == undefined) {
        console.error ("internal error: could not figure out which target_option target_graphite '" +
                target_graphite.target + "' comes from");
        return [];
    }
    return options.targets[matching_i];
}

(function ($) {
    var default_graphite_options = {
        'fgcolor' : '#ffffff'
    }
    var default_graphitejs_options = {
        'events_color': '#ccff66',
        'events_text_color': '#5C991F'
    }

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
        $img.attr("src", build_graphite_url(options));
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

    // note: graphite json output is a list of dicts like:
    // {"datapoints": [...], "target": "<metricname>" }
    // if you did alias(series, "foo") then "target" will contain the alias
    // (loosing the metricname which is bad, esp. when you had a glob with an alias, then you don't know what's what)
    // rickshaw: options.series is a list of dicts like:
    // { name: "alias", color: "foo", data: [{x: (...), y: (...)} , ...]}
    // we basically tell users to use this dict, with extra 'target' to specify graphite target string
    // flot: d = [[<ts>, <val>], (...)]
    // plot ($(..), [d], ..)
    $.fn.graphiteRick = function (options, on_error) {
        options = options || {};
        var settings = $.extend({}, default_graphite_options, default_graphitejs_options, $.fn.graphite.defaults, options);

        return this.each(function () {
            $this = $(this);
            $this.data("graphOptions", settings);
            $.fn.graphiteRick.render(this, settings, on_error);
        });
    };

    $.fn.graphiteFlot = function (options, on_error) {
        options = options || {};
        var settings = $.extend({}, default_graphite_options, default_graphitejs_options, $.fn.graphite.defaults, options);

        return this.each(function () {
            $this = $(this);
            $this.data("graphOptions", settings);
            $.fn.graphiteFlot.render(this, settings, on_error);
        });
    };

    $.fn.graphiteFlot.render = function(div, options, on_error) {
        $div = $(div);
        $div.height(options.height);
        $div.width(options.width);
        var drawFlot = function(resp_graphite, resp_anthracite) {
            resp_graphite = resp_graphite[0];
            var events = resp_anthracite[0].events;
            var all_targets = [];
            if(resp_graphite.length == 0 ) {
                console.warn("no data in graphite response");
            }
            for (var res_i = 0; res_i < resp_graphite.length; res_i++) {
                var target = find_definition(resp_graphite[res_i], options);
                target.label = target.name // flot wants 'label'
                target.data = [];
                if('drawNullAsZero' in options && options['drawNullAsZero']) {
                    for (var i in resp_graphite[res_i].datapoints) {
                        target.data[i] = [resp_graphite[res_i].datapoints[i][1] * 1000, resp_graphite[res_i].datapoints[i][0] || 0 ];
                    }
                } else {
                    for (var i in resp_graphite[res_i].datapoints) {
                        target.data[i] = [resp_graphite[res_i].datapoints[i][1] * 1000, resp_graphite[res_i].datapoints[i][0]];
                    }
                }
                all_targets.push(target);
            }
            // default config state modifiers (you can override them in your config objects)
            var states = {
                'stacked': {
                    'series': {'stack': true, 'lines': {'show': true, 'lineWidth': 0, 'fill': 1}},
                },
                'lines': {
                    // flot lib wants 0 or null. not false o_O
                    'series': {'stack': null, 'lines': { 'show': true, 'lineWidth': 0.6, 'fill': false }}
                }
            };
            if(! 'states' in options) {
                options['states'] = {};
            }
            options['states'] = $.extend(options['states'], states);

            function suffixFormatterSI(val, axis) {
                range = axis.max - axis.min;
                lowest = Math.min (range,val);
                if (lowest >= Math.pow(10,12))
                    return (val / Math.pow(10,12)).toFixed(axis.tickDecimals) + " T";
                if (lowest >= Math.pow(10,9))
                    return (val / Math.pow(10,9)).toFixed(axis.tickDecimals) + " G";
                if (lowest >= Math.pow(10,6))
                    return (val / Math.pow(10,6)).toFixed(axis.tickDecimals) + " M";
                if (lowest >= Math.pow(10,3))
                    return (val / Math.pow(10,3)).toFixed(axis.tickDecimals) + " k";
                return val.toFixed(axis.tickDecimals);
            }
            function suffixFormatterBinary(val, axis) {
                range = axis.max - axis.min;
                lowest = Math.min (range,val);
                if (lowest >= Math.pow(2,40))
                    return (val / Math.pow(2,40)).toFixed(axis.tickDecimals) + " Ti";
                if (lowest >= Math.pow(2,30))
                    return (val / Math.pow(2,30)).toFixed(axis.tickDecimals) + " Gi";
                if (lowest >= Math.pow(2,20))
                    return (val / Math.pow(2,20)).toFixed(axis.tickDecimals) + " Mi";
                if (lowest >= Math.pow(2,10))
                    return (val / Math.pow(2,10)).toFixed(axis.tickDecimals) + " Ki";
                return val.toFixed(axis.tickDecimals);
            }

            var buildFlotOptions = function(options) {
                options['xaxis'] = { color: options['fgcolor'], mode: 'time'};
                options['yaxis'] = { color: options['fgcolor'], tickFormatter: suffixFormatterSI};
                if('suffixes' in options) {
                    if(options['suffixes'] == 'binary') {
                        options['yaxis']['tickFormatter'] = suffixFormatterBinary;
                    } else if(!options['suffixes']) {
                        delete options['yaxis']['tickFormatter'];
                    }
                }
                if('title' in options) {
                    options['xaxes'] = [{axisLabel: options['title']}];
                }
                if('vtitle' in options) {
                    options['yaxes'] = [{position: 'left', axisLabel: options['vtitle']}];
                }
                for (i = 0; i < options['targets'].length; i++ ) {
                    options['targets'][i]['color'] = color_from_graphite(options['targets'][i]['color']);
                }
                if(!('grid' in options)) {
                    options['grid'] = {};
                }
                if(!('markings' in options['grid'])) {
                    options['grid']['markings'] = [];
                }
                for (var i = 0; i < events.length; i++) {
                    x = events[i].time * 1000;
                    options['grid']['markings'].push({ color: options['events_color'], lineWidth: 1, xaxis: { from: x, to: x} });
                }
                state = options['state'] || 'lines';
                return $.extend(options, options['states'][state]);
            }
            var plot = $.plot(div, all_targets, buildFlotOptions(options));
            // add labels
            var o;
            for (var i = 0; i < events.length; i++) {
                o = plot.pointOffset({ x: events[i].time * 1000, y: 0});
                msg = '<div style="position:absolute;left:' + (o.left) + 'px;top:' + ( o.top + 10 ) + 'px;';
                msg += 'color:' + options['events_text_color'] + ';font-size:smaller">';
                msg += '<b>' + events[i].type + '</b></br>';
                msg += events[i].desc
                msg += '</div>';
                $div.append(msg);
            }
            if (options['line_stack_toggle']) {
                var form = document.getElementById(options['line_stack_toggle']);
                if(options['state'] == 'stacked') {
                    lines_checked = '';
                    stacked_checked = ' checked';
                } else {
                    lines_checked = ' checked';
                    stacked_checked = '';
                }
                form.innerHTML= '<input type="radio" name="offset" id="lines" value="lines"'+ lines_checked +'>' +
                    '<label class="lines" for="lines">lines</label>' +
                    '<br/><input type="radio" name="offset" id="stacked" value="stacked"' + stacked_checked + '>' +
                    '<label class="stack" for="stack">stack</label>';

                form.addEventListener('change', function(e) {
                    var mode = e.target.value;
                    options['state'] = mode;
                    $.plot(div, all_targets, buildFlotOptions(options));
                }, false);
            }
        }
        $.when(
        $.ajax({
            accepts: {text: 'application/json'},
            cache: false,
            dataType: 'jsonp',
            jsonp: 'jsonp',
            url: build_graphite_url(options, true),
            error: function(xhr, textStatus, errorThrown) { on_error(textStatus + ": " + errorThrown); }
        }),
        $.ajax({
            accepts: {text: 'application/json'},
            cache: false,
            dataType: 'jsonp',
            jsonp: 'jsonp',
            url: build_anthracite_url(options, true),
            error: function(xhr, textStatus, errorThrown) { on_error(textStatus + ": " + errorThrown); }
        })).done(drawFlot);
    };

    $.fn.graphiteRick.render = function(div, options, on_error) {
        $div = $(div);
        $div.attr("height", options.height);
        $div.attr("width", options.width);
        var drawRick = function(resp_graphite) {
            // note that resp_graphite.length can be != options.targets.length.  let's call:
            // * target_graphite a targetstring as returned by graphite
            // * target_option a targetstring configuration
            // if a target_option contains * graphite will return all matches separately unless you use something to aggregate like sumSeries()
            // we must render all target_graphite's, but we must merge in the config from the corresponding target_option.
            // example: for a target_graphite 'stats.foo.bar' we must find a target_option 'stats.foo.bar' *or*
            // anything that causes graphite to match it, such as 'stats.*.bar' (this would be a bit cleaner if graphite's json
            // would include also the originally specified target string)
            // note that this code assumes each target_graphite can only be originating from one target_option,
            // in some unlikely cases this is not correct (there might be overlap between different target_options with globs)
            // but in that case I don't see why taking the settings of any of the possible originating target_options wouldn't be fine.
            var all_targets = [];
            resp_graphite = resp_graphite[0];
            var events = resp_anthracite[0].events;
            if(resp_graphite.length == 0 ) {
                console.warn("no data in graphite response");
            }
            for (var res_i = 0; res_i < resp_graphite.length; res_i++) {
                var target = find_definition(resp_graphite[res_i], options);
                target.data = [];
                for (var i in resp_graphite[res_i].datapoints) {
                    target.data[i] = { x: resp_graphite[res_i].datapoints[i][1], y: resp_graphite[res_i].datapoints[i][0] || 0 };
                }
                all_targets.push(target);
            }
            options['element'] = div;
            options['series'] = all_targets
            for (i = 0; i < options['targets'].length; i++ ) {
                options['targets'][i]['color'] = color_from_graphite(options['targets'][i]['color']);
            }
            var graph = new Rickshaw.Graph(options);
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
            var setRickshawOptions = function (options, graph) {
                if ('state' in options && options['state'] == 'stacked') {
                    graph.setRenderer('stack');
                    graph.offset = 'zero';
                }
                else { // 'state' is lines
                    graph.setRenderer('line');
                    graph.offset = 'zero';
                }
                return graph;
            }
            graph = setRickshawOptions(options, graph);
            graph.render();
            if (options['legend']) {
                var legend = new Rickshaw.Graph.Legend({
                    graph: graph,
                    element: document.getElementById(options['legend'])
                });
                if(options['legend_toggle']) {
                    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
                        graph: graph,
                        legend: legend
                    });
                }
                if(options['legend_reorder']) {
                    var order = new Rickshaw.Graph.Behavior.Series.Order({
                        graph: graph,
                        legend: legend
                    });
                }
                if(options['legend_highlight']) {
                    var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
                    graph: graph,
                    legend: legend
                    });
                }
            }
            if (options['line_stack_toggle']) {
                var form = document.getElementById(options['line_stack_toggle']);
                if(!options['renderer'] || options['renderer'] == 'area') {
                    lines_checked = '';
                    stack_checked = ' checked';
                } else {
                    lines_checked = ' checked';
                    stack_checked = '';
                }
                form.innerHTML= '<input type="radio" name="mode" id="lines" value="lines"'+ lines_checked +'>' +
                    '<label class="lines" for="lines">lines</label>' +
                    '<br/><input type="radio" name="mode" id="stacked" value="stacked"' + stack_checked + '>' +
                    '<label class="stack" for="stacked">stacked</label>';

                form.addEventListener('change', function(e) {
                    options['state'] = e.target.value;
                    graph = setRickshawOptions(options, graph);
                    graph.render();
                }, false);
            }
        }
        $.ajax({
            accepts: {text: 'application/json'},
            cache: false,
            dataType: 'jsonp',
            jsonp: 'jsonp',
            url: build_graphite_url(options, true),
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
        graphite_url: "/render/",
        width: "940"
    };

}(jQuery));
