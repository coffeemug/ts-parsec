import type { stream } from './stream';

/*
  Result handling
*/
export type result<T, E> = { type: 'ok', res: T, } | { type: 'err', err: E, };
export type parser_error = { row: number, col: number, msg: string, };

export const ok = <T>(res: T): result<T, never> => ({ type: 'ok', res, });
export const err = (row: number, col: number, msg: string): result<never, parser_error> =>
  ({ type: 'err', err: { row, col, msg, }});

/*
  Parser types
*/
export type parserFn<T> = (source: stream) => result<T, parser_error>;
export type parser<T> = parserFn<T> & {
  map: <U>(fn: ((value: T) => U)) => parser<U>,
};
export type parserlike<T> = parserFn<T> | parser<T> | string;

/*
  Allowing functions and strings to act like parsers
*/
export function toParser<T extends string>(p: T): parser<T>;
export function toParser<T>(p: parserlike<T>): parser<T>;
export function toParser <T>(pl: parserlike<T>) {
  if (typeof pl == 'string') {
    return str(pl);
  }

  if ('map' in pl) {
    return pl;
  }

  const fn_: parser<T> = pl as parser<T>;

  fn_.map = <U>(fnTransform: (value: T) => U): parser<U> => {
    return toParser((source: stream): result<U, parser_error> => {
      const res = fn_(source);
      if (res.type == 'ok') {
        return ok(fnTransform(res.res));
      } else {
        return res;
      }
    });
  };

  return fn_;
}

/*
  The most basic of parsers
*/
export const str = <T extends string>(match: T): parser<T> =>
  lex(toParser((source: stream) => {
    for (let i = 0; i < match.length; i++) {
      if(source.next() != match[i]) {
        return err(0, 0, '');
      }
    }
    return ok(match);
  }));

export const lex = <T>(p: parserlike<T>) => keepWs((source: stream) => {
  ws(source);
  return toParser(p)(source);
});

export const keepWs = <T>(p: parserlike<T>) =>
  toParser((source: stream) => {
    const prev_drop_ws = source.drop_ws;
    source.drop_ws = false;
    const res = toParser(p)(source);
    source.drop_ws = prev_drop_ws;
    return res;
  });

export const ws = toParser((source: stream) => {
  while (true) {
    source.push();
    const ch = source.next();
    if (ch?.trim() === "") {
      source.pop_continue();
    } else {
      source.pop_rollback();
      break;
    }
  }
  return ok({});
});

/*
  Laziness helper
*/
export const fwd = <T>(thunk: (() => parserlike<T>)): parser<T> =>
  toParser((source: stream) => toParser(thunk())(source));

/*
  TODO:
  - In `either('foo').map(...)` the string 'foo' gets mapped to unknown.
    Should fix that.
  - If I could push infinite regress through map, it would be trivial to
    just specify the AST type in map, and avoid the trick in `form`.
*/
