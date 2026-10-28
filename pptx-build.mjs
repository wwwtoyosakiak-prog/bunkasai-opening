import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require("fs");
const b64 = p => "data:image/jpeg;base64," + fs.readFileSync(p).toString("base64");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/root/.claude/skills/synced/c083a02c-689d-45c9-a06d-b10e2524bbb7_99f8174c-8d90-42aa-a9ed-61fa15d92457/pptx/scripts/apply_theme.js");
const { SLIDES } = await import("./assets/slides.mjs");

const A = "assets/";
const OUT = process.argv[2] || "deck.pptx";

// ===== テーマ：黒地＋白の太字＋ピンクのアクセント（サイトと同じ） =====
const HEX = { bg: "0B0B0F", card: "16161C", line: "2E2E38", text: "FFFFFF", sub: "C8C8D2", muted: "8A8A93", accent: "FF3B6B", gold: "FFD60A" };
const THEME = {
  name: "Bunkasai Dark",
  headFontFace: "Yu Gothic",
  bodyFontFace: "Yu Gothic",
  colors: {
    dk1: HEX.bg, lt1: HEX.text, dk2: HEX.card, lt2: HEX.sub,
    accent1: HEX.accent, accent2: HEX.gold, accent3: HEX.line, accent4: HEX.muted,
    accent5: "0A84FF", accent6: "30D158", hlink: HEX.accent, folHlink: HEX.muted
  }
};

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625
pres.title = "多摩祭2026 段ボールガチャワークショップの報告";
pres.author = "新西ゼミ";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const ACC = C.accent1, WHITE = C.background1, SUB = C.background2, CARD = C.text2, LINE = C.accent3, MUTED = C.accent4, GOLD = C.accent2;

// ===== レイアウト =====
pres.defineSlideMaster({
  title: "TITLE", background: { color: C.text1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 1.35, w: 9, h: 1.3, fontSize: 44, bold: true, color: WHITE, align: "center", valign: "middle" }, text: "" } },
    { placeholder: { options: { name: "subtitle", type: "body", x: 0.5, y: 2.85, w: 9, h: 0.7, fontSize: 22, bold: true, color: SUB, align: "center", valign: "top" }, text: "" } },
    { placeholder: { options: { name: "byline", type: "body", x: 0.5, y: 4.15, w: 9, h: 0.9, fontSize: 18, bold: true, color: WHITE, align: "center", valign: "middle" }, text: "" } }
  ]
});
const contentLayout = (name, titleX, bg) => pres.defineSlideMaster({
  title: name, background: { color: bg },
  margin: [0.4, 0.5, 0.4, 0.5],
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: titleX, y: 0.32, w: 9.5 - titleX, h: 0.46, fontSize: 18, bold: true, color: WHITE, align: "left", valign: "middle", margin: 0 }, text: "" } }
  ],
  slideNumber: { x: 9.15, y: 5.2, w: 0.5, h: 0.3, fontSize: 10, color: MUTED, align: "right" }
});
contentLayout("CONTENT", 0.5, C.text1);
contentLayout("CONTENT_PREP", 1.02, C.text1);
contentLayout("VIDEO", 0.5, "000000");

// ===== 文字の強調：**…** をアクセント色に、\n を改行に =====
function rich(text, base = {}, accent = ACC) {
  const runs = [];
  String(text || "").split("\n").forEach((line, li, arr) => {
    const parts = line.split("**");
    parts.forEach((p, j) => {
      if (!p) return;
      runs.push({ text: p, options: { ...base, color: j % 2 ? accent : base.color } });
    });
    if (li < arr.length - 1 && runs.length) runs[runs.length - 1].options.breakLine = true;
  });
  return runs;
}
const nLines = t => String(t || "").split("\n").length;
// 自動の折り返しも含めた行数の見積もり（全角1文字＝文字サイズ、半角は約0.55）
const vlen = l => [...l.replace(/\*\*/g, "")].reduce((a, ch) => a + (ch.charCodeAt(0) < 0x2000 ? 0.55 : 1), 0);
const estLines = (t, size, w) => String(t || "").split("\n").reduce((a, l) => a + Math.max(1, Math.ceil(vlen(l) * size / 72 / (w * 0.96))), 0);
let objN = 0;
const on = k => `${k}-${++objN}`;

