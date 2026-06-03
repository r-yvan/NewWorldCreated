declare module "json2csv" {
  export interface ParserOptions {
    fields?: string[];
    delimiter?: string;
  }
  export class Parser {
    constructor(options?: ParserOptions);
    parse(data: unknown): string;
  }
  export function parse(data: unknown, options?: ParserOptions): string;
}
