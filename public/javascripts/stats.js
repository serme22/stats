dayjs.locale('it')
dayjs.extend(window.dayjs_plugin_utc)
dayjs.extend(window.dayjs_plugin_relativeTime)

var session

async function get_privileges(server, token, user) {

    var myHeaders = new Headers();

    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Origin", server);
    myHeaders.append("Authorization", `token ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    //inviti associati alle periferiche
    let basic = await fetch(`${server}/privileges?user_id=${user}&export_peripheral=0&export_peripheral_group_peripherals=0&export_peripheral_groups=0&page_size=8000`, requestOptions)
        .then(response => response.json())
        .then(result => {

            var list = result.list
            var data = list.map((val) => {
                return {
                    name: val.id,
                    group: val.group_tag
                }
            })

            console.log(data)
            var group = d3.rollup(data, d => d.length, d => d.group)

            var series =
            {
                id: "type",
                name: "Type",
                colorByPoint: true,
                data: []
            }

            var seriesdata = []

            group.forEach((value, key) => {
                seriesdata.push({
                    name: key,
                    y: value,
                    sliced: true
                })
            })

            series.data = seriesdata

            return series

        })
        .catch(error => console.log('error', error));


    let guest = await fetch(`${server}/privileges/sent/?user_id=${user}&export_peripheral=0&export_peripheral_group_peripherals=0&export_peripheral_groups=0&page_size=8000`, requestOptions)
        .then(response => response.json())
        .then(result => {

            var list = result.list
            var data = list.map((val) => {
                return {
                    name: val.id,
                    group: val.group_tag
                }
            })

            var group = d3.rollup(data, d => d.length, d => d.group)
            var seriesdata = []
            /*
                        group.forEach((value, key) => {
                            seriesdata.push({
                                name: key +" - invitati",
                                y: value,
                                sliced: true
                            })
                        })
            */
            return group

        })
        .catch(error => console.log('error', error));


    let deleted = await fetch(`${server}/privileges/deleted/?user_id=${user}&page_size=8000`, requestOptions)
        .then(response => response.json())
        .then(result => {

            var list = result.list
            var data = list.map((val) => {
                return {
                    name: val.id,
                    group: val.group_tag
                }
            })

            var group = d3.rollup(data, d => d.length, d => d.group)

            return group

        })
        .catch(error => console.log('error', error));

    let chart_basic = $$("chart_type").getChart();

    let chart_seded = $$("chart_sended").getChart();


    while (chart_basic.series.length) {
        chart_basic.series[0].remove();
    };

    while (chart_seded.series.length) {
        chart_seded.series[0].remove();
    };

    var inviati =
    {
        id: "inviati",
        name: "inviati",
        colorByPoint: true,
        data: []
    }

    guest.forEach((value, key) => {
        inviati.data.push({
            name: key + " - invitati",
            y: value,
            sliced: false
        })
    })

    deleted.forEach((value, key) => {
        inviati.data.push({
            name: key + " - deleted",
            y: value,
            sliced: false
        })
    })

    chart_basic.addSeries(basic)
    chart_seded.addSeries(inviati)


}

async function get_sended_invites(server, token, user) {

    var myHeaders = new Headers();

    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Origin", server);
    myHeaders.append("Authorization", `token ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    return fetch(`${server}/privileges/sent?user_id=${user}&export_user_data=1`, requestOptions)
        .then(response => response.json())
        .then(result => {

            console.log(result)
            return result.list

        })
        .catch(error => console.log('error', error));
}

const button_logout =
{
    view: "button",
    label: "esci",
    align: "right",
    type: "icon",
    icon: "wxi-angle-double-right",
    width: 100,
    click: function () {
        webix.storage.session.clear()
        window.location.href = "/"
    }
}

const label_server = {

    id: "label_server",
    view: "template",
    borderless: true,
    template: "Stai usando il server: #server#",
    on: {
        onAfterRender: webix.once(function () {
            this.parse({ server: session.name })
        })
    }
}

const toolbar = {

    view: "toolbar",
    css: "webix_dark",
    cols: [
        label_server,
        {},
        button_logout
    ]
}

const table_send_keys = {

    id: "tbl_send_keys",
    view: "datatable",
    resizeColumn: true,
    select: "cell",
    columns: [
        { id: "id", header: ["id"], adjust: true },
        { id: "btcode", header: ["btcode", { content: "textFilter" }], adjust: true },
        {
            id: "invitation_time", header: ["data invito"], format: function (val) {
                return format_date(val)
            }, sort: "date", adjust: true
        },
        { id: "user_name", header: ["name"] },
        { id: "user_surname", header: ["surname"] },
        { id: "user_email", header: ["email", { content: "textFilter" }], adjust: true },
        {
            id: "last_usage_time", header: ["ultimo utilizzo"], format: function (val) {
                return format_date(val)
            }, adjust: true, sort: "date"
        },
        { id: "group_tag", header: ["tipo utente", { content: "selectFilter" }] },
        { id: "status", header: ["stato", { content: "selectFilter" }] },
    ],
    on: {
        onAfterLoad: function () {
            $$("label_invitations").parse({ count: this.count() })
        },
        onAfterFilter: function () {
            $$("label_invitations").parse({ count: this.count() })
        },
        onAfterSelect: function (selection, preserve) {
            var item = this.getItem(selection.row)
            console.log(item.btcode)

            const tbl = $$("tbl_periferiche")
            tbl.getFilter("btcode").value = item.btcode
            tbl.filterByAll()

        },
    }
}

const table_logs = {

    id: "tbl_logs",
    view: "datatable",
    resizeColumn: true,
    tooltip: true,
    columns: [
        { id: "id", header: ["id"], adjust: true },
        { id: "privilege_id", header: ["id log"], adjust: true },
        { id: "name", header: ["name"], adjust: true, map: "user.name" },
        { id: "surname", header: ["surname"], adjust: true, map: "user.surname" },
        {
            id: "insert_time", header: ["ultimo utilizzo"], adjust: true, format: (val) => {
                return format_date(val, true)
            }, sort: "date"
        },
        {
            id: "usage_type", header: ["evento"], adjust: true, format: (val) => {
                switch (+val) {
                    case 0:
                        return "Apertura"
                    case 17:
                        return "Chiusura"
                    case 18:
                        return "Tag"
                    case 21:
                        return "Scansionato QR"
                }
            }
        },
    ]
}

const label_counter = {

    id: "label_counter",
    view: "template",
    template: "Totale periferiche: #count#",
    height: 30,
    on: {

        onAfterRender: webix.once(function () {
            this.parse({ count: 0 })
            //$$("label_counter").parse({ count: 0 })
        })
    }
}

const label_invitations = {

    id: "label_invitations",
    view: "template",
    template: "Totale inviti: #count#",
    height: 30,
    on: {

        onAfterRender: webix.once(function () {
            this.parse({ count: 0 })
            //$$("label_counter").parse({ count: 0 })
        })
    }
}

const pager_peripherals = {

    id: "pagerA",
    view: "pager",
    group: 5,
    size: 25,
    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()} "
}

