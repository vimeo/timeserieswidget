graph_png_fancy_stacked = {
    graphite_url: 'http://<graphite hostname:port>/render/',
    from: '-24hours',
    until: 'now',
    height: '300',
    width: '740',
    targets: [
        {name: 'series 1',
         color: 'CC6699',
         target: 'randomWalk("random1")',
        },
        {name: 'series 2',
         color: '2FFF00',
         target: 'randomWalk("random2")'
        },
        {name: 'series 3',
         color: '0000FF',
         target: 'randomWalk("random3")'
        }
    ],
    title: 'horizontal title',
    vtitle: 'vertical title',
    drawNullAsZero: false,
    // png specific:
    lineMode: 'slope',
    areaMode: 'stacked',
    hideLegend: 'false',
};
