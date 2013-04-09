## TimeSeriesWidget

Plugin to easily make time series graphs and update them on the fly using
[Graphite url api](http://readthedocs.org/docs/graphite/en/latest/url-api.html) on the background,
allowing you to easily add:

* Client-side rendered, interactive, canvas-based graphs
  (relying on [Flot](http://www.flotcharts.org/))
* Client-side rendered, interactive, svg-based graphs
  (relying on [Rickshaw](http://code.shutterstock.com/rickshaw/))
* PNG's rendered by Graphite

Goals:
* easy to use, elegant but powerful api, aimed to cover all your graphite/time series graphing needs.
* only abstract where it makes sense.  Graphite, Flot, and Rickshaw api's are awesome and powerfull, expose them
* aim for some consistency in configuration across backends (to the extent possible and sane)
* provide all interactive features you would expect; so that all graphite dashboards can rely on the same
code to render client-side graphs, minimizing redundant work and combining efforts.

Feature comparison table.
NA = not available (can't be done to my knowledge), WIP = work in progress (should be possible)

<table>
<tr>
    <th></th>
    <th>PNG</th>
    <th>Flot</th>
    <th>Rickshaw</th>
</tr>
<tr>
    <td>description</td>
    <td>Static PNG images rendered by graphite server</td>
    <td>Interactive client-side rendering using canvas</td>
    <td>Interactive client-side rendering using SVG</td>
</tr>
<tr>
    <td>speed</td>
    <td>quite fast</td>
    <td>quite fast.  interactive features near-realtime</td>
    <td>slow with many datapoints and/or multiple graphs (needs better <a href="https://github.com/graphite-project/graphite-web/issues/153">graphite consolidation</a>)</td>
</tr>
<tr>
    <td>hover over datapoints/graph -> popup with exact data</td>
    <td>NA</td>
    <td>WIP (<a href="https://github.com/flot/flot/pull/867">flot pull 867</a>)</td>
    <td>Y</td>
</tr>
<tr>
    <td>events with annotations (using anthracite)</td>
    <td>NA</td>
    <td>Y</td>
    <td>WIP</td>
</tr>
<tr>
    <td>interactive zooming and panning</td>
    <td>NA</td>
    <td>WIP</td>
    <td>WIP</td>
</tr>
<tr>
    <td>hover over legend -> hilight on plot</td>
    <td>NA</td>
    <td>WIP</td>
    <td>Y</td>
</tr>
<tr>
    <td>reordering items in legend to reorder on stacked plot</td>
    <td>NA</td>
    <td>WIP</td>
    <td>Y</td>
</tr>
<tr>
    <td>toggling targets on/off</td>
    <td>NA</td>
    <td>WIP (<a href="https://github.com/flot/flot/pull/848">flot pull 848</a>,
             <a href="https://github.com/flot/flot/issues/869">flot pull 869</a>,
             <a href="https://github.com/Dieterbe/timeserieswidget/tree/flot-legend-toggle">branch flot-legend-toggle</a>)</td>
    <td>Y</td>
</tr>
<tr>
    <td>toggling between line vs stack (band) mode</td>
    <td>NA</td>
    <td>Y</td>
    <td>Y</td>
</tr>
<tr>
    <td>auto smoothing dense graphs based on datapoints/pixel</td>
    <td>NA</td>
    <td>NA</td>
    <td>WIP</td>
</tr>
<tr>
    <td>notes</td>
    <td>1999 called. they want their static images back.<br/>
    you could actually implement interactive features with a JS layer on top. (and some monitoring dashboards do this) but that is/would be soo slow)</td>
    <td></td>
    <td>more "generic" (based on D3), all data is accessible in DOM and themeable with CSS</td>
</tr>
</table>

**any web code that can generate graphite urls can use this library with minimal transition work**

![Screenshot](https://raw.github.com/Dieterbe/timeserieswidget/master/screenshots/flot-annotated-event.png)
![Screenshot](https://raw.github.com/Dieterbe/timeserieswidget/master/screenshots/compare-stacked.png)

## Installation

 * git clone into directory that will be available over http
 * git submodule update --init
 * include the needed css/js depending on your needs; see example files

## Notes for client-side graph rendering / troubleshooting

### Configuration of graphite server / If you don't seem to get any actual data

you'll need a small tweak to allow this app to request data from graphite. (we could use jsonp, but see https://github.com/obfuscurity/tasseo/pull/27)
For apache2 this works:

    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, OPTIONS"
    Header set Access-Control-Allow-Headers "origin, authorization, accept"


## Flot client-side canvas graphs

see examples
note: for timezone support, include timezone-js/src/date.js,
Set the 'zoneFileBasePath' option to the url path needed to reach the included tz folder,
and of course set the 'tz' parameter to your timezone.
Note if you load files straight from disk (such as the examples), you might see errors like
"XMLHttpRequest cannot load file://(...)/timeserieswidget/tz/northamerica. Origin null is not allowed by Access-Control-Allow-Origin.".
This is a CORS restriction, see http://stackoverflow.com/questions/3595515/xmlhttprequest-error-origin-null-is-not-allowed-by-access-control-allow-origin


## Rickshaw client-side svg graphs

### Minimal config
```html
<div id="graph">
```

```js
$("#graph").graphiteRick({
    from: "-24hours",
    targets: [
        {target: "server.web1.load"},
    ],
});
```

### Advanced examples

See 'examples' directory.  
All example files are created so that you can easily diff between png and rickshaw implementations.
There's also a file with both a png and rickshaw graph for easy comparison
(this is used in the screenshot above)


Note that graphite options for visual things (colors, areaMode, legends, etc) will be ignored,
but we provide alternatives (work in progress though).  There's a bunch of options; for now just look them
up in the source code.


### TODO

* timezone
* zoom, panning

## Optional keys for flot/rickshaw

* 'suffixes': false, 'binary' or 'si' (defaults to 'si')
 automatically show large numbers using a prefix.  like graphite does, but configurable

## Graphite PNG's
### How it works

One. Adding a graph to a page:

```html
<img id="graph">
```

```js
$("#graph").graphite({
    from: "-24hours",
    target: [
        "server.web1.load",
    ],
});
```

Two. Setting custom options:

```html
<img id="graph">
```

```js
$("#graph").graphite({
    from: "-24hours",
    colorList: "red,green",
    target: [
        "alias(summarize(stats.site1.auth.login.error,'30min'),'Login Errors')",
        "alias(summarize(stats.site1.auth.login.user,'30min'),'Login Success')"
    ],
    title: "Login errors vs Success"
});
```

Three. Setting global defaults:

```js
$.fn.graphite.defaults.width = "450"
$.fn.graphite.defaults.height = "300"
```

Four. Updating existing graph:

```js
$.fn.graphite.update($("#graph"), {from: "-3days", lineWidth: "2"});
```

Five. Setting a custom api url--the default is "/render/":

```js
$.fn.graphite.defaults.graphite_url = "http://myserver/render/"
```

or

```js
$("#graph").graphite({
    graphite_url: "http://myserver/render/"
});
```

### $(img).graphite(options)

You should probably specify a target. All other settings are optional. All
settings will be passed through to the graphite api.


# Configuration
retaining a familiar 'graphite function api'-feel, easy switching between backends,
designing an API on top of flot/rickshaw tailored towards timeseries and making common features easily available,
while still providing access to flot/rickshaw internals for deep customisation, is no easy task.
But I think I've come up with a solution that's fairly elegant.  Here's how it works.

* the general rule is: each option in the option dict corresponds with a graphite url parameter name
* instead of `target=<foo>&target=<bar>(...)` we define a `targets` list option
* in target definitions:
  * don't use `alias()` or `color()`, we have alternatives (see below)
  * don't use `colorList`, i didn't even look into how to port this feature to flot/rickshaw cause you can easily avoid it
  * graphite supports color names like 'green' and hexadecimal RGB codes like '1088ef' (it doesn't allow a `#` prefix)
  * flot generally uses names or CSS color specifications like "rgb(255, 100, 123)" or '#1088ef',
    or an integer that specifies which of auto-generated colors to select, e.g. 0 will get color no. 0
    it unofficially supports graphite-style color codes (with '#') but only in line mode, so we keep compat with graphite
    in your config (no '#'), but automatically add the '#' when needed.  same for rickshaw which requires the '#'.

* enabling certain interactivity features may set other options which may override specific customisations you did;
  consult the code and grep for the feature if you want to know more.
* as a general rule, put all the options that only apply to a specific backend at the bottom of the config
* to show events, set `anthracite_url` and/or `es_url` as shown in the examples.  both Anthracite and ElasticSearch(logstash) events are supported
