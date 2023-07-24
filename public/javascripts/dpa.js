dayjs.locale('it')
dayjs.extend(window.dayjs_plugin_utc)
dayjs.extend(window.dayjs_plugin_relativeTime)

var window_edit
var window_new

/*
const tool_table =

{
    id: "toolmain",
    css: "",
    view: "toolbar",
    cols: [
        { id: "mainlabel1", view: "label", label: "Tutte", borderless: true },
        { id: "icon1", view: "icon", height: 0, width: 38, icon: "wxi-sync", tooltip: { template: "Aggiorna" } },
        { id: "icon2", icon: "wxi-search", view: "icon", height: 0, width: 38, tooltip: { template: "Cerca" } },
        { id: "icon3", icon: "wxi-plus", view: "icon", height: 0, width: 38, tooltip: { template: "Nuova" } }
    ]
}
*/

const multiview = {

    id: "views",
    view: "multiview",
    cells: [
        {
            id: "toolmain",
            css: "",
            view: "toolbar",
            cols: [
                { id: "lblinfo", view: "label", label: "Tutte", borderless: true },
                {
                    id: "icon1", view: "icon", height: 0, width: 38, icon: "wxi-sync", tooltip: { template: "Aggiorna" }, on: {
                        onItemClick: function () {
                            console.log("refresh")
                            $$("tbl_dpa").refresh()
                        }
                    }
                },
                {
                    id: "icon2", icon: "wxi-search", view: "icon", height: 0, width: 38, tooltip: { template: "Cerca" }, on: {
                        onItemClick: function () {
                            $$("toolsearch").show()
                        }
                    }
                },
                {
                    id: "icon3", icon: "wxi-plus", view: "icon", height: 0, width: 38, tooltip: { template: "Nuova" }, on: {
                        onItemClick: function () {
                            var frm = $$("editform")
                            var tbl_rows = $$("rows")
                            var time = $$("timeline")

                            frm.clear()
                            tbl_rows.clearAll()
                            time.clearAll()

                            window_edit.show()
                        }
                    }
                }
            ]
        },
        {

            id: "toolsearch",
            view: "toolbar",
            cols: [
                {
                    id: "srcico1", view: "icon", height: 0, width: 38, icon: "wxi-angle-left", on: {
                        onItemClick: () => {
                            $$("views").back()
                        }
                    }
                },
                { view: "text", placeholder: "ricerca per numero anno tipo" }
            ]
        }
    ]

}

const toolbar_edit = {

    id: "tedit",
    view: "toolbar",
    height: 30,
    cols: [{ view: "icon", height: 0, width: 38, icon: "wxi-trash", tooltip: { template: "Elimina" } },
    { view: "icon", icon: "wxi-plus-circle", height: 0, width: 38, tooltip: { template: "Nuova" } }]

}

const timeline = {

    id: "timeline",
    view: "timeline",
    //    layout: "x", // horizontal mode is set 
    //height: 120,
    width: 240,
    type: {
        type: "alternate"
    },
    scheme: {
        $init: function (obj) {
            console.log(obj)
            obj.$css = obj.color
        }
    }
}

const toolbar_main = {

    css: "webix_dark",
    view: "toolbar",
    height: 50,
    cols: [
        {
            icon: "mdi mdi-menu", view: "icon", height: 0, width: 38, click: () => {
                $$("$sidebar1").toggle();
            }
        },
        { view: "label", label: "DPA" },
        { icon: "mdi mdi-bell", view: "icon", height: 0, "width": 38 }
    ]
}

const table_rows =
{
    id: "rows",
    view: "datatable",
    tooltip: true,
    select: true,
    columns: [
        { id: "posizione", header: ["id"], adjust: true },
        { id: "articolo", header: ["articolo"], adjust: true },
        { id: "quantita", header: ["quantità"], adjust: true },
        { id: "note", header: ["note"], adjust: true }
    ]
}

const form_edit = {

    id: "editform",
    view: "form",
    elements: [
        {
            rows: [
                { view: "text", value: "100", name: "stato", hidden: true },
                { view: "combo", label: "Tipo", labelWidth: "120", options: [{ id: "ITA", value: "Italia" }, { id: "EST", value: "Estero" }], required: true, name: "tipo" },
                { view: "datepicker", name: "data_richiesta", label: "Data richiesta:", labelWidth: "120", format: "%d/%m/%Y", required: true },
                { view: "textarea", name: "cliente", label: "Cliente:", required: true, labelWidth: "120", height: 100, suggest: "http://127.0.0.1:8000/api/v1/cliente/" },
                toolbar_edit,
                table_rows,
                {
                    cols: [
                        {
                            view: "button", value: "salva", click: function () {
                                //var tbl = $$("tbl_dpa")
                                //tbl.save()
                                var frm = $$("editform");
                                console.log(frm)
                                frm.save()
                            }
                        }, {
                            view: "button", value: "annulla", click: function () {
                                //$$("edit").hide();
                                window_edit.hide()
                            }
                        }
                    ]
                }

            ]

        }
    ]
}

