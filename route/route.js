import { createElement } from "@algodomain/core";
import { getStore } from "@algodomain/store";

export default (props) => {
  return createElement(RouteLoader, {
    page: props.page,
    path: props.path,
    store: "currentRoute",
  });
};
const RouteLoader = (props) => {
  let currentRoute = getStore("currentRoute");
  function shouldRender() {
    if (currentRoute && props?.path && currentRoute === props.path) {
      return props.page();
    } else {
      return "";
    }
  }
  return createElement(
    "span",
    {
      updateId: props.updateId,
      class: "route",
    },
    shouldRender()
  );
};