const table_users = {

    id: "tbl_users",
    view: "datatable",
    resizeColumn: true,
    tooltip: true,
    columns: [
        { id: "id", header: ["id"], adjust: true },
        { id: "user_id", header: ["id user"], adjust: true, sort: "int" },
        { id: "name", header: ["name"], adjust: true, map: "#user.name#" },
        { id: "surname", header: ["surname"], adjust: true, map: "#user.surname#" },
        { id: "group_tag", header: ["role", { content: "selectFilter" }], adjust: true },
        {
            id: "last_usage_time", header: ["ultimo utilizzo"], adjust: true, format: (val) => {
                return format_date(val, true)
            }, sort: "date"
        },
    ],
    on: {
        onItemClick: function (id, e, node) {
            console.log(id)
            var itm = this.getItem(id)

            console.log(itm)

        }
    }
}

const combo_clienti = {

    id: "cmb_clienti",
    view: "combo",
    label: "Clienti:",
    name: "cliente",
    options: []
}

const check_low = {
    view: "checkbox",
    labelWidth: "auto",
    labelRight: "Low voltage",
    serie: "low"
}

const check_stb = {

    view: "checkbox",
    labelWidth: "auto",
    labelRight: "Standby voltage",
    serie: "stby"
}

const check_resd = {
    view: "checkbox",
    labelWidth: "auto",
    labelRight: "Residual capacity",
    serie: "res"
}

