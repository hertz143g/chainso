import { resolveMusicMetadata } from "@/lib/musicMetadata";

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams.get("url");
  if (!input) return Response.json({ error: "Укажи ссылку на музыку" }, { status: 400 });
  const metadata = await resolveMusicMetadata(input, request.signal);
  if (!metadata) return Response.json({ error: "Некорректная ссылка" }, { status: 400 });
  return Response.json(metadata, { headers: { "Cache-Control": "private, max-age=3600" } });
}
