export type AstNode =
  | NumberLiteral
  | StringLiteral
  | StringTemplate
  | BooleanLiteral
  | NullLiteral
  | Identifier
  | BinaryExpr
  | UnaryExpr
  | CallExpr
  | MemberExpr
  | SafeMemberExpr
  | ElvisExpr
  | ArrayLiteral
  | ObjectLiteral
  | IndexExpr
  | FunctionLiteral
  | LetStatement
  | AssignmentStatement
  | IfStatement
  | ForStatement
  | WhileStatement
  | ReturnStatement
  | BlockStatement
  | ExpressionStatement
  | Program;

export enum AstType {
  NumberLiteral,
  StringLiteral,
  StringTemplate,
  BooleanLiteral,
  NullLiteral,
  Identifier,
  BinaryExpr,
  UnaryExpr,
  CallExpr,
  MemberExpr,
  SafeMemberExpr,
  ElvisExpr,  
  ArrayLiteral,
  ObjectLiteral,
  IndexExpr,
  FunctionLiteral,
  LetStatement,
  AssignmentStatement,
  IfStatement,
  ForStatement,
  WhileStatement,
  ReturnStatement,
  BlockStatement,
  ExpressionStatement,
  Program
}

export interface LiteralExpr<Type extends AstType.NumberLiteral | AstType.StringLiteral | AstType.BooleanLiteral | AstType.NullLiteral | AstType.ArrayLiteral>  {
  type: Type;
  value: number | string | boolean | null | AstNode[];
}

export interface NumberLiteral extends LiteralExpr<AstType.NumberLiteral> {
  type: AstType.NumberLiteral;
  value: number;
}

export interface StringLiteral extends LiteralExpr<AstType.StringLiteral> {
  type: AstType.StringLiteral;
  value: string;
}

export interface StringTemplate {
  type: AstType.StringTemplate;
  parts: AstNode[];
}

export interface BooleanLiteral extends LiteralExpr<AstType.BooleanLiteral> {
  type: AstType.BooleanLiteral;
  value: boolean;
}

export interface NullLiteral extends LiteralExpr<AstType.NullLiteral> {
  type: AstType.NullLiteral;
}

export interface Identifier {
  type: AstType.Identifier;
  name: string;
}

export interface BinaryExpr {
  type: AstType.BinaryExpr;
  operator: string;
  left: AstNode;
  right: AstNode;
}

export interface UnaryExpr {
  type: AstType.UnaryExpr;
  operator: string;
  right: AstNode;
}

export interface CallExpr {
  type: AstType.CallExpr;
  callee: AstNode;
  args: AstNode[];
}

export interface MemberExpr {
  type: AstType.MemberExpr;
  object: AstNode;
  property: string;
}

export interface SafeMemberExpr {
  type: AstType.SafeMemberExpr;
  object: AstNode;
  property: string;
}

export interface ElvisExpr {
  type: AstType.ElvisExpr;
  left: AstNode;
  right: AstNode;
}

export interface ArrayLiteral {
  type: AstType.ArrayLiteral;
  value: AstNode[];
}

export interface ObjectLiteral {
  type: AstType.ObjectLiteral;
  properties: { key: string; value: AstNode }[];
}

export interface IndexExpr {
  type: AstType.IndexExpr;
  object: AstNode;
  index: AstNode;
}

export interface FunctionLiteral {
  type: AstType.FunctionLiteral;
  parameters: Identifier[];
  body: BlockStatement;
}

export interface LetStatement {
  type: AstType.LetStatement;
  name: string;
  value: AstNode;
}

export interface AssignmentStatement {
  type: AstType.AssignmentStatement;
  name: string;
  value: AstNode;
}

export interface IfStatement {
  type: AstType.IfStatement;
  condition: AstNode;
  thenBranch: AstNode;
  elseBranch: AstNode | null;
}

export interface ForStatement {
  type: AstType.ForStatement;
  variable: Identifier;
  iterable: AstNode;
  body: BlockStatement;
}

export interface WhileStatement {
  type: AstType.WhileStatement;
  condition: AstNode;
  body: BlockStatement;
}

export interface ReturnStatement {
  type: AstType.ReturnStatement;
  value: AstNode | null;
}

export interface BlockStatement {
  type: AstType.BlockStatement;
  statements: AstNode[];
}

export interface ExpressionStatement {
  type: AstType.ExpressionStatement;
  expression: AstNode;
}

export interface Program {
  type: AstType.Program;
  statements: AstNode[];
}
