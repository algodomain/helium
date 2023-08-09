let heliumStore = new Map();
let boundedMethodMap = new Map();
export function createStore(name, object) {
  boundedMethodMap.set(name, []);
  heliumStore.set(name, object);
}
export function updateStore(name, object) {
  heliumStore.set(name, object);
  boundedMethodMap.get(name).forEach(methodInfo => {
    methodInfo.props.store[name] = object;
    let newElement = methodInfo.method(methodInfo.props, methodInfo.children);
    let oldElement = document.querySelector("[updateId=" + methodInfo.updateId + "]");
    let parentNode = oldElement.parentNode;
    parentNode.replaceChild(newElement, oldElement);
  });
}
export function bindMethod(storeName, method, props, children, updateId) {
  let methodInfo = {
    method,
    props,
    children,
    updateId
  };
  boundedMethodMap.get(storeName).push(methodInfo);
}
export function getStore(storeName) {
  if (!heliumStore.has(storeName)) {
    createStore(storeName, null);
  }
  return heliumStore.get(storeName);
}