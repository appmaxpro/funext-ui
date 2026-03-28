function preEval(code: string, input: string = "") {
  if (code.startsWith("function("))
    //fn = eval(`(${input}) => ${code} `);
    return eval(code);
  else {
    const prefix = `(${input})`;
    const replace = `(${input}) `;
    while (code.indexOf(replace) === 0) code = code.replace(replace, prefix);

    if (code.startsWith(`${prefix}=>`)) return eval(code);
  }
}

function evalMulti(code: string, input: string = "") {
  var fn;
  try {
    fn = preEval(code, input);
  } catch (e) {
    console.error("Try eval multi line code: " + code);
  }
  if (typeof fn !== "function") {
    
    fn = eval(`(${input}) => {
          ${code} 
      }`);
  }
  return fn;
}

export function evalCode(code: string, input: string = "", safe: boolean = false) {
  code = code.trim();
  if (!code.length) {
    return;
  }
  //code = code.replace(/\\/g, "\\\\").replace(/`/g, "\\`")
  if (code.includes("\n")) {
    const codes = code.replace(/\\/g, "\\\\").replace(/`/g, "\\`");
    try {
      
      return evalMulti(codes, input);
    } catch (e) {
      if (safe) {
        console.error("Invalid code:", code, ", got error:", e);
        return;
      }
      console.warn("Invalid code:", codes);
      throw e;
    }
  }
  var fn;
  try {
    fn = preEval(code, input);
  } catch (e) {
    //console.error("Try eval inline code: " + code);
  }
  if (typeof fn !== "function") {
    fn = undefined;
    const fnCode = `(${input}) => ${code}`
    try {
      fn = eval(fnCode);
    } catch (e) {
      if (safe) {
        console.error("Invalid code:", fnCode, ", got error:", e);
        return;
      }
      console.warn("Invalid code:", fnCode);
      throw e;
    }
  }
  return fn;
}
