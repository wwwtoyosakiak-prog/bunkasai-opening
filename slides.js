// 発表スライド（1ページ目はタイトル画面。ここに書いたものが2ページ目以降になる）
// prep: P / R / E / P のどれか　heading: 大きく出す一文　lines: 補足（2行まで推奨）
// **…** で囲んだ部分はテーマカラーで強調される
export const SLIDES = [
  {
    prep: "P",
    tag: "結論",
    heading: "動画で**楽しさ**を見せると\n子どもは**参加したくなる**",
    lines: [
      "課題だった「宣伝・集客」を解決する手がかりを、多摩祭の実践で得ました"
    ]
  }
];

// **強調** を <em> に変換（それ以外の文字はそのまま文字として扱う）
export function renderRich(el, text) {
  el.textContent = "";
  String(text || "").split("\n").forEach((line, i) => {
    if (i) el.appendChild(document.createElement("br"));
    line.split("**").forEach((part, j) => {
      if (!part) return;
      const node = j % 2 ? document.createElement("em") : document.createTextNode(part);
      if (j % 2) node.textContent = part;
      el.appendChild(node);
    });
  });
}
