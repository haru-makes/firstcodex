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
    const next: LiveMemo = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
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
    <main className="app-shell">
      <header className="topbar glass">
        <div>
          <p className="eyebrow">Live Memory Album</p>
          <h1>ライブメモアプリ</h1>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => setView('create')}>+ 新規メモ</button>
        </div>
      </header>

      {view === 'list' && (
        <section className="panel">
          <div className="panel-header">
            <h2>あなたのライブ記録</h2>
            <span className="badge">{memos.length}件</span>
          </div>
          <div className="grid">
            {memos.length === 0 ? (
              <article className="empty glass">
                <h3>最初の1件を記録しましょう</h3>
                <p>ライブ直後の熱量を、そのまま思い出に残せます。</p>
                <button className="btn btn-primary" onClick={() => setView('create')}>メモを作成</button>
              </article>
            ) : (
              memos.map((memo) => (
                <MemoCard
                  key={memo.id}
                  memo={memo}
                  onOpen={(id) => {
                    setSelectedId(id);
                    setView('detail');
                  }}
                />
              ))
            )}
          </div>
        </section>
      )}

      {view === 'create' && (
        <section className="panel">
          <MemoForm tags={TAGS} onCancel={() => setView('list')} onSubmit={createMemo} />
        </section>
      )}

      {view === 'detail' && selectedMemo && (
        <section className="detail" style={{ backgroundImage: selectedMemo.backgroundImageUrl ? `url(${selectedMemo.backgroundImageUrl})` : 'none' }}>
          <div className="detail-dim" />
          <article className="detail-content glass">
            <div className="row">
              <button className="btn" onClick={() => setView('list')}>← 一覧へ</button>
              <button className="btn btn-primary" onClick={() => setView('edit')}>編集</button>
            </div>
            <h2>{selectedMemo.title || '無題メモ'}</h2>
            <p className="meta">更新: {new Date(selectedMemo.updatedAt).toLocaleString('ja-JP')}</p>
            <p className="body">{selectedMemo.body}</p>
            <div className="tags">
              {selectedMemo.emotionTags.length === 0 ? <span className="chip">タグなし</span> : selectedMemo.emotionTags.map((t) => <span className="chip" key={t}>{t}</span>)}
            </div>
          </article>
        </section>
      )}

      {view === 'edit' && selectedMemo && (
        <section className="panel">
          <MemoForm initial={selectedMemo} tags={TAGS} onCancel={() => setView('detail')} onSubmit={(data) => updateMemo(selectedMemo.id, data)} />
        </section>
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
    <form className="form glass" onSubmit={(e) => { e.preventDefault(); onSubmit({ title, body, backgroundImageUrl, emotionTags }); }}>
      <h2>{initial ? 'メモ編集' : '新規メモ作成'}</h2>
      <label>タイトル<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: 2026春ツアー東京公演" /></label>
      <label>本文<textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="セットリスト、印象に残ったMC、会場の雰囲気など" /></label>
      <label>背景画像URL<input value={backgroundImageUrl} onChange={(e) => setBackgroundImageUrl(e.target.value)} placeholder="https://..." /></label>
      <fieldset>
        <legend>感情タグ</legend>
        <div className="tag-picker">
          {tags.map((tag) => (
            <label className="chip selectable" key={tag}><input type="checkbox" checked={emotionTags.includes(tag)} onChange={() => toggleTag(tag)} />{tag}</label>
          ))}
        </div>
      </fieldset>
      <div className="actions">
        <button className="btn" type="button" onClick={onCancel}>キャンセル</button>
        <button className="btn btn-primary" type="submit">保存</button>
      </div>
    </form>
  );
}