const check_percent = {
    view: "checkbox",
    labelWidth: "auto",
    labelRight: "Percent",
    value: 1,
    serie: "percent"
}

const form_series = {

    view: "form",
    elements: [{ cols: [check_low, check_stb, check_resd, check_percent] }],
    elementsConfig: {
        on: {
            onChange: function () {
                show_series(this.data)
            }
        }
    }

}

function clearAll() {

    $$("tbl_logs").clearAll()
    $$("tbl_users").clearAll()
    $$("tbl_periferiche").clearAll()
    $$("tbl_send_keys").clearAll()

}

const button_dw_users = {

    view: "button",
    label: "scarica",
    click: function () {
        webix.toExcel($$("tbl_send_keys"), {
            filename:"Invitati"
        })
    }

}

const button_cerca = {

    id: "btn_cerca",
    view: "button",
    value: "Cerca",
    click: function () {

        var frm = $$("frm_cerca")

        if (frm.validate()) {

            clearAll()
            var params = frm.getValues()

            load_data(session.server, session.token, params.cliente).then((result) => {

                console.log(result)
                //#region Chart fw
                var list = result.list
                var data = list.map((val) => {
                    return {
                        name: val.btcode,
                        fw: val.peripheral_firmware.version
                    }
                })

                var group = d3.rollup(data, d => d.length, d => d.fw)
                var series =
                {
                    name: "Version",
                    colorByPoint: true,
                    data: []
                }

                var seriesdata = []

                group.forEach((value, key) => {
                    seriesdata.push({
                        name: key,
                        y: value,
                        sliced: true
                    })
                })

                series.data = seriesdata

                var chart = $$("chart_fw").getChart();

                while (chart.series.length) {
                    chart.series[0].remove();
                };

                chart.addSeries(series)
                //#endregion

                //#region periferiche

                var tbl = $$("tbl_periferiche")

                tbl.clearAll()
                tbl.parse(result.list)
                tbl.sort("ultimo", "desc", "date")
                tbl.markSorting("ultimo", "desc")
                //#endregion

            }
            ).then(() => {
                get_sended_invites(session.server, session.token, params.cliente).then((result) => {
                    $$("tbl_send_keys").parse(result)
                })

                get_privileges(session.server, session.token, params.cliente)

            }
            )



        }

    }
}

const form_cerca = {

    id: "frm_cerca",
    view: "form",
    elements: [combo_clienti, button_cerca]

}

const chart_percentual = {

    id: "chart_percentual",
    view: "highchart",
    modules: ["series-label", "exporting", "export-data"],
    cdn: "https://code.highcharts.com/11.0.1",
    settings: {
        chart: { type: 'line' },
        title: { text: 'Battery %' },
        xAxis: {
            labels: { enabled: false }
        },
        yAxis: {
            title: { enabled: false },
            labels: { enabled: false },
            min: 45,
            max: 100,
            plotBands: [{
                from: 100,
                to: 71,
                color: 'rgba(160, 255, 8, 0.15)',
                label: {
                    //text: 'Good',
                    style: {
                        color: '#606060'
                    }
                }
            },
            {
                from: 70,
                to: 56,
                color: 'rgba(255, 255, 50, 0.15)',
                label: {
                    //text: 'Warning',
                    style: {
                        color: '#606060'
                    }
                }
            }, {
                from: 55,
                to: 0,
                color: 'rgba(160, 8, 8, 0.15)',
                label: {
                    text: 'Change battery ASAP',
                    style: {
                        color: '#606060'
                    }
                }
            }
            ]
        },
        plotOptions: {
            line: {
                connectNulls: false,
                //lineWidth: 0,
                marker: {
                    enabled: true,
                    radius: 4,
                    symbol: "circle"
                }
            }
        }
    }
}

const chart_type = {

    id: "chart_type",
    view: "highchart",
    modules: ["series-label", "exporting", "export-data"],
    cdn: "https://code.highcharts.com/11.0.1",
    settings: {
        chart: { type: 'pie' },
        title: { text: 'Basic keys' },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b><br>N°: <b>{point.y}</b>'
        }
    }
}

