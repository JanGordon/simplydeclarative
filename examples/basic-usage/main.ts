import { div, textInput, sdText, renderApp, sdElement, sdGetNodeById, button } from "../../lib/lib"





function r() {


    return new div("root-div", 
        new textInput("email-inpt", "").addStyle(`background-color: ${sdGetNodeById<textInput>("email-inpt")!.htmlElement.value};`),
        new sdText("email-display",
            `
                email: ${sdGetNodeById<textInput>("email-inpt")!.htmlElement.value}
                time from below: ${sdGetNodeById<sdText>("date")?.text}
            `
        ),
        new sdText("date", Date.now().toString()),
        counter("first"),
        counter("first1"),
    )
}

var counts = new Map<string, {i: number}>();

function counter(uid: string) {
    var count = counts.get(uid)
    if (count == undefined) count = {i: 0}; counts.set(uid, count);
    return new div(`counter-${uid}-root`, 
        new sdText(`counter-${uid}-display`, count.i.toString()),
        new button(`counter-${uid}-button`, new sdText(`counter-${uid}-button-text`, "+")).addEventListener("click", (self, e)=>{
            count!.i++
        })
    )
}


renderApp(r, document.getElementById("app")!)