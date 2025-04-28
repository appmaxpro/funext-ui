
import {
    Component as OwlComponent,
  } from "@odoo/owl";

  class OwlContainer extends OwlComponent{

  }

  export class TemplateOutletComponent extends OwlComponent {
    static template = `<OwlContainer tpl="props.tpl">`
    static components = [OwlContainer];
    
  }



  

 