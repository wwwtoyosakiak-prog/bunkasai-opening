import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./config.js";

export const configured = !String(firebaseConfig.apiKey).includes("ここに");
export const app = configured ? initializeApp(firebaseConfig) : null;
export const db = configured ? getDatabase(app) : null;
export const auth = configured ? getAuth(app) : null;

// 全端末で同じ瞬間にカウントダウンするため、サーバー時刻とのずれを補正する
let offset = 0;
if (db) onValue(ref(db, ".info/serverTimeOffset"), s => { offset = s.val() || 0; });
export const now = () => Date.now() + offset;

export const COUNT_MS = 3000; // 3・2・1

// 発表者が決めた state から、いま表示すべき場面を決める
//  waiting: 開演前 / ready・count・lit: オープニング / title: タイトル表示
//  video: 動画上映 / vote: 投票受付 / result: 投票結果
export function phaseOf(state) {
  if (!state) return { mode: "waiting" };
  switch (state.phase) {
    case "go": {
      const t = now() - state.startAt;
      if (t < 0) return { mode: "ready" };
      if (t < COUNT_MS) return { mode: "count", n: 3 - Math.floor(t / 1000) };
      return { mode: "lit", since: t - COUNT_MS };
    }
    case "title": return { mode: "lit", since: Infinity };
    case "video":
    case "vote":
    case "result": return { mode: state.phase, video: state.video };
    default: return { mode: "waiting" };
  }
}

// 投票の集計
export function tally(snapVal) {
  let yes = 0, no = 0;
  for (const v of Object.values(snapVal || {})) { if (v === "yes") yes++; else if (v === "no") no++; }
  const total = yes + no;
  return { yes, no, total, pct: total ? Math.round(yes / total * 1000) / 10 : 0 };
}

const cache = new WeakMap();
export function setText(el, text) {
  if (cache.get(el) === text) return;
  cache.set(el, text);
  el.textContent = text;
}
