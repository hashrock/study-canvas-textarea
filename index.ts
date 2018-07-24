import { example } from "./example";

const canvas = document.querySelector("#canv");
const input: HTMLTextAreaElement = document.querySelector("#cursor");
const ctx = (canvas as HTMLCanvasElement).getContext("2d");
let offset = 0;

function moveFileStart() {
  cursor.r = 0;
  cursor.c = 0;
}

function moveFileEnd() {
  cursor.r = lines.length - 1;
  cursor.c = lines[lines.length - 1].length;
}

function moveNextLineStart() {
  cursor.r += 1;
  cursor.c = 0;
}

function movePrevLineEnd() {
  cursor.r -= 1;
  cursor.c = lines[cursor.r].length;
}

function onKeyDown(e: KeyboardEvent) {
  input.focus();
  offset += 1;
  switch (e.keyCode) {
    case 8: // Backspace
      backSpace();

      break;
    case 46: // Delete
      break;
    case 13: // Enter
      break;
    case 37: // Left arrow
      moveLeft();

      break;
    case 38: // Up arrow
      moveUp();
      break;
    case 39: // Right arrow
      moveRight();
      break;
    case 40: // Down arrow
      moveDown();
      break;
    default:
  }

  if (!e.shiftKey) {
    cursor.cancelSelection();
  }
  redraw();
}

ctx.font = '13px "Courier New", monospace';
ctx.textAlign = "left";
ctx.textBaseline = "top";
ctx.fillStyle = "rgba(0,0,0,1.0)";

function compare(p1: Point, p2: Point) {
  if (p1.r === p2.r) {
    return p1.c - p2.c;
  }
  return p1.r - p2.r;
}

class Point {
  c: number = 0;
  r: number = 0;
}

class Cursor {
  p: Point = new Point();
  sp: Point = new Point();

  cancelSelection() {
    this.sp = { ...this.p };
  }

  get start() {
    return compare(this.p, this.sp) > 0 ? this.sp : this.p;
  }
  get end() {
    return compare(this.p, this.sp) < 0 ? this.sp : this.p;
  }

  get c() {
    return this.p.c;
  }
  set c(v) {
    this.p.c = v;
  }
  get r() {
    return this.p.r;
  }
  set r(v) {
    this.p.r = v;
  }
}
let cursor = new Cursor();

var fontsize = 13;
var lineHeight = 13 * 1.5;

const lines = example.split("\n");

redraw();

document.body.addEventListener("keydown", onKeyDown);

function backSpace() {
  if (cursor.p.c === 0) {
    joinLine(cursor);
  } else {
    removeCharBefore();
    cursor.p.c -= 1;
  }
}

function removeCharBefore() {
  lines[cursor.p.r] =
    lines[cursor.p.r].slice(0, cursor.c - 1) + lines[cursor.r].slice(cursor.c);
}

function moveDown() {
  cursor.r += 1;
  if (cursor.r > lines.length) {
    moveFileEnd();
  }
}

function moveRight() {
  cursor.c += 1;
  if (cursor.c > lines[cursor.r].length) {
    moveNextLineStart();
  }
}

function moveUp() {
  cursor.r -= 1;
  if (cursor.r < 0) {
    moveFileStart();
  }
}

function moveLeft() {
  cursor.c -= 1;
  if (cursor.c < 0) {
    movePrevLineEnd();
  }
}

function insert(text: string, cursor: Cursor) {
  const t = lines[cursor.r];
  lines[cursor.r] = t.slice(0, cursor.c) + text + t.slice(cursor.c);
  cursor.c += text.length;
  cursor.cancelSelection();
}
function insertBr(cursor: Cursor) {
  const t = lines[cursor.r];
  lines[cursor.r] = t.slice(0, cursor.c);
  lines.splice(cursor.r + 1, 0, t.slice(cursor.c));
  cursor.r += 1;
  cursor.c = 0;
  cursor.cancelSelection();
}
function joinLine(cursor: Cursor) {
  cursor.c = lines[cursor.r - 1].length;
  lines[cursor.r - 1] = lines[cursor.r - 1] + lines[cursor.r];
  lines.splice(cursor.r, 1);
  cursor.r -= 1;
}

input.addEventListener("compositionstart", e => {
  const el: HTMLTextAreaElement = e.target as HTMLTextAreaElement;
  el.style.opacity = "1";
});
input.addEventListener("compositionend", e => {
  const el: HTMLTextAreaElement = e.target as HTMLTextAreaElement;
  el.style.opacity = "0";
  insert(el.value, cursor);
  el.value = "";
  redraw();
});
input.addEventListener("input", (e: InputEvent) => {
  const el: HTMLTextAreaElement = e.target as HTMLTextAreaElement;
  if (!e.isComposing) {
    el.style.opacity = "0";
    if (el.value === "\n") {
      insertBr(cursor);
    } else {
      insert(el.value, cursor);
    }

    el.value = "";
    redraw();
  }
});

function redraw() {
  ctx.clearRect(0, 0, 400, 300);

  const thisLine = lines[cursor.r];
  const m = thisLine.slice(0, cursor.c);
  const measure = ctx.measureText(m);

  lines.forEach((item, i) => {
    ctx.fillStyle = `hsl(${(i + offset) * 10}, 100%, 80%)`;

    //selection
    drawSelection(i, item);

    drawTextLine(item, i);
  });
  drawCursor(ctx, measure);
  input.style.left = `${measure.width}px`;
  input.style.top = `${cursor.r * lineHeight}px`;
}

function drawTextLine(item: string, i: number) {
  ctx.fillStyle = "black";
  ctx.fillText(item, 0, i * lineHeight + (lineHeight - fontsize) / 2);
}

function drawSelection(i: number, item: string) {
  if (cursor.start.r === i && cursor.end.r === i) {
    const s = ctx.measureText(item.slice(0, cursor.start.c));
    const m = ctx.measureText(item.slice(cursor.start.c, cursor.end.c));
    ctx.fillRect(s.width, lineHeight * i, m.width, lineHeight);
  } else if (cursor.start.r === i) {
    const s = ctx.measureText(item.slice(0, cursor.start.c));
    const m = ctx.measureText(item.slice(cursor.start.c));
    ctx.fillRect(s.width, lineHeight * i, m.width, lineHeight);
  } else if (cursor.end.r === i) {
    const s = ctx.measureText(item.slice(0, cursor.end.c));
    ctx.fillRect(0, lineHeight * i, s.width, lineHeight);
  }
  if (cursor.end.r > i && cursor.start.r < i) {
    const m2 = ctx.measureText(item);
    ctx.fillRect(0, lineHeight * i, m2.width, lineHeight);
  }
}

function drawCursor(ctx: CanvasRenderingContext2D, measure: TextMetrics) {
  ctx.beginPath();
  ctx.moveTo(measure.width + 0.5, cursor.r * lineHeight);
  ctx.lineTo(measure.width + 0.5, cursor.r * lineHeight + lineHeight);
  ctx.stroke();
}
