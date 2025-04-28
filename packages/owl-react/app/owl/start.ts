import { Component } from "@odoo/owl";
import { OwlApp } from "./owl-app";
import { getTemplate } from "./templates";

export function createOwlApp(component:Component, appConfig:any = {}) {
  let { env } = appConfig;
  const isRoot = !env;
  if (isRoot) {
      //env = await makeEnv();
      //await startServices(env);
  }

  const app = new OwlApp(component as any, {
      env,
      getTemplate,
      dev: true,
      //warnIfNoStaticProps: !session.test_mode,
      name: component.constructor.name,
      translatableAttributes: ["data-tooltip"],
      //translateFn: _t,
      ...appConfig,
  });
  /*
  const root = await app.mount(target);
  if (isRoot) {
      //odoo.__WOWL_DEBUG__ = { root };
  }*/

  return app;
}