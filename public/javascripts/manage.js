const support = {

    id:"submit",
    view: "form",
    name:"submit",
    elements: [
        { view: "text", label: "", placeholder: "nome, cognome, btcode, email" },
        { view: "button", label: "cerca", value: "cerca", click: ()=>{
            console.log(this)
        } }
    ]

}

webix.ready(() => {

    webix.ui(
        {
            rows: [support]
        }
    )

})