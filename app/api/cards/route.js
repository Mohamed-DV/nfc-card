import { getAllCards, saveCard, isValidId } from "@/lib/store";

export const dynamic = "force-dynamic";

function authorized(req) {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return false; // refuse all edits until a password is configured
  return req.headers.get("x-admin-password") === pass;
}

export async function GET(req) {
  if (!authorized(req)) return Response.json({ error: "Mot de passe incorrect" }, { status: 401 });
  return Response.json(await getAllCards());
}

export async function PUT(req) {
  if (!authorized(req)) return Response.json({ error: "Mot de passe incorrect" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || !isValidId(body.id)) return Response.json({ error: "Carte invalide" }, { status: 400 });
  try {
    const card = await saveCard(Number(body.id), body);
    return Response.json({ id: Number(body.id), ...card });
  } catch (e) {
    const status = e.status || 500;
    return Response.json(
      { error: e.status ? e.message : "Échec de l'enregistrement. Base de données configurée ?" },
      { status }
    );
  }
}
