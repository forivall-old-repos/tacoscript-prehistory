import { TokenType } from "horchata/lib/tokenizer/types";

export class GeneratorTokenType extends TokenType {}

export const WordBoundary = new GeneratorTokenType("b");
export const FormattingSpace = new GeneratorTokenType("sp");
export const ForcedSpace = new GeneratorTokenType("fsp");
export const Indent = new GeneratorTokenType("tab");
export const Newline = new GeneratorTokenType("nl");

export {
  WordBoundary as wb,
  FormattingSpace as sp,
  ForcedSpace as fsp,
  Indent as tab,
  Newline as nl
};
