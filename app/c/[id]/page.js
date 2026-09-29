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

  return (
    <main className="tap-wrap">
      <CardFace card={c} id={id} />
      <p className="tap-foot">Carte NFC n°{id}</p>
    </main>
  );
}
