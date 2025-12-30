import { fromString } from '../src/stream';
import { ok, ws } from '../src/base';

describe('stream newline normalization', () => {
  it('normalizes \\r\\n to \\n', () => {
    const s = fromString('a\r\nb', 'keep_all');
    expect(s.next()).toBe('a');
    expect(s.next()).toBe('\n');
    expect(s.next()).toBe('b');
    expect(s.next()).toBe(null);
  });

  it('normalizes \\r to \\n', () => {
    const s = fromString('a\rb', 'keep_all');
    expect(s.next()).toBe('a');
    expect(s.next()).toBe('\n');
    expect(s.next()).toBe('b');
    expect(s.next()).toBe(null);
  });

  it('keeps \\n as \\n', () => {
    const s = fromString('a\nb', 'keep_all');
    expect(s.next()).toBe('a');
    expect(s.next()).toBe('\n');
    expect(s.next()).toBe('b');
    expect(s.next()).toBe(null);
  });
});

describe('stream row tracking', () => {
  it('increments row on \\n', () => {
    const s = fromString('a\nb', 'keep_all');
    expect(s.row).toBe(1);
    s.next(); // a
    expect(s.row).toBe(1);
    s.next(); // \n
    expect(s.row).toBe(2);
    expect(s.col).toBe(1);
  });

  it('increments row on \\r\\n (counts as single newline)', () => {
    const s = fromString('a\r\nb', 'keep_all');
    expect(s.row).toBe(1);
    s.next(); // a
    expect(s.row).toBe(1);
    s.next(); // \r\n -> \n
    expect(s.row).toBe(2);
    expect(s.col).toBe(1);
    s.next(); // b
    expect(s.row).toBe(2);
  });

  it('increments row on standalone \\r', () => {
    const s = fromString('a\rb', 'keep_all');
    s.next(); // a
    s.next(); // \r -> \n
    expect(s.row).toBe(2);
    expect(s.col).toBe(1);
  });
});

describe('stream ws_mode keep_all', () => {
  it('returns all characters including whitespace', () => {
    const s = fromString('a b', 'keep_all');
    expect(s.next()).toBe('a');
    expect(s.next()).toBe(' ');
    expect(s.next()).toBe('b');
  });

  it('returns newlines', () => {
    const s = fromString('a\nb', 'keep_all');
    expect(s.next()).toBe('a');
    expect(s.next()).toBe('\n');
    expect(s.next()).toBe('b');
  });
});

describe('stream ws_mode drop_all', () => {
  it('skips spaces', () => {
    const s = fromString('a b', 'drop_all');
    expect(s.next()).toBe('a');
    expect(s.next()).toBe('b');
  });

  it('skips newlines', () => {
    const s = fromString('a\nb', 'drop_all');
    expect(s.next()).toBe('a');
    expect(s.next()).toBe('b');
  });

  it('skips \\r\\n', () => {
    const s = fromString('a\r\nb', 'drop_all');
    expect(s.next()).toBe('a');
    expect(s.next()).toBe('b');
  });
});

describe('stream ws_mode keep_newlines', () => {
  it('skips spaces but keeps newlines', () => {
    const s = fromString('a b\nc', 'keep_newlines');
    expect(s.next()).toBe('a');
    expect(s.next()).toBe('b');
    expect(s.next()).toBe('\n');
    expect(s.next()).toBe('c');
  });

  it('normalizes \\r\\n to \\n and keeps it', () => {
    const s = fromString('a\r\nb', 'keep_newlines');
    expect(s.next()).toBe('a');
    expect(s.next()).toBe('\n');
    expect(s.next()).toBe('b');
  });
});

describe('ws parser', () => {
  it('drop_all consumes all whitespace including newlines', () => {
    const s = fromString('  \n\n  x', 'keep_all');
    expect(ws('drop_all')(s)).toEqual(ok({}));
    expect(s.next()).toBe('x');
  });

  it('keep_newlines consumes spaces but stops at newline', () => {
    const s = fromString('   \nx', 'keep_all');
    expect(ws('keep_newlines')(s)).toEqual(ok({}));
    expect(s.next()).toBe('\n');
  });

  it('keep_newlines consumes nothing if starts with newline', () => {
    const s = fromString('\nx', 'keep_all');
    expect(ws('keep_newlines')(s)).toEqual(ok({}));
    expect(s.next()).toBe('\n');
  });

  it('keep_newlines works with \\r\\n', () => {
    const s = fromString('  \r\nx', 'keep_all');
    expect(ws('keep_newlines')(s)).toEqual(ok({}));
    expect(s.next()).toBe('\n'); // normalized from \r\n
  });
});
