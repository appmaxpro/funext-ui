import { parseXML } from "@odoo/owl";
import { applyInheritance } from "./template_inheritance";

function getClone(template:Element) {
    const c = template.cloneNode(true) as Element;
    new Document().append(c); // => c is the documentElement of its ownerDocument
    return c;
}

function getParsedTemplate(templateString:string) {
    const doc = parser.parseFromString(templateString, "text/xml");
    for (const processor of templateProcessors) {
        processor(doc);
    }
    return doc.firstChild;
}

function _getTemplate(name:string, blockId:number|null = null) {
    if (!(name in parsedTemplates)) {
        if (!(name in templates)) {
            return null;
        }
        const templateString = templates[name];
        parsedTemplates[name] = getParsedTemplate(templateString);
    }
    let processedTemplate = parsedTemplates[name];

    const inheritFrom = processedTemplate.getAttribute("t-inherit");
    if (inheritFrom) {
        const parentTemplate = _getTemplate(inheritFrom, blockId || info[name].blockId);
        if (!parentTemplate) {
            throw new Error(
                `Constructing template ${name}: template parent ${inheritFrom} not found`
            );
        }
        const element = getClone(processedTemplate);
        processedTemplate = applyInheritance(getClone(parentTemplate), element, info[name].url);
        if (processedTemplate.tagName !== element.tagName) {
            const temp = processedTemplate;
            processedTemplate = new Document().createElement(element.tagName);
            processedTemplate.append(...temp.childNodes);
        }
        for (const { name, value } of element.attributes) {
            if (!["t-inherit", "t-inherit-mode"].includes(name)) {
                processedTemplate.setAttribute(name, value);
            }
        }
    }

    for (const otherBlockId in templateExtensions[name] || {}) {
        if (blockId && (otherBlockId as unknown as number) > blockId) {
            break;
        }
        if (!(name in parsedTemplateExtensions)) {
            parsedTemplateExtensions[name] = {};
        }
        if (!(otherBlockId in parsedTemplateExtensions[name])) {
            parsedTemplateExtensions[name][otherBlockId] = [];
            for (const { templateString, url } of templateExtensions[name][otherBlockId]) {
                parsedTemplateExtensions[name][otherBlockId].push({
                    template: getParsedTemplate(templateString),
                    url,
                });
            }
        }
        for (const { template, url } of parsedTemplateExtensions[name][otherBlockId]) {
            if (!urlFilters.every((filter) => filter(url))) {
                continue;
            }
            processedTemplate = applyInheritance(
                inheritFrom ? processedTemplate : getClone(processedTemplate),
                getClone(template),
                url
            );
        }
    }

    return processedTemplate;
}

function isRegistered(...args:any[]) {
    const key = JSON.stringify([...args]);
    if (registered.has(key)) {
        return true;
    }
    registered.add(key);
    return false;
}

const info = Object.create(null);
const parsedTemplateExtensions = Object.create(null);
const parsedTemplates = Object.create(null);
const parser = new DOMParser();
/** @type {Map<string, Element>} */
const processedTemplates = new Map();
const registered = new Set();
/** @type {Record<string, Record<number, ({ templateString: string, url: string })[]>>} */
const templateExtensions = Object.create(null);
/** @type {((document: Document) => void)[]} */
const templateProcessors:((document: Document) => void)[] = [];
/** @type {Record<string, string>} */
const templates = Object.create(null);
let blockType:string|null = null;
let blockId = 0;
/** @type {((url: string) => boolean)[]} */
let urlFilters:((url: string) => boolean)[] = [];

export function checkPrimaryTemplateParents(namesToCheck:string[]) {
    const missing = new Set(namesToCheck.filter((name) => !(name in templates)));
    if (missing.size) {
        console.error(`Missing (primary) parent templates: ${[...missing].join(", ")}`);
    }
}

export function clearProcessedTemplates() {
    processedTemplates.clear();
}

/**
 * @param {string} name
 */
export function getTemplate(name:string) {
    if (!processedTemplates.has(name)) {
        processedTemplates.set(name, _getTemplate(name));
    }
    return processedTemplates.get(name);
}

export function registerTemplate(name:string, url:string, templateString:string) {
    if (isRegistered(...arguments)) {
        return;
    }
    if (blockType !== "templates") {
        blockType = "templates";
        blockId++;
    }
    if (name in templates && (info[name].url !== url || templates[name] !== templateString)) {
        throw new Error(`Template ${name} already exists`);
    }
    templates[name] = templateString;
    info[name] = { blockId, url };
}

export function registerTemplateExtension(inheritFrom:string, url:string, templateString:string) {
    if (isRegistered(...arguments)) {
        return;
    }
    if (blockType !== "extensions") {
        blockType = "extensions";
        blockId++;
    }
    if (!templateExtensions[inheritFrom]) {
        templateExtensions[inheritFrom] = [];
    }
    if (!templateExtensions[inheritFrom][blockId]) {
        templateExtensions[inheritFrom][blockId] = [];
    }
    templateExtensions[inheritFrom][blockId].push({
        templateString,
        url,
    });
}


export async function registerAllTemplate(url:string){
  return fetch(url).then(async (response)=> {
    if(response.ok) {
      const xml = await response.text()
      //console.log("registerAllTemplate :", xml)
      const doc = parseXML(xml);
      for (const template of doc.querySelectorAll("[t-name]")) {
        const name = template.getAttribute("t-name")!;
        registerTemplate(name, url, template.outerHTML);
      }
    } else{
      throw new Error("Unable to load url:" + url+"\n"+response.statusText)
    }

    return true;
  }).catch((error) => {
    console.error(error)
  })
}

/**
 * @param {(document: Document) => void} processor
 */
export function registerTemplateProcessor(processor:(document: Document) => void) {
    templateProcessors.push(processor);
}

/**
 * @param {typeof urlFilters} filters
 */
export function setUrlFilters(filters:((url: string) => boolean)[]) {
    urlFilters = filters;
}