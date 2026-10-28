// 発表の順番（操作パネルと発表画面で共通）
// 待機 →（3・2・1）→ タイトル → スライド →（動画のあるページでは）上映 → 投票 → 結果 → 次のスライド …
import { phaseOf } from "./common.js?v=70";
import { SLIDES } from "./slides.js?v=70";

export const STEPS = [{ phase: "title" }];
SLIDES.forEach((sl, i) => {
  STEPS.push({ phase: "slide", slide: i });
  if (sl.then) ["video", "vote", "result"].forEach(ph => STEPS.push({ phase: ph, video: sl.then }));
});

export const stepName = st => !st ? "（最後です）" : st.phase === "go" ? "3・2・1 スタート" : st.phase === "title" ? "タイトル"
  : st.phase === "slide" ? `${st.slide + 2}ページ目` + (SLIDES[st.slide].tag ? `：${SLIDES[st.slide].tag}` : "")
  : ({ video: "動画を上映", vote: "投票を開始", result: "投票を締め切って結果" })[st.phase] + `（${st.video === "v1" ? "1本目" : "2本目"}）`;

// いまの場面が STEPS の何番目か（待機中・カウント中は -1）
export function curStep(state) {
  const p = phaseOf(state);
  if (p.mode === "lit") return 0;
  return STEPS.findIndex(st => st.phase === p.mode && (p.mode === "slide" ? st.slide === p.slide : st.video === p.video));
}

// 次・前の場面として書き込む内容（待機中に「次へ」を押すと 3・2・1 が始まる）
export function nextStep(state) {
  const p = phaseOf(state);
  if (p.mode === "waiting") return { phase: "go" };
  if (p.mode === "ready" || p.mode === "count") return null;
  return STEPS[curStep(state) + 1] || null;
}
export function prevStep(state) {
  const i = curStep(state);
  return i > 0 ? STEPS[i - 1] : null;
}
