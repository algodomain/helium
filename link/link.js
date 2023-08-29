import { createElement } from "@algodomain/core";
import { updateStore } from "@algodomain/store";

export default (props) => {
  const updateCurrentLink = (e) => {
    updateStore("currentRoute", props.path);
     history.pushState("", "", props.path);
     e.preventDefault();
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