function prepChip(slide, letter) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 0.34, w: 0.42, h: 0.42, rectRadius: 0.08, fill: { color: ACC }, line: { type: "none" }, objectName: on("prep") });
  slide.addText(letter, { x: 0.5, y: 0.34, w: 0.42, h: 0.42, fontSize: 18, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: on("prep-letter") });
}
function newSlide(sl, section) {
  const layout = sl.prep ? "CONTENT_PREP" : "CONTENT";
  const s = pres.addSlide({ masterName: layout, sectionTitle: section });
  if (sl.prep) prepChip(s, sl.prep);
  s.addText(sl.tag, { placeholder: "title" });
  return s;
}
function heading(s, text, x, y, w, size = 30) {
  const h = estLines(text, size, w) * size / 72 * 1.35 + 0.08;
  s.addText(rich(text, { fontSize: size, bold: true, color: WHITE }), { x, y, w, h, margin: 0, valign: "top", isTextBox: true, objectName: on("heading") });
  return y + h;
}
function noteLine(s, text, x, y, w) {
  const h = estLines(text, 16, w - 0.4) * 0.3 + 0.24;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: CARD }, line: { color: LINE, width: 1 }, objectName: on("note-bg") });
  s.addText(rich(text, { fontSize: 16, bold: true, color: SUB }), { x: x + 0.2, y, w: w - 0.4, h, margin: 0, valign: "middle", isTextBox: true, objectName: on("note") });
  return y + h;
}
function items(s, list, x, y, w, size = 18) {
  list.forEach(it => {
    const lh = estLines(it.text, size, w - 0.62) * size / 72 * 1.35;
    const h = Math.max(0.44, lh);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: y + (h - 0.44) / 2, w: 0.44, h: 0.44, rectRadius: 0.08, fill: { color: ACC }, line: { type: "none" }, objectName: on("chip") });
    s.addText(it.prep, { x, y: y + (h - 0.44) / 2, w: 0.44, h: 0.44, fontSize: 18, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: on("chip-t") });
    s.addText(rich(it.text, { fontSize: size, bold: true, color: WHITE }), { x: x + 0.62, y, w: w - 0.62, h, margin: 0, valign: "middle", isTextBox: true, objectName: on("item") });
    y += h + 0.2;
  });
  return y - 0.2;
}
function facts(s, list, x, y, w, labelW = 1.35, size = 17) {
  list.forEach(([k, v]) => {
    const h = estLines(v, size, w - labelW) * size / 72 * 1.4;
    s.addText(k, { x, y, w: labelW, h: size / 72 * 1.4, fontSize: 15, bold: true, color: ACC, margin: 0, valign: "middle", isTextBox: true, objectName: on("fact-k") });
    s.addText(rich(v, { fontSize: size, bold: true, color: WHITE }), { x: x + labelW, y, w: w - labelW, h, margin: 0, valign: "top", isTextBox: true, objectName: on("fact-v") });
    y += h + (size < 17 ? 0.14 : 0.2);
  });
  return y - 0.2;
}
function stats(s, list, x, y, w, h = 1.65) {
  const gap = 0.25, cw = (w - gap * (list.length - 1)) / list.length;
  list.forEach((it, i) => {
    const cx = x + i * (cw + gap);
    const fill = it.total ? ACC : CARD;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y, w: cw, h, rectRadius: 0.12, fill: { color: fill }, line: { color: it.total ? ACC : LINE, width: 1.5 }, objectName: on("stat-card") });
    s.addText([
      { text: it.num, options: { fontSize: list.length > 3 ? 40 : 48, bold: true, color: it.total ? WHITE : ACC } },
      { text: it.unit, options: { fontSize: 18, bold: true, color: WHITE } }
    ], { x: cx, y: y + 0.15, w: cw, h: 0.8, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: on("stat-num") });
    s.addText(rich(it.label, { fontSize: 14, bold: true, color: WHITE }), { x: cx + 0.1, y: y + 0.95, w: cw - 0.2, h: h - 1.05, align: "center", valign: "top", margin: 0, isTextBox: true, objectName: on("stat-label") });
  });
  return y + h;
}
function pillarCards(s, list, x, y, w, h) {
  const gap = 0.25, cw = (w - gap * (list.length - 1)) / list.length;
  list.forEach((it, i) => {
    const cx = x + i * (cw + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y, w: cw, h, rectRadius: 0.12, fill: { color: CARD }, line: { color: ACC, width: 2 }, objectName: on("pillar") });
    s.addText(it.title, { x: cx + 0.18, y: y + 0.18, w: cw - 0.36, h: 0.5, fontSize: 22, bold: true, color: ACC, margin: 0, valign: "middle", isTextBox: true, objectName: on("pillar-h") });
    s.addText(rich(it.text, { fontSize: 14, bold: true, color: WHITE }), { x: cx + 0.18, y: y + 0.78, w: cw - 0.36, h: h - 0.95, margin: 0, valign: "top", paraSpaceAfter: 0, lineSpacingMultiple: 1.15, isTextBox: true, objectName: on("pillar-t") });
  });
  return y + h;
}
// 角丸と枠線は画像そのものに焼き込み済み（PowerPointでも崩れないように）
function framedImage(s, path, x, y, w, h, cap) {
  s.addImage({ path, x, y, w, h, altText: cap || "", objectName: on("img") });
  if (cap) s.addText(cap, { x: x - 0.3, y: y + h + 0.1, w: w + 0.6, h: 0.32, fontSize: 12, bold: true, color: SUB, align: "center", margin: 0, isTextBox: true, objectName: on("cap") });
}
function fitBox(iw, ih, bw, bh) { const r = Math.min(bw / iw, bh / ih); return [iw * r, ih * r]; }


