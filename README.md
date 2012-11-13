## graphite.js

Plugin to easily make graphs and update them on the fly using the 
[Graphite url api](http://readthedocs.org/docs/graphite/en/latest/url-api.html).  
Supports loading png's rendered by Graphite, as well as interactive svg-based client-side
graphs (relying on [Rickshaw](http://code.shutterstock.com/rickshaw/))

## Rickshaw client-side svg graphs

### Minimal config
```html
<div id="graph">
```

```js
$("#graph").graphiteRick({
    from: "-24hours",
    target: [
        {data: "server.web1.load"},
    ],
});
```

### Advanced examples

See 'examples' directory.  
All example files are created so that you can easily diff between png and rickshaw implementations


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
