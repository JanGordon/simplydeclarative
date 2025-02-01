(() => {
  // src/lib.ts
  var nodeTable = /* @__PURE__ */ new Map();
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
        generic: [this.text]
      };
    }
    create(parent, nextSibling) {
      let container = document.createElement("div");
      container.id = this.uid;
      let el = document.createTextNode(this.text);
      prevNodeLookup.set(this.uid, this.getState());
      container.appendChild(el);
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
    }
    create(parent, nextSibling) {
      prevNodeLookup.set(this.uid, this.getState());
      let el = document.createElement(this.tagName);
      el.id = this.uid;
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
        children: this.children.map((c) => c.uid),
        generic: []
      };
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
      this.htmlElement = h;
      if (nextSibling) {
        parent.insertBefore(h, nextSibling);
      } else {
        parent.appendChild(h);
      }
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
      for (let i = 0; i < currentState.generic.length; i++) {
        if (prevState.generic[i] != currentState.generic[i]) {
          let parentNode2 = document.getElementById(node.uid).parentElement;
          document.getElementById(node.uid).remove();
          if (node.nodeType == 1 /* element */) {
            createChildren(node.create(parentNode2), node.children);
          } else {
            node.create(parentNode2);
          }
          return;
        }
      }
      if (node.nodeType == 1 /* element */) {
        if (node.styleString != prevState.style) {
          document.getElementById(node.uid).style.cssText = node.styleString;
        }
      }
      let currentStateCCopy = currentState.children.map((v) => v);
      let parentNode = document.getElementById(node.uid);
      out:
        for (let p of prevState.children) {
          for (let ci = 0; ci < currentStateCCopy.length; ci++) {
            if (currentStateCCopy[ci] == p) {
              currentStateCCopy.splice(ci, 1);
              continue out;
            }
          }
          parentNode.removeChild(document.getElementById(p));
          prevNodeLookup.delete(p);
        }
      for (let i of currentStateCCopy) {
      }
      for (let i = 0; i < currentState.children.length; i++) {
        if (currentState.children[i] != prevState.children[i]) {
          if (currentStateCCopy.includes(currentState.children[i])) {
            let node1 = nodeTable.get(currentState.children[i]);
            if (prevState.children[i + 1]) {
              let el = node1.create(parentNode, document.getElementById(prevState.children[i + 1]));
              if (node1.nodeType == 1 /* element */) {
                createChildren(el, node1.children);
              }
            } else {
              let el = node1.create(parentNode);
              if (node1.nodeType == 1 /* element */) {
                createChildren(el, node1.children);
              }
            }
          } else {
            let htmNode = document.getElementById(currentState.children[i]);
            if (prevState.children[i + 1]) {
              parentNode.insertBefore(htmNode, document.getElementById(prevState.children[i + 1]));
            } else {
              parentNode.appendChild(htmNode);
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
    let emailIn = new textInput("email-inpt", "");
    return new div("root-div", emailIn, new sdText("email-display", "hello?: " + emailIn.htmlElement.value), new sdText("date", Date.now().toString()));
  }
  renderApp(r, document.getElementById("app"));
})();
