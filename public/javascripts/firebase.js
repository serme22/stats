
dayjs.locale('it')
dayjs.extend(window.dayjs_plugin_utc)
dayjs.extend(window.dayjs_plugin_relativeTime)

var fulldata

var firebaseConfig = {
    apiKey: 'AIzaSyCPpOmhRrB5qYK-xGl2aDHlY87MgjabPrU',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'serme-fb935',
    // Add other configuration properties here if necessary
};

firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

function builChart(data) {

    const chart = $$("chart").getChart();

    while (chart.series.length) {
        chart.series[0].remove();
    };

    const seriesData = data.map((item) => (
        //[moment.unix(item.insert / 1000).utc().format() , parseInt(item.residual)]
        [item.insert, parseInt(item.residual)]
    ))

    //var batteryPercentData = data.map(obj => [obj.timestamp, obj.battery.percent]);

    var batteryPercentData = {
        name: "Battery Percent",
        data: data.map(obj => [obj.insert, obj.battery.percent])
    }
    var batteryLowData = {
        name: "Battery Low",
        data: data.map(obj => [obj.insert, obj.battery.low])
    };
    var batteryResidualData = {
        name: "Battery Residual",
        data: data.map(obj => [obj.insert, obj.battery.residual])
    };
    var batteryStandbyData = {
        name: "Battery Standby",
        data: data.map(obj => [obj.insert, obj.battery.standby])
    };

    var peripheralCountsData = {
        name: "Peripheral Counts",
        data: data.map(obj => [obj.insert, obj.battery.peripheral_counts])
    };

    /*
        var series = {
            name: "residual",
            data: seriesData,
            turboThreshold: 10000
        }
    */

    //chart.addSeries(batteryPercentData);
    chart.addSeries(batteryLowData);
    chart.addSeries(batteryResidualData);
    chart.addSeries(batteryStandbyData);
    //chart.addSeries(peripheralCountsData);

}

const checks = {

    view: "checkbox"

}

function load_records(params) {

    table = $$("logs");
    table.showProgress({
        type: "top",
        delay: 3000
    });
    table.clearAll();

    table.load(
        () => {
            return new Promise((resolve, reject) => {
                db.collection('logs').doc(params.doc).get().then((doc) => {

                    if (doc.exists) {
                        fulldata = doc.data();

                        console.log(fulldata);
                        data = doc.data().data;

                        if (params.calinit && params.calend) {

                            var filteredData = $.grep(data, function (item) {
                                return item.insert >= params.calinit && item.insert <= params.calend;
                            });

                            resolve(filteredData);
                        }
                        else {
                            resolve(data);
                        }

                    } else {
                        reject(new Error("Document not found"));
                    }
                }).catch(function (error) {
                    reject(error)
                })

            })
        }
    )
        .then(
            (data) => {
                console.log(data)
                builChart(data);

                $$("v").clearAll()
                $$("v").parse(fulldata.voltimetro)
            })

}

function load(doc) {

    table = $$("logs");
    table.showProgress({
        type: "top",
        delay: 3000
    });

    table.clearAll();
    table.load(
        function () {
            return new Promise((resolve, reject) => {
                db.collection('logs').doc(doc).get().then(function (doc) {

                    if (doc.exists) {
                        fulldata = doc.data();

                        console.log(fulldata);
                        data = doc.data().data;

                        var filteredData = $.grep(data, function (item) {
                            return item.insert >= 1686738024798 && item.insert <= 1686739302679;
                        });

                        console.log("filtered data", filteredData)
                        resolve(data);

                    } else {
                        reject(new Error("Document not found"));
                    }
                }).catch(function (error) {
                    reject(error)
                })

            })
        }
    ).then(
        (data) => {
            console.log(data)
            builChart(data);

            $$("v").clearAll()
            $$("v").parse(fulldata.voltimetro)
        }
    )

}

