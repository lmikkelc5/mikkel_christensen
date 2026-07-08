import { getRssXml } from "@/lib/content";

export function GET() {
  return new Response(getRssXml(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
