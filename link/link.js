import { createElement } from "@helium/core.js";
import { updateStore } from "@helium/store.js";
export default (props) => {
  const updateCurrentLink = () => {
    updateStore("currentRoute", props.path);
  };
  return createElement(
    "a",
    {
      href: "#",
      onClick: updateCurrentLink,
    },
    props.children[0]
  );
};
