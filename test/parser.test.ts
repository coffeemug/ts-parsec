import { ok, str } from '../src/base';
import { nat, either, many, seq, some, alnum, sepBy, maybe, int } from '../src/lib';
import { fromString } from '../src/stream';

it('', () => {
  expect(either('1', 'a')(fromString('12'))).toEqual(ok('1'));
  expect(either('a', '1')(fromString('12'))).toEqual(ok('1'));
  expect(seq('1', '2')(fromString('12'))).toEqual(ok(['1', '2']));
});

it('', () => {
  expect(nat(fromString('171hello'))).toEqual(ok(171));
  expect(str('171')(fromString('171hello'))).toEqual(ok('171'));

  expect(either(nat, '171')(fromString('171hello'))).toEqual(ok(171));
  expect(either('171', nat)(fromString('171hello'))).toEqual(ok("171"));

  expect(either(nat, str('hi'))(fromString('hi'))).toEqual(ok('hi'));
});

it('', () => {
  expect(many(str('hi'))(fromString(''))).toEqual(ok([]));
  expect(many(str('hi'))(fromString('foo'))).toEqual(ok([]));
  expect(many(str('hi'))(fromString('hi'))).toEqual(ok(['hi']));
  expect(many(str('hi'))(fromString('hihi'))).toEqual(ok(['hi', 'hi']));
  expect(many(str('hi'))(fromString('hifoo'))).toEqual(ok(['hi']));
});

it('', () => {
  expect(some(str('hi'))(fromString('hi'))).toEqual(ok(['hi']));
  expect(some(str('hi'))(fromString('hihi'))).toEqual(ok(['hi', 'hi']));
  expect(some(str('hi'))(fromString('hifoo'))).toEqual(ok(['hi']));
});

it('', () => {
  expect(alnum(fromString("0"))).toEqual(ok('0'));
  expect(alnum(fromString("1"))).toEqual(ok('1'));
  expect(alnum(fromString("5"))).toEqual(ok('5'));
  expect(alnum(fromString("9"))).toEqual(ok('9'));
  expect(alnum(fromString("a"))).toEqual(ok('a'));
  expect(alnum(fromString("m"))).toEqual(ok('m'));
  expect(alnum(fromString("z"))).toEqual(ok('z'));
  expect(alnum(fromString("A"))).toEqual(ok('A'));
  expect(alnum(fromString("M"))).toEqual(ok('M'));
  expect(alnum(fromString("Z"))).toEqual(ok('Z'));
});

it('', () => {
  expect(sepBy(nat, ',')(fromString(""))).toEqual(ok([]));
  expect(sepBy(nat, ',')(fromString("12"))).toEqual(ok([12]));
  expect(sepBy(nat, ',')(fromString("12,23,34"))).toEqual(ok([12,23,34]));
  expect(sepBy(nat, ',')(fromString("12,23,34,"))).toEqual(ok([12,23,34]));
});

it('', () => {
  expect(maybe('foo')(fromString('foo'))).toEqual(ok('foo'));
  expect(maybe('foo')(fromString('bar'))).toEqual(ok(null));
});

it('', () => {
  expect(int(fromString('12'))).toEqual(ok(12));
  expect(int(fromString('-12'))).toEqual(ok(-12));
  expect(int(fromString('+12'))).toEqual(ok(12));
  expect(int(fromString('- 12'))).toEqual(ok(-12));
  expect(int(fromString('+ 12'))).toEqual(ok(12));
});