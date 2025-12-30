
export type ws_mode = 'keep_all' | 'drop_all' | 'keep_newlines';

export type stream = {
  row: number,
  col: number,
  ws_mode: ws_mode,
  next: () => string | null,
  push: () => void,
  pop_continue: () => void,
  pop_rollback: () => void,
};

class string_stream {
  row: number = 1;
  col: number = 1;
  idx: number = 0;

  stack: {
    row: number,
    col: number,
    idx: number,
  }[] = [];

  constructor(public source: string, public ws_mode: ws_mode = 'drop_all') {}

  next(): string | null {
    if (this.idx == this.source.length) {
      return null;
    }

    const ch = this.normalizeNewline(this.source[this.idx++]);
    if (ch == '\n') {
      this.row++;
      this.col = 1;
    } else {
      this.col++;
    }

    if (this.ws_mode === 'keep_all') {
      return ch;
    }

    if (this.ws_mode === 'drop_all' && ch.trim() === '') {
      return this.next();
    }

    if (this.ws_mode === 'keep_newlines') {
      if (ch === '\n') {
        return ch;
      }
      if (ch.trim() === '') {
        return this.next();
      }
    }

    return ch;
  }

  private normalizeNewline(ch: string) {
    const peek = () =>
      this.idx == this.source.length ? null : this.source[this.idx];

    if (ch == '\r') {
      if (peek() == '\n') {
        this.idx++;
      }
      ch = '\n';
    }
    return ch;
  }

  push() {
    this.stack.push({
      row: this.row, col: this.col, idx: this.idx,
    })
  }

  pop_continue() {
    this.stack.pop();
  }

  pop_rollback() {
    const x = this.stack.pop()!;
    this.row = x.row;
    this.col = x.col;
    this.idx = x.idx;
  }
}

export const fromString = (source: string, ws_mode: ws_mode = 'drop_all'): stream => {
  return new string_stream(source, ws_mode);
}
