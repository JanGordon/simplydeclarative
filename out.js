(() => {
  // src/lib.ts
  var nodeTable = /* @__PURE__ */ new Map();
  function sdGetNodeById(uid) {
    let el = nodeTable.get(uid);
    if (el) {
      return el;
    } else {
      return null;
    }
  }
  var prevNodeLookup = /* @__PURE__ */ new Map();
  var sdText = class {
    constructor(uid, t) {
      this.nodeType = 0 /* text */;
      this.text = t;
      this.uid = uid;
      nodeTable.set(uid, this);
    }
    getState() {
      return {
        style: "",
        children: [],
        eventListeners: [],
        generic: [this.text]
      };
    }
    create(parent, nextSibling) {
      let container = document.createElement("div");
      container.id = this.uid;
      let el = document.createTextNode(this.text);
      prevNodeLookup.set(this.uid, this.getState());
      container.appendChild(el);
      this.htmlElement = container;
      if (nextSibling) {
        parent.insertBefore(container, nextSibling);
      } else {
        parent.appendChild(container);
      }
      return container;
    }
  };
  var placeholders = /* @__PURE__ */ new Map();
  var sdElementBase = class {
    constructor(uid) {
      this.nodeType = 1 /* element */;
      this.children = [];
      this.styleString = "";
      this.eventListeners = [];
      this.uid = uid;
      nodeTable.set(uid, this);
      let el = document.getElementById(uid);
      if (el) {
        this.htmlElement = el;
      } else {
        let placeholder = placeholders.get(this.tagName);
        if (placeholder) {
          this.htmlElement = placeholder;
        } else {
          let el2 = document.createElement(this.tagName);
          placeholders.set(this.tagName, el2);
          this.htmlElement = el2;
        }
      }
    }
    addStyle(style) {
      this.styleString += style;
      return this;
    }
    create(parent, nextSibling) {
      prevNodeLookup.set(this.uid, this.getState());
      let el = document.createElement(this.tagName);
      el.id = this.uid;
      el.style.cssText = this.styleString;
      for (let [e, l] of this.eventListeners) {
        el["on" + e] = (e2) => {
          l(this, e2);
        };
      }
      if (nextSibling) {
        parent.insertBefore(el, nextSibling);
      } else {
        parent.appendChild(el);
      }
      this.htmlElement = el;
      return el;
    }
    getState() {
      return {
        style: this.styleString,
        eventListeners: this.eventListeners,
        children: this.children.map((c) => c.uid),
        generic: []
      };
    }
    addEventListener(event, listener) {
      this.eventListeners.push([event, listener]);
      return this;
    }
  };
  var div = class extends sdElementBase {
    constructor(uid, ...children) {
      super(uid);
      this.tagName = "div";
      for (let c of children) {
        this.children.push(c);
      }
    }
  };
  var button = class extends sdElementBase {
    constructor(uid, ...children) {
      super(uid);
      this.tagName = "button";
      for (let c of children) {
        this.children.push(c);
      }
    }
  };
  var textInput = class extends sdElementBase {
    constructor(uid, value) {
      super(uid);
      this.tagName = "input";
      this.value = "";
      this.value = value || "";
      this.value1 = value || "";
    }
    getState() {
      return {
        style: this.styleString,
        eventListeners: this.eventListeners,
        children: [],
        generic: [this.value1]
      };
    }
    create(parent, nextSibling) {
      prevNodeLookup.set(this.uid, this.getState());
      let h = document.createElement(this.tagName);
      h.addEventListener("change", () => {
        this.value = h.value;
      });
      h.setAttribute("type", "text");
      h.value = this.value1;
      h.id = this.uid;
      for (let [e, l] of this.eventListeners) {
        h["on" + e] = (e2) => {
          l(this, e2);
        };
      }
      this.htmlElement = h;
      if (nextSibling) {
        parent.insertBefore(h, nextSibling);
      } else {
        parent.appendChild(h);
      }
      h.style.cssText += this.styleString;
      console.log(h.style.cssText + ", " + this.styleString);
      return h;
    }
  };
  function createChildren(parent, children) {
    for (let c of children) {
      if (c.nodeType == 1 /* element */) {
        createChildren(c.create(parent), c.children);
      } else {
        c.create(parent);
      }
    }
  }
  function checkForChanges(node) {
    let prevState = prevNodeLookup.get(node.uid);
    let currentState = node.getState();
    if (prevState) {
      let htmlNode = document.getElementById(node.uid);
      for (let i = 0; i < currentState.generic.length; i++) {
        if (prevState.generic[i] != currentState.generic[i]) {
          let parentNode = document.getElementById(node.uid).parentElement;
          var nextSibling = htmlNode.nextSibling || void 0;
          htmlNode.remove();
          if (node.nodeType == 1 /* element */) {
            createChildren(node.create(parentNode, nextSibling), node.children);
          } else {
            node.create(parentNode, nextSibling);
          }
          return;
        }
      }
      if (node.nodeType == 1 /* element */) {
        if (node.styleString != prevState.style) {
          document.getElementById(node.uid).style.cssText = node.styleString;
        }
      }
      let currentStateECopy = currentState.eventListeners.map((v) => v);
      out:
        for (let pe of prevState.eventListeners) {
          for (let i = 0; i < currentStateECopy.length; i++) {
            if (pe[0] == currentStateECopy[i][0]) {
              currentStateECopy.splice(i);
              continue out;
            }
          }
          htmlNode["on" + pe[0]] = null;
        }
      for (let [eName, listener] of currentStateECopy) {
        htmlNode["on" + eName] = (e) => {
          listener(htmlNode, e);
        };
      }
      let currentStateCCopy = currentState.children.map((v) => v);
      out:
        for (let p of prevState.children) {
          for (let ci = 0; ci < currentStateCCopy.length; ci++) {
            if (currentStateCCopy[ci] == p) {
              currentStateCCopy.splice(ci, 1);
              continue out;
            }
          }
          htmlNode.removeChild(document.getElementById(p));
          prevNodeLookup.delete(p);
        }
      for (let i of currentStateCCopy) {
      }
      for (let i = 0; i < currentState.children.length; i++) {
        if (currentState.children[i] != prevState.children[i]) {
          if (currentStateCCopy.includes(currentState.children[i])) {
            let node1 = nodeTable.get(currentState.children[i]);
            if (prevState.children[i + 1]) {
              let el = node1.create(htmlNode, document.getElementById(prevState.children[i + 1]));
              if (node1.nodeType == 1 /* element */) {
                createChildren(el, node1.children);
              }
            } else {
              let el = node1.create(htmlNode);
              if (node1.nodeType == 1 /* element */) {
                createChildren(el, node1.children);
              }
            }
          } else {
            let htmNode = document.getElementById(currentState.children[i]);
            if (prevState.children[i + 1]) {
              htmlNode.insertBefore(htmNode, document.getElementById(prevState.children[i + 1]));
            } else {
              htmlNode.appendChild(htmNode);
            }
          }
        }
        checkForChanges(nodeTable.get(currentState.children[i]));
      }
    }
  }
  function renderApp(app, target) {
    let rootEl = app();
    createChildren(rootEl.create(target), rootEl.children);
    var toPause = false;
    function animate() {
      let rootEl2 = app();
      checkForChanges(rootEl2);
      if (!toPause) {
        requestAnimationFrame(animate);
      }
    }
    requestAnimationFrame(animate);
    window.sdNextFrame = () => {
      toPause = true;
      animate();
    };
    window.sdPause = () => {
      toPause = true;
    };
    window.sdResume = () => {
      toPause = false;
      requestAnimationFrame(animate);
    };
  }

  // src/main.ts
  function r() {
    return new div("root-div", new textInput("email-inpt", "").addStyle(`background-color: ${sdGetNodeById("email-inpt").htmlElement.value};`), new sdText("email-display", `
                email: ${sdGetNodeById("email-inpt").htmlElement.value}
                time from below: ${sdGetNodeById("date")?.text}
            `), new sdText("date", Date.now().toString()), counter("first"), counter("first1"));
  }
  var counts = /* @__PURE__ */ new Map();
  function counter(uid) {
    var count = counts.get(uid);
    if (count == void 0)
      count = { i: 0 };
    counts.set(uid, count);
    return new div(`counter-${uid}-root`, new sdText(`counter-${uid}-display`, count.i.toString()), new button(`counter-${uid}-button`, new sdText(`counter-${uid}-button-text`, "+")).addEventListener("click", (self, e) => {
      count.i++;
    }));
  }
  renderApp(r, document.getElementById("app"));
})();
