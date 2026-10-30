import uniqueId from "lodash/uniqueId";
import {evalCode} from "../eval";
//@ts-nocheck

/** @preserve
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */
("use strict");

/**
 * This is a very simple HTML to JSX converter. It turns out that browsers
 * have good HTML parsers (who would have thought?) so we utilise this by
 * inserting the HTML into a temporary DOM node, and then do a breadth-first
 * traversal of the resulting DOM tree.
 */

// https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType
var NODE_TYPE = {
  ELEMENT: 1,
  TEXT: 3,
  COMMENT: 8,
};

var ATTRIBUTE_MAPPING = {
  for: "htmlFor",
  class: "className",
};

var ELEMENT_ATTRIBUTE_MAPPING = {
  input: {
    checked: "defaultChecked",
    value: "defaultValue",
    autofocus: "autoFocus",
  },
};

// Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element#SVG_elements
var ELEMENT_TAG_NAME_MAPPING = {
  a: "a",
};

function nextUid() {
  return uniqueId("s-");
}

function isPlainObject(value) {
  return value ? value.constructor === Object : false;
}

function noEmpty(value) {
  return Boolean(value) && (!isPlainObject(value) || value.type !== "$c");
}

function trim(items, schema) {
  items = items ? items.filter(noEmpty) : items;
  if (items && items.length) {
    var ch = [];
    for (var i = 0, n = items.length; i < n; i++) {
      var cur = items[i];
      if (cur.type === "$c") {
        continue;
      }
      var c = ch.length;
      if (cur.type === "$text") {
        if (c > 0 && ch[c - 1].type === "$text") {
          ch[c - 1].text = ch[c - 1].text + cur.text;
          if (i === n - 1 && ch[c - 1].text.trim().length) ch.pop();
          continue;
        }
        if (i === n - 1 && !cur.text.trim().length) {
          continue;
        }
        ch.push(cur);
      } else {
        if (
          c > 0 &&
          ch[c - 1].type === "$text" &&
          !ch[c - 1].text.trim().length
        ) {
          ch[c - 1] = cur;
        } else {
          ch.push(cur);
        }
      }
    }
    if (ch.length) {
      if (ch.length === 1 && ch[ch.length - 1].type === "$text") {
        var text = ch[ch.length - 1].text.trim();
        if (text.length) {
          if (!schema) return text;
          schema.text = text;
        }
      } else {
        if (!schema) return ch;
        schema.items = ch;
      }
    }
  }
}

var _emptyArray = [];
function trimOrEmpty(items, filter) {
  if (!items) return _emptyArray;
  items = trim(items) || _emptyArray;
  if (items && !Array.isArray(items)) items = [items];

  return items.filter(filter || Boolean);
}

function map({ attrs, items, props, slots, type }, isSchema) {
  var schema = { type, ...attrs, uid: nextUid() };
  if ("type" in attrs) {
    schema.xType = type;
  }
  trim(items, schema);
  if (props && Object.keys(props).length) {
    schema.props = props;
  }
  if (slots) {
    schema.slots = slots;
  }
  return schema;
}


function evalFn(code, input, name, target) {
  var fn;
  try {
    fn = evalCode(code, input);
  } catch (e) {
    if (target && name) {
        target[name + "EvalError"] = e;
      }
      console.error("Invalid JSON prop:", name, ", got error:", e);
  }
  
  return fn;
}

