import { nodeState, nodeTable, nodeType, prevNodeLookup, sdElement, sdNode } from "./main"

export class sdText {
    uid: string
    text: string
    nodeType = nodeType.text
    htmlElement: HTMLDivElement
    getState() {
        return {
            style: "",
            children: [] as string[],
            eventListeners: [],
            attributes: new Map<string, string>(),
            generic: [this.text]
        }
    }

    constructor(uid: string, t: string) {
        this.text = t
        this.uid = uid
        nodeTable.set(uid, this)
    }
    create(parent: HTMLElement, nextSibling?: HTMLElement) {
        let container = document.createElement("div")
        container.id = this.uid
        let el = document.createTextNode(this.text)
        prevNodeLookup.set(this.uid, this.getState())

        container.appendChild(el)
        this.htmlElement = container
        if (nextSibling) {
            parent.insertBefore(container, nextSibling)
        } else {
            parent.appendChild(container)
        }
        return container
    }
}

const placeholders = new Map<string, HTMLElement>() // holds placeholder elements indexed by tagName

// function toNode(i: sdNode | string): sdNode {
//     return typeof i == "string" ? new sdText(i) : i
// }

class sdElementBase implements sdElement {
    nodeType = nodeType.element
    children: sdNode[] = []
    uid: string
    styleString: string = ""
    attributes = new Map<string, string>()
    htmlElement: HTMLElement
    tagName: string
    constructor(uid: string) {

        this.uid = uid
        nodeTable.set(uid, this)
        let el = document.getElementById(uid) 
        if (el) {
            this.htmlElement = el
        } else {
            let placeholder = placeholders.get(this.tagName)
            if (placeholder) {
                this.htmlElement = placeholder

            } else {
                let el = document.createElement(this.tagName)
                placeholders.set(this.tagName, el)
                this.htmlElement = el
            }

        }


    }
    addStyle(style: string) {
        this.styleString+=style
        return this
    }
    create(parent: HTMLElement, nextSibling?: HTMLElement) {
        prevNodeLookup.set(this.uid, this.getState())
        let el = document.createElement(this.tagName)
        el.id = this.uid

        el.style.cssText = this.styleString
        for (let [e, l] of this.eventListeners) {
            el["on"+ e] = (e)=>{l(this, e)}
        }

        for (let [name, val] of this.attributes.entries()) {
            el.setAttribute(name, val)
        }

        if (nextSibling) {
            parent.insertBefore(el, nextSibling)
        } else {
            parent.appendChild(el)
        }
        this.htmlElement = el
        return el
    }
    getState(): nodeState {
        return {
            style: this.styleString,
            eventListeners: this.eventListeners,
            attributes: new Map<string, string>(this.attributes.entries()),
            children: this.children.map((c)=>c.uid),
            generic: []
        }
    }
    eventListeners: [string, (self: this, e: Event)=>void][] = []
    addEventListener(event: string, listener: (self: this, e: Event)=>void) {
        this.eventListeners.push([event, listener])
        return this
    }
}



export class div extends sdElementBase {
    tagName = "div"
    declare htmlElement: HTMLDivElement
    constructor(uid: string, ...children: sdNode[]) {
        super(uid)
        for (let c of children) {
            this.children.push(c)
        }
        
    }
}

export class button extends sdElementBase {
    tagName = "button"
    declare htmlElement: HTMLButtonElement
    constructor(uid: string, ...children: sdNode[]) {
        super(uid)
        for (let c of children) {
            this.children.push(c)
        }
        
    }
}

export class img extends sdElementBase {
    tagName = "img"
    declare htmlElement: HTMLImageElement
    constructor(uid: string, srcset: string, alt?: string) {
        super(uid)
        this.attributes.set("srcset", srcset)
        this.attributes.set("alt", alt ? alt : "")
    }
}



export class textInput extends sdElementBase {
    tagName = "input"
    private value1: string;
    value = ""
    declare htmlElement: HTMLInputElement

    constructor(uid: string, value?: string) {
        super(uid)
        this.value = value || ""
        this.value1 = value || ""
    }
    getState(): nodeState {
        return {
            style: this.styleString,
            eventListeners: this.eventListeners,
            children: [],
            attributes: this.attributes,
            generic: [this.value1]
        } 
    }
    create(parent: HTMLElement, nextSibling?: HTMLElement) {
        prevNodeLookup.set(this.uid, this.getState())
        let h = document.createElement(this.tagName) as HTMLInputElement
        h.addEventListener("change", ()=>{
            this.value = h.value
        })
        h.setAttribute("type", "text")
        h.value = this.value1
        h.id = this.uid

        for (let [e, l] of this.eventListeners) {
            h["on"+ e] = (e)=>{l(this, e)}
        }
        this.htmlElement = h
        if (nextSibling) {
            parent.insertBefore(h, nextSibling)
        } else {
            parent.appendChild(h)
        }
        h.style.cssText += this.styleString
        console.log(h.style.cssText + ", " + this.styleString)

        return h
    }
    
}