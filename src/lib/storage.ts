import type { LiveMemo } from '../types/liveMemo';

const KEY = 'live_memo_items';

export function loadMemos(): LiveMemo[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LiveMemo[];
  } catch {
    return [];
  }
}

export function saveMemos(memos: LiveMemo[]): void {
  localStorage.setItem(KEY, JSON.stringify(memos));
}
