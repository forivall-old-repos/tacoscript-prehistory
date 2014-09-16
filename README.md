# Smorescript

ECMAScript, with added boring!

## Goals

* Have a one to one representation of the Spidermonkey Parser API AST
* Be fully compatible with ES6+
* Be compatible with [sweet.js](http://sweetjs.org)

## Design Philosophy
Don't use `!` for negation, instead, use it more as an execution marker, or kinda like how CSS uses it for `!important`.

Use words for logic, and symbols for math.

Minimal semicolons and braces. Ideally none. Allow braces for object literals, but prefer indentation for blocks.

## Target syntax

### Main, simple changes
js
```JavaScript
/* block comment */
// line comment
var \u1337 = {};
var foo, bar;
foo == bar;
foo == null;
foo != null;
foo === bar;
foo !== bar;
foo || bar;
foo && bar;
```
smore
```
#* block comment *#
# line comment
\\u1337 = {}
foo similarto bar
ngot foo  # shorthand for not got foo
got foo
foo is bar
foo isnt bar
foo or bar
foo and bar
```
js
```JavaScript
foo ? bar : baz;
foo ? bar
: fizz ? bizz
: baz;
```
smore
```
# TODO - determine syntax
# overload if/then/else, like coffeescript
?if foo ?then bar ?else baz
if foo then bar else baz

# conditionals in questionmarks, results surrounded by colons
? foo ?: bar : baz
? foo ?: bar :? fizz ?: bizz : baz

# use the same syntax for switch / case and ternary??? based on if it's statements or expressions.
# switch foo case true then bar else baz
# switch foo case > 5 then bar else baz
switch foo then bar else baz
```
js
```JavaScript
() => "foo"

(() => console.log("foo"); void 0); // ES6
(function() { return "foo"}).bind(this); // ES5

function() { console.log("foo"); };
function() { return "foo"; };
function declared() { return "foo"; }
function*() { yield 1; yield 2; }
do that(); while (true)
while(true) bar();
for(var i = 1; i < 0; i++)
{
  let a = 1; 
}
// reserved word in smore
var then;

var MyModule = require('my-module');
```

smore
```
() =>> "foo"
() => console.log("foo")
() -> console.log("foo")
() ->> "foo"
!declared = ()  ->> "foo"
() *->>
  yield 1
  yield 2

do that() while true
while true then bar()
while true
  bar()

# TODO: look up that other altjs i looked at for a better word other than update
for i = 1 while i < 0 update i++
  bar()
for i = 1 while i < 0 update i++ then bar()
for i = 1 upto 0 by 1 then bar()
for i of [] then bar()

block
  a = 1

var the\u006e;
# idea: use use some kind of lookup table to determine the letter with the least amount of information density.

MyModule = require! 'my-module'
# of course, this should be replaced with a sweetjs macro when possible.
```

### Semantic changes

Automatic local variables, using let, or var if in es5 mode.

global variables are declared with the `global` keyword.

### Other changes

js
```JavaScript
!foo;
```

smore
```
not foo
```

In addition to the syntax difference, the `not` operator will have lower precedence than logical OR (`or`/`||`), but higher than `?:`

### Low Priority changes

* Introduce a cast operator, instead of the practice of various conventions such as `+number` or `~~integer` or `'' + string`

js
```JavaScript
+number
~~integer
''+string
```

smore
```
n\number
i\integer
s\string
```

Precedence is equal to unary `+`, with right associativity. Additional operators can be added with sweet.js (when compatibility works).

* Discourage use of `,` except in argument lists, and as the comma operator
js
```JavaScript
array = [1, 2, 3, 1 + 2]
result = doThing(1, {})
object = {foo: 'bar', baz: 1}
```
smore
```
array = [1 2 3 (1 + 2)]
result = doThing(1 {})
object = {(foo: bar) (baz: 1)}
object = {
  foo: bar
  baz: 1
}
# OR
object = {,foo: bar ,baz: 1}  # comma is used like the quote in lisps
object = {,foo: bar ('baz': 1)}
object = {,foo: bar  'baz': 1} # use 2 spaces as convention in objects, to avoid visual clutter
object = {
  ,foo: bar
  'baz': 1
}
```

```
# even lispier example
a = [(doThing! (require! './a') 'a') 'a']
a = [doThing(require('./a')) 'a' 'a']

fs.readFile! './a.json', (err file) ->
  if err then throw err
  console.log! file.toString!
# note that, when decompiled, (without annotations) this should become
fs.readFile! './a.json', (err file) ->
  if err then throw err
  console.log(file.toString())
# unless ! is implemented as a sweetjs macro
```

conditional return shorthand

```
if foo then return bar
```
can be written as
```
if foo return bar
```

previous statement shorthand

Stylistically, longer statements should still use normal if statement syntax

the goal here is to keep the return keyword as close to the left hand side as possible to help readability for where functions exit

```
if foo and bar and baz and reallyLongFunctionNameWhyAreYouDoingThis()
  return bar
```
