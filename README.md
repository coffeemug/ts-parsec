
This is a parser combinator library written in typescript. Design
goals:

- Produces recursive descent parsers capable of parsing PEG grammars.
- For throwaway projects only. Will never grow big, have complex
  optimizations, or other fancy featues.
- Small, so I can understand every detail. The library is under 500
  lines of code and took maybe a couple of days to write.
- Type safe. The syntax tree types are inferred from the combinators.
  It's beautiful and really fun to use.

## Installation
```sh
npm install @spakhm/ts-parsec
```

## Example

Here is a simple example:

```ts
const digit = range('0', '9');
const lower = range('a', 'z');
const upper = range('A', 'Z');
const alpha = either(lower, upper);
const alnum = either(alpha, digit);

const ident = lex(seq(alpha, many(alnum))).map(([first, rest]) =>
  [first, ...rest].join(""));

const input = "Hello";
const stream = fromString(input);
ident(stream);
```

## Limitations

- No error reporting at all.
