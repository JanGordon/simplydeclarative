import { div, textInput, sdText, renderApp } from "./lib"


function r() {
    return new div("root-div", 
        new textInput("email-inpt", ""),
        new sdText("date", Date.now().toString())
    )
}


renderApp(r, document.getElementById("app")!)