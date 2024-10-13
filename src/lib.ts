import type { stream } from './stream';
import type { parser, parserlike } from './base';
import { err, ok, toParser, lex } from './base';

export const attempt = <T>(parser: parserlike<T>): parser<T> =>
  toParser((source: stream) => {
    source.push();
    const res = toParser(parser)(source);
    if (res.type == 'ok') {
      source.pop_continue();
    } else {
      source.pop_rollback();
    }
    return res;
  });

export const range = (start: string, end: string): parser<string> =>
  toParser((source: stream) => {
    const next = source.next();
    if (!next) return err(0, 0, '');
    if (next >= start[0] && next <= end[0]) return ok(next);
    return err(0, 0, '');
  });
    
export const either = <Ts extends any[]>(...parsers: { [K in keyof Ts]: parserlike<Ts[K]> }): parser<Ts[number]> =>
  toParser((source: stream) => {
    for (const parser of parsers) {
      const res = attempt(parser)(source);
      if (res.type == 'ok') {
        return res;
      }
    }
    return err(0, 0, '');
  });

export type seq_parser<T extends any[]> = parser<T> & {
  map2: <U>(fn: ((...values: T) => U)) => parser<U>,
};

export const seq = <Ts extends any[]>(...parsers: { [K in keyof Ts]: parserlike<Ts[K]> }): seq_parser<Ts> => {
  const p = toParser((source: stream) => {
    const res: unknown[] = [];
    for (const parser of parsers) {
      const res_ = toParser(parser)(source);
      if (res_.type == 'ok') {
        res.push(res_.res);
      } else {
        return err(0, 0, '');
      }
    }
    return ok(res as any);
  }) as seq_parser<Ts>;
  p.map2 = <U>(fn: ((...values: Ts) => U)) =>
    p.map(x => fn(...x));
  return p;
}

export const many = <T>(parser: parserlike<T>): parser<T[]> =>
  toParser((source: stream) => {
    const res: T[] = [];
    while (true) {
      const _res = attempt(parser)(source);
      if (_res.type == 'ok') {
        res.push(_res.res);
      } else {
        break;
      }
    }

    return ok(res);
  });

export const some = <T>(parser: parserlike<T>): parser<T[]> =>
  seq(parser, many(parser)).map2((ft, rt) => [ft, ...rt]);

export const digit = range('0', '9');

export const nat = lex(some(digit)).map((val) =>
  parseInt(val.join("")));

export const maybe = <T>(p: parserlike<T>) =>
  toParser((source: stream) => {
    const res = attempt(p)(source);
    return res.type == 'ok' ? res : ok(null);
  });

export const int = seq(maybe(either('-', '+')), nat).map2((sign, val) => {
  if (sign === '-') {
    return -val;
  } else {
    return val;
  }
});

export const lower = range('a', 'z');
export const upper = range('A', 'Z');
export const alpha = either(lower, upper);
export const alnum = either(alpha, digit);

export const sepBy = <T, U>(item: parserlike<T>, sep: parserlike<U>, allowTrailingSep: boolean = true): parser<T[]> =>
  toParser((source: stream) => {
    const res: T[] = [];

    const res_ = attempt(item)(source);
    if (res_.type == 'err') {
      return ok(res);
    } else {
      res.push(res_.res);
    }

    while (true) {
      const sepres_ = attempt(sep)(source);
      if (sepres_.type == 'err') {
        return ok(res);
      }
  
      const res_ = attempt(item)(source);
      if (res_.type == 'err') {
        return allowTrailingSep ? ok(res) : err(0, 0, '');
      } else {
        res.push(res_.res);
      }
    }
  });

export function binop<O, D, N>(
  operator: parserlike<O>,
  operand: parserlike<D>,
  makeNode: (op: O, left: D | N, right: D) => N
): parser<N | D> {
  return toParser((source: stream) => {
    const p = seq(operand, many(seq(operator, operand))).map2<N | D>((left, rights) => {
      const acc = rights.reduce<N | D>(
        (acc, [op, right]) => makeNode(op, acc, right), left);
      return acc;
    });
    return p(source);
  });
}

export function binopr<O, D, N>(
  operator: parserlike<O>,
  operand: parserlike<D>,
  makeNode: (op: O, left: D, right: D | N) => N
): parser<N | D> {
  return toParser((source: stream) => {
    const p = seq(operand, many(seq(operator, operand))).map2<N | D>((left, rights) => {
      if (rights.length === 0) return left;

      // Start from the last operand and reduce from right to left
      let acc: D | N = rights[rights.length - 1][1];
      for (let i = rights.length - 2; i >= 0; i--) {
        const [op, right] = rights[i];
        acc = makeNode(op, right, acc);
      }

      return makeNode(rights[0][0], left, acc);
    });

    return p(source);
  });
}
