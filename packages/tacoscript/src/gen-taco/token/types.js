import { TokenType } from "horchata/lib/tokenizer/types";

export class GeneratorTokenType extends TokenType {}

export const WordBoundary = new GeneratorTokenType("b");

export { WordBoundary as wb };
