graph_flot_simple_line = {
    graphite_url: "http://<graphite hostname:port>/render/",
//  es_url: "http://<elastic search machine>:9200/logstash-2013.03.29/_search?q=puppet",
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
};
graph_flot_fancy_stacked = {
    graphite_url: "http://<graphite hostname:port>/render/",
    //es_url: "http://<elastic search machine>:9200/logstash-2013.03.29/_search?q=puppet"
    from: "-24hours",
    until: "now",
    height: "300",
    width: "740",
    targets: [
        {name: '0.01',
         color: '2FFF00',
         target: "scale(divideSeries(stats.timers.render_time.histogram.bin_0.01,stats.timers.render_time.count),0.1)"
        },
        {name: '0.05',
         color: '64DD0E',
         target: "scale(divideSeries(stats.timers.render_time.histogram.bin_0.05,stats.timers.render_time.count),0.1)"
        },
        {name: '0.1',
         color: '9CDD0E',
         target: "scale(divideSeries(stats.timers.render_time.histogram.bin_0.1,stats.timers.render_time.count),0.1)"
        },
        {name: '0.5',
         color: 'DDCC0E',
         target: "scale(divideSeries(stats.timers.render_time.histogram.bin_0.5,stats.timers.render_time.count),0.4)"
        },
        {name: '1',
         color: 'DDB70E',
         target: "scale(divideSeries(stats.timers.render_time.histogram.bin_1,stats.timers.render_time.count),0.5)"
        },
        {name: '5',
         color: 'FF6200',
         target: "scale(divideSeries(stats.timers.render_time.histogram.bin_5,stats.timers.render_time.count),4.0)"
        },
        {name: '10',
         color: 'FF3C00',
         target: "scale(divideSeries(stats.timers.render_time.histogram.bin_10,stats.timers.render_time.count),5.0)"
        },
        {name: '50',
         color: 'FF1E00',
         target: "scale(divideSeries(stats.timers.render_time.histogram.bin_50,stats.timers.render_time.count),40.0)"
        },
        {name: 'inf',
         color: 'FF0000',
         target: "scale(divideSeries(stats.timers.render_time.histogram.bin_inf,stats.timers.render_time.count),60.0)"
        }
    ],
    title: "render time histogram (stacked graph)",
    vtitle: "rel. freq with scale adjustment per band",
    drawNullAsZero: false,
    // clientside specific:
    line_stack_toggle: 'line_stack_form_flot',
    state: 'stacked',
    // flot specific:
    legend: { container: '#legend_flot', noColumns: 1 },
};