const SCHEMA = {
  prop: {
    attrs: {
      name: "string",
      eval: "boolean",
      value: "object",
      tt: "string",
      if: (value) => new Function("value", "ctx", value),
    },
    getAttr: (name) => {
      return SCHEMA.prop.attrs[name];
    }
  },
  slot: {
    name: "string",
  },
  others: {
    hidden: "boolean",
    hideIf: "string",
    depends: "string",
    sx: "object",
    handler: "string",
    props: "object",
    
    title: "string",
    type: "string",
    onClick: "default",
  },
  schema: {
    name: "string",
    title: "string",
    help: "string",
    handler: "string",
    props: "object",
    attrs: "object",
    type: "string",
  },
  widget: {
    attrs: {
      hidden: "boolean",
      hideIf: "string",
      depends: "string",
      widget: "string",
      slots: "object",
      render: "string",
      context: "default"
    },
    getAttr: (name) => {
      return SCHEMA.widget.attrs[name] ?? SCHEMA.schema[name];
    },
  },
  option: {
    value: "string",
    title: "string",
    help: "string",
    icon: "string",
    order: "number",
    data: "object",
    widget: "string",
    domain: 'object'
  },
  property: {
    attr: {
      name: "string",
      type: "string",
      pType: "string",
      placeholder: "string",
      canSuggest: "boolean",
      canSelect: "string",
      onChange: "string",
      onSelect: "string",
      target: "string",
      targetName: "string",
      targetSearch: "string",
      aggregate: "string",
      sortable: "boolean",
      orderBy: "string",
      limit: "number",
      searchLimit: "number",
      optionsIn: "string",
      options: "[]",
      multiple: "boolean",
      domain: "default",
      filterDomain: 'default',
      context: "default",
      readonly: "boolean",
      readonlyIf: "string",
      required: "boolean",
      requiredIf: "string",
      validIf: "string",
      validate: "string",
      canDirty: "boolean",
      defaultValue: "any",
      noTitle: 'boolean',
      min: "number",
      max: "number",
      pattern: "string",
      views: "slot",
      canMove: "boolean",
      opts: 'object',
      parse: (value, target) =>
        value ? evalFn(value, 'value, ctx', "parse", target) : undefined,
      format: (value, target) =>
        value ? evalFn(value, 'value, ctx', "format", target) : undefined,
    },
    slots: ["options"],
    getAttr: (name) => {
      return SCHEMA.property.attr[name];
    },
    map: ({ items, attrs, props, ...rest }) => {
      items = trimOrEmpty(items, isPlainObject);
      var options = SCHEMA.property.parseOptions(items);
      if (!attrs.pType) {
        attrs.pType = attrs.type || (attrs.name === "id" ? "int" : "string");
      }
      delete attrs.type;
      return {
        ...rest,
        ...attrs,
        ...(options && { options }),
        uid: nextUid(),
      };
    },
    parseOptions: (items) => {
      var options = items.find((item) => item.type === "options");
      if(options){
        return Array.isArray(options.items) ? options.items : options.items ? [options.items] : [];
      }
    }
  },
  field: {
    extends: ["all", "property"],
    slots: ["views", "options"],
    getAttr: (name) => {
      return SCHEMA.property.getAttr(name) ?? SCHEMA.widget.getAttr(name);
    },
    map: ({ items, attrs, ...rest }) => {
      if (!attrs.pType) {
        attrs.pType = attrs.type || (attrs.name === "id" ? "int" : undefined);
      }
      items = trimOrEmpty(items, isPlainObject);
      var options = SCHEMA.property.parseOptions(items);

      var views = items.filter((item) => item.type === "views");
      if(attrs.pType === "mto" || attrs.pType === "otm" || attrs.pType === "mtm") {
        attrs.fields = items.filter((i) => i.type === "property")
      }
      
      return {
        ...rest,
        ...attrs,
        ...(options && { options }),
        ...(views.length && { views }),
        uid: nextUid(),
      };
    },
  },
  form: {
    attrs: {
      mode: "string",
      side: "string",
      readonly: "boolean",
      edit: "boolean",
      delete: "boolean",
      create: "boolean",
      readonlyIf: "string",
      onSubmit: "string",
      onEdit: "string",
      onDelete: "string",
      onNew: "string",
      validate: "string",
      commit: "string",
    },
    getAttr: (name) => {
      return SCHEMA.form.attrs[name] ?? SCHEMA.widget.getAttr(name);
    },
  },
  "filter-form": {
    getAttr: (name) => {
      return SCHEMA.form.getAttr(name);
    },
  },
  list: {
    attrs: {
      orderBy: "string",
      limit: "number",
      moveBy: "string",
      virtual: "boolean",
    },
    getAttr: (name) => {
      return SCHEMA.form.getAttr(name) ?? SCHEMA.list.attrs[name];
    },
  },
  filter: {
    attrs: {
      form: "slot",
      sidebar: "slot",
      defaults: "object",
    },
    getAttr: (name) => {
      return SCHEMA.filter.attrs[name] ?? SCHEMA.widget.getAttr(name);
    },
    map: ({ items, attrs, ...rest }) => {
      items = trimOrEmpty(items, isPlainObject);
      return {
        form: items.find((i) => i.type === "filter-form" || i.type === "form"),
        sidebar: items.find((i) => i.type === "sidebar"),
        ...attrs,
        ...rest,
        uid: nextUid(),
      };
    },
  },
  resource: {
    attrs: {
      domain: "default",
      context: "object",
      viewType: "string",
      model: "string",
      sorted: "[]",
      params: "object",
    },
    getAttr: (name) => {
      return SCHEMA.resource.attrs[name] ?? SCHEMA.widget.getAttr(name);
    },
    map: ({ items, attrs, ...rest }) => {
      items = trimOrEmpty(items, isPlainObject);
      return {
        fields: items.filter((i) => i.type === "property"),
        views: items.filter((i) => ["form", "filter", "list"].includes(i.type)),
        params: items.filter((i) => i.type === "param"),
        ...attrs,
        ...rest,
        uid: nextUid(),
      };
    },
  },
  views: {
    attrs: {},
    types: ["list", "form"],
    map: ({ items, ...rest }) => {
      items =
        items && Array.isArray(items)
          ? items
              .filter(isPlainObject)
              .filter((i) => ["list", "form"].includes(i.type))
          : null;
      return { type: "views", items: items && items.length ? items : null };
    },
  },
  html: {
    tag: "string",
    content: "string",
  },
  h: {
    content: "string",
    getAttr: (name) => (name === "content" ? "string" : undefined),
    map: ({ items, attrs, type, ...rest }) => {
      return { tag: "h", type, ...attrs, uid: nextUid() };
    },
  },
};

