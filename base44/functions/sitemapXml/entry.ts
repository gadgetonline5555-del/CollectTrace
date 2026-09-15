import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Auto-generated sitemap of every public AI-research snapshot. Grows
// automatically as users run research — the programmatic-SEO acquisition loop.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "investra-manga-insight.base44.app";
    const origin = "https://" + host;

    const sources = [
      () => base44.asServiceRole.entities.AiResearchSnapshot.list("-created_date", 500),
      () => base44.asServiceRole.entities.WealthProfile.list("-created_date", 500),
      () => base44.asServiceRole.entities.CompanyIntel.list("-created_date", 500),
      () => base44.asServiceRole.entities.IpoProfile.list("-created_date", 500),
    ];

    const urls: string[] = [`${origin}/`];
    for (const load of sources) {
      try {
        const rows: any[] = await load();
        for (const r of rows) {
          if (r?.id) urls.push(`${origin}/s/${r.id}`);
        }
      } catch { /* entity may be empty */ }
    }

    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n") +
      `\n</urlset>\n`;

    return new Response(body, {
      headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" }
    });
  } catch (error) {
    console.error("sitemapXml error:", error?.message || error);
    return new Response("error", { status: 500 });
  }
}