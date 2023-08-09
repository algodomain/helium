import { createElement } from "@algodomain/core";
import { updateStore } from "@algodomain/store";

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
