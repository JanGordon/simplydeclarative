import { div, textInput, sdText, renderApp, nodeTable } from "./lib"





function r() {

    let emailIn = new textInput("email-inpt", "")

    return new div("root-div", 
        emailIn,
        new sdText("email-display", "hello?: " + emailIn.htmlElement.value),
        new sdText("date", Date.now().toString())
    )
}


renderApp(r, document.getElementById("app")!)