// ===== 結論・まとめ：一番伝えたい一文を大きく、2〜3の細かい点はサブのカードで =====
function heroSlide(s, sl) {
  // メインの一文：強調部分（興味関心の一歩目）をいちばん大きく
  const runs = [];
  String(sl.heading).split("\n").forEach((line, li, arr) => {
    line.split("**").forEach((p, j) => {
      if (!p) return;
      runs.push({ text: p, options: j % 2 ? { fontSize: 54, bold: true, color: ACC } : { fontSize: 30, bold: true, color: WHITE } });
    });
    if (li < arr.length - 1) runs[runs.length - 1].options.breakLine = true;
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 0.98, w: 9, h: 2.0, rectRadius: 0.16, fill: { color: CARD }, line: { color: ACC, width: 2.5 }, objectName: on("hero-card") });
  s.addText(runs, { x: 0.8, y: 1.08, w: 8.4, h: 1.8, align: "center", valign: "middle", margin: 0, lineSpacingMultiple: 1.05, isTextBox: true, objectName: on("hero") });
  // サブ
  s.addText(sl.sub, { x: 0.5, y: 3.13, w: 9, h: 0.36, fontSize: 15, bold: true, color: SUB, margin: 0, valign: "middle", isTextBox: true, objectName: on("hero-sub") });
  const list = sl.items, n = list.length, gap = 0.25, cw = (9 - gap * (n - 1)) / n, y = 3.58, h = 1.45;
  list.forEach((it, i) => {
    const x = 0.5 + i * (cw + gap);
    const [ttl, ...rest] = String(it.text).split("\n");
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h, rectRadius: 0.12, fill: { color: CARD }, line: { color: LINE, width: 1 }, objectName: on("sub-card") });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.2, y: y + 0.2, w: 0.38, h: 0.38, rectRadius: 0.07, fill: { color: ACC }, line: { type: "none" }, objectName: on("sub-chip") });
    s.addText(it.prep, { x: x + 0.2, y: y + 0.2, w: 0.38, h: 0.38, fontSize: 15, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: on("sub-chip-t") });
    s.addText(rich(ttl.replace(/^→\s*/, ""), { fontSize: 15, bold: true, color: ACC }), { x: x + 0.7, y: y + 0.17, w: cw - 0.85, h: 0.44, margin: 0, valign: "middle", isTextBox: true, objectName: on("sub-title") });
    s.addText(rich(rest.join("\n").replace(/^→\s*/, ""), { fontSize: 14, bold: true, color: WHITE }), { x: x + 0.2, y: y + 0.7, w: cw - 0.4, h: h - 0.82, margin: 0, valign: "top", isTextBox: true, objectName: on("sub-text") });
  });
}

