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

// state.phase が "go" のとき、startAt からの経過時間で表示を決める
export function phaseOf(state) {
  if (!state || state.phase !== "go") return { mode: "waiting" };
  const t = now() - state.startAt;
  if (t < 0) return { mode: "ready" };
  if (t < COUNT_MS) return { mode: "count", n: 3 - Math.floor(t / 1000) };
  return { mode: "lit", since: t - COUNT_MS };
}

const cache = new WeakMap();
export function setText(el, text) {
  if (cache.get(el) === text) return;
  cache.set(el, text);
  el.textContent = text;
}
