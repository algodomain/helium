import { updateStore } from "@algodomain/store";

export default (props) => {
  const updateCurrentLink = () => {
    updateStore("currentRoute", props.path);
  };

  return (
    <a href='#' onClick={updateCurrentLink}>
      {props.children[0]}
    </a>
  );
};
