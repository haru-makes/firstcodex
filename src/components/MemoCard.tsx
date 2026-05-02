import type { LiveMemo } from '../types/liveMemo';

type Props = {
  memo: LiveMemo;
  onOpen: (id: string) => void;
};

export function MemoCard({ memo, onOpen }: Props) {
  return (
    <button className="card" onClick={() => onOpen(memo.id)}>
      <h3>{memo.title || '無題メモ'}</h3>
      <p>{memo.body.slice(0, 60)}</p>
      <small>{new Date(memo.updatedAt).toLocaleString('ja-JP')}</small>
    </button>
  );
}
