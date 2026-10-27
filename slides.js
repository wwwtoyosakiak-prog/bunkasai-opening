// 発表スライド（1ページ目はタイトル画面。ここに書いたものが2ページ目以降になる）
// prep: P / R / E（目次などは空欄）　tag: 見出しラベル
// heading: 大きく出す一文　lines: 補足（2行まで推奨）　items: 目次などの一覧
// **…** で囲んだ部分はテーマカラーで強調される
export const SLIDES = [
  {
    prep: "",
    tag: "目次",
    items: [
      { prep: "概", text: "活動の概要" },
      { prep: "P", text: "結論" },
      { prep: "R", text: "理由：これまでの課題と、動画を使った理由" },
      { prep: "E", text: "具体例：参加実績と、会場で動画を見て投票" },
      { prep: "P", text: "まとめ：結論と次回への改善" }
    ]
  },
  {
    prep: "",
    tag: "活動の概要",
    facts: [
      ["いつ", "2026年10月24日（土）　**多摩祭2026**"],
      ["どこで", "多摩大学 多摩キャンパス　アリーナ17番"],
      ["なにを", "**段ボールガチャ**ワークショップ（株式会社ペパポン × 新西ゼミ）"],
      ["だれに", "幼児〜小学3年生と、その保護者"],
      ["ねらい", "親子のものづくりで、**環境**と**福祉**への貢献を伝える"]
    ]
  },
  {
    prep: "",
    tag: "当日の様子",
    photos: [
      { src: "photos/photo1.jpg", cap: "アリーナのテントで、親子で工作" },
      { src: "photos/photo2.jpg", cap: "紙芝居とクイズで、環境と福祉を学ぶ" },
      { src: "photos/photo3.jpg", cap: "共用画面では動画を上映" }
    ]
  },
  {
    prep: "P",
    tag: "結論",
    heading: "動画で**楽しさ**を見せると\n子どもは**参加したくなる**",
    lines: [
      "課題だった「宣伝・集客」を解決する手がかりを、多摩祭の実践で得ました"
    ]
  },
  {
    prep: "R",
    tag: "理由①　これまでの課題",
    heading: "体験の中身は充実させてきた\nでも**参加前に楽しさが伝わらない**",
    lines: [
      "参加した子どもの満足度は高い一方で、「宣伝・集客」に課題を感じていました"
    ]
  },
  {
    prep: "R",
    tag: "理由②　動画を使ってみた",
    heading: "出店場所の前で**動画を流す**と…",
    quote: "「ママ、これ何？」\n「これやりたい」",
    lines: [
      "画面を見て、興味を持って参加する子どもが多く見られました"
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
