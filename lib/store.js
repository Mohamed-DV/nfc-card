// Storage layer: Upstash Redis on Vercel (free), local JSON file in development.
import { Redis } from "@upstash/redis";
import { promises as fs } from "fs";
import path from "path";

export const TOTAL_CARDS = Number(process.env.TOTAL_CARDS || 20);

export const FIELDS = [
  { key: "fullName", label: "Nom & Prénom" },
  { key: "jobTitle", label: "Fonction / Poste actuel" },
  { key: "entity", label: "Entité" },
  { key: "direction", label: "Direction" },
  { key: "phone", label: "Téléphone professionnel" },
  { key: "email", label: "Adresse e-mail professionnelle" },
  { key: "instagram", label: "Instagram", max: 400 },
  { key: "facebook", label: "Facebook", max: 400 },
  { key: "linkedin", label: "LinkedIn", max: 400 },
  { key: "whatsapp", label: "WhatsApp", max: 400 },
];

const DEFAULT_CARDS = {
  1: {
    fullName: "Mohamed Elkhalfi",
    jobTitle: "Flutter Mobile Developer",
    entity: "STARTNEST",
    direction: "Direction Digitale & Développement Mobile",
    phone: "+212 6 00 00 00 00",
    email: "elkhalfimohameddv@gmail.com",
  },
};

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const LOCAL_FILE = path.join(process.cwd(), "data", "cards.json");

function emptyCard() {
  return { photo: "", ...Object.fromEntries(FIELDS.map((f) => [f.key, ""])) };
}

function cleanPhoto(value) {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s) return "";
  if (!/^data:image\/jpeg;base64,[a-z0-9+/]+={0,2}$/i.test(s)) return null;
  if (s.length > 200_000) return null;
  return s;
}

function clean(input = {}) {
  const out = emptyCard();
  for (const f of FIELDS) out[f.key] = String(input[f.key] ?? "").trim().slice(0, f.max || 200);
  const photo = cleanPhoto(input.photo);
  if (photo === null) {
    const err = new Error("Photo trop volumineuse ou format invalide.");
    err.status = 400;
    throw err;
  }
  out.photo = photo;
  return out;
}

async function readLocal() {
  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8"));
  } catch {
    return {};
  }
}

export function isValidId(id) {
  const n = Number(id);
  return Number.isInteger(n) && n >= 1 && n <= TOTAL_CARDS;
}

export async function getCard(id) {
  let data;
  if (redis) data = await redis.get(`card:${id}`);
  else data = (await readLocal())[id];
  return clean(data ?? DEFAULT_CARDS[id] ?? {});
}

export async function getAllCards() {
  const ids = Array.from({ length: TOTAL_CARDS }, (_, i) => i + 1);
  return Promise.all(ids.map(async (id) => ({ id, ...(await getCard(id)) })));
}

export async function saveCard(id, input) {
  const card = clean(input);
  if (redis) {
    await redis.set(`card:${id}`, card);
  } else {
    const all = await readLocal();
    all[id] = card;
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, JSON.stringify(all, null, 2));
  }
  return card;
}

export function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "?";
}
