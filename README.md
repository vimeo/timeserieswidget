## TimeSeriesWidget

Plugin to easily make *highly interactive* time series (graphite) graph objects.
(i.e. graphs where you can interactively toggle on/off individual series, inspect datapoints, zoom in realtime, etc)
Supports [Flot](http://www.flotcharts.org/) (canvas), [Rickshaw](http://code.shutterstock.com/rickshaw/) (svg), 
[Highcharts](http://www.highcharts.com/) (svg) and standard graphite png images 
(in case you're nostalgic and don't like interactivity)

Goals:
* easy to use, elegant but powerful api, aimed to cover all your graphite/time series graphing needs.
* only abstract where it makes sense. Graphite, Flot, Highcharts and Rickshaw api's are awesome and powerfull, expose them
* aim for some consistency in configuration across backends (to the extent possible and sane)
* be very similar/compatible to the existing graphite API (but extended for interactivity features)
* provide all interactive features you would expect; so that all graphite dashboards can rely on the same
code to render client-side graphs, minimizing redundant work and combining efforts.

Feature comparison table.
NA = not available (can't be done to my knowledge), WIP = work in progress (should be possible. this basically means TODO)

<table>
<tr>
    <th></th>
    <th>PNG</th>
    <th>Flot</th>
    <th>Rickshaw</th>
    <th>Highcharts</th>
</tr>
<tr>
    <td>description</td>
    <td>Static PNG images rendered by graphite server</td>
    <td>Interactive client-side rendering using canvas</td>
    <td>Interactive client-side rendering using SVG</td>
    <td>Interactive client-side rendering using SVG</td>
</tr>
<tr>
    <td>speed</td>
    <td>quite fast</td>
    <td>quite fast.  interactive features near-realtime</td>
    <td>slow with many datapoints and/or multiple graphs (needs better <a href="https://github.com/graphite-project/graphite-web/issues/153">graphite consolidation</a>)</td>
    <td>TODO</td>
</tr>
<tr>
    <td>hover over datapoints/graph -> popup with exact data</td>
    <td>NA</td>
    <td>Y (<a href="https://github.com/flot/flot/pull/867">flot #867</a> would make it a bit better)</td>
    <td>Y</td>
    <td>Y</td>
</tr>
<tr>
    <td>events with annotations (using anthracite)</td>
    <td>NA</td>
    <td>Y</td>
    <td>WIP</td>
    <td>N</td>
</tr>
<tr>
    <td>interactive zooming</td>
    <td>NA</td>
    <td>Y</td>
    <td>WIP</td>
    <td>Y</td>
</tr>
<tr>
    <td>interactive panning</td>
    <td>NA</td>
    <td>WIP</td>
    <td>WIP</td>
    <td>N</td>
</tr>
<tr>
    <td>hover over legend -> hilight on plot</td>
    <td>NA</td>
    <td>WIP</td>
    <td>Y</td>
    <td>Y</td>
</tr>
<tr>
    <td>reordering items in legend to reorder on stacked plot</td>
    <td>NA</td>
    <td>WIP</td>
    <td>Y</td>
    <td>TODO</td>
</tr>
<tr>
    <td>toggling targets on/off</td>
    <td>NA</td>
    <td>WIP (<a href="https://github.com/flot/flot/pull/848">flot pull 848</a>,
             <a href="https://github.com/flot/flot/issues/869">flot pull 869</a>,
             <a href="https://github.com/vimeo/timeserieswidget/tree/flot-legend-toggle">branch flot-legend-toggle</a>)</td>
    <td>Y</td>
    <td>Y</td>
</tr>
<tr>
    <td>toggling between line vs stack (band) mode</td>
    <td>NA</td>
    <td>Y</td>
    <td>Y</td>
    <td>Y</td>
</tr>
<tr>
    <td>auto smoothing dense graphs based on datapoints/pixel</td>
    <td>NA</td>
    <td>NA</td>
    <td>WIP</td>
    <td>Y</td>
</tr>
<tr>
    <td>notes</td>
    <td>1999 called. they want their static images back.<br/>
    you could actually implement interactive features with a JS layer on top. (and some monitoring dashboards do this) but that is/would be soo slow)</td>
    <td></td>
    <td>more "generic" (based on D3), all data is accessible in DOM and themeable with CSS</td>
    <td>Licensing: Free for non commercial (http://www.highcharts.com/license)</td>
</tr>
</table>

**any web code that can generate graphite urls can use this library with minimal transition work**

![Screenshot](https://raw.github.com/vimeo/timeserieswidget/master/screenshots/flot-annotated-event.png)
![Screenshot](https://raw.github.com/vimeo/timeserieswidget/master/screenshots/compare-stacked.png)

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


## Flot Timezone support

note: for timezone support, include timezone-js/src/date.js,
Set the 'zoneFileBasePath' option to the url path needed to reach the included tz folder,
and of course set the 'tz' parameter to your timezone.
Note if you load files straight from disk (such as the examples), you might see errors like
"XMLHttpRequest cannot load file://(...)/timeserieswidget/tz/northamerica. Origin null is not allowed by Access-Control-Allow-Origin.".
This is a CORS restriction, see http://stackoverflow.com/questions/3595515/xmlhttprequest-error-origin-null-is-not-allowed-by-access-control-allow-origin


## Configuration

### Examples

A lot can be learned by just looking at, and playing with the examples,
so check the [examples directory](https://github.com/vimeo/timeserieswidget/tree/master/examples)

The examples are designed so that:

* there's a js file per backend (png, flot, rickshaw), per graph (a simple and fancy one).
* the simple graph is minimal and line-based, the fancy is area-based and demos most available options.
* in a definition, we put (by convention) all common options first, backend-specific things afterwards.
* there's an html file (6 in total) to show each graph (2) of each backend (3)
* graph-compare.html includes all 6 on one page.
* the html and js files are written so you can easily diff them.

Obviously you'll probably need to adjust the targets to make the examples work with your graphite server.

In general, we try to use the same options for all backends (i.e. make the flot/rickshaw backends respond to the same options as the graphite png api)
So for the most part, the available options (see examples) closely match the available options from the [graphite api](http://graphite.readthedocs.org/en/1.0/url-api.html)
Sometimes this is not possible.

### Options that diverge from how graphite does things:
* instead of `target=<foo>&target=<bar>(...)` we define a `targets` list option
* in target definitions:
  * don't use `alias()` or `color()`, we have alternatives ('name' and 'color' options)
  * don't use `colorList`, i didn't even look into how to port this feature to flot/rickshaw cause you can easily avoid it

### Backend specific options (see js defs files)

#### png-specific
options that only apply to graphite's native png renders:
```
colors, areaMode, legends, etc
```
#### clientside specific
options that apply to both flot and rickshaw: when a tswidget feature can't be implemented in flot/rickshaw directly, tswidget provides
the code, and it works with either the flot or rickshaw backend.
```
'suffixes': false, 'binary' or 'si' (defaults to 'si')
```
automatically show large numbers using a prefix.  like graphite does, but configurable

```
anthracite_url
es_url
```
show events from anthracite and/or elasticSearch (logstash) datasource.

```
line_stack_toggle: 'line_stack_form_flot',
state: 'stacked',
```
DOM id for line/stack selector form, and initial state
```
hover_details
```
hover with mouse over graph datapoints to yield popups with information (series and X/Y values) about nearest datapoint

#### flot specific

when a tswidget feature maps directly to a native flot feature, or it doesn't work with rickshaw
or just any option in the flot api (legend, grid, ...)

#### rickshaw specific

when a tswidget feature maps directly to a native rickshaw feature, or it doesn't work with flot
or just any option in the rickshaw api

## Default configuration

(works across all backends)

```js
$.fn.graphite.defaults.width = "450"
$.fn.graphite.defaults.height = "300"
```

## Updating existing graph:

(only for png backend)

```js
$.fn.graphite.update($("#graph"), {from: "-3days", lineWidth: "2"});
```

## Misc notes

### about color definitions

short story:  use rgb codes like '#1088ef', to be compatible with all 3 (graphite/flot/rickshaw).
or find something else that works with all three and update this.

for targets but presumably other things as well:
* graphite supports color names like 'green' and hexadecimal RGB codes like '#1088ef'
* flot generally uses names or CSS color specifications like "rgb(255, 100, 123)" or '#1088ef',
  or an integer that specifies which of auto-generated colors to select, e.g. 0 will get color no. 0
  it unofficially supports color codes (without '#') but only in line mode.
* rickshaw supports a few things, but for hex codes, it requires the '#'

## Some clientside specific options
* may set or override flot/rickshaw-specific options (such as grid, legend, ...) if you've set them.
  this should rarely be a problem, consult the code and grep for the feature if you want to know more.