const main_menu = {
    view: "sidebar",
    width: 185,
    data: [
        { id: "dashboard", icon: "mdi mdi-view-dashboard", value: "DPA", }
    ]
}

const pager = {

    view: "pager",
    id: "pageA",
    size: 25,
    group: 15,
    template: "{common.first()} {common.prev()} {common.pages()} {common.next()} {common.last()} "
}

const menu_file = {

    id: "file",
    view: "menu",
    data: [
        {
            id: "D", value: "DPA", submenu: [{ id: "S", value: "Salva" },
            { id: "A", value: "Azioni", submenu: [{ id: "R", value: "Richiesta preparazione" }, { id: "P", value: "Preparato" }, { id: "E", value: "Evadi", disabled: true }, { id: "A", value: "Annulla" }] }]
        }
    ]

}

const tool_search = {

    id: "toolsearch",
    view: "toolbar",
    cols: [
        { id: "srcico1", view: "icon", height: 0, width: 38, icon: "wxi-angle-left" },
        { view: "text" }
    ]
}

const table_dpa = {

    id: "tbl_dpa",
    view: "datatable",
    sort: "multi",
    scheme: {
        $init: function (obj) {
            obj.$css = "stato_" + obj.stato
        },
        $save: function (obj) {
            if (!obj.stato) {
                obj.stato = 100
            }
            if (!obj.creata_da) {
                obj.creata_da = 1
            }
        }
    },
    url: "http://127.0.0.1:8000/api/v1/dpa/",
    resizeColumn: true,
    tooltip: true,
    select: true,
    fixedRowHeight: false,
    columns: [
        { id: "index", header: [""] },
        { id: "numero", header: ["numero", { content: "serverFilter" }], adjust: true, sort: "server" },
        { id: "anno", header: ["anno", { content: "serverSelectFilter" }], adjust: true, sort: "server" },
        { id: "tipo", header: ["tipo", { content: "serverSelectFilter" }], adjust: true, sort: "server" },
        { id: "cliente", header: ["cliente", { content: "serverFilter" }], minColumnWidth: 80, width: 800, adjust: true },
        {
            id: "created_at", header: ["data inserimento"], format: (val) => {
                return `${dayjs(val).format("DD/MM/YYYY")} (${dayjs(val).fromNow()})`
            }, adjust: true, sort: "server"
        },
        { id: "stato", header: ["stato"] }
    ],
    on: {
        onItemDblClick: function (id, e, node) {

            var sel = this.getItem(id)

            $$("edit").getHead().getChildViews()[0].setHTML(`${sel.numero}`)
            //$$("edit").show()

            $$("timeline").clearAll()
            $$("timeline").parse(sel.timeline)

            var frm = $$("editform");

            if (sel.stato == 900) {
                frm.disable()
            } else {
                frm.enable()
            }

            window_edit.show()
        },
        onItemClick: function (id, e, node) {
            console.log(id)
            console.log(this.getItem(id))
        },
        onAfterLoad: function () {

            console.log("load finished")
            this.adjustRowHeight("cliente");
            this.markSorting("created_at", "desc")

        },
        "data->onStoreUpdated": function () {
            this.data.each(function (obj, i) {
                obj.index = i + 1;
            });
        }

    },
    pager: "pageA",
    save: {
        "update": "json->http://127.0.0.1:8000/api/v1/dpa",
        "insert": "json->http://127.0.0.1:8000/api/v1/dpa"
    }
}

webix.ready(function () {

    window_edit = webix.ui({

        id: "edit",
        view: "window",
        head: "Edit.. ",
        modal: true,
        width: 1000,
        height: 600,
        position: "center",
        close: true,
        body: {
            type: "space",
            menu_file,
            rows: [
                menu_file,
                {
                    cols: [
                        form_edit,
                        timeline
                    ]
                }
            ]
        }
    })

    webix.ui({
        rows: [toolbar_main,
            {
                cols: [
                    main_menu,
                    {
                        rows: [
                            multiview,
                            table_dpa,
                            pager
                        ]
                    }
                ]
            }]
    })

    $$("editform").bind($$("tbl_dpa"))
    $$("rows").bind($$("tbl_dpa"), "$data", "rows")

})


