## graphite.js

Plugin to easily make graphs and update them on the fly using the 
[Graphite url api](http://readthedocs.org/docs/graphite/en/latest/url-api.html).  
Supports loading png's rendered by Graphite,
as well as client-side rendering of interactive svg-based graphs
(relying on [Rickshaw](http://code.shutterstock.com/rickshaw/))

The goal is to turn this in a library which is easy to use, has an elegant but powerful api,
and has all features you would expect; so that all graphite dashboards can rely on the same
code to render client-side graphs, minimizing redundant work and combining efforts.
Features like getting more info (in popups) when hoovering over datapoints, interactive zooming and panning,
inspection of specific bands, reordering bands, toggling certain targets on and off,
toggling between line vs stack (band) mode, etc.  Most of these already work, the others are coming soon
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
