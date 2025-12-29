import { fwd, ok, str } from "../src/base";
import { either, int, binop, binopr } from "../src/lib";
import { fromString } from "../src/stream";

type node = ['+' | '-' | '*' | '/', node, node] | bigint;
const term = fwd(() => binop(either(str('+'), str('-')), factor,
  (a, b: node, c): node => [a, b, c]));
const factor = binop(either(str('*'), str('/')), int,
  (a, b: node, c): node => [a, b, c]);

it('', () => {
  expect(term(fromString("1+2"))).toEqual(ok(['+', 1n, 2n]));
  expect(term(fromString("1+2+3"))).toEqual(ok(['+', ['+', 1n, 2n], 3n]));
  expect(term(fromString("1+2*3"))).toEqual(ok(['+', 1n, ['*', 2n, 3n]]));
});

const assign = binopr(str('='), int, (a, b, c) => [a, b, c]);

it('', () => {
  expect(assign(fromString("1=2=3"))).toEqual(ok(['=', 1n, ['=', 2n, 3n]]));
});
