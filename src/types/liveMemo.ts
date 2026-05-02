export type EmotionTag = '最高' | '感動' | '楽しい' | 'しっとり' | '熱い';

export type LiveMemo = {
  id: string;
  title: string;
  body: string;
  emotionTags: EmotionTag[];
  backgroundImageUrl?: string;
  createdAt: string;
  updatedAt: string;
};
