import { type Token, TokenType } from './token';
import * as AST from './ast';
import { ca } from 'react-day-picker/locale';

export class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): AST.Program {
    const statements: AST.AstNode[] = [];

    while (!this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) statements.push(stmt);
    }

    return { type: AST.AstType.Program, statements };
  }

  private parseStatement(): AST.AstNode | null {
    this.skipSemicolons();
    if (this.isAtEnd()) return null;

    // console.log(`Parsing statement at ${this.current().type} (${this.current().value}), next: ${this.peek(1).type}`);
    const type = this.current().type;
    switch (type) {
       case TokenType.LET:  
        return this.parseLetStatement();
      case TokenType.IDENTIFIER:
        // Lookahead for assignment: IDENT = ...    
        if (this.peek(1).type === TokenType.ASSIGN) {
          return this.parseAssignmentStatement();
        }
        return this.parseExpressionStatement();
      case TokenType.IF:
        return this.parseIfStatement();
      case TokenType.RETURN:
        return this.parseReturnStatement();
      case TokenType.FOR:
        return this.parseForStatement();
      case TokenType.WHILE:
        return this.parseWhileStatement();
      case TokenType.LBRACE:
        return this.parseBlockStatement();
      default:
        return this.parseExpressionStatement();

    }
  }

  private parseLetStatement(): AST.LetStatement {
    this.advance(); // consume 'let'
    const name = this.expect(TokenType.IDENTIFIER, "Expected variable name").value;
    this.expect(TokenType.ASSIGN, "Expected '=' after variable name");
    const value = this.parseExpression();
    this.consumeOptionalSemicolon();
    return { type: AST.AstType.LetStatement, name, value };
  }

  private parseAssignmentStatement(): AST.AssignmentStatement {
    const name = this.expect(TokenType.IDENTIFIER, "Expected variable name").value;
    this.expect(TokenType.ASSIGN, "Expected '=' after variable name");
    const value = this.parseExpression();
    this.consumeOptionalSemicolon();
    return { type: AST.AstType.AssignmentStatement, name, value };
  }

  private parseIfStatement(): AST.IfStatement {
    this.advance(); // consume 'if'
    this.expect(TokenType.LPAREN, "Expected '(' after 'if'");
    const condition = this.parseExpression();
    this.expect(TokenType.RPAREN, "Expected ')' after condition");

    const thenBranch = this.check(TokenType.LBRACE)
      ? this.parseBlockStatement()
      : this.parseStatement()!;

    let elseBranch: AST.AstNode | null = null;
    if (this.check(TokenType.ELSE)) {
      this.advance();
      elseBranch = this.check(TokenType.LBRACE)
        ? this.parseBlockStatement()
        : this.parseStatement()!;
    }

    return { type: AST.AstType.IfStatement, condition, thenBranch, elseBranch };
  }

  private parseReturnStatement(): AST.ReturnStatement {
    this.advance(); // consume 'return'
    let value: AST.AstNode | null = null;

    if (!this.check(TokenType.SEMICOLON) && !this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      value = this.parseExpression();
    }

    this.consumeOptionalSemicolon();
    return { type: AST.AstType.ReturnStatement, value };
  }

  private parseForStatement(): AST.ForStatement {
    this.advance(); // consume 'for'
    this.expect(TokenType.LPAREN, "Expected '(' after 'for'");

    const variable = { type: AST.AstType.Identifier, name: this.expect(TokenType.IDENTIFIER, "Expected variable name").value } as AST.Identifier;

    this.expect(TokenType.IN, "Expected 'in' after variable name");

    const iterable = this.parseExpression();

    this.expect(TokenType.RPAREN, "Expected ')' after iterable");

    const body = this.parseBlockStatement();

    return { type: AST.AstType.ForStatement, variable, iterable, body };
  }

  private parseWhileStatement(): AST.WhileStatement {
    this.advance(); // consume 'while'
    this.expect(TokenType.LPAREN, "Expected '(' after 'while'");

    const condition = this.parseExpression();

    this.expect(TokenType.RPAREN, "Expected ')' after condition");

    const body = this.parseBlockStatement();

    return { type: AST.AstType.WhileStatement, condition, body };
  }

  private parseBlockStatement(): AST.BlockStatement {
    this.advance(); // consume '{'
    const statements: AST.AstNode[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) statements.push(stmt);
    }

    this.expect(TokenType.RBRACE, "Expected '}' after block");
    return { type: AST.AstType.BlockStatement, statements };
  }

  private parseExpressionStatement(): AST.ExpressionStatement {
    const expression = this.parseExpression();
    this.consumeOptionalSemicolon();
    return { type: AST.AstType.ExpressionStatement, expression };
  }

  parseExpression(): AST.AstNode {
    return this.parseElvis();
  }

  private parseElvis(): AST.AstNode {
    let left = this.parseOr();

    while (this.check(TokenType.ELVIS)) {
      this.advance();
      const right = this.parseOr();
      left = { type: AST.AstType.ElvisExpr, left, right };
    }

    return left;
  }

  private parseOr(): AST.AstNode {
    let left = this.parseAnd();

    while (this.check(TokenType.OR)) {
      const operator = this.advance().value;
      const right = this.parseAnd();
      left = { type: AST.AstType.BinaryExpr, operator, left, right };
    }

    return left;
  }

  private parseAnd(): AST.AstNode {
    let left = this.parseEquality();

    while (this.check(TokenType.AND)) {
      const operator = this.advance().value;
      const right = this.parseEquality();
      left = { type: AST.AstType.BinaryExpr, operator, left, right };
    }

    return left;
  }

  private parseEquality(): AST.AstNode {
    let left = this.parseComparison();

    while (this.check(TokenType.EQ) || this.check(TokenType.NEQ)) {
      const operator = this.advance().value;
      const right = this.parseComparison();
      left = { type: AST.AstType.BinaryExpr, operator, left, right };
    }

    return left;
  }

  private parseComparison(): AST.AstNode {
    let left = this.parseAdditive();

    while (this.check(TokenType.LT) || this.check(TokenType.LTE) ||
      this.check(TokenType.GT) || this.check(TokenType.GTE)) {
      const operator = this.advance().value;
      const right = this.parseAdditive();
      left = { type: AST.AstType.BinaryExpr, operator, left, right };
    }

    return left;
  }

  private parseAdditive(): AST.AstNode {
    let left = this.parseMultiplicative();

    while (this.check(TokenType.PLUS) || this.check(TokenType.MINUS)) {
      const operator = this.advance().value;
      const right = this.parseMultiplicative();
      left = { type: AST.AstType.BinaryExpr, operator, left, right };
    }

    return left;
  }

  private parseMultiplicative(): AST.AstNode {
    let left = this.parseUnary();

    while (this.check(TokenType.STAR) || this.check(TokenType.SLASH) || this.check(TokenType.PERCENT)) {
      const operator = this.advance().value;
      const right = this.parseUnary();
      left = { type: AST.AstType.BinaryExpr, operator, left, right };
    }

    return left;
  }

  private parseUnary(): AST.AstNode {
    if (this.check(TokenType.NOT) || this.check(TokenType.MINUS)) {
      const operator = this.advance().value;
      const right = this.parseUnary();
      return { type: AST.AstType.UnaryExpr, operator, right };
    }

    return this.parsePostfix();
  }

  private parsePostfix(): AST.AstNode {
    let expr = this.parsePrimary();

    while (true) {
      const type = this.current().type;
      switch (type) {
        case TokenType.LPAREN:
          this.advance();
          const args: AST.AstNode[] = [];

          if (!this.check(TokenType.RPAREN)) {
            do {
              args.push(this.parseExpression());
            } while (this.match(TokenType.COMMA));
          }

          this.expect(TokenType.RPAREN, "Expected ')' after arguments");
          expr = { type: AST.AstType.CallExpr, callee: expr, args };
          break;
        case TokenType.DOT:
          this.advance();
          const property = this.expect(TokenType.IDENTIFIER, "Expected property name").value;
          expr = { type: AST.AstType.MemberExpr, object: expr, property };
          break;
        case TokenType.QUESTION_DOT:
          this.advance();
          const safeProperty = this.expect(TokenType.IDENTIFIER, "Expected property name").value;
          expr = { type: AST.AstType.SafeMemberExpr, object: expr, property: safeProperty };
          break;
        case TokenType.LBRACKET:
          this.advance();
          const index = this.parseExpression();
          this.expect(TokenType.RBRACKET, "Expected ']' after index");
          expr = { type: AST.AstType.IndexExpr, object: expr, index };
          break;
        default:
          break;
      }
    }
    return expr;
  }

  private parsePrimary(): AST.AstNode {
    const type = this.current().type;
    switch(type) {
       case TokenType.NUMBER:
        return { type: AST.AstType.NumberLiteral, value: parseFloat(this.advance().value) };
      case TokenType.STRING:
        return { type: AST.AstType.StringLiteral, value: this.advance().value };
      case TokenType.STRING_TEMPLATE:
        return this.parseStringTemplate();
      case TokenType.TRUE:
        this.advance();
        return { type: AST.AstType.BooleanLiteral, value: true };
      case TokenType.FALSE:
        this.advance();
        return { type: AST.AstType.BooleanLiteral, value: false };
      case TokenType.NULL:
        this.advance();
        return { type: AST.AstType.NullLiteral, value: null };
      case TokenType.IDENTIFIER:
        return { type: AST.AstType.Identifier, name: this.advance().value };
      case TokenType.FN:
        return this.parseFunctionLiteral();
      case TokenType.LPAREN:
        this.advance();
        const expr = this.parseExpression();
        this.expect(TokenType.RPAREN, "Expected ')' after expression");
        return expr;
      case TokenType.LBRACKET:
        return this.parseArrayLiteral();
      case TokenType.LBRACE:
        return this.parseObjectLiteral();
      default:
        throw new Error(`Unexpected token: ${this.current().value} at: ${this.current().line}:${this.current().column}`);
    }
  }

  private parseArrayLiteral(): AST.ArrayLiteral {
    this.advance(); // consume '['
    const elements: AST.AstNode[] = [];

    if (!this.check(TokenType.RBRACKET)) {
      do {
        elements.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
    }

    this.expect(TokenType.RBRACKET, "Expected ']' after array elements");
    return { type: AST.AstType.ArrayLiteral, value: elements };
  }

  private parseObjectLiteral(): AST.ObjectLiteral {
    this.advance(); // consume '{'
    const properties: { key: string; value: AST.AstNode }[] = [];
    const tokenType = this.current().type;
    if (tokenType !== TokenType.RBRACE) {
      do {
        // Accept both identifiers and string literals as keys
        let key: string;
        if (tokenType === TokenType.IDENTIFIER) {
          key = this.advance().value;
        } else if (tokenType === TokenType.STRING) {
          key = this.advance().value;
        } else {
          throw new Error(`Expected property name at: ${this.current().line}:${this.current().column}`);
        }
        this.expect(TokenType.COLON, "Expected ':' after property name");
        const value = this.parseExpression();
        properties.push({ key, value });
      } while (this.match(TokenType.COMMA));
    }

    this.expect(TokenType.RBRACE, "Expected '}' after object properties");
    return { type: AST.AstType.ObjectLiteral, properties };
  }

  private parseFunctionLiteral(): AST.FunctionLiteral {
    this.advance(); // consume 'fn'
    this.expect(TokenType.LPAREN, "Expected '(' after 'fn'");

    const parameters: AST.Identifier[] = [];

    if (!this.check(TokenType.RPAREN)) {
      do {
        const param = this.expect(TokenType.IDENTIFIER, "Expected parameter name");
        parameters.push({ type: AST.AstType.Identifier, name: param.value });
      } while (this.match(TokenType.COMMA));
    }

    this.expect(TokenType.RPAREN, "Expected ')' after parameters");

    const body = this.parseBlockStatement();

    return { type: AST.AstType.FunctionLiteral, parameters, body };
  }

  private parseStringTemplate(): AST.StringTemplate {
    // Store the raw template string - interpreter will parse ${} expressions
    const templateValue = this.advance().value;
    return { type: AST.AstType.StringTemplate, parts: [{ type: AST.AstType.StringLiteral, value: templateValue }] };
  }

  private skipSemicolons(): void {
    while (this.check(TokenType.SEMICOLON)) {
      this.advance();
    }
  }

  private consumeOptionalSemicolon(): void {
    this.match(TokenType.SEMICOLON);
  }

  private current(): Token {
    return this.tokens[this.pos];
  }

  private peek(offset: number): Token {
    const index = this.pos + offset;
    if (index >= this.tokens.length) return this.tokens[this.tokens.length - 1]; // EOF
    return this.tokens[index];
  }

  private check(type: TokenType): boolean {
    return !this.isAtEnd() && this.current().type === type;
  }

  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.advance();
      return true;
    }
    return false;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.pos++;
    return this.tokens[this.pos - 1];
  }

  private expect(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(`${message} at: ${this.current().line}:${this.current().column}`);
  }

  private isAtEnd(): boolean {
    return this.current().type === TokenType.EOF;
  }
}
