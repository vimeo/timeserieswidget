graph_rickshaw_simple_line = {
    url: "http://<graphite hostname:port>/render/",
    from: "-24hours",
    until: "now",
    height: "300",
    width: "740",
    targets: [
        {name: 'get',
        color: 'green',
        target: 'sumSeries(stats.*.memcached_*_get)',
        },
        {name: 'miss',
        color: 'red',
        target: 'sumSeries(stats.*.memcached_*_miss)'
        }
    ],
    title: 'Memcache',
    vtitle: 'requests/second',
    y_axis: 'y_axis_rickshaw',
    x_axis: true,
    legend: 'legend_rickshaw',
    legend_toggle: true,
    legend_reorder: true,
    legend_highlight: true,
    hoover_details: true,
    line_stack_toggle: 'line_stack_form_rickshaw',
};
graph_rickshaw_fancy_stacked = {
    url: "http://<graphite hostname:port>/render/",
    from: "-24hours",
    until: "now",
    height: "300",
    width: "740",
    targets: [
        {name: '0.01',
         color: '2FFF00',
         target: "scale(divideSeries(stats.timers.render_time.bin_0_01,stats.timers.render_time.count),0.1)"
        },
        {name: '0.05',
         color: '64DD0E',
         target: "scale(divideSeries(stats.timers.render_time.bin_0_05,stats.timers.render_time.count),0.1)"
        },
        {name: '0.1',
         color: '9CDD0E',
         target: "scale(divideSeries(stats.timers.render_time.bin_0_1,stats.timers.render_time.count),0.1)"
        },
        {name: '0.5',
         color: 'DDCC0E',
         target: "scale(divideSeries(stats.timers.render_time.bin_0_5,stats.timers.render_time.count),0.4)"
        },
        {name: '1',
         color: 'DDB70E',
         target: "scale(divideSeries(stats.timers.render_time.bin_1,stats.timers.render_time.count),0.5)"
        },
        {name: '5',
         color: 'FF6200',
         target: "scale(divideSeries(stats.timers.render_time.bin_5,stats.timers.render_time.count),4.0)"
        },
        {name: '10',
         color: 'FF3C00',
         target: "scale(divideSeries(stats.timers.render_time.bin_10,stats.timers.render_time.count),5.0)"
        },
        {name: '50',
         color: 'FF1E00',
         target: "scale(divideSeries(stats.timers.render_time.bin_50,stats.timers.render_time.count),40.0)"
        },
        {name: 'inf',
         color: 'FF0000',
         target: "scale(divideSeries(stats.timers.render_time.bin_inf,stats.timers.render_time.count),60.0)"
        }
    ],
    legend: 'legend_rickshaw',
    legend_toggle: true,
    legend_reorder: true,
    legend_highlight: true,
    hoover_details: true,
    line_stack_toggle: 'line_stack_form_rickshaw',
    y_axis: 'y_axis_rickshaw',
    x_axis: true,
    title: "render time histogram",
    vtitle: "rel. freq with scale adjustment per band",
    state: 'stacked'
};
