import { ok, err } from '../src/base';
import { nat, sepBy, sepBy1 } from '../src/lib';
import { fromString } from '../src/stream';

it('sepBy with trailingSep allow (default)', () => {
  expect(sepBy(nat, ',')(fromString(""))).toEqual(ok([]));
  expect(sepBy(nat, ',')(fromString("12"))).toEqual(ok([12n]));
  expect(sepBy(nat, ',')(fromString("12,23,34"))).toEqual(ok([12n,23n,34n]));
  expect(sepBy(nat, ',')(fromString("12,23,34,"))).toEqual(ok([12n,23n,34n]));
});

it('sepBy with trailingSep forbid', () => {
  expect(sepBy(nat, ',', 'forbid')(fromString(""))).toEqual(ok([]));
  expect(sepBy(nat, ',', 'forbid')(fromString("12"))).toEqual(ok([12n]));
  expect(sepBy(nat, ',', 'forbid')(fromString("12,23,34"))).toEqual(ok([12n,23n,34n]));
  expect(sepBy(nat, ',', 'forbid')(fromString("12,23,34,"))).toEqual(err(0, 0, ''));
});

it('sepBy with trailingSep require', () => {
  expect(sepBy(nat, ',', 'require')(fromString(""))).toEqual(ok([]));
  expect(sepBy(nat, ',', 'require')(fromString("12"))).toEqual(err(0, 0, ''));
  expect(sepBy(nat, ',', 'require')(fromString("12,23,34"))).toEqual(err(0, 0, ''));
  expect(sepBy(nat, ',', 'require')(fromString("12,23,34,"))).toEqual(ok([12n,23n,34n]));
});

it('sepBy1', () => {
  expect(sepBy1(nat, ',')(fromString(""))).toEqual(err(0, 0, ''));
  expect(sepBy1(nat, ',')(fromString("12"))).toEqual(ok([12n]));
  expect(sepBy1(nat, ',')(fromString("12,23,34"))).toEqual(ok([12n,23n,34n]));
  expect(sepBy1(nat, ',')(fromString("12,23,34,"))).toEqual(ok([12n,23n,34n]));
});

it('sepBy1 with trailingSep options', () => {
  expect(sepBy1(nat, ',', 'forbid')(fromString("12,23,"))).toEqual(err(0, 0, ''));
  expect(sepBy1(nat, ',', 'require')(fromString("12,23"))).toEqual(err(0, 0, ''));
  expect(sepBy1(nat, ',', 'require')(fromString("12,23,"))).toEqual(ok([12n,23n]));
});

it('sepBy with trailingSep leave', () => {
  const stream1 = fromString("");
  expect(sepBy(nat, ',', 'leave')(stream1)).toEqual(ok([]));
  expect(stream1.next()).toEqual(null);

  const stream2 = fromString("12");
  expect(sepBy(nat, ',', 'leave')(stream2)).toEqual(ok([12n]));
  expect(stream2.next()).toEqual(null);

  const stream3 = fromString("12,23,34");
  expect(sepBy(nat, ',', 'leave')(stream3)).toEqual(ok([12n,23n,34n]));
  expect(stream3.next()).toEqual(null);

  const stream4 = fromString("12,23,34,");
  expect(sepBy(nat, ',', 'leave')(stream4)).toEqual(ok([12n,23n,34n]));
  expect(stream4.next()).toEqual(',');  // trailing separator left on stream
});

it('sepBy1 with trailingSep leave', () => {
  expect(sepBy1(nat, ',', 'leave')(fromString(""))).toEqual(err(0, 0, ''));

  const stream1 = fromString("12,23,");
  expect(sepBy1(nat, ',', 'leave')(stream1)).toEqual(ok([12n,23n]));
  expect(stream1.next()).toEqual(',');  // trailing separator left on stream
});
