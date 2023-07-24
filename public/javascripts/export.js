
dayjs.locale('it')
dayjs.extend(window.dayjs_plugin_utc)
dayjs.extend(window.dayjs_plugin_relativeTime)

var firebaseConfig = {
    apiKey: 'AIzaSyCPpOmhRrB5qYK-xGl2aDHlY87MgjabPrU',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'serme-fb935',
    // Add other configuration properties here if necessary
};

firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

const pager = {
    id: "pagerA",
    view: "pager",
    size: 50,
    group: 5,
    template: "{common.first()}  {common.prev()} {common.pages()} {common.next()} {common.last()} "
}

const form = {

    id: "docs",
    view: "form",
    elements: [
        {
            view: "button", value: "carica", click: () => {
                sel = $$("docs").getValues();

                for (var key in sel) {

                    if (sel.hasOwnProperty(key)) {
                        var value = sel[key];

                        if (value == 1) {
                            db.collection('logs').doc(key)
                                .get()
                                .then((doc) => {
                                    $$("logs").parse(doc.data().data);
                                })
                        }
                        // Do something with the checked value
                    }
                }
            }
        }
    ]

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
        },
        onAfterFilter: function () {
        }
    },
    pager: "pagerA",
}

const esporta = {

    id: "export",
    view: "button",
    value: "esporta",
    click: function () {
        webix.toExcel([$$("logs")], {
            rawValues: true,
            columns: [
                {
                    id: "insert", header: "data", exportFormat: "dd/mm/yyyy hh:mm:ss", template: function (val) {

                        return dayjs(val.insert).format("YYYY-MM-DD HH:mm:ss");
                    }
                },
                { id: "low", header: "low", exportType: "number" },
                { id: "percent", header: "percent", exportType: "number" },
                { id: "residual", header: "residual", exportType: "number" },
                { id: "standby", header: "standby", exportType: "number" },
                { id: "peripheral_counts", header: "conteggio", exportType: "number" }
            ]
        })
    }
}

async function getDocs() {

    docs = await db.collection('logs').get();
    docs.forEach(doc => {
        $$("docs").addView(

            { view: "checkbox", label: doc.id, name: doc.id, labelWidth: 300 }
        )
    });

}

webix.ready(function () {

    webix.ui({
        rows: [form, tabella, pager, esporta]
    })

    getDocs()

})
