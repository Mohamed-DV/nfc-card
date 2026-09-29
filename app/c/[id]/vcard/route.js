import { externalUrl, whatsappUrl } from "@/lib/links";
import { getCard, isValidId } from "@/lib/store";

export const dynamic = "force-dynamic";

const esc = (s = "") => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

function photoLine(dataUrl) {
  const match = /^data:image\/jpeg;base64,([a-z0-9+/]+={0,2})$/i.exec(dataUrl || "");
  if (!match) return null;
  const raw = `PHOTO;ENCODING=b;TYPE=JPEG:${match[1]}`;
  let folded = raw.slice(0, 75);
  for (let i = 75; i < raw.length; i += 74) folded += "\r\n " + raw.slice(i, i + 74);
  return folded;
}

export async function GET(_req, { params }) {
  const { id } = await params;
  if (!isValidId(id)) return new Response("Not found", { status: 404 });
  const c = await getCard(id);

  const parts = c.fullName.split(/\s+/);
  const first = parts.shift() || "";
  const last = parts.join(" ");

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(last)};${esc(first)};;;`,
    `FN:${esc(c.fullName)}`,
    c.entity || c.direction ? `ORG:${esc(c.entity)}${c.direction ? ";" + esc(c.direction) : ""}` : null,
    c.jobTitle ? `TITLE:${esc(c.jobTitle)}` : null,
    c.phone ? `TEL;TYPE=WORK,VOICE:${c.phone.replace(/[^\d+]/g, "")}` : null,
    c.email ? `EMAIL;TYPE=WORK,INTERNET:${c.email}` : null,
    externalUrl(c.instagram) ? `URL;TYPE=Instagram:${esc(externalUrl(c.instagram))}` : null,
    externalUrl(c.facebook) ? `URL;TYPE=Facebook:${esc(externalUrl(c.facebook))}` : null,
    externalUrl(c.linkedin) ? `URL;TYPE=LinkedIn:${esc(externalUrl(c.linkedin))}` : null,
    whatsappUrl(c.whatsapp) ? `URL;TYPE=WhatsApp:${esc(whatsappUrl(c.whatsapp))}` : null,
    photoLine(c.photo),
    "END:VCARD",
  ].filter(Boolean);

  const filename = (c.fullName || `carte-${id}`).replace(/[^\w-]+/g, "_");
  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.vcf"`,
      "Cache-Control": "no-store",
    },
  });
}