function save() {

    var docname = $$("doc").getValue();
    var values = $$("volt").getValues();

    const docRef = db.collection('logs').doc(docname);

    docRef.update({
        voltimetro: firebase.firestore.FieldValue.arrayUnion({
            data: new Date(),
            misura: +values.volt
        })
    }).then(
        () => {
            webix.message("Salvato correttamente")
            $$("volt").clear()
        }
    ).catch(
        (error) => {
            webix.message(error)
        });
}

function loadDocs() {

    var list = $$("doc").getPopup().getList();

    list.clearAll();
    list.load(async function () {

        ret = []

        docs = await db.collection('logs').get();
        docs.forEach(doc => {
            ret.push(
                {
                    "id": doc.id,
                    "value": doc.id
                }
            )
        });

        return ret;

    })
}

const pager = {
    id: "pagerA",
    view: "pager",
    size: 50,
    group: 5,
    template: "{common.first()}  {common.prev()} {common.pages()} {common.next()} {common.last()} "
}

const esporta = {

    id: "export",
    view: "button",
    value: "esporta",
    click: function () {
        webix.toExcel([$$("logs"), $$("v")])
    }
}

const aggiorna = {

    id: "update",
    view: "button",
    value: "aggiorna",
    click: function () {
        load($$("doc").getValue())
    }
}

const calinit = {

    id: "calinit",
    view: "datepicker",
    name: "calinit",
    label: "Data iniziale:",
    value: new Date(),
    format: "%d/%m/%Y %H:%i:%s",
    labelWidth: 100,
    timepicker: true

}

const calend = {

    id: "calend",
    view: "datepicker",
    name: "calend",
    format: "%d/%m/%Y %H:%i:%s",
    value: new Date(),
    label: "Data finale:",
    labelWidth: 100,
    timepicker: true

}

const tabella = {

    id: "logs",
    view: "datatable",
    resizeColumn: true,
    columns: [
        {
            id: "insert", header: ["data"], adjust: true, sort: "date",
            format: function (val) {
                //return new Date(val);
                //moment.locale("it");                
                //return moment.unix(val / 1000).format("DD MMM YYYY HH:mm:ss");
                return dayjs(val).format("DD MMM YYYY HH:mm:ss")
            }
        },

        {
            id: "insert", header: ["elapsed"], adjust: true, sort: "date",
            format: function (val) {
                //return new Date(val);
                //moment.locale("it");
                //return moment.unix(val / 1000).fromNow(true);
                return dayjs(val).fromNow(true);

            }
        },

        {
            id: "low", header: ["low", { content: "numberFilter" }], adjust: true, map: "#battery.low#", sort: "int", format: (val) => {
                return new Intl.NumberFormat("it-IT").format(val)
            }
        },
        {
            id: "percent", header: ["percent", { content: "numberFilter" }], adjust: true, map: "#battery.percent#", sort: "int", format: (val) => {
                return new Intl.NumberFormat("it-IT").format(val)
            }
        },
        {
            id: "residual", header: ["residual", { content: "numberFilter" }], adjust: true, map: "#battery.residual#", sort: "int", format: (val) => {
                //return NumberFormat("it-IT")
                return new Intl.NumberFormat("it-IT").format(val)
            }
        },
        {
            id: "standby", header: ["standby", { content: "numberFilter" }], adjust: true, map: "#battery.standby#", sort: "int", format: (val) => {
                return new Intl.NumberFormat("it-IT").format(val)
            }
        },
        {
            id: "peripheral_counts", header: ["conteggio periferica", { content: "numberFilter" }], adjust: true, map: "#battery.peripheral_counts#", sort: "int", format: (val) => {
                return new Intl.NumberFormat("it-IT").format(val)
            }
        },
    ],
    //data: load(),
    on: {
        onAfterLoad: function () {
            this.sort("#data#", "desc");
            this.markSorting("insert", "desc");

            $$("info").parse({ count: this.count().toLocaleString("it-IT") })
        },
        onAfterFilter: function () {
            $$("info").parse({ count: this.count() })
        }
    },
    pager: "pagerA",
    css: "rows"
}

const info = {
    id: "info",
    view: "template",
    height: 30,
    template: "Totale cicli #count#"
}

