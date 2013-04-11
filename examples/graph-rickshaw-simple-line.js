graph_rickshaw_simple_line = {
    graphite_url: 'http://<graphite hostname:port>/render/',
    from: '-24hours',
    until: 'now',
    height: '300',
    width: '740',
    targets: [
        {name: 'series 1',
         color: '#CC6699',
         target: 'randomWalk("random1")',
        },
        {name: 'series 2',
         color: '#2FFF00',
         target: 'randomWalk("random2")'
        },
        {name: 'series 3',
         color: '#0000FF',
         target: 'randomWalk("random3")'
        }
    ],
    title: 'horizontal title',
    vtitle: 'vertical title',
    // rickshaw specific:
    y_axis: 'y_axis_rickshaw',
    x_axis: true,
    legend: 'legend_rickshaw',
    legend_toggle: true,
    legend_highlight: true,
};
