graph_png_fancy = {
    url: "http://localhost:9000/render/",
    from: "-24hours",
    until: "now",
    height: "300",
    width: "740",
    colorList: "red,green",
    target: [
        "alias(color(scale(divideSeries(stats.timers.render_time.bin_0_01,stats.timers.render_time.count),0.01),'2FFF00'),'0.01')",
        "alias(color(scale(divideSeries(stats.timers.render_time.bin_0_05,stats.timers.render_time.count),0.04),'64DD0E'),'0.05')",
        "alias(color(scale(divideSeries(stats.timers.render_time.bin_0_1,stats.timers.render_time.count),0.05),'9CDD0E'),'0.1')",
        "alias(color(scale(divideSeries(stats.timers.render_time.bin_0_5,stats.timers.render_time.count),0.4),'DDCC0E'),'0.5')",
        "alias(color(scale(divideSeries(stats.timers.render_time.bin_1,stats.timers.render_time.count),0.5),'DDB70E'),'1')",
        "alias(color(scale(divideSeries(stats.timers.render_time.bin_5,stats.timers.render_time.count),4),'FF6200'),'5')",
        "alias(color(scale(divideSeries(stats.timers.render_time.bin_10,stats.timers.render_time.count),5),'FF3C00'),'10')",
        "alias(color(scale(divideSeries(stats.timers.render_time.bin_50,stats.timers.render_time.count),40),'FF1E00'),'50')",
        "alias(color(scale(divideSeries(stats.timers.render_time.bin_inf,stats.timers.render_time.count),60),'FF0000'),'inf')",
    ],
    lineMode: "slope",
    areaMode: "stacked",
    drawNullAsZero: "false",
    hideLegend: "false",
    title: "render time histogram",
    vtitle: "rel. freq with scale adjustment per band"
};
graph_png_simple = {
    url: "http://localhost:9000/render/",
    from: "-3minutes",
    until: "now",
    height: "300",
    width: "740",
    colorList: "red,green",
    target: [
        "alias(color(scale(divideSeries(stats.timers.render_time.bin_0_01,stats.timers.render_time.count),0.01),'2FFF00'),'0.01')",
        "alias(color(scale(divideSeries(stats.timers.render_time.bin_inf,stats.timers.render_time.count),60),'FF0000'),'inf')",
    ],
    lineMode: "slope",
    //areaMode: "stacked",
    drawNullAsZero: "false",
    hideLegend: "false",
    title: "render time histogram",
    vtitle: "rel. freq with scale adjustment per band"
};

