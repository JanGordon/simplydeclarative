import { div, textInput, sdText, renderApp, sdElement, sdGetNodeById, button, img } from "../../lib/lib"



var heroSrc = "https://picsum.photos/200/300"

function nextImage() {
    heroSrc = `https://picsum.photos/200/300?nocache=${Date.now()}`
}

var switcherInterval = setInterval(nextImage, 5000)

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
        new img("hero", heroSrc),
        new sdText("image-caption", heroSrc),
        new button("next-image", new sdText("next-image-btn", "New Image")).addEventListener("click", ()=>{
            nextImage()
            clearInterval(switcherInterval)
            switcherInterval = setInterval(nextImage, 5000)
        })
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