const lineBreakRE = /[\r\n]/;

/**
 * Iterates over elements of object invokes iteratee for each element
 *
 * @param {object}   obj        Collection object
 * @param {function} iteratee   Callback function called in iterative processing
 * @param {any}      context    This arg (aka Context)
 */
function eachObj(obj, iteratee, context) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      iteratee.call(context || obj, key, obj[key]);
    }
  }
}

/**
 * Convert tag name to tag name suitable for JSX.
 *
 * @param  {string} tagName  String of tag name
 * @return {string}
 */
function jsxTagName(tagName) {
  var name = tagName;

  if (ELEMENT_TAG_NAME_MAPPING.hasOwnProperty(name)) {
    name = ELEMENT_TAG_NAME_MAPPING[name];
  }

  return name;
}

/**
 * Repeats a string a certain number of times.
 * Also: the future is bright and consists of native string repetition:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat
 *
 * @param {string} string  String to repeat
 * @param {number} times   Number of times to repeat string. Integer.
 * @see http://jsperf.com/string-repeater/2
 */
function repeatString(string, times) {
  if (times === 1) {
    return string;
  }
  if (times < 0) {
    throw new Error();
  }
  var repeated = "";
  while (times) {
    if (times & 1) {
      repeated += string;
    }
    if ((times >>= 1)) {
      string += string;
    }
  }
  return repeated;
}

/**
 * Determine if the string ends with the specified substring.
 *
 * @param {string} haystack String to search in
 * @param {string} needle   String to search for
 * @return {boolean}
 */
function endsWith(haystack, needle) {
  return haystack.slice(-needle.length) === needle;
}

