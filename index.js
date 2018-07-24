const canvas = document.querySelector("#canv");
const input = document.querySelector("#cursor");
const ctx = canvas.getContext("2d");

function hoge() {
  if (cursor.c < 0) {
    cursor.r -= 1;
    cursor.c = lines[cursor.r].length;
  }
  if (cursor.r > lines.length) {
    cursor.r = lines.length - 1;
  }

  if (cursor.r < 0) {
    cursor.r = 0;
  }

  if (cursor.c > lines[cursor.r].length) {
    cursor.r += 1;
    cursor.c = 0;
  }
}

let shift = false;

function onKeyDown(e) {
  offset += 1;
  switch (e.keyCode) {
    case 8: // Backspace
      if (cursor.c === 0) {
        joinLine(cursor);
      } else {
        lines[cursor.r] =
          lines[cursor.r].slice(0, cursor.c - 1) +
          lines[cursor.r].slice(cursor.c);
        cursor.c -= 1;
      }

      break;
    case 46: // Delete
      break;
    case 13: // Enter
      break;
    // case 16:
    //   shifted = true
    //   break;
    case 37: // Left arrow
      cursor.c -= 1;
      break;
    case 38: // Up arrow
      cursor.r -= 1;
      break;
    case 39: // Right arrow
      cursor.c += 1;
      break;
    case 40: // Down arrow
      cursor.r += 1;
      break;
    default:
  }

  if (!e.shiftKey) {
    //shift
    cursor.sc = cursor.c;
    cursor.sr = cursor.r;
  }
  console.log(e.shiftKey);
  console.log(cursor);

  hoge();
  redraw();
}

ctx.font = '13px "Courier New", monospace';
ctx.textAlign = "left";
ctx.textBaseline = "top";
ctx.fillStyle = "rgba(0,0,0,1.0)";
var text_width = 100;
let cursor = { c: 0, r: 0, sc: 0, sr: 0 };

var fontsize = 13;
var lineHeight = 13 * 1.5;

const example = `自作エディタコンポーネント
てすてす

ABCDEFABCDEFABCDEFABCDEFABCDEF
表示テスト表示テスト表示テスト表示テスト表示テスト

# 見出し

- リスト
- リスト
- リスト
- リスト
- リスト

whoooooaaaaaaaaa
`;

const lines = example.split("\n");

redraw();

document.body.addEventListener("keydown", onKeyDown);

function insert(text, cursor) {
  const t = lines[cursor.r];
  lines[cursor.r] = t.slice(0, cursor.c) + text + t.slice(cursor.c);
  cursor.c += text.length;
}
function insertBr(cursor) {
  const t = lines[cursor.r];
  lines[cursor.r] = t.slice(0, cursor.c);
  lines.splice(cursor.r + 1, 0, t.slice(cursor.c));
  cursor.r += 1;
  cursor.c = 0;
}
function joinLine(cursor) {
  const t = lines[cursor.r];
  cursor.c = lines[cursor.r - 1].length;
  lines[cursor.r - 1] = lines[cursor.r - 1] + lines[cursor.r];
  lines.splice(cursor.r, 1);
  cursor.r -= 1;
}

input.addEventListener("compositionstart", e => {
  e.target.style.opacity = "1";
});
input.addEventListener("compositionend", e => {
  e.target.style.opacity = "0";
  insert(e.target.value, cursor);
  e.target.value = "";
  redraw();
});
input.addEventListener("input", e => {
  if (!e.isComposing) {
    e.target.style.opacity = "0";
    if (e.target.value === "\n") {
      insertBr(cursor);
    } else {
      insert(e.target.value, cursor);
    }

    e.target.value = "";
    redraw();
  }
});

function between() {}

var offset = 0;

function redraw() {
  ctx.clearRect(0, 0, 400, 300);

  const thisLine = lines[cursor.r];
  const m = thisLine.slice(0, cursor.c);
  const measure = ctx.measureText(m);

  lines.forEach((item, i) => {
    ctx.fillStyle = `hsl(${(i + offset) * 10}, 100%, 80%)`;

    //selection
    if (cursor.sr === i && cursor.r === i) {
      const s = ctx.measureText(item.slice(0, cursor.sc));
      const m = ctx.measureText(item.slice(cursor.sc, cursor.c));
      ctx.fillRect(s.width, lineHeight * i, m.width, lineHeight);
    } else if (cursor.sr === i) {
      const s = ctx.measureText(item.slice(0, cursor.sc));
      const m = ctx.measureText(item.slice(cursor.sc, 0));
      ctx.fillRect(s.width, lineHeight * i, m.width, lineHeight);
    } else if (cursor.r === i) {
      const s = ctx.measureText(item.slice(0, cursor.c));
      // const m = ctx.measureText(item.slice(cursor.sc, 0));
      ctx.fillRect(0, lineHeight * i, s.width, lineHeight);
    }

    if (cursor.r > i && cursor.sr < i) {
      const m2 = ctx.measureText(item);
      ctx.fillRect(0, lineHeight * i, m2.width, lineHeight);
    }

    ctx.fillStyle = "black";
    ctx.fillText(item, 0, i * lineHeight + (lineHeight - fontsize) / 2);
  });
  ctx.beginPath();

  ctx.moveTo(measure.width + 0.5, cursor.r * lineHeight);
  ctx.lineTo(measure.width + 0.5, cursor.r * lineHeight + lineHeight);
  ctx.stroke();
  input.style.left = `${measure.width}px`;
  input.style.top = `${cursor.r * lineHeight}px`;
}
