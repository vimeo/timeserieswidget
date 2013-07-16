graph_highcharts_options = {
    graphite_url: 'http://<graphite hostname:port>/render/',
    from: '-24hours',
    until: 'now',
    height: '300',
    width: '840',
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
    drawNullAsZero: false,
    state: 'stacked',
    line_stack_toggle: 'line_stack_form_highcharts',
    hover_details: true
};