/**
 * Trim the specified substring off the string. If the string does not end
 * with the specified substring, this is a no-op.
 *
 * @param {string} haystack String to search in
 * @param {string} needle   String to search for
 * @return {string}
 */
function trimEnd(haystack, needle) {
  return endsWith(haystack, needle)
    ? haystack.slice(0, -needle.length)
    : haystack;
}

/**
 * Convert a hyphenated string to camelCase.
 */
function hyphenToCamelCase(string) {
  return string.replace(/-(.)/g, function (match, chr) {
    return chr.toUpperCase();
  });
}
function toCamelCase(name) {
  if (name) {
    name = hyphenToCamelCase(name);
    return name[0].toUpperCase() + name.slice(1);
  }
  return name;
}

function dotToCamelCase(name) {
  if (name && name.indexOf(".") > -1) {
    return name.split(".").map(toCamelCase)
    //name = name.replace(/\.(.)/g, (match, chr) => chr.toUpperCase());
  }
  return toCamelCase(name);
}

/**
 * Determines if the specified string consists entirely of whitespace.
 */
function isEmpty(string) {
  return !/[^\s]/.test(string);
}

/**
 * Determines if the CSS value can be converted from a
 * 'px' suffixed string to a numeric value
 *
 * @param {string} value CSS property value
 * @return {boolean}
 */
function isConvertiblePixelValue(value) {
  return /^\d+px$/.test(value);
}

/**
 * Determines if the specified string consists entirely of numeric characters.
 */
function isNumeric(input) {
  return (
    input !== undefined &&
    input !== null &&
    (typeof input === "number" || parseInt(input, 10) == input)
  );
}

var createElement;
if (typeof IN_BROWSER !== "undefined" && IN_BROWSER) {
  // Browser environment, use document.createElement directly.
  createElement = function (tag) {
    return document.createElement(tag);
  };
} else {
  // Node.js-like environment, use jsdom.
  //var jsdom = require('jsdom-no-contextify').jsdom;
  //var window = jsdom().defaultView;
  createElement = function (tag) {
    return window.document.createElement(tag);
  };
}

var tempEl = createElement("div");
/**
 * Escapes special characters by converting them to their escaped equivalent
 * (eg. "<" to "&lt;"). Only escapes characters that absolutely must be escaped.
 *
 * @param {string} value
 * @return {string}
 */
function escapeSpecialChars(value) {
  // Uses this One Weird Trick to escape text - Raw text inserted as textContent
  // will have its escaped version in innerHTML.
  tempEl.textContent = value;
  return tempEl.innerHTML;
}

if (typeof window.trustedTypes === "undefined")
  window.trustedTypes = { createPolicy: (n, rules) => rules };

var policy = trustedTypes.createPolicy("xml", {
  createHTML: (input) => input,
});

var parser;

try {
  parser = new DOMParser();
} catch (e) {}

