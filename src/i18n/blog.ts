// Статьи блога лежат в src/blog/*.md. Пока у статьи draft: true, она собирается только для проверки:
// закрыта от поиска, не попадает в меню, карту сайта и llms.txt.
type Front = { title: string; description: string; tag: string; date: string; minutes: number; draft?: boolean; theme?: string; cover?: string; coverNote?: string };
const files = import.meta.glob<{ frontmatter: Front; Content: any }>('../blog/*.md', { eager: true });
export const POSTS = Object.entries(files)
  .map(([path, m]) => ({ slug: path.split('/').pop()!.replace(/\.md$/, ''), ...m.frontmatter, Content: m.Content }))
  .sort((a, b) => b.date.localeCompare(a.date));
export const LIVE_POSTS = POSTS.filter((p) => !p.draft);
export const BLOG_LIVE = LIVE_POSTS.length > 0;
