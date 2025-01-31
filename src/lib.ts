type nodeState = {
    style: string, // will only cause style to be updated
    children: string[] // list of uids in order, will only casue appedn or prepend
    generic: string[] // list of strings that must be equal or else cause full rerender
}


const nodeTable = new Map<string, sdNode>()

const prevNodeLookup = new Map<string, nodeState>()

export type sdNode = sdElement | sdText

export enum nodeType {
    text,
    element
}

export interface sdElement {
    uid: string
    nodeType: nodeType
    styleString: string
    children: sdNode[]
    create(parent: HTMLElement, nextSibling?: HTMLElement): Node
    getState(): nodeState
}

export class sdText {
    uid: string
    text: string
    nodeType = nodeType.text
    getState() {
        return {
            style: "",
            children: [],
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
        if (nextSibling) {
            parent.insertBefore(container, nextSibling)
        } else {
            parent.appendChild(container)
        }
        return container
    }
}

// function toNode(i: sdNode | string): sdNode {
//     return typeof i == "string" ? new sdText(i) : i
// }

class sdElementBase implements sdElement {
    nodeType = nodeType.element
    children: sdNode[] = []
    uid: string
    styleString: string
    tagName: string
    constructor(uid: string) {

        this.uid = uid
        nodeTable.set(uid, this)

    }
    addStyle(style: string) {
        
    }
    create(parent: HTMLElement, nextSibling?: HTMLElement) {
        prevNodeLookup.set(this.uid, this.getState())
        let el = document.createElement(this.tagName)
        el.id = this.uid

        if (nextSibling) {
            parent.insertBefore(el, nextSibling)
        } else {
            parent.appendChild(el)
        }
        return el
    }
    getState(): nodeState {
        return {
            style: this.styleString,
            children: this.children.map((c)=>c.uid),
            generic: []
        }
    }
}


export class div extends sdElementBase {
    tagName = "div"
    constructor(uid: string, ...children: sdNode[]) {
        super(uid)
        for (let c of children) {
            this.children.push(c)
        }
        
    }
}

export class textInput extends sdElementBase {
    tagName = "input"
    value: string;
    constructor(uid: string, value?: string) {
        super(uid)
        
        this.value = value || ""
    }
    getState(): nodeState {
        return {
            style: this.styleString,
            children: [],
            generic: [this.value]
        } 
    }
    create(parent: HTMLElement, nextSibling?: HTMLElement) {
        prevNodeLookup.set(this.uid, this.getState())
        let h = document.createElement(this.tagName) as HTMLInputElement
        h.setAttribute("type", "text")
        h.value = this.value
        h.id = this.uid
        if (nextSibling) {
            parent.insertBefore(h, nextSibling)
        } else {
            parent.appendChild(h)
        }
        return h
    }
    
}

function createChildren(parent: HTMLElement, children: sdNode[]) {
    for (let c of children) {
        if (c.nodeType == nodeType.element) {
            createChildren(c.create(parent) as HTMLElement, (c as sdElement).children)

        } else {
            c.create(parent)
        }
    }
}



function checkForChanges(node: sdNode) {
    let prevState = prevNodeLookup.get(node.uid)
    let currentState = node.getState()
    if (prevState) {
        console.log(currentState.generic, prevState.generic, node.uid)
        for (let i = 0; i < currentState.generic.length; i++) {

            if (prevState.generic[i] != currentState.generic[i]) {
                // rerender

                let parentNode = document.getElementById(node.uid)!.parentElement!
                //remove old
                document.getElementById(node.uid)!.remove()
                // nodeTable.delete(node.uid)
                // prevNodeLookup.delete(node.uid)

                //add new

                if (node.nodeType == nodeType.element) {
                    createChildren(node.create(parentNode) as HTMLElement, (node as sdElement).children)
        
                } else {
                    node.create(parentNode)
                }

                return // weve handled all childrens changes by rerendering them
            }
        }

        if (node.nodeType == nodeType.element) { // this needs to be last resort before checking if should be rerendered (otheriwse its just wasted)
            if ((node as sdElement).styleString != prevState.style) {
                document.getElementById(node.uid)!.style.cssText = (node as sdElement).styleString
            }
        }


        //first, find children to remove and to add will be left in curretnStateCCopy
        let currentStateCCopy = currentState.children.map((v)=>v)
        let parentNode = document.getElementById(node.uid)!
        out:
        for (let p of prevState.children) {
            for (let ci = 0; ci < currentStateCCopy.length; ci++) {
                if (currentStateCCopy[ci] == p) {
                    currentStateCCopy.splice(ci, 1)
                    continue out
                }
            }
            parentNode.removeChild(document.getElementById(p)!) // need to think about how to remove text and find it
            prevNodeLookup.delete(p)
        }

        // then  add children
        for (let i of currentStateCCopy) {
            
        }
        for (let i = 0; i < currentState.children.length; i++) {
            if (currentState.children[i] != prevState.children[i]) {
                if (currentStateCCopy.includes(currentState.children[i])) {
                    // this needs to be added to the dom as was not in the prevState.children
                    let node1 = nodeTable.get(currentState.children[i])!

                    if (prevState.children[i+1]) { // checks if there is something to prepenf before
                        let el = node1.create(parentNode, document.getElementById(prevState.children[i+1])!) // prepend before the next element the old state
                        if (node1.nodeType == nodeType.element) {
                            createChildren((el as HTMLElement), (node1 as sdElement).children)

                        }
                        
                    } else { //otherwise well jsut append the child 
                        let el = node1.create(parentNode)
                        if (node1.nodeType == nodeType.element) {
                            createChildren((el as HTMLElement), (node1 as sdElement).children)

                        }
                    }

                } else {
                    // just need to prepend the boy from seomwhere
                    let htmNode = document.getElementById(currentState.children[i])! // must exist as otheriwse it would be in the prevStateCCopy
                    
                    
                    if (prevState.children[i+1]) { // checks if there is something to prepenf before
                        parentNode.insertBefore(htmNode, document.getElementById(prevState.children[i+1])!)
                        
                    } else { //otherwise well jsut append the child 
                        parentNode.appendChild(htmNode)
                    }
                    
                    
                }
            }
            checkForChanges(nodeTable.get(currentState.children[i])!)

        }
        
    }
    
}

export function renderApp(app: ()=>sdElement, target: HTMLElement) {
    let rootEl = app()
    
    createChildren(rootEl.create(target) as HTMLElement, rootEl.children)

    function animate() {
        let rootEl = app()
        checkForChanges(rootEl)


        requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
}