function show_progress_icon(delay) {
    $$("main_layout").disable();
    $$("main_layout").showProgress({
        type: "icon",
        delay: delay,
        hide: true
    });
    setTimeout(function () {
        $$("main_layout").enable();
    }, delay);

};


const button_export = {

    view: "button",
    value: "esporta distinta",
    label: "esporta distinta",
    click: function () {
        webix.toExcel($$("treeview"), {
            filename: $$("text_articolo").getValue(),
            name: "Distinta"
        })
    }

}

const treeview = {

    id: "treeview",
    //view: "tree",
    view: "treetable",
    resizeColumn: true,
    select: "row",
    onContext: {},
    columns: [
        { id: "value", header: ["articolo", { content: "textFilter" }], width: 300, template: "{common.treetable()} <span class='node-articolo'>#value#</span>" },
        { id: "desc", header: ["descrizione", { content: "textFilter" }], width: 500, template: "<span class='node-desc'>#desc#</span>" },
        { id: "quantita", header: ["quantità"] },
        { id: "misura", header: ["UM"] },
        { id: "ean13", header: ["ean-13"], adjust: true },
        //{ id: "costo", header: ["costo"] }
    ],
    activeTitle: true,
    tooltip: function (obj) {
        if (obj.desc) {
            return obj.desc;
        }
        return obj.value;
    },
    data: [],
    on: {
        onBeforeContextMenu: function (id, e, node) {

            var item = this.getItem(id);
            console.log(item)

            var disabled = () => {
                if (item.files) {
                    if (item.files.length > 0) {
                        return false
                    }
                    return true
                }
                return true
            }

            var data = [
                { action: "title", value: item.value, icon: "mdi mdi-information", tipo: "title", tooltip: item.desc, disabled: true },
                { $template: "Separator" },
                { action: "copy", value: "Copia", icon: "mdi mdi-content-copy", tooltip: "Copia codice negli appunti", submenu: [{ action: "barcode", value: "Codice EAN-13", icon: "mdi mdi-barcode-scan" }, { action: "code", value: "Codice articolo", icon: "mdi mdi-package-variant" }] },
                { value: "Disegni", submenu: item.files, disabled: disabled(), icon: "mdi mdi-folder-edit" }
            ]

            var context = $$("cmenu")

            context.clearAll()
            context.parse(data)

            //this.clearAll()
            //this.parse(data)

            /*
                        if (item) {
                            webix.ui({
                                view: "contextmenu",
                                template: function (obj) {
                                    if (obj.id == "title") {
                                        console.log("setting title", obj.value, obj.icon)
                                        //return "<div>"+obj.icon+"</div>"
                                        
                                        return "<span class='menu-content-title'>" +  obj.value +"</span>"
                                        
                                        //return  "<span class='"+obj.icon +"'></span> <b>" + obj.value + "</b>"
                                    }
                                    return "<span class='"+obj.icon +"'></span> " +  obj.value
                                },
                                data: data, //item.files, // ["Option 1", "Option 2", "Option 3"],
                                on: {
                                    onMenuItemClick: function (id) {
                                        console.log(id)
                                        if (id == "copy") {
                                            navigator.clipboard.writeText(item.value)
                                        }
            
                                    }
                                }
                            }).show(e);
                        }
            
                        e.preventDefault();
            */

        }

    },
    onAfterSelect: function (selection, preserve) {
        var data = this.getItem(selection.id)
        console.log(data)
    }
}
//template: "{common.icon()} {common.folder()} <span class='node-articolo'>#value#</span> <span class='node-desc'>#desc#</span>"


/*
const suggest = {

    view: "suggest",
    body: {
        //dataFeed: "http://127.0.0.1:8000/api/v1/articoli/",
        dataFeed: "http://192.6.2.21:8000/api/v1/articoli/",
    },
    on: {
        onValueSuggest: function (data) {
            $$("text_articolo").setValue(data.articolo)
        }
    }

}
*/

