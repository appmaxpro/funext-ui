export enum TokenType {
  // Literals
  NUMBER,
  STRING,
  STRING_TEMPLATE,
  IDENTIFIER,
  TRUE,
  FALSE,
  NULL,

  // Operators
  PLUS,
  MINUS,
  STAR,
  SLASH,
  PERCENT,

  // Comparison
  EQ,
  NEQ,
  LT,
  LTE,
  GT,
  GTE,

  // Logical
  AND,
  OR,
  NOT,

  // Assignment
  ASSIGN,

  // Delimiters
  LPAREN,
  RPAREN,
  LBRACE,
  RBRACE,
  LBRACKET,
  RBRACKET,
  COMMA,
  DOT,
  COLON,
  SEMICOLON,

  // Null-safety
  QUESTION_DOT,
  ELVIS,

  // Keywords
  LET,
  IF,
  ELSE,
  RETURN,
  FN,
  FOR,
  IN,
  WHILE,

  // Special
  EOF,
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export function createToken(type: TokenType, value: string, line: number, column: number): Token {
  return { type, value, line, column };
}
