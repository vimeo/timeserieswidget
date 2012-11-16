## graphite.js

Plugin to easily make graphs and update them on the fly using
[Graphite url api](http://readthedocs.org/docs/graphite/en/latest/url-api.html) on the background,
allowing you to easily add:

* Client-side rendered, interactive, canvas-based graphs
  (relying on [Flot](http://www.flotcharts.org/))
* Client-side rendered, interactive, svg-based graphs
  (relying on [Rickshaw](http://code.shutterstock.com/rickshaw/))
* PNG's rendered by Graphite

Goals:
* easy to use, elegant but powerful api.
* only abstract where it makes sense.  Graphite, Flot, and Rickshaw api's are awesome and powerfull, expose them
* aim for some consistency in configuration across backends (to the extent possible and sane)
* provide all interactive features you would expect; so that all graphite dashboards can rely on the same
code to render client-side graphs, minimizing redundant work and combining efforts.

Feature comparison table.
NA = not available, WIP = work in progress

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
    <td>becomes slow with many datapoints and/or multiple graphs</td>
</tr>
<tr>
    <td>hoover over datapoints/graph -> popup with exact data</td>
    <td>NA</td>
    <td>WIP</td>
    <td>Y</td>
</tr>
<tr>
    <td>events with annotations</td>
    <td>NA</td>
    <td>WIP</td>
    <td>WIP</td>
</tr>
<tr>
    <td>interactive zooming and panning</td>
    <td>NA</td>
    <td>WIP</td>
    <td>WIP</td>
</tr>
<tr>
    <td>hoover over legend -> hilight on plot</td>
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
    <td>WIP</td>
    <td>Y</td>
</tr>
<tr>
    <td>toggling between line vs stack (band) mode</td>
    <td>NA</td>
    <td>Y</td>
    <td>Y</td>
</tr>
<tr>
    <td>notes</td>
    <td>1999 called. they want their static images back.<br/>
    you could actually implement these features with a JS layer on top. (and some monitoring dashboards do this) but that is/would be soo slow)</td>
    <td>flot seems to have a tad more features than rickshaw</td>
    <td>more "generic" (based on D3), all data is accessible in DOM and themeable with CSS</td>
</tr>
</table>

**any web code that can generate graphite urls can use this library with minimal transition work**

![Screenshot](https://raw.github.com/Dieterbe/graphitejs/master/screenshot-compare.png)

## Flot client-side canvas graphs

see examples


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

Note: the code needs to be able to map targets returned from graphite back to your configuration, so:

* if you have `scale()` in your targets, be wary of https://github.com/graphite-project/graphite-web/issues/103
  and adjust your scales if needed.
* don't use function aliases, i.e. use `sumSeries()`, not `sum()`

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
* annotations

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
$.fn.graphite.defaults.url = "http://myserver/render/"
```

or

```js
$("#graph").graphite({
    url: "http://myserver/render/"
});
```

### $(img).graphite(options)

You should probably specify a target. All other settings are optional. All
settings will be passed through to the graphite api.
