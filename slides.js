// 発表スライド（1ページ目はタイトル画面。ここに書いたものが2ページ目以降になる）
// prep: P / R / E（目次などは空欄）　tag: 見出しラベル
// heading: 大きく出す一文　lines: 補足（2行まで推奨）　items: 目次などの一覧
// **…** で囲んだ部分はテーマカラーで強調される
export const SLIDES = [
  {
    prep: "",
    tag: "目次",
    items: [
      { prep: "背", text: "背景：ペパポンと新西ゼミの連携" },
      { prep: "概", text: "多摩祭ワークショップの概要" },
      { prep: "P", text: "結論" },
      { prep: "R", text: "理由：これまでの課題と、動画で見えた子どもの変化" },
      { prep: "E", text: "具体例：参加実績と、会場で動画を見て投票" },
      { prep: "P", text: "まとめ：結論と次回への改善" }
    ]
  },
  {
    prep: "",
    tag: "そもそも、ペパポンとは？",
    heading: "**段ボール**でできたガチャガチャ",
    split: { src: "photos/lineup.jpg?v=1", cap: "ガチャ本体もカプセルも、すべて段ボール" },
    pillars: [
      { icon: "photos/sdg12.png?v=1", title: "環境に貢献", text: "段ボールのリサイクル率は\n**ほぼ100％**" },
      { icon: "photos/sdg8.png?v=1", title: "社会に貢献", text: "カプセルの組み立てを\n**福祉作業所**に依頼し、\n障がいのある人の仕事に" }
    ]
  },
  {
    prep: "",
    tag: "新西ゼミ × ペパポン　連携の取り組み",
    facts: [
      ["2024", "多摩祭でSDGsブースを出展（来場**79人**・販売**46台**）"],
      ["2025", "子ども向けワークショップを企画（満足度**100％**）"],
      ["2026", "ペパポンのPR動画を制作"],
      ["今回", "多摩祭2026で**ワークショップ＋動画コンテスト**"]
    ],
    lines: [
      "企業からの依頼：\n子どもも学生も楽しみながら、環境と福祉を学べる場に"
    ]
  },
  {
    prep: "",
    tag: "活動の概要",
    figure: { src: "photos/kit.jpg?v=2", cap: "完成した段ボールガチャ" },
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
    tag: "当日の様子　ワークショップの流れ",
    flow: true,
    photos: [
      { src: "photos/photo2.jpg?v=2", step: "①", cap: "紙芝居・クイズ", pos: "45% 50%" },
      { src: "photos/photo2b.jpg?v=2", step: "②", cap: "キット作成", pos: "50% 55%" },
      { src: "photos/photo3.jpg?v=2", step: "③", cap: "動画コンテスト", pos: "55% 40%" }
    ]
  },
  {
    prep: "P",
    tag: "結論",
    heading: "動画は、子どもの\n**興味関心の一歩目**になる",
    items: [
      { prep: "1", text: "見て「やりたい」→ **参加のきっかけ**に" },
      { prep: "2", text: "**ほかの商品**にも興味が広がる" },
      { prep: "3", text: "キットの**飾り付けのアイデア**が生まれる" }
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
    tag: "理由②　呼び込み動画　→ 結論1",
    heading: "出店場所の前で**動画を流す**と…",
    quote: "「ママ、これ何？」\n「これやりたい」",
    lines: [
      "画面を見て、興味を持って参加する子どもが多く見られました"
    ]
  },
  {
    prep: "R",
    tag: "理由③　動画コンテスト　→ 結論2・3",
    heading: "動画を見た子どもから\nこんな声が",
    figure: { src: "photos/photo3.jpg?v=2", cap: "動画コンテストの様子", pos: "50% 45%" },
    items: [
      { prep: "2", text: "**「これもほしいなー」**\nほかの商品にも興味が広がった" },
      { prep: "3", text: "**「こんな飾り付け、自分もしてみたい」**\n飾り付けのアイデアになった" }
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
