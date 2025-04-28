import { type Component as OwlComponent, Component, App , xml, OwlError, } from "@odoo/owl";
import { Cache } from "./cache";
const cache = new Cache();
const tplCache = new Cache<Tpl>();
const tplNameCache = new Cache<XMLDocument>();
const tplTemplates = new Map<string, string | Element>();
const reactCache = new WeakMap<any, OwlComponent>();

let isDev = false;
export function setDev(prop:boolean) {
  isDev = prop;
}

interface Tpl {
  name: string;
  doc: XMLDocument;
}


export function createOwlComponent({
  name,
  template,
  app,
  components,
  events,
}: {
  name: string;
  template: string;
  app: App,
  components?: any[];
  events?: any[];
}): OwlComponent {
  /*
  let componentsCC = components
    ? `static components = [${components.join(", ")}];`
    : "";
  let cName = `
        return (class ${name} extends Component {
            static template = "${template ?? ""}";
            ${componentsCC}           
        })
    `;
  const fn = new Function(
    "Component",cName);
  return fn(Component) as Component;
  */
  let cached = cache.get(`${name}.${template}`);
  if (!cached) {

    
    const tt = "static template = xml'"+(template ?? '')+"`";

    let cName = `
        return (class ${name} extends Component {
            ${tt};
        })`;
    const fn = new Function("Component", "xml", cName);
    cached = fn(Component, xml) as Component;

    cache.put(`${name}.${template}`, cached);
  }

  return cached as unknown as OwlComponent;
}


export function extendsOwlComponent(
  name: string,
  rectType: any,
  component: any
): OwlComponent {

  let cached = reactCache.get(rectType);
  if (!cached) {
      let cName = `
          return (class ${name} extends Component {
          })`;
      const fn = new Function("Component", cName);
      cached = fn(component) as Component;
      reactCache.set(rectType, cached);
  }

  return cached as unknown as OwlComponent;
}
