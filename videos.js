// 上映する動画と投票の設定
// 動画ファイルは videos フォルダに置き、src のファイル名と合わせてください（mp4 / H.264 推奨、1本50MB以内）
export const VIDEOS = [
  {
    id: "v1",
    name: "1本目：動画コンテスト優勝作品",
    src: "videos/video1.mp4?v=2",
    question: "この動画、面白かった？",
    yes: "面白かった",
    no: "面白くなかった",
    // 多摩祭での親子（子どもと付き添いの保護者）の結果（9作品全体：566÷778）
    compare: { label: "多摩祭の親子", yes: 72.8 }
  },
  {
    id: "v2",
    name: "2本目：出店場所の前で流した呼び込み動画",
    src: "videos/video2.mp4?v=2",
    question: "これを見て、やってみたくなった？",
    yes: "やってみたい",
    no: "そうでもない",
    compare: null
  }
];

export const videoById = id => VIDEOS.find(v => v.id === id);
