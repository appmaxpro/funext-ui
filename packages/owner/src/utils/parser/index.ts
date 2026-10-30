import { Lexer } from './lexer';
import { Parser } from './parser';
import { Interpreter } from './interpreter';
import { type NativeFunction } from './natives';
import { defaultCache } from './cache';
import { AstType, type AstNode } from './ast';
import { result } from 'lodash';

export interface ScriptResult {
  output: string[];
  value: unknown;
  errors: string[];
}

export class KodiScriptBuilder {
  private source: string;
  private variables: Record<string, unknown> = {};
  private functions: Map<string, NativeFunction> = new Map();
  private _silentPrint = false;
  private _useCache = true;
  private _maxOps = 0;
  private _timeout = 0;

  constructor(source: string) {
    this.source = source;
  }

  withVariable(name: string, value: unknown): KodiScriptBuilder {
    this.variables[name] = value;
    return this;
  }

  withVariables(vars: Record<string, unknown>): KodiScriptBuilder {
    Object.assign(this.variables, vars);
    return this;
  }

  registerFunction(name: string, fn: (...args: unknown[]) => unknown): KodiScriptBuilder {
    this.functions.set(name, fn);
    return this;
  }

  bind(name: string, obj: unknown): KodiScriptBuilder {
    this.variables[name] = obj;
    return this;
  }

  silentPrint(silent = true): KodiScriptBuilder {
    this._silentPrint = silent;
    return this;
  }

  withCache(enabled = true): KodiScriptBuilder {
    this._useCache = enabled;
    return this;
  }

  withMaxOperations(maxOps: number): KodiScriptBuilder {
    this._maxOps = maxOps;
    return this;
  }

  withTimeout(timeoutMs: number): KodiScriptBuilder {
    this._timeout = timeoutMs;
    return this;
  }

  execute(): ScriptResult {
    // Try cache first
    let ast = this._useCache ? defaultCache.get(this.source) : undefined;

    if (!ast) {
      const lexer = new Lexer(this.source);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      ast = parser.parse();

      // Store in cache
      if (this._useCache) {
        defaultCache.set(this.source, ast);
      }
    }

    const interpreter = new Interpreter({ silentPrint: this._silentPrint });
    interpreter.setVariables(this.variables);
    interpreter.setMaxOperations(this._maxOps);
    if (this._timeout > 0) {
      interpreter.setDeadline(Date.now() + this._timeout);
    }
    this.functions.forEach((fn, name) => interpreter.registerFunction(name, fn));

    try {
      const { output, result } = interpreter.run(ast);
      return { output, value: result, errors: [] };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      return { output: [], value: null, errors: [errorMessage] };
    }
  }
}

export function parse(source: string): AstNode {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const program = parser.parse();
  return program.statements.length === 1 ? program.statements[0] : program;
}

export function evaluate(source: string | AstNode, variables?: Record<string, unknown>): unknown {
  // If the source is a string, parse it into an AST node
  if (typeof source === 'string') {
    return KodiScript.run(source, variables);
  }
  if (source.type !== AstType.Program) {
      source = { type: AstType.Program, statements: [source] };
  }
   const interpreter = new Interpreter();
   interpreter.setVariables(variables ?? {});
  try {
      const { output, result } = interpreter.run(source);
      return { output, value: result, errors: [] };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      return { output: [], value: null, errors: [errorMessage] };
    }
}

export const KodiScript = {
  run(source: string, variables?: Record<string, unknown>): ScriptResult {
    const builder = new KodiScriptBuilder(source);
    if (variables) {
      builder.withVariables(variables);
    }
    return builder.execute();
  },

  builder(source: string): KodiScriptBuilder {
    return new KodiScriptBuilder(source);
  },
};

export default KodiScript;
export { Lexer } from './lexer';
export { Parser } from './parser';
export { Interpreter } from './interpreter';
export { type Token, TokenType } from './token';
export * as AST from './ast';
