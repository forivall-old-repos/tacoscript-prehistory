## Translation

This is the Translation directory.

The code included here aids in translating javascript to & from tacoscript. This involves running the parser, performing any ast/cst transformations that will be needed, and then running the code generator.

### TODO
* Basic API
* Validation (run the reverse generation; should be equal)
  * Test code will be in core code, and tests will contain fixtures in order to run the translation & validation over standard code bases
* Common syntax changes
* Refactor into plugin oriented Architecture as core plugins
* Allow other parsers
* Modularize (long term)
