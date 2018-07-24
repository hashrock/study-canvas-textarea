import { example } from "./example";
import { Cursor } from "./cursor";
import { redraw, setupTextDrawStyle } from "./draw";

let ctx: CanvasRenderingContext2D;
let cursor: Cursor;
const input: HTMLTextAreaElement = document.querySelector("#cursor");
let offset = 0;
const lines = example.split("\n");

export function init(canvas: HTMLCanvasElement) {
  ctx = (canvas as HTMLCanvasElement).getContext("2d");
  setupTextDrawStyle(ctx);
  cursor = new Cursor();
  document.body.addEventListener("keydown", onKeyDown);
  redraw(ctx, lines, cursor, offset, input);
}

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
  redraw(ctx, lines, cursor, offset, input);
}

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
  redraw(ctx, lines, cursor, offset, input);
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
    redraw(ctx, lines, cursor, offset, input);
  }
});