const form_cerca = {

    id: "form_cerca",
    view: "form",
    elements: [
        {
            view: "radio",
            label: "Modalita:",
            labelWidth: 100,
            value: "E",
            options: [
                { id: "E", value: "Esplosione" },
                { id: "I", value: "Implosione" }
            ],
            name: "mode"
        },
        {
            id: "text_articolo", view: "text", label: "Articolo:", labelWidth: 100, name: "articolo",
            required: true, placeholder: "ricerca per articolo (usa % come segnaposto)",
            //suggest: "http://127.0.0.1:8000/api/v1/articoli/?mode=art"
            suggest: {
                body: {
                    //dataFeed: "http://127.0.0.1:8000/api/v1/articoli/?mode=art",
                    dataFeed: function (value) {

                        //this.data = []

                        this.clearAll()
                        if (value.length < 3) return
                        var urldata = "mode=art&filter[value]=" + encodeURIComponent(value)
                        this.load("http://192.6.2.21:8000/api/v1/articoli/?" + urldata, this.config.datatype)
                    },
                    keyPressTimeout: 100
                },
                on: {
                    onValueSuggest: function (data) {
                        console.log(data)
                        $$("text_articolo").setValue(data.articolo)
                        $$("text_descrizione").setValue(data.descrizione)
                        $$("button_cerca").enable()
                    }
                }
            }
        },
        {
            id: "text_descrizione", view: "text", label: "Descrizione:", labelWidth: 100, name: "descrizione", placeholder: "ricerca per descrizione",
            //suggest: "http://127.0.0.1:8000/api/v1/articoli/?mode=desc"
            suggest: {
                body: {
                    //dataFeed: "http://127.0.0.1:8000/api/v1/articoli/?mode=desc",
                    
                    dataFeed: function (value) {

                        //this.data = []
                        this.clearAll()
                        if (value.length < 4) return
                        var urldata = "mode=desc&filter[value]=" + encodeURIComponent(value)
                        this.load("http://192.6.2.21:8000/api/v1/articoli/?" + urldata, this.config.datatype)

                    },
                    keyPressTimeout: 100
                },
                on: {
                    onValueSuggest: function (data) {
                        console.log(data)
                        $$("text_articolo").setValue(data.articolo)
                        $$("text_descrizione").setValue(data.descrizione)
                        $$("button_cerca").enable()
                    }
                },
            }
        },
        {
            id: "button_cerca", view: "button", value: "visualizza", disabled: true, click: function () {

                var frm = $$("form_cerca")

                if (frm.validate()) {

                    show_progress_icon(5000)
                    var values = frm.getValues()
                    console.log(frm.getValues())

                    webix.ajax("http://192.6.2.21:8000/api/v1/treeview/", values).then(function (data) {

                        console.log(data.json())
                        var tree = $$("treeview")
                        tree.clearAll()
                        tree.parse(data)
                    })
                }
            }
        }
    ]
}

webix.ready(function () {

    webix.ui({

        id: "main_layout",
        rows: [form_cerca,
            treeview,
            button_export
        ]

    })

    const cmenu = webix.ui({
        view: "contextmenu",
        tooltip: function (itm) {
            if (itm.tooltip) {
                return itm.tooltip
            }
            return itm.value
        },
        id: "cmenu",
        //data:["Add","Rename","Delete",{ $template:"Separator" },"Info"],
        data: [],
        autowidth: true,
        minWidth: 200,
        master: $$("treeview"),
        template: function (obj) {

            if (obj.tipo == "title") {
                return `<span class='${obj.icon}'></span><span class='menu-content-title'>${obj.value}</span>`
            }

            //return obj.value
            return `<span class='${obj.icon}'></span><span>${obj.value}</span>`

        },
        on: {
            onMenuItemClick: function (id) {

                var context = this.getContext()
                var table = context.obj
                var tableItem = table.getItem(context.id.row)

                var menu = this.getMenu(id)
                var itm = menu.getItem(id)

                if (itm.action == "barcode") {
                    navigator.clipboard.writeText(tableItem.ean13)
                }
                if (itm.action == "code") {
                    navigator.clipboard.writeText(tableItem.value)
                }

                //webix.message("List item: <i>" + list.getItem(listId).title + "</i> <br/>Context menu item: <i>" + this.getItem(id).value + "</i>");
            }
        }
    });

    $$("cmenu").attachTo($$("treeview"));

    webix.extend($$("main_layout"), webix.ProgressBar);



})