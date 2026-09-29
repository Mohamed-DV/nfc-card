import { headers } from "next/headers";
import { notFound } from "next/navigation";
import CardFace from "@/components/CardFace";
import { getCard, isValidId } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!isValidId(id)) return {};
  const c = await getCard(id);
  return { title: c.fullName ? `${c.fullName} — Carte NFC` : "Carte NFC" };
}

export default async function CardPage({ params }) {
  const { id } = await params;
  if (!isValidId(id)) notFound();
  const c = await getCard(id);
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const url = host ? `${proto}://${host}/c/${id}` : "";

  return (
    <main className="tap-wrap">
      <CardFace card={c} id={id} url={url} />
      <p className="tap-foot">Carte NFC n°{id}</p>
    </main>
  );
}
