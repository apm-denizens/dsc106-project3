import { c as create_ssr_component } from "../../chunks/ssr.js";
import "d3";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg id="my_dataviz" width="800" height="600"></svg>`;
});
export {
  Page as default
};