const combo = {

    id: "doc",
    view: "combo",
    name: "doc",
    label: "Report:",
    labelWidth: 100,
    options: [],
    on: {
        onChange: function (newVal, oldVal) {
            /*
                        $$("logs").showProgress({
                            type: "top",
                            delay: 3000
                        });
                        load(this.getText(newVal));
            */
            //$$("logs").clearAll();
            //$$("logs").parse(load(this.getText(newVal)));
        }
    }
}

const volt = {

    id: "volt",
    view: "form",
    elements: [

        {
            view: "fieldset", label: "Registra lettura voltimetro", body: {
                rows: [

                    { view: "text", label: "lettura", type: "number", name: "volt" },
                    {
                        view: "button", value: "Salva", click: function (id, event) {
                            if ($$("volt").validate()) {
                                save()
                            }
                            else {
                                webix.alert({
                                    type: "alert-error",
                                    title: "Error",
                                    text: "Inserire il valore"
                                });
                            }
                        }
                    }]
            }
        }
    ],
    rules: {
        "volt": webix.rules.isNumber
    }

}

const v = {

    id: "v",
    view: 'datatable',
    columns: [
        {
            id: "data", header: ["data"], adjust: true, sort: "date", format: function (val) {
                return dayjs(val.seconds * 1000).format("DD MMM YYYY HH:mm:ss")
            }
        },
        {
            id: "misura", header: ["volt"], adjust: true
        }
    ]
}

const gobutton = {

    id: "search",
    view: "button",
    value: "Cerca",
    click: function () {

        var vals = $$("filter").getValues();

        console.log(dayjs(vals.calinit).valueOf(), dayjs(vals.calend).valueOf());

        vals.calinit = dayjs(vals.calinit).valueOf();
        vals.calend = dayjs(vals.calend).valueOf();

        console.log(vals);

        load_records(vals)

    }

}

const filter = {

    id: "filter",
    view: "form",
    elements: [
        {
            view: "fieldset", label: "Consulta test report", body: {
                rows: [
                    combo,
                    { cols: [calinit, calend] },
                    gobutton
                ]
            }
        }
    ]

}

const resizer = {
    view: "resizer"
}

const chart = {

    id: "chart",
    view: "highchart",
    modules: ["series-label", "exporting", "export-data"],
    settings: {
        title: {
            text: 'Forecast Line Chart'
        },
        time: {
            timezone: 'Europe/Rome'
        },
        xAxis: {
            title: {
                text: 'X-axis'
            },
            //type: 'linear'
            type: 'datetime',
            //tickInterval: 300,
            //min: Date.UTC(2023, 5, 8), // Set the minimum date
            //max: Date.UTC(2023, 5, 9), // Set the maximum date

        },
        yAxis: {
            title: {
                text: 'Y-axis'
            },
            type: 'linear'
        },
        chart: {
            zoomBySingleTouch: true,
            zoomType: 'x'
        },
        tooltip: {
            shared: true
        }

    }

}

webix.ready(function () {

    webix.ui({
        multi: true,
        view: "accordion",
        type: "wide",
        rows: [
            filter,
            {
                header: "REGISTRA LETTURE",
                collapsed: true,
                body: {
                    rows: [
                        volt
                    ]
                }
            },
            {
                collapsed: false,
                header: "LOGS",
                body: {
                    multi: true,
                    view: "accordion",
                    type: "space",
                    cols: [
                        {
                            header: "Logs",
                            body: {
                                rows: [
                                    info,
                                    tabella,
                                    pager,
                                    esporta
                                ]
                            }
                        },
                        {
                            header: "Registrazioni Volts",
                            collapsed: true,
                            body: v
                        }
                    ]
                }
            },
            {
                collapsed: false,
                header: "CHARTS",
                body: chart
            }
        ]

        /*
        rows: [
            filter,
            //volt,
            accordion,
            info,
            { cols: [tabella, resizer, v] },
            pager,
            esporta,
            chart
        ]
        */
    })

    webix.extend($$("logs"), webix.ProgressBar);

    loadDocs()

});

/*
setInterval(function () {

    $$("logs").parse(load());

}, 60000)*/