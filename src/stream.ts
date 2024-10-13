
export type stream = {
  row: number,
  col: number,
  drop_ws: boolean,
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

  constructor(public source: string, public drop_ws: boolean = true) {}

  next(): string | null {
    if (this.idx == this.source.length) {
      return null;
    }
    const ch = this.source[this.idx++];
    this.col++;
    if (ch == '\n') {
      this.row++;
      this.col = 1;
    }

    if (this.drop_ws && ch.trim() === "") {
      return this.next();
    } else {
      return ch;
    }
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

export const fromString = (source: string): stream => {
  return new string_stream(source);
}