// ===== 動画と挙手のスライド =====
const VID = {
  v2: { file: A + "video2.mp4", poster: A + "v2thumb.jpg", w: 960, h: 540, title: "呼び込み動画「ぺぱぽん、くるりんぽ」", q: "これを見て、やってみたくなった？", yes: "やってみたい", no: "そうでもない" },
  v1: { file: A + "video1.mp4", poster: A + "v1thumb.jpg", w: 540, h: 960, title: "動画コンテスト優勝作品", q: "この動画、面白かった？", yes: "面白かった", no: "面白くなかった", compare: 72.8 }
};
function videoSlide(v, section) {
  const s = pres.addSlide({ masterName: "VIDEO", sectionTitle: section });
  s.addText(v.title, { placeholder: "title" });
  const [w, h] = fitBox(v.w, v.h, 8.6, 4.55);
  s.addMedia({ type: "video", path: v.file, cover: b64(v.poster), x: (10 - w) / 2, y: 0.88, w, h, objectName: on("video") });
  s.addNotes("動画をクリックすると再生されます。スライドショー中は、動画の上にマウスを置くと再生ボタンが出ます。");
}
function handSlide(v, section) {
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: section });
  s.addText("会場のみなさんに聞いてみます", { placeholder: "title" });
  const leftW = v.compare ? 5.4 : 9;
  heading(s, v.q, 0.5, 1.0, leftW, 32);
  const opts = [v.yes, v.no];
  const ow = v.compare ? 2.55 : 4.25;
  opts.forEach((t, i) => {
    const x = 0.5 + i * (ow + 0.3);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.15, w: ow, h: 1.5, rectRadius: 0.14, fill: { color: i ? CARD : ACC }, line: { color: i ? LINE : ACC, width: 1.5 }, objectName: on("hand-opt") });
    s.addText(t, { x, y: 2.15, w: ow, h: 1.5, fontSize: 24, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: on("hand-opt-t") });
  });
  s.addText("手を挙げてください", { x: 0.5, y: 3.9, w: leftW, h: 0.45, fontSize: 18, bold: true, color: SUB, margin: 0, isTextBox: true, objectName: on("hand-cta") });
  if (v.compare) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.35, y: 1.0, w: 3.15, h: 3.95, rectRadius: 0.14, fill: { color: CARD }, line: { color: GOLD, width: 2 }, objectName: on("compare") });
    s.addText("多摩祭の親子は…", { x: 6.55, y: 1.2, w: 2.75, h: 0.4, fontSize: 16, bold: true, color: SUB, margin: 0, isTextBox: true, objectName: on("compare-h") });
    s.addText([{ text: String(v.compare), options: { fontSize: 54, bold: true, color: GOLD } }, { text: "%", options: { fontSize: 24, bold: true, color: WHITE } }],
      { x: 6.35, y: 1.8, w: 3.15, h: 1.1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: on("compare-num") });
    s.addText(`「${v.yes}」`, { x: 6.55, y: 2.9, w: 2.75, h: 0.4, fontSize: 18, bold: true, color: WHITE, align: "center", margin: 0, isTextBox: true, objectName: on("compare-l") });
    s.addText("9作品全体 566票÷778票", { x: 6.55, y: 3.35, w: 2.75, h: 0.35, fontSize: 12, color: MUTED, align: "center", margin: 0, isTextBox: true, objectName: on("compare-src") });
    s.addText("会場のみなさんと比べると？", { x: 6.55, y: 4.05, w: 2.75, h: 0.6, fontSize: 15, bold: true, color: SUB, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: on("compare-q") });
  }
  s.addNotes(`挙手で答えてもらいます。「${v.yes}」の人、「${v.no}」の人の順に手を挙げてもらい、おおよその割合を伝えます。` + (v.compare ? `多摩祭では親子の72.8％が「面白かった」と答えました。` : ""));
}

// ===== 各ページ =====
const sectionOf = sl => sl.prep === "P" ? (sl.tag.startsWith("まとめ") ? "P まとめ" : "P 結論") : sl.prep === "R" ? "R 理由" : sl.prep === "E" ? "E 具体例" : "導入";
let lastSection = "";
function section(name) { if (name !== lastSection) { pres.addSection({ title: name }); lastSection = name; } return name; }

