import type { LiveMemo } from '../types/liveMemo';

type Props = {
  memo: LiveMemo;
  onOpen: (id: string) => void;
};

export function MemoCard({ memo, onOpen }: Props) {
  return (
    <button className="card" onClick={() => onOpen(memo.id)} aria-label={`${memo.title || '無題メモ'}を開く`}>
      <h3>{memo.title || '無題メモ'}</h3>
      <p>{memo.body.slice(0, 80) || '本文がまだありません。'}</p>
      <div className="card-footer">
        <small>{new Date(memo.updatedAt).toLocaleString('ja-JP')}</small>
        <div className="tags">
          {memo.emotionTags.slice(0, 2).map((tag) => (
            <span key={tag} className="chip">{tag}</span>
          ))}
        </div>
      </div>
    </button>
  );
}