var HTMLtoJson = function (config) {
  this.config = config || {};
  if (!this.config.indent) {
    this.config.indent = "  ";
  }
};
HTMLtoJson.prototype = {
  /**
   * Reset the internal state of the converter
   */
  reset: function () {
    this.output = "";
    this.level = 0;
    this._inPreTag = false;
    this.widget = {
      items: [],
      props: {},
      attrs: {},
    };
    this.stack = [];
  },
  /**
   * Main entry point to the converter. Given the specified HTML, returns a
   * JSX object representing it.
   * @param {string} html HTML to convert
   * @return {string} JSX
   */
  convert: function (html) {
    this.reset();

    if (parser) {
      let doc = parser.parseFromString(
        policy.createHTML(this._cleanInput(html)),
        "text/xml",
      );
      this._visit(doc.documentElement);
      if (this.widget.items && Array.isArray(this.widget.items) && this.widget.items.length === 1) {
        return this.widget.items[0];
      }
    } else {
      var containerEl = createElement("div");
      containerEl.innerHTML = "\n" + this._cleanInput(html) + "\n";
      const topLevel = this._onlyOneTopLevel(containerEl);
      if (topLevel === containerEl) this._traverse(containerEl);
      else this._visit(containerEl);
      if (this.widget.items.length === 1) {
        return this.widget.items[0];
      }
    }
    return this.widget;
  },

  /**
   * Cleans up the specified HTML so it's in a format acceptable for
   * converting.
   *
   * @param {string} html HTML to clean
   * @return {string} Cleaned HTML
   */
  _cleanInput: function (html) {
    // Remove unnecessary whitespace
    html = html.trim();
    // Ugly method to strip script tags. They can wreak havoc on the DOM nodes
    // so let's not even put them in the DOM.
    html = html.replace(/<script([\s\S]*?)<\/script>/g, "");
    return html;
  },

  /**
   * Determines if there's only one top-level node in the DOM tree. That is,
   * all the HTML is wrapped by a single HTML tag.
   *
   * @param {DOMElement} containerEl Container element
   * @return {boolean}
   */
  _onlyOneTopLevel: function (containerEl) {
    // Only a single child element
    if (
      containerEl.childNodes.length === 1 &&
      containerEl.childNodes[0].nodeType === NODE_TYPE.ELEMENT
    ) {
      return containerEl.childNodes[0];
    }
    // Only one element, and all other children are whitespace
    var foundElement = false;
    for (var i = 0, count = containerEl.childNodes.length; i < count; i++) {
      var child = containerEl.childNodes[i];
      if (child.nodeType === NODE_TYPE.ELEMENT) {
        if (foundElement) {
          // Encountered an element after already encountering another one
          // Therefore, more than one element at root level
          return containerEl;
        } else {
          foundElement = child;
        }
      } else if (
        child.nodeType === NODE_TYPE.TEXT &&
        !isEmpty(child.textContent)
      ) {
        // Contains text content
        return containerEl;
      }
    }
    return foundElement;
  },

  /**
   * Gets a newline followed by the correct indentation for the current
   * nesting level
   *
   * @return {string}
   */
  _getIndentedNewline: function () {
    return "\n" + repeatString(this.config.indent, this.level + 2);
  },

  /**
   * Handles processing the specified node
   *
   * @param {Node} node
   */
  _visit: function (node) {
    if (this._shouldIgnore(node)) {
      return;
    }
    const newW = this._beginWidget(this.widget);

    this._beginVisit(node);
    this._traverse(node);
    this._endVisit(node);

    this._endWidget(newW);
  },

  _beginWidget: function (cur) {
    var cur = this.widget;
    if (cur.type) this.stack.push(cur);

    this.widget = {
      items: [],
      props: {},
      attrs: {},
      parent: cur,
    };

    return this.widget;
  },

  _endWidget: function (widget) {
    var parent = widget.parent;
    delete widget.parent;
    delete widget.isComponent;

    var cur = this.stack.pop();
    if (widget.type === "$c") {
      this.widget = cur;
      return;
    }

    if (widget.schema) {
      var schema = widget.schema;
      delete widget.schema;
      //console.log("map widget:", widget, ', using:', schema.map ? schema : "map")
      widget = schema.map ? schema.map(widget) : map(widget);
    } else {
      widget = map(widget);
    }
    if (cur && widget) {
      if (widget.type === "prop") {
        if (widget.name) {
          if (widget.hasOwnProperty("value")) {
            cur.props[widget.name] = widget.value;
          } else {
            var text = widget.content ? widget.content.trim() : null;
            if (text) {
              var val =
                (widget.eval ? this._eval(text, widget.name, cur.props) : text) ||
                text;
              cur.props[widget.name] = val;
            }
          }
        }
      } else if (widget.type === "slot") {
        var items = widget.items;
        //console.log("------slots:", widget.name, ", items:", items);
        

        if (widget.name && (widget.text || (items && items.length))) {
          cur.slots = cur.slots || {};

          if (items && items.length) {
            if (items.length > 1) {
              cur.slots[widget.name] = {
                type: "FG",
                items: items,
              };
            } else {
              cur.slots[widget.name] = items[0];
            }
          } else if (widget.text) {
            cur.slots[widget.name] = widget.text;
          }
        }
      } else {
        if (widget.type !== "$text" || widget.text.trim().length)
          cur.items.push(widget);
      }
    }

    this.widget = cur || widget;
  },

  /**
   * Traverses all the children of the specified node
   *
   * @param {Node} node
   */
  _traverse: function (node) {
    this.level++;
    for (var i = 0, count = node.childNodes.length; i < count; i++) {
      this._visit(node.childNodes[i]);
    }
    this.level--;
  },

  /**
   * Handle pre-visit behaviour for the specified node.
   *
   * @param {Node} node
   */
  _beginVisit: function (node) {
    switch (node.nodeType) {
      case NODE_TYPE.ELEMENT:
        this._beginVisitElement(node);
        break;

      case NODE_TYPE.TEXT:
        this._visitText(node);
        break;

      case NODE_TYPE.COMMENT:
        this._visitComment(node);
        break;

      default:
        console.warn("Unrecognised node type: " + node.nodeType);
    }
  },

  /**
   * Handles post-visit behaviour for the specified node.
   *
   * @param {Node} node
   */
  _endVisit: function (node) {
    switch (node.nodeType) {
      case NODE_TYPE.ELEMENT:
        this._endVisitElement(node);
        break;
      // No ending tags required for these types
      case NODE_TYPE.TEXT:
      case NODE_TYPE.COMMENT:
        break;
    }
  },

  /**
   * Handles pre-visit behaviour for the specified element node
   *
   * @param {DOMElement} node
   */
  _beginVisitElement: function (node) {
    var tagName = jsxTagName(node.tagName);
    var schema = SCHEMA[tagName];

    this.widget.type = tagName;
    if (schema) this.widget.schema = schema;

    this.widget.isComponent = tagName[0] === tagName[0].toUpperCase();

    var attributes = node.attributes;
    for (var i = 0, count = attributes.length; i < count; i++) {
      this._getElementAttribute(attributes[i], tagName, schema, this.widget);
    }

    if (tagName === "textarea") {
      // Hax: textareas need their inner text moved to a "defaultValue" attribute.
      this.widget.props["value"] = JSON.stringify(node.value);
    } else if (tagName === "style") {
      // Hax: style tag contents need to be dangerously set due to liberal curly brace usage
      this.widget.props["dangerouslySetInnerHTML"] = {
        __html: JSON.stringify(node.textContent),
      };
    } else if (tagName === "pre") {
      this._inPreTag = true;
    } else if (tagName === "h" || tagName === "html") {
      this.widget.attrs.content = node.innerHTML.trim();
      node.childNodes.forEach((n) => n.remove());
    } else if (
      tagName === "prop" &&
      !this.widget.attrs.hasOwnProperty("value")
    ) {
      this.widget.attrs.content = node.innerHTML.trim();
      node.childNodes.forEach((n) => n.remove());
    }
    //this.widget.type = tagName;
  },

  /**
   * Handles post-visit behaviour for the specified element node
   *
   * @param {Node} node
   */
  _endVisitElement: function (node) {
    var tagName = jsxTagName(node.tagName);

    if (tagName === "pre") {
      this._inPreTag = false;
    }
  },

  _shouldIgnore: function (node) {
    switch (node.nodeType) {
      case NODE_TYPE.COMMENT:
        return true;
      case NODE_TYPE.TEXT:
        var text = escapeSpecialChars(node.textContent);
        if (lineBreakRE.test(text) && !text.trim()) {
          return true;
        }
    }
    return false;
  },

  /**
   * Determines if this element node should be rendered as a self-closing
   * tag.
   *
   * @param {Node} node
   * @return {boolean}
   */
  _isSelfClosing: function (node) {
    var tagName = jsxTagName(node.tagName);
    // If it has children, it's not self-closing
    // Exception: All children of a textarea are moved to a "defaultValue" attribute, style attributes are dangerously set.
    return !node.firstChild || tagName === "textarea" || tagName === "style";
  },

  /**
   * Handles processing of the specified text node
   *
   * @param {TextNode} node
   */
  _visitText: function (node) {
    var parentTag = node.parentNode && jsxTagName(node.parentNode.tagName);

    if (parentTag === "textarea" || parentTag === "style") {
      // Ignore text content of textareas and styles, as it will have already been moved
      // to a "defaultValue" attribute and "dangerouslySetInnerHTML" attribute respectively.
      return;
    }
    var parent = this.widget.parent;
    if (parent) parentTag = parent.type || parent.tag;

    var text = escapeSpecialChars(node.textContent);
    ///console.log("parentTag text:", parentTag, ": ", text);

    if (this._inPreTag) {
      // If this text is contained within a <pre>, we need to ensure the JSX
      // whitespace coalescing rules don't eat the whitespace. This means
      // wrapping newlines and sequences of two or more spaces in variables.
      text = text
        .replace(/\r/g, "")
        .replace(/( {2,}|\n|\t|\{|\})/g, function (whitespace) {
          return "{" + JSON.stringify(whitespace) + "}";
        });
    } else {
      if (lineBreakRE.test(text) && !text.trim()) {
        this.widget.type = "$c";
        return null;
      }

      // Handle any curly braces.
      /*
      text = text
        .replace(/(\{|\})/g, function(brace) {
            return '{\'' + brace + '\'}';
        });
      */
      // If there's a newline in the text, adjust the indent level
      if (text.indexOf("\n") > -1) {
        text = text.replace(/\n\s*/g, this._getIndentedNewline());
      }
      if (parent && !parent.schema) {
        parent.items.push(text);
        this.widget.type = "$c";
        return null;
      }
      // Handle any curly braces.
      /*
      text = text.replace(/(\{|\})/g, function (brace) {
        return "{'" + brace + "'}";
      });
      */
    }
    this.widget.type = "$text";
    this.widget.attrs.text = text;
  },

  /**
   * Handles processing of the specified text node
   *
   * @param {Text} node
   */
  _visitComment: function (node) {
    this.widget.type = "$c";
    ///this.widget.props.text = '{/*' + node.textContent.replace('*/', '* /') + '*/}'
  },

  /**
   * Gets a JSX formatted version of the specified attribute from the node
   *
   * @param {DOMElement} node
   * @param {object}     attribute
   * @return {string}
   */
  _getElementAttribute: function (attribute, tag, schema, widget) {
    switch (attribute.name) {
      case "style":
        widget.props.style = this._getStyleAttribute(attribute.value);
        return;
      default:
        let sAttr;
        var eType;
        var name = attribute.name;
        var result = attribute.value;
        if (schema) {
          sAttr = schema.getAttr ? schema.getAttr(name) : schema[name];
        }

        if (!sAttr) {
          sAttr = SCHEMA.others[name];
        }

        if (!sAttr) {
          name =
            (ELEMENT_ATTRIBUTE_MAPPING[tag] &&
              ELEMENT_ATTRIBUTE_MAPPING[tag][name]) ||
            ATTRIBUTE_MAPPING[name] ||
            name;

        }

        if (!sAttr && widget.isComponent) {
          // Numeric values should be output as {123} not "123"
          if (isNumeric(result)) {
            result =
              result.indexOf(".") > -1 ? parseFloat(result) : parseInt(result);
          } else if (/^(true|false)$/.test(result)) {
            result = /^(t|true)$/.test(result);
          } else if (result.length > 0) {
            result = result.replace(/"/gm, "&quot;");
          }
        } else if (result.length > 0) {
          result = result.replace(/"/gm, "&quot;");
        }

        if (sAttr) {
          var val;
          if (typeof sAttr === "function") {
            val = sAttr(result, widget.attrs);
          } else {
            switch (sAttr) {
              case "boolean":
                val = /^(1|t|y|true|yes)$/.test(result);
                break;
              case "number":
                val =
                  result.indexOf(".") > -1
                    ? parseFloat(result)
                    : parseInt(result);
                break;
              case "[]":
              case "object":
                val = this._eval(result, name, widget);
                break;
              case "any":
                val = this._eval(result, name, widget) || result;
                break;
              case "fn":
                //val = evalFn(result, "ctx", name, widget.attrs);
                //val = new Function("ctx", result);
                val = result;
                break;

              default:
                val = result;
            }
          }
          if (name === "props" && isPlainObject(val)) {
            widget.props = { ...widget.props, ...val };
          } 
          else if (sAttr && name === "attrs" && isPlainObject(val)){
            widget.attrs = { ...widget.attrs, ...val };
          }
          else {
            widget.attrs[name] = val;
          }
        } else {
          if (name.startsWith("e_")) {
            //result = evalFn(result, 'ctx', name, widget);
          }

          widget.props[name] = result;
        }
    }
  },

  /**
   * Gets a JSX formatted version of the specified element styles
   *
   * @param {string} styles
   * @return {string}
   */
  _getStyleAttribute: function (styles) {
    var jsxStyles = new StyleParser(styles).toJSXString();
    return jsxStyles;
  },

  _eval: function (input, name, widget) {
    try {
      var obj = eval("(" + input + ")");
      if(typeof obj === 'function') {
         obj = evalFn(input, "ctx", name, widget);  
      }
      return obj;
    } catch (e) {
      if (widget && name) {
        widget[name + "EvalError"] = e;
      }
      console.error("Invalid JSON for attr:", name, ", got error:", e);
    }
  },
};

/**
 * Handles parsing of inline styles
 *
 * @param {string} rawStyle Raw style attribute
 * @constructor
 */
var StyleParser = function (rawStyle) {
  this.parse(rawStyle);
};
StyleParser.prototype = {
  /**
   * Parse the specified inline style attribute value
   * @param {string} rawStyle Raw style attribute
   */
  parse: function (rawStyle) {
    this.styles = {};
    rawStyle.split(";").forEach(function (style) {
      style = style.trim();
      var firstColon = style.indexOf(":");
      var key = style.substr(0, firstColon);
      var value = style.substr(firstColon + 1).trim();
      if (key !== "") {
        // Style key should be case insensitive
        key = key.toLowerCase();
        this.styles[key] = value;
      }
    }, this);
  },

  /**
   * Convert the style information represented by this parser into a JSX
   * string
   *
   * @return {string}
   */
  toJSXString: function () {
    var output = [];
    eachObj(
      this.styles,
      function (key, value) {
        output.push(this.toJSXKey(key) + ": " + this.toJSXValue(value));
      },
      this,
    );
    return output.join(", ");
  },

  /**
   * Convert the CSS style key to a JSX style key
   *
   * @param {string} key CSS style key
   * @return {string} JSX style key
   */
  toJSXKey: function (key) {
    // Don't capitalize -- prefix
    if (key.startsWith("--")) return key;

    // Don't capitalize -ms- prefix
    if (/^-ms-/.test(key)) {
      key = key.substr(1);
    }
    return hyphenToCamelCase(key);
  },

  /**
   * Convert the CSS style value to a JSX style value
   *
   * @param {string} value CSS style value
   * @return {string} JSX style value
   */
  toJSXValue: function (value) {
    if (isNumeric(value)) {
      // If numeric, no quotes
      return value;
    } else {
      // Probably a string, wrap it in quotes
      return "'" + value.replace(/'/g, '"') + "'";
    }
  },
};

/**
 * Returns a template literal that evaluates to str. You can add interpolation
 * sigils into the string if required
 */
function toStringExpression(str) {
  return `\`${str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/, "\\${")}\``;
}

export default HTMLtoJson
//module.exports.default = HTMLtoJson;
