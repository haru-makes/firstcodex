import { useMemo, useState } from 'react';
import { MemoCard } from '../components/MemoCard';
import { loadMemos, saveMemos } from '../lib/storage';
import type { EmotionTag, LiveMemo } from '../types/liveMemo';

type View = 'list' | 'create' | 'detail' | 'edit';

const TAGS: EmotionTag[] = ['最高', '感動', '楽しい', 'しっとり', '熱い'];

export function App() {
  const [memos, setMemos] = useState<LiveMemo[]>(() => loadMemos());
  const [view, setView] = useState<View>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedMemo = useMemo(
    () => memos.find((m) => m.id === selectedId) ?? null,
    [memos, selectedId]
  );

  function createMemo(data: Omit<LiveMemo, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const next: LiveMemo = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    const updated = [next, ...memos];
    setMemos(updated);
    saveMemos(updated);
    setSelectedId(next.id);
    setView('detail');
  }

  function updateMemo(id: string, patch: Partial<LiveMemo>) {
    const updated = memos.map((m) =>
      m.id === id ? { ...m, ...patch, updatedAt: new Date().toISOString() } : m
    );
    setMemos(updated);
    saveMemos(updated);
    setView('detail');
  }

  return (
    <main className="container">
      <header>
        <h1>ライブメモアプリ</h1>
      </header>

      {view === 'list' && (
        <section>
          <button onClick={() => setView('create')}>+ 新規メモ</button>
          <div className="grid">
            {memos.map((memo) => (
              <MemoCard
                key={memo.id}
                memo={memo}
                onOpen={(id) => {
                  setSelectedId(id);
                  setView('detail');
                }}
              />
            ))}
          </div>
        </section>
      )}

      {view === 'create' && (
        <MemoForm
          tags={TAGS}
          onCancel={() => setView('list')}
          onSubmit={createMemo}
        />
      )}

      {view === 'detail' && selectedMemo && (
        <section
          className="detail"
          style={{ backgroundImage: selectedMemo.backgroundImageUrl ? `url(${selectedMemo.backgroundImageUrl})` : 'none' }}
        >
          <div className="overlay">
            <button onClick={() => setView('list')}>← 一覧へ</button>
            <button onClick={() => setView('edit')}>編集</button>
            <h2>{selectedMemo.title}</h2>
            <p>{selectedMemo.body}</p>
            <p>タグ: {selectedMemo.emotionTags.join(', ') || 'なし'}</p>
          </div>
        </section>
      )}

      {view === 'edit' && selectedMemo && (
        <MemoForm
          initial={selectedMemo}
          tags={TAGS}
          onCancel={() => setView('detail')}
          onSubmit={(data) => updateMemo(selectedMemo.id, data)}
        />
      )}
    </main>
  );
}

type FormProps = {
  tags: EmotionTag[];
  initial?: Partial<LiveMemo>;
  onCancel: () => void;
  onSubmit: (data: Omit<LiveMemo, 'id' | 'createdAt' | 'updatedAt'>) => void;
};

function MemoForm({ tags, initial, onCancel, onSubmit }: FormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(initial?.backgroundImageUrl ?? '');
  const [emotionTags, setEmotionTags] = useState<EmotionTag[]>(initial?.emotionTags ?? []);

  function toggleTag(tag: EmotionTag) {
    setEmotionTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, body, backgroundImageUrl, emotionTags });
      }}
    >
      <h2>{initial ? 'メモ編集' : '新規メモ'}</h2>
      <label>タイトル<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label>本文<textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} /></label>
      <label>背景画像URL<input value={backgroundImageUrl} onChange={(e) => setBackgroundImageUrl(e.target.value)} /></label>
      <fieldset>
        <legend>感情タグ</legend>
        {tags.map((tag) => (
          <label key={tag}><input type="checkbox" checked={emotionTags.includes(tag)} onChange={() => toggleTag(tag)} />{tag}</label>
        ))}
      </fieldset>
      <div className="actions">
        <button type="button" onClick={onCancel}>キャンセル</button>
        <button type="submit">保存</button>
      </div>
    </form>
  );
}
