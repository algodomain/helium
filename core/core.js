import { bindMethod, getStore } from "@algodomain/store";

const isEvent = (k, v) => k.startsWith("on") && typeof v === "function";
const eventName = (k) => k.substr(2).toLowerCase();
const isString = (s) => typeof s === "string";
const isFunction = (s) => typeof s === "function";

function setStoreObjectInProps(tag, props, children) {
  let storeProp = props != undefined && props != null && props.store;
  if (storeProp) {
    props.store = {};
    let storeNames = storeProp.toString().trim().split(" ");
    props.updateId = generateRandomString();

    storeNames.forEach((storeName) => {
      props.store[storeName] = getStore(storeName.trim());
      bindMethod(storeName, tag, props, children, props.updateId);
    });
  }
  return props;
}

function generateRandomString() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 10; i++) {
    if (i === 0) {
      result += characters.charAt(Math.floor(Math.random() * 52));
    } else {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  }
  return result;
}

function attrs(el, props) {
  // Remember, JSX sets props to `null` if nothing is defined, so in that case we just return el
  if (!props) {
    return el;
  }

  // For every passed prop, we get key and value
  for (let [k, val] of Object.entries(props)) {
    // Check if it starts with `on`. Then we assume it is an event and add an event listener.
    if (isEvent(k, val)) {
      el.addEventListener(eventName(k), val);
    }
    // If the key is class, we use classList to add one or many CSS classes
    else if (k === "class") {
      const classes = Array.isArray(val) ? val : [val];
      el.classList.add(...classes);
    }
    // Of finally, if not class nor event, we set attribute using the setAttribute function.
    else {
      el.setAttribute(k, val);
    }
  }
  return el;
}

export function createElement(tag, props, ...children) {
  if (isFunction(tag)) {
    props = setStoreObjectInProps(tag, props, children);
    return tag({ ...props, children });
  }
  const el = attrs(document.createElement(tag), props);
  children.flat().forEach((child) => {
    const node = !isString(child) ? child : document.createTextNode(child);
    el.appendChild(node);
  });
  return el;
}
