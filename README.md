# Simply Declarative
This is an immediate mode JavaScript framework designed to reduce teh complexity of dealing with signals and fancy reactive objects.
Put it simply, the layout is updated every animation frame (usually 60hz) and then any changes from the previous layout are made to the DOM.

## Basic example
```
import { div, textInput, sdText, renderApp, sdElement, sdGetNodeById, button } from "./lib"

function r() {
    return new div("root-div", 
        new textInput("bg-color-inpt", "").addStyle(`background-color: ${sdGetNodeById<textInput>("bg-color-inpt")!.htmlElement.value};`),
        new sdText("date", Date.now().toString()),
    )
}


renderApp(r, document.getElementById("app")!)
```

Here, the function, `r`, is run every frame. The layout is defined with an easy to use class-based system. Every element is instantiated with at least one argument, it's unique id. This is crucial to allow the framework to more efficiently and selectively update the DOM. It also makes it easy to get elements with the `sdGetNodeById` function.

Most methods on `sdNode` will return themselves to allow for a builder pattern.

It is also important to note that text elements must be explicitly made with `sdText`, because they too, also have an id.

## Event Listeners
In this framework, there can only be one listener per node per event type due to technical constraints. For example, the listener added last will overwrite the first one.
```
new button("test-btn")
    .addEventListener("click", ()=>alert("clicked"))
    .addEventListener("click", ()=>alert("beep")) // only this callback will run

