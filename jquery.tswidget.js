function strip_ending_slash(str) {
    if(str.substr(-1) == '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}

// return a list of urls from the requested parameters
// why N urls? because sometimes urls would become too long (with many targets)
// it's up to the caller to deal with this.
function build_graphite_url(options, raw) {
    raw = raw || false;
    var limit = 2000;  // http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
    var url = options.graphite_url + "?";
    var url_target = '';  // will contain the part of a url with target args
    var target_parts = []; // will contain one or more of the above, depending on limit

    internal_options = ['_t'];
    graphite_options = ['target', 'targets', 'from', 'until', 'rawData', 'format'];
    graphite_png_options = ['areaMode', 'width', 'height', 'template', 'margin', 'bgcolor',
                         'fgcolor', 'fontName', 'fontSize', 'fontBold', 'fontItalic',
                         'yMin', 'yMax', 'colorList', 'title', 'vtitle', 'lineMode',
                         'lineWith', 'hideLegend', 'hideAxes', 'hideGrid', 'minXstep',
                         'majorGridlineColor', 'minorGridLineColor', 'minorY',
                         'thickness', 'min', 'max', 'tz'];

    // use random parameter to force image refresh
    options["_t"] = options["_t"] || Math.random();

    $.each(options, function (key, value) {
        if(raw) {
            if ($.inArray(key, graphite_options) == -1) {
                return;
            }
        } else {
            if ($.inArray(key, graphite_options) == -1 && $.inArray(key, graphite_png_options) == -1) {
                return;
            }
        }
        if (key === "targets") {
            $.each(value, function (index, value) {
                    if (raw) {
                        // it's normally pointless to use alias() in raw mode, because we apply an alias (name) ourself
                        // in the client rendering step.  we just need graphite to return the target.
                        // but graphite sometimes alters the name of the target in the returned data
                        // (https://github.com/graphite-project/graphite-web/issues/248)
                        // so we need a good string identifier and set it using alias() (which graphite will honor)
                        // so that we recognize the returned output. simplest is just to include the target spec again
                        // though this duplicates a lot of info in the url.
                        new_part = "&target=alias(" + encodeURIComponent(value.target) + ",'" + value.target +"')";
                    } else {
                        new_part = "&target=alias(color(" +encodeURIComponent(value.target + ",'" + value.color) +"'),'" + value.name +"')";
                    }
                    // note that this doesn't account for non-target args that will get added to url later, but this is good enough.
                    if (url.length + url_target.length + new_part.length > limit) {
                        target_parts.push(url_target);
                        url_target = "";
                    }
                    url_target += new_part;
            });
        } else if (value !== null) {
            // key can be 'target' here, so the 'targets' option doesn't have to be set (see above)
            // so url_target can remain empty sometimes, which is fine. though using 'targets' is
            // probably the better way.
            url += "&" + key + "=" + encodeURIComponent(value);
        }
    });
    target_parts.push(url_target);
    return $.map(target_parts, function(target_part) {
        if(raw) {
            target_part += '&format=json';
        }
        return (url + target_part).replace(/\?&/, "?");
    });
};

function build_anthracite_url(options) {
    url = strip_ending_slash(options.anthracite_url) + '/events/jsonp';
    if ('events_query' in options) {
        url += '?q=' + options['events_query'];
    }
    return url;
}

function find_definition (target_graphite, options) {
    var matching_i = undefined;
    for (var cfg_i = 0; cfg_i < options.targets.length && matching_i == undefined; cfg_i++) {
        // string match (no globbing)
        if(options.targets[cfg_i].target == target_graphite.target) {
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
    /*
    from graphite-web-0.9.9/graphTemplates.conf.example:

    [default]
    background = black
    foreground = white
    majorLine = white
    minorLine = grey
    lineColors = blue,green,red,purple,brown,yellow,aqua,grey,magenta,pink,gold,rose
    fontName = Sans
    fontSize = 10
    fontBold = False
    fontItalic = False

    definitions below are from http://graphite.readthedocs.org/en/1.0/url-api.html
    */
    var default_graphite_options = {
        'bgcolor': '#000000', // background color of the graph
        'fgcolor' : '#ffffff',  // title, legend text, and axis labels
        'majorLine': '#ffffff',
        'minorLine': '#afafaf'
    }
    var default_tswidget_options = {
        'events_color': '#ccff66',
        'es_events_color': '#ff0066',
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
        $img.attr("src", build_graphite_url(options)[0]); // TODO: ideally we would actually show multiple images
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
        var settings = $.extend({}, default_graphite_options, default_tswidget_options, $.fn.graphite.defaults, options);

        return this.each(function () {
            $this = $(this);
            $this.data("graphOptions", settings);
            $.fn.graphiteRick.render(this, settings, on_error);
        });
    };

    $.fn.graphiteFlot = function (options, on_error) {
        if ('zoneFileBasePath' in options) {
            timezoneJS.timezone.zoneFileBasePath = options['zoneFileBasePath'];
            timezoneJS.timezone.init();
        }
        options = options || {};
        var settings = $.extend({}, default_graphite_options, default_tswidget_options, $.fn.graphite.defaults, options);

        return this.each(function () {
            $this = $(this);
            $this.data("graphOptions", settings);
            $.fn.graphiteFlot.render(this, settings, on_error);
        });
    };

    $.fn.graphiteFlot.render = function(div, options, on_error) {
        var id = div.getAttribute('id');
        $div = $(div);
        $div.height(options.height);
        $div.width(options.width);
        var events = [];
        var es_events = [];
        var all_targets = [];
        var add_targets = function(response_data) {
            for (var res_i = 0; res_i < response_data.length; res_i++) {
                var target = find_definition(response_data[res_i], options);
                target.label = target.name // flot wants 'label'
                target.data = [];
                if('drawNullAsZero' in options && options['drawNullAsZero']) {
                    for (var i in response_data[res_i].datapoints) {
                        target.data[i] = [response_data[res_i].datapoints[i][1] * 1000, response_data[res_i].datapoints[i][0] || 0 ];
                    }
                } else {
                    for (var i in response_data[res_i].datapoints) {
                        target.data[i] = [response_data[res_i].datapoints[i][1] * 1000, response_data[res_i].datapoints[i][0]];
                    }
                }
                all_targets.push(target);
            }
        }

        var drawFlot = function() {
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
            if(!('states' in options)) {
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
                // xaxis color = title color and horizontal lines in grid
                // yaxis color = vtitle color and vertical lines in grid
                // xaxis tickcolor = override vertical lines in grid
                // yaxis tickcolor = override horizontal lines in grid
                // note: flot doesn't distinguish between major and minor line
                // so i use minor, because graphite uses very thin lines which make them look less intense,
                // in flot they seem to be a bit thicker, so generally make them less intense to have them look similar.
                // although they still look more intense than in graphite though.
                // tuning tickLength doesn't seem to help (and no lineWidth for axis..). maybe a graphite bug
                options['tickColor'] = options['minorLine'];
                options['xaxis'] = { color: options['fgcolor'], tickColor: options['tickColor'], mode: 'time'};
                if ('tz' in options) {
                    options['xaxis']['timezone'] = options['tz'];
                }
                options['yaxis'] = { color: options['fgcolor'], tickColor: options['tickColor'], tickFormatter: suffixFormatterSI};
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
                    options['targets'][i]['color'] = options['targets'][i]['color'];
                }
                if(!('grid' in options)) {
                    options['grid'] = {};
                }
                if(options['hover_details']) {
                    options['grid']['hoverable'] = true;
                    options['grid']['autoHighlight'] = true;  // show datapoint being hilighted. true by default but hardcode to make sure
                }
                if(!('markings' in options['grid'])) {
                    options['grid']['markings'] = [];
                }
                for (var i = 0; i < events.length; i++) {
                    x = events[i].time * 1000;
                    options['grid']['markings'].push({ color: options['events_color'], lineWidth: 1, xaxis: { from: x, to: x} });
                }
                for (var i = 0; i < es_events.length; i++) {
                    x = Date.parse(es_events[i]['_source']['@timestamp']);
                    options['grid']['markings'].push({ color: options['es_events_color'], lineWidth: 1, xaxis: { from: x, to: x} });
                }
                state = options['state'] || 'lines';
                return $.extend(options, options['states'][state]);
            }
            var plot = $.plot(div, all_targets, buildFlotOptions(options));
            // add labels
            var o;
            for (var i = 0; i < events.length; i++) {
                o = plot.pointOffset({ x: events[i].time * 1000, y: 0});
                msg = '<div style="position:absolute;left:' + (o.left) + 'px;top:' + ( o.top + 35 ) + 'px;';
                msg += 'color:' + options['events_text_color'] + ';font-size:smaller">';
                msg += '<b>' + events[i].type + '</b></br>';
                msg += events[i].desc
                msg += '</div>';
                $div.append(msg);
            }
            for (var i = 0; i < es_events.length; i++) {
                o = plot.pointOffset({ x: Date.parse(es_events[i]['_source']['@timestamp']), y: 0});
                msg = '<div style="background-color:#40FF00;position:absolute;left:' + (o.left) + 'px;top:' + ( o.top + 35 ) + 'px;';
                msg += 'color:' + '#FF0066' + ';font-size:smaller">';
                msg += '<b>tags</b>: ' + es_events[i]['_source']['@tags'].join(' ') + '</br>';
                msg += "<b>env</b>: " + es_events[i]['_source']['@fields']['environment'] + '</br>';
                msg += "<b>msg</b>: " + es_events[i]['_source']['@message'] + '</br>';
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
           function showTooltip(x, y, contents) {
                $("<div id='tooltip_" + id + "'>" + contents + "</div>").css({
                    position: "absolute",
                    display: "none",
                    top: y + 5,
                    left: x + 5,
                    border: "1px solid #fdd",
                    padding: "2px",
                    "background-color": "#fee",
                    opacity: 0.80
                }).appendTo("body").fadeIn(200);
            }
          var previousPoint = null;
        $(div).bind("plothover", function (event, pos, item) {
            if (item) {
                if (previousPoint != item.dataIndex) {
                    previousPoint = item.dataIndex;
                    $("#tooltip_" + id).remove();
                    var x = item.datapoint[0],
                    y = item.datapoint[1].toFixed(2);
                    //alert();
                    var date = new Date(x);
                    var hours = date.getHours();
                    var minutes = date.getMinutes();
                    var seconds = date.getSeconds();
                    var formattedTime = hours + ':' + minutes + ':' + seconds;
                    showTooltip(item.pageX, item.pageY,
                        "series: " + item.series.label + "<br/>time: " + formattedTime + "<br/>value: " + y);
                }
            } else {
                $("#tooltip_" + id).remove();
                previousPoint = null;
            }
        });

        }
        urls = build_graphite_url(options, true);
        var requests = $.map(urls, function(url) {
            return $.ajax({
                accepts: {text: 'application/json'},
                cache: false,
                dataType: 'jsonp',
                jsonp: 'jsonp',
                url: url,
                success: function(data, textStatus, jqXHR ) {
                    if(data.length == 0 ) {
                        console.warn("no data in graphite response");
                    }
                    add_targets(data);
                },
                error: function(xhr, textStatus, errorThrown) { on_error(textStatus + ": " + errorThrown); }
            });
        });
        if('anthracite_url' in options){
            requests.push($.ajax({
                accepts: {text: 'application/json'},
                cache: false,
                dataType: 'jsonp',
                jsonp: 'jsonp',
                url: build_anthracite_url(options, true),
                success: function(data, textStatus, jqXHR ) { events = data.events },
                error: function(xhr, textStatus, errorThrown) { on_error(textStatus + ": " + errorThrown); }
            }));
        }
        if('es_url' in options){
            requests.push($.ajax({
                accepts: {text: 'application/json'},
                cache: false,
                dataType: 'json',
                jsonp: 'json',
                url: options['es_url'],
                success: function(data, textStatus, jqXHR ) { es_events = data.hits.hits },
                error: function(xhr, textStatus, errorThrown) { on_error(textStatus + ": " + errorThrown); }
            }));
        }

        $.when.apply($, requests ).done(drawFlot);
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
                options['targets'][i]['color'] = options['targets'][i]['color'];
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
            if(options['hover_details']) {
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
            url: build_graphite_url(options, true)[0], // TODO: support for multiple urls, like flot has
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