const chart_sended = {

    id: "chart_sended",
    view: "highchart",
    modules: ["series-label", "exporting", "export-data"],
    cdn: "https://code.highcharts.com/11.0.1",
    settings: {
        chart: { type: 'pie' },
        title: { text: 'Send keys' },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b><br>N°: <b>{point.y}</b>'
        }
    }
}

const chart_fw = {

    id: "chart_fw",
    view: "highchart",
    modules: ["series-label", "exporting", "export-data"],
    cdn: "https://code.highcharts.com/11.0.1",
    settings: {
        chart: { type: 'pie' },
        title: { text: 'Firmware versions' },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b><br>N°: <b>{point.y}</b>'
        },
        plotOptions: {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            const tbl = $$("tbl_periferiche")
                            tbl.getFilter("fw").value = this.name
                            tbl.filterByAll()
                            //tbl.filter ("fw", this.name)
                            //console.log(this.name)
                        }
                    }
                }
            }
        }
    }
}

const button_download = {

    view: "button",
    label: "scarica",
    click: () => {
        webix.toExcel($$("tbl_periferiche"), { rawValues: true })
    }

}

const table_periferiche = {

    id: "tbl_periferiche",
    view: "datatable",
    resizeColumn: true,
    hover: "myhover",
    select: "row",
    gravity: 3,
    tooltip: true,
    scheme: {
        $init: function (itm) {
            console.log("data init")
        },
        $change: function (itm) {
            console.log("data changed")
        },
        $serialize: function (itm) {
            console.log("data serialize")
        }
    },
    columns: [
        { id: "id", header: ["id"], adjust: true },
        {
            id: "btcode", header: ["btcode", { content: "textFilter" }], adjust: true, template: (obj) => {
                return `<a href='https://backoffice.mrn.ovh/#/peripherals/${obj.btcode}' target=blanck> ${obj.btcode} </a>`
            }
        },
        {
            id: "status", header: ["stato", { content: "selectFilter" }], format: (val) => {

                switch (+val) {
                    case 0: return "Aggiunta in BD"
                    case 1: return "In manutenzione"
                    case 6, 7: return "In installazione"
                    case 3: return "Collaudata"
                    case 9: return "Attivo"
                }

            }
        },
        { id: "name", header: ["name", { content: "textFilter" }], adjust: true, sort: "text" },
        { id: "desc", header: ["desc"], adjust: true },
        { id: "address", header: ["indirizzo"] },
        { id: "tipo", header: ["tipo", { content: "selectFilter" }], adjust: true, map: "#peripheral_type.name#", sort: "text" },
        { id: "fw", header: ["fw", { content: "selectFilter" }], adjust: true, map: "#peripheral_firmware.version#" },
        { id: "products_lot_tag", header: ["lotto", { content: "selectFilter" }], adjust: true },
        {
            id: "activation_time", header: ["attivata il"], adjust: true, format: (val) => {
                return format_date(val, true)
            }, sort: "date"
        },
        {
            id: "ultimo", header: ["ultima lettura"], map: "#battery.insert_time#", adjust: true, format: (val) => {
                return format_date(val, true)
            }, sort: "date"
        },
        { id: "battery", header: ["%", { content: "numberFilter" }], map: "#battery.percentage#", adjust: true, sort: "int" }
    ],
    pager: "pagerA",
    on: {

        onItemClick: function (id, e, node) {

            var itm = this.getItem(id)
            var chart = $$("chart_batt").getChart()
            var chp = $$("chart_percentual").getChart()

            while (chart.series.length) {
                chart.series[0].remove()
            }

            while (chp.series.length) {
                chp.series[0].remove()
            }

            console.log(itm)
            load_battery(session.server, session.token, itm.btcode).then((result) => {

                console.log(result)

                var srs_data = []
                $.each(result.standby_voltage, function (inx, val) {
                    srs_data.unshift(+val)
                })

                var series_stb = {
                    id: "stby",
                    name: "Standby voltage",
                    data: srs_data
                }

                srs_data = []
                $.each(result.low_voltage, function (inx, val) {
                    srs_data.unshift(+val)
                })

                var series_low = {
                    id: "low",
                    name: "Low voltage",
                    data: srs_data
                }

                srs_data = []
                $.each(result.percentage, function (inx, val) {

                    if (val != null) {
                        srs_data.unshift(+val)
                    } else {
                        srs_data.unshift(val)
                    }
                })

                var series_percent = {
                    id: "percent",
                    name: "Read",
                    data: srs_data,
                    color: "rgba(245, 118, 39, 0.8)"
                }

                srs_data = []
                $.each(result.residual_capacity, function (inx, val) {
                    srs_data.unshift(+val)
                })

                var series_residual = {
                    id: "res",
                    name: "Residual",
                    data: srs_data
                }

                srs_data = []
                $.each(result.count_open, function (inx, val) {
                    srs_data.unshift(+val)
                })

                var series_total_counts = {
                    id: "counts",
                    name: "Work counts",
                    data: srs_data
                }

                var series_date = []
                $.each(result.time, function (idx, val) {
                    series_date.unshift(dayjs(val * 1000).format("DD MMM YYYY HH:mm:ss"))
                })

                srs_data = []
                $.each(result.self_discharge, function (idx, val) {

                    if (val != null) {
                        srs_data.unshift(+val)
                    } else {
                        srs_data.unshift(val)
                    }
                })

                var series_self = {
                    id: "self",
                    name: "Self discharge",
                    data: srs_data,
                    color: "grey"
                }

                console.log(series_self)

                chart.xAxis[0].categories = series_date;
                chp.xAxis[0].categories = series_date;

                chart.addSeries(series_stb)
                chart.addSeries(series_low)
                chart.addSeries(series_residual)

                chp.addSeries(series_percent)
                chp.addSeries(series_self)

                //chart.get("percent").hide()
                //chart.get("stby").hide()
                //chart.get("low").hide()
                //chart.get("res").hide()
                //chart.get("self").hide()

            })

            get_peripheral_users(session.server, session.token, itm.btcode).then((result) => {
                console.log(result)

                var tbl = $$("tbl_users")
                tbl.clearAll()
                tbl.parse(result)
            })

            get_logs(session.server, session.token, itm.btcode).then((result) => {
                var tbl = $$("tbl_logs")
                console.log(result)

                tbl.clearAll()
                tbl.parse(result)

                tbl.sort("insert_time", "desc", "date")
                tbl.markSorting("insert_time", "desc")
            })

        },
        onAfterFilter: function () {
            $$("label_counter").parse({ count: this.count() })
        },
        onAfterLoad: function () {
            $$("label_counter").parse({ count: this.count() })
        }
    }

}

