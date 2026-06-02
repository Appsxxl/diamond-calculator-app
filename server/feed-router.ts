import { publicProcedure, router } from "./_core/trpc";

const CHANNEL_ID = "UCXh1ElqY3LpawTWvCOW6pUA";
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

function formatAge(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function parseXML(xml: string) {
  const out: { id: string; title: string; age: string }[] = [];
  const entryRe = /<entry>(.*?)<\/entry>/gs;
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(xml)) !== null) {
    const e = m[1];
    const id = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = e.match(/<title>([^<]+)<\/title>/)?.[1];
    const pub = e.match(/<published>([^<]+)<\/published>/)?.[1];
    if (!id || !title) continue;
    out.push({
      id,
      title: title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
      age: pub ? formatAge(pub) : "",
    });
  }
  return out;
}

export const feedRouter = router({
  getYouTubeVideos: publicProcedure.query(async () => {
    try {
      const res = await fetch(RSS_URL, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) return [];
      const xml = await res.text();
      return parseXML(xml);
    } catch {
      return [];
    }
  }),
});
