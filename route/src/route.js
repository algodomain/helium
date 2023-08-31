import { getStore, updateStore } from "@algodomain/store";

export default (props) => {
  return (
    <RouteLoader page={props.page} path={props.path} store='currentRoute' />
  );
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
  return (
    <span updateId={props.updateId} class='route'>
      {shouldRender()}
    </span>
  );
};

export function navigate() {
  var referrer = document.referrer;
  let url = referrer.replace(window.location.href, "/").replace(/\/$/, "");
  console.log(url);
  history.replaceState("", "", url);
  if (url != "") {
    updateStore("currentRoute", url);
  }
}