const chart_batteries = {

    id: "chart_batt",
    view: "highchart",
    modules: ["accessibility", "series-label", "exporting", "export-data"],
    cdn: "https://code.highcharts.com/11.0.1",
    settings: {
        chart: {
            type: 'area',
            zoomBySingleTouch: true,
            zoomType: 'x',
        },
        tooltip: {
            shared: true
        },
        title: { text: 'Monitoraggio batteria' },
        xAxis: {
            labels: { enabled: false }
        },
        legend: { enabled: true },
        plotOptions: {
            series: {
                marker: {
                    enabled: true,
                    radius: 4,
                    symbol: "circle"
                }
            }
        }
    },

}

async function load_battery(server, token, btcode) {

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Origin", server);
    myHeaders.append("Authorization", `token ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    return fetch(`${server}/peripherals/${btcode}/battery_history_chart?page=1&page_size=100&include_anomalies=0`, requestOptions)
        .then(response => response.json())
        .then(result => result)
        .catch(error => console.log('error', error));
}

async function load_data(server, token, cliente) {

    var myHeaders = new Headers();

    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Origin", server)
    myHeaders.append("Authorization", `token ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    return fetch(`${server}/peripherals?export_privileges=0&export_group_tags=0&export_features=0&export_settings=0&export_firmware=1&export_statistics=0&export_accessories=0&export_access_control_count=0&export_pin_sync=0&export_puks=0&user_id=${cliente}&page_size=2000`, requestOptions)
        .then(response => response.json())
        .then(result => result)
        .catch(error => console.log('error', error));

}

async function installattori(server, token) {

    var myHeaders = new Headers();

    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Origin", server)
    myHeaders.append("Authorization", `token ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    //return fetch(`https://api.mrn.ovh/installers`, requestOptions)
    return fetch(`${server}/installers`, requestOptions)
        .then(response => response.json())
        .then(result => {
            var list = result.list
            var data = list.map((val) => {
                return {
                    id: val.user_id,
                    value: `${val.name} ${val.surname} (${val.email} - ${val.user_id})`
                }
            })
            return data
        })
        .catch(error => console.log('error', error));
}

function format_date(val, elapsed = true) {

    var data = dayjs(val * 1000)

    return elapsed ? `${data.format("DD MMM YYYY HH:mm:ss")}  (${data.fromNow()})` : `${data.format("DD MMM YYYY HH:mm:ss")}`

    //return `${data.format("DD MMM YYYY HH:mm:ss")}  (${data.fromNow()})`

}

function show_series(data) {

    console.log(data)

    var chart = $$("chart_batt").getChart()
    var series = chart.get(data.serie)

    if (series) {

        console.log(series.visible)

        if (data.value == 1) {
            series.show()
        }
        else {
            series.hide()
        }

    }
}

async function get_logs(server, token, peripheral) {

    var myHeaders = new Headers();


    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Origin", server);
    myHeaders.append("Authorization", `token ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    return fetch(`${server}/peripherals/${peripheral}/usages?
    page_size=100000`, requestOptions)
        .then(response => response.json())
        .then(result => result.list)
        .catch(error => console.log('error', error));

}

async function get_peripheral_users(server, token, peripheral) {

    var myHeaders = new Headers();

    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Origin", server);
    myHeaders.append("Authorization", `token ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    return fetch(`${server}/privileges?
        btcode=${peripheral}
        &user_id=-1
        &export_user_data=1
        &status
        &page
        &page_size`, requestOptions)
        .then(response => response.json())
        .then(result => result.list)
        .catch(error => console.log('error', error));
}

webix.ready(() => {

    session = webix.storage.session.get("loginparams")

    installattori(session.server, session.token).then(data => {

        console.log(data)
        var list = $$("cmb_clienti").getPopup().getList()
        list.clearAll()
        list.parse(data)

    })

    /* webix.ui({
 
         type: "wide",
         rows: [toolbar,
             //form_cerca,
             { view: "resizer" },
             {
                 cols: [{ rows: [label_counter, table_periferiche, pager_peripherals, button_download] },
                 { view: "resizer" },
                     chart_fw]
             },
             { view: "resizer" },
             { cols: [table_users, { view: "resizer" }, table_logs] },
             { view: "resizer" },
             {
                 rows: [label_invitations,
                     table_send_keys]
             },
             { view: "resizer" },
             {
                 cols: [
                     { view: "resizer" },
                     chart_batteries,
                     { view: "resizer" },
                     chart_percentual
                 ]
             }
         ]
 
     })*/

    webix.ui({
        multi: true,
        view: "accordion",
        css: "webix_dark",
        rows: [
            toolbar,
            { header: "Rircerca cliente", body: form_cerca },
            { view: "resizer" },
            {
                header: "Periferiche", body: {
                    cols: [
                        { gravity: 4, rows: [label_counter, table_periferiche, pager_peripherals, button_download] },
                        { view: "resizer" },
                        chart_fw]
                }
            },
            { view: "resizer" },
            {
                header: "Utenti",
                collapsed: true,
                body: { cols: [table_users, { view: "resizer" }, table_logs] }
            },
            { view: "resizer" },
            {
                header: "Invitati",
                collapsed: true,
                body:
                {
                    rows: [label_invitations,
                        table_send_keys,
                        button_dw_users]
                }
            },
            { view: "resizer" },
            {
                header: "Grafici",
                collapsed: true,
                body: {
                    cols: [
                        { view: "resizer" },
                        chart_batteries,
                        { view: "resizer" },
                        chart_percentual
                    ]
                }
            },
            { view: "resizer" },
            {

                header: "Dashboard",
                collapsed: true,
                body: {
                    cols: [chart_type, chart_sended]
                }
            }
        ]
    })
    //load_clienti()
})