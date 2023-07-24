const form_login = {

    id: "login",
    view: "form",
    elements: [
        {
            id:"combo_server", view: "combo", label: "server:", options: [{
                id: "https://api.sclak.com",
                value: "Sclak"
            }, {
                id: "https://api.mrn.ovh",
                value: "AliA",
            }], name: "server"
        },
        { view: "text", label: "email:", type: "email", name: "username" },
        {
            view: "search", label: "password:", type: "password", icon: "wxi-eye", name: "password",
            on: {
                onSearchIconClick: function (e) {
                    const input = this.getInputNode()
                    console.log(input)
                    webix.html.removeCss(e.target, "wxi-eye-slash");
                    webix.html.removeCss(e.target, "wxi-eye");

                    if (input.type == "text") {
                        webix.html.addCss(e.target, "wxi-eye");
                        input.type = "password";
                    } else {
                        webix.html.addCss(e.target, "wxi-eye-slash");
                        input.type = "text";
                    }
                }
            }
        },
        {
            view: "button", value: "login", click: function () {

                var frm = this.getParentView()

                var params = frm.getValues()

                var list = $$("combo_server").getList()

                var list_item = list.getSelectedItem()

                if (frm.validate()) {
                    login(params).then((result) => {
                        console.log(result)

                        webix.storage.session.put("loginparams", { server: params.server, token: result.token, name: list_item.value })
                        console.log(webix.storage.session.get("loginparams"))
                        window.location.href = "stats.html";

                    }
                    )
                }
            }
        }

    ],
    rules: {
        "username": webix.rules.isEmail,
        "server": webix.rules.isNotEmpty,
        "password": webix.rules.isNotEmpty
    }

}

webix.ready(function () {

    webix.ui({
        rows: [form_login]
    });

});

function login(params) {

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "username": params.username,
        "password": params.password
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    return fetch(`${params.server}/auth_tokens`, requestOptions)
        .then(response => response.json())
        .then(result => result)
        .catch(error => console.log('error', error));
}