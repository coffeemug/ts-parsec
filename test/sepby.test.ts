import { ok, err } from '../src/base';
import { nat, sepBy, sepBy1 } from '../src/lib';
import { fromString } from '../src/stream';

it('sepBy with trailingSep allow (default)', () => {
  expect(sepBy(nat, ',')(fromString(""))).toEqual(ok([]));
  expect(sepBy(nat, ',')(fromString("12"))).toEqual(ok([12]));
  expect(sepBy(nat, ',')(fromString("12,23,34"))).toEqual(ok([12,23,34]));
  expect(sepBy(nat, ',')(fromString("12,23,34,"))).toEqual(ok([12,23,34]));
});

it('sepBy with trailingSep forbid', () => {
  expect(sepBy(nat, ',', 'forbid')(fromString(""))).toEqual(ok([]));
  expect(sepBy(nat, ',', 'forbid')(fromString("12"))).toEqual(ok([12]));
  expect(sepBy(nat, ',', 'forbid')(fromString("12,23,34"))).toEqual(ok([12,23,34]));
  expect(sepBy(nat, ',', 'forbid')(fromString("12,23,34,"))).toEqual(err(0, 0, ''));
});

it('sepBy with trailingSep require', () => {
  expect(sepBy(nat, ',', 'require')(fromString(""))).toEqual(ok([]));
  expect(sepBy(nat, ',', 'require')(fromString("12"))).toEqual(err(0, 0, ''));
  expect(sepBy(nat, ',', 'require')(fromString("12,23,34"))).toEqual(err(0, 0, ''));
  expect(sepBy(nat, ',', 'require')(fromString("12,23,34,"))).toEqual(ok([12,23,34]));
});

it('sepBy1', () => {
  expect(sepBy1(nat, ',')(fromString(""))).toEqual(err(0, 0, ''));
  expect(sepBy1(nat, ',')(fromString("12"))).toEqual(ok([12]));
  expect(sepBy1(nat, ',')(fromString("12,23,34"))).toEqual(ok([12,23,34]));
  expect(sepBy1(nat, ',')(fromString("12,23,34,"))).toEqual(ok([12,23,34]));
});

it('sepBy1 with trailingSep options', () => {
  expect(sepBy1(nat, ',', 'forbid')(fromString("12,23,"))).toEqual(err(0, 0, ''));
  expect(sepBy1(nat, ',', 'require')(fromString("12,23"))).toEqual(err(0, 0, ''));
  expect(sepBy1(nat, ',', 'require')(fromString("12,23,"))).toEqual(ok([12,23]));
});
