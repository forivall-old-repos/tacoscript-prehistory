Abstract Syntax Tree internals
==============================

In order to both re-use babel's babylon parser and preserve formatting, tacoscript's transpilers re-attach the tokens used for parsing onto the AST nodes. While using a CST (concrete syntax tree) would be more logical, a reasonable CST parser doesn't currently exist for ES2015+. A future version could switch to a CST, if it makes things simpler. For the short term, we will keep any AST transformations as simple as possible, and instead focus on token transformations.