// 1. タイトル
section("導入");
{
  const s = pres.addSlide({ masterName: "TITLE", sectionTitle: "導入" });
  s.addText("動画で子どもを呼び込む", { placeholder: "title" });
  s.addText("多摩祭2026 段ボールガチャワークショップの報告", { placeholder: "subtitle" });
  s.addText([{ text: "多摩大学 経営情報学部 新西ゼミ", options: { fontSize: 16, color: SUB, breakLine: true } }, { text: "3年　金彌 寛大・丹伊田 一輝・池森 和真", options: { fontSize: 20 } }], { placeholder: "byline" });
}

// PowerPointの幅に合わせて改行位置だけ調整する文言
const FIX = {
  "**段ボールガチャ**ワークショップ（株式会社ペパポン × 新西ゼミ）": "**段ボールガチャ**ワークショップ\n（株式会社ペパポン × 新西ゼミ）",
  "親子のものづくりで、**環境**と**福祉**への貢献を伝える": "親子のものづくりで\n**環境**と**福祉**への貢献を伝える",
  "作って遊ぶ様子も映像に入れ\n**呼び込み**にも**待ち時間**にも\n流したい": "作って遊ぶ様子も映像に\n**呼び込み**にも\n**待ち時間**にも流したい"
};
const fix = t => FIX[t] || t;
for (const raw of SLIDES) {
  const sl = { ...raw,
    facts: raw.facts && raw.facts.map(([k, v]) => [k, fix(v)]),
    pillars: raw.pillars && raw.pillars.map(p => ({ ...p, text: fix(p.text) })) };
  const sec = section(sectionOf(sl));
  const s = newSlide(sl, sec);
  const X = 0.5, W = 9;
  let y = 1.0;

  if (sl.split) { // ペパポンとは：見出しの下を左右2列で上下いっぱいに使う
    heading(s, sl.heading, X, 1.0, W, 30);
    const top = 1.85, bot = 5.1, bh = bot - top;
    // 左：白いカードの中に製品写真と説明
    const lw = 4.7;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X, y: top, w: lw, h: bh, rectRadius: 0.14, fill: { color: "FFFFFF" }, line: { color: ACC, width: 2.5 }, objectName: on("lineup-card") });
    const [iw, ih] = fitBox(1200, 622, lw - 0.4, bh - 0.75);
    s.addImage({ path: A + "lineup.jpg", x: X + (lw - iw) / 2, y: top + 0.2 + (bh - 0.75 - ih) / 2, w: iw, h: ih, altText: sl.split.cap, objectName: on("lineup") });
    s.addText(sl.split.cap, { x: X + 0.2, y: bot - 0.55, w: lw - 0.4, h: 0.4, fontSize: 15, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: on("lineup-cap") });
    // 右：環境・社会への貢献（上下に均等）
    const px = X + lw + 0.3, pw = 9.5 - px, gap = 0.25, ph = (bh - gap) / 2;
    sl.pillars.forEach((p, i) => {
      const py = top + i * (ph + gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px, y: py, w: pw, h: ph, rectRadius: 0.12, fill: { color: CARD }, line: { color: ACC, width: 2 }, objectName: on("pillar") });
      const icon = A + p.icon.split("/").pop().split("?")[0], isz = 1.05;
      s.addImage({ path: icon, x: px + 0.2, y: py + (ph - isz) / 2, w: isz, h: isz, altText: p.title, objectName: on("sdg") });
      s.addText([
        { text: p.title, options: { fontSize: 20, bold: true, color: ACC, breakLine: true } },
        ...rich(p.text, { fontSize: 14, bold: true, color: WHITE })
      ], { x: px + 0.2 + isz + 0.2, y: py + 0.12, w: pw - isz - 0.55, h: ph - 0.24, margin: 0, valign: "middle", paraSpaceBefore: 2, isTextBox: true, objectName: on("pillar-t") });
    });
    continue;
  }

  if (sl.tag === "新西ゼミ × ペパポン　連携の取り組み") { // 年表：横いっぱいのタイムライン＋下に企業からの依頼
    const TL = {
      "2024": "多摩祭で\nペパポンカプセルを販売",
      "2025": "子ども向け\nワークショップを企画\n満足度**100％**",
      "2026": "今回の多摩祭で\nワークショップ\n＋動画コンテスト"
    };
    const n = sl.facts.length, gap = 0.3, cw = (W - gap * (n - 1)) / n;
    const lineY = 1.32;
    s.addShape(pres.shapes.LINE, { x: X + cw / 2, y: lineY, w: W - cw, h: 0, line: { color: ACC, width: 3 }, objectName: on("tl-line") });
    sl.facts.forEach(([yr], i) => {
      const x = X + i * (cw + gap), last = i === n - 1;
      s.addShape(pres.shapes.OVAL, { x: x + cw / 2 - 0.17, y: lineY - 0.17, w: 0.34, h: 0.34, fill: { color: last ? ACC : C.text1 }, line: { color: ACC, width: 3 }, objectName: on("tl-dot") });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.7, w: cw, h: 2.3, rectRadius: 0.14, fill: { color: last ? ACC : CARD }, line: { color: last ? ACC : LINE, width: 1.5 }, objectName: on("tl-card") });
      s.addText(yr, { x: x + 0.25, y: 1.85, w: cw - 0.5, h: 0.6, fontSize: 32, bold: true, color: last ? WHITE : ACC, margin: 0, valign: "middle", isTextBox: true, objectName: on("tl-year") });
      s.addText(rich(TL[yr], { fontSize: 14, bold: true, color: WHITE }, last ? WHITE : ACC), { x: x + 0.25, y: 2.45, w: cw - 0.5, h: 1.5, margin: 0, valign: "top", lineSpacingMultiple: 1.05, isTextBox: true, objectName: on("tl-text") });
    });
    const [label, body0] = sl.lines[0].split("\n");
    const body = body0.replace("発信で、", "発信で、\n");
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X, y: 4.3, w: W, h: 0.85, rectRadius: 0.12, fill: { color: CARD }, line: { color: GOLD, width: 1.5 }, objectName: on("request") });
    s.addText(label.replace(/：$/, ""), { x: X + 0.3, y: 4.3, w: 2.0, h: 0.85, fontSize: 16, bold: true, color: GOLD, margin: 0, valign: "middle", isTextBox: true, objectName: on("request-k") });
    s.addText(body, { x: X + 2.3, y: 4.3, w: W - 2.6, h: 0.85, fontSize: 17, bold: true, color: WHITE, margin: 0, valign: "middle", isTextBox: true, objectName: on("request-v") });
    continue;
  }

  if (sl.tag === "活動の概要") { // 概要：5項目を上下いっぱいに並べ、右に完成品の写真
    const top = 1.0, bot = 5.1, H = bot - top;
    const ih = H - 0.45, iw = ih * 871 / 1353, ix = 9.5 - iw;
    framedImage(s, A + "kit_d.jpg", ix, top, iw, ih, sl.figure.cap);
    const lw = ix - 0.3 - X, n = sl.facts.length, gap = 0.12, rh = (H - gap * (n - 1)) / n;
    sl.facts.forEach(([k, v], i) => {
      const y = top + i * (rh + gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X, y, w: lw, h: rh, rectRadius: 0.1, fill: { color: CARD }, line: { color: LINE, width: 1 }, objectName: on("ov-row") });
      s.addText(k, { x: X + 0.25, y, w: 1.05, h: rh, fontSize: 16, bold: true, color: ACC, margin: 0, valign: "middle", isTextBox: true, objectName: on("ov-k") });
      s.addText(rich(v, { fontSize: 17, bold: true, color: WHITE }), { x: X + 1.35, y, w: lw - 1.55, h: rh, margin: 0, valign: "middle", isTextBox: true, objectName: on("ov-v") });
    });
    continue;
  }

  if (sl.tag === "背景　これまでの課題") { // 集客の課題：想定と実績を大きな横棒で
    heading(s, sl.heading, X, 0.95, W, 30);
    const top = 2.15, h = 2.2;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X, y: top, w: W, h, rectRadius: 0.14, fill: { color: CARD }, line: { color: LINE, width: 1 }, objectName: on("gap-card") });
    const lx = X + 0.35, labW = 2.7, bx = lx + labW, bw = W - 0.7 - labW - 1.85;
    sl.gaps.forEach((g, i) => {
      const gy = top + 0.35 + i * 0.85;
      s.addText(g.label.replace("　", "\n"), { x: lx, y: gy, w: labW, h: 0.7, fontSize: 15, bold: true, color: SUB, margin: 0, valign: "middle", isTextBox: true, objectName: on("gap-l") });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y: gy + 0.2, w: bw, h: 0.32, rectRadius: 0.16, fill: { color: LINE }, line: { type: "none" }, objectName: on("gap-bg") });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y: gy + 0.2, w: bw * g.actual / g.plan, h: 0.32, rectRadius: 0.16, fill: { color: ACC }, line: { type: "none" }, objectName: on("gap-bar") });
      s.addText([{ text: String(g.actual), options: { fontSize: 30, bold: true, color: ACC } }, { text: g.unit, options: { fontSize: 15, bold: true, color: WHITE, breakLine: true } }, { text: `想定 ${g.plan}${g.unit}`, options: { fontSize: 12, bold: true, color: SUB } }],
        { x: bx + bw + 0.2, y: gy - 0.05, w: 1.6, h: 0.8, align: "left", margin: 0, valign: "middle", isTextBox: true, objectName: on("gap-v") });
    });
    noteLine(s, sl.lines[0], X, 4.6, W);
    continue;
  }

  if (sl.photos && sl.flow) { // ワークショップの流れ
    const pw = 2.7, ph = 2.7 * 1080 / 1026, gap = (W - pw * 3) / 2;
    sl.photos.forEach((p, i) => {
      const x = X + i * (pw + gap);
      s.addImage({ path: A + `flow${i + 1}_d.jpg`, x, y: 1.2, w: pw, h: ph, altText: p.cap, objectName: on("flow-img") });
      s.addShape(pres.shapes.OVAL, { x: x + 0.12, y: 1.32, w: 0.5, h: 0.5, fill: { color: ACC }, line: { color: WHITE, width: 1.5 }, objectName: on("step") });
      s.addText(String(i + 1), { x: x + 0.12, y: 1.32, w: 0.5, h: 0.5, fontSize: 18, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: on("step-t") });
      s.addText(p.cap, { x, y: 1.2 + ph + 0.2, w: pw, h: 0.5, fontSize: 20, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: on("flow-cap") });
      if (i < 2) s.addText("▶", { x: x + pw, y: 1.2 + ph / 2 - 0.25, w: gap, h: 0.5, fontSize: 20, bold: true, color: ACC, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: on("arrow") });
    });
    continue;
  }

  if (sl.hero) { heroSlide(s, sl); continue; }
  const fig = sl.figure;
  const cw = fig ? 6.1 : W;
  if (fig) {
    const f = fig.src.split("/").pop().split("?")[0];
    const [file, ...native] = { "kit.jpg": ["kit_d.jpg", 871, 1353], "photo3.jpg": ["r4_d.jpg", 706, 1096], "v2thumb.jpg": ["v2thumb_r_d.jpg", 972, 552], "v1thumb.jpg": ["v1thumb_r_d.jpg", 552, 972] }[f];
    const [iw, ih] = fitBox(native[0], native[1], 2.6, 3.65);
    framedImage(s, A + file, 6.9 + (2.6 - iw) / 2, 1.0 + (3.65 - ih) / 2, iw, ih, fig.cap);
  }
  if (sl.heading) y = heading(s, sl.heading, X, y, cw, (sl.items || []).length >= 3 && sl.lines ? 28 : 30) + 0.3;
  if (sl.quote) {
    const h = nLines(sl.quote) * 30 / 72 * 1.35;
    s.addText(rich(sl.quote, { fontSize: 30, bold: true, color: ACC }), { x: X, y, w: cw, h, margin: 0, valign: "top", isTextBox: true, objectName: on("quote") });
    y += h + 0.3;
  }
  if (sl.items) y = items(s, sl.items, X, sl.heading ? y : 1.15, cw, sl.tag === "目次" ? 20 : 18) + 0.3;
  if (sl.facts) y = facts(s, sl.facts, X, sl.heading ? y : (fig ? 1.0 : 1.1), cw, sl.tag === "新西ゼミ × ペパポン　連携の取り組み" ? 0.95 : 1.4, fig ? 16 : 17) + 0.3;
  if (sl.stats) y = stats(s, sl.stats, X, y, cw) + 0.3;
  if (sl.pillars) y = pillarCards(s, sl.pillars, X, y, cw, 2.15) + 0.3;
  if (sl.lines) for (const l of sl.lines) y = noteLine(s, l, X, Math.min(y, 4.55), cw) + 0.15;

  if (sl.then) videoSlide(VID[sl.then], sec);
}

await pres.writeFile({ fileName: OUT });
await applyTheme(OUT, THEME);
console.log("wrote", OUT);
