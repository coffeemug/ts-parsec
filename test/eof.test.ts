import { ok, err } from '../src/base';
import { eof, nat, seq } from '../src/lib';
import { fromString } from '../src/stream';

it('eof succeeds at end of input', () => {
  expect(eof(fromString(""))).toEqual(ok(null));
});

it('eof fails when input remains', () => {
  expect(eof(fromString("abc"))).toEqual(err(0, 0, ''));
});

it('eof succeeds after consuming all input', () => {
  expect(seq(nat, eof)(fromString("123"))).toEqual(ok([123n, null]));
});

it('eof fails when input remains after parsing', () => {
  expect(seq(nat, eof)(fromString("123abc"))).toEqual(err(0, 0, ''));
});
