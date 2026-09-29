"use client";

import { useEffect, useState } from "react";
import CardFace from "@/components/CardFace";
import QrCode from "@/components/QrCode";

const FIELDS = [
  { key: "fullName", label: "Nom & Prénom", placeholder: "Mohamed Elkhalfi" },
  { key: "jobTitle", label: "Fonction / Poste actuel", placeholder: "Flutter Mobile Developer" },
  { key: "entity", label: "Entité", placeholder: "STARTNEST" },
  { key: "direction", label: "Direction", placeholder: "Direction Digitale" },
  { key: "phone", label: "Téléphone professionnel", placeholder: "+212 6 00 00 00 00", type: "tel" },
  { key: "email", label: "Adresse e-mail professionnelle", placeholder: "nom@entreprise.ma", type: "email" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/nom" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/nom" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/nom" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "+212 6 00 00 00 00" },
];

export default function Admin() {
  const [password, setPassword] = useState("");
  const [cards, setCards] = useState(null);
  const [selected, setSelected] = useState(1);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    const saved = sessionStorage.getItem("nfc-admin-pass");
    if (saved) load(saved);
  }, []);

  async function load(pass) {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/cards", { headers: { "x-admin-password": pass } });
    setBusy(false);
    if (!res.ok) {
      sessionStorage.removeItem("nfc-admin-pass");
      setMsg({ type: "err", text: "Mot de passe incorrect" });
      return;
    }
    const data = await res.json();
    sessionStorage.setItem("nfc-admin-pass", pass);
    setPassword(pass);
    setCards(data);
    pick(data, selected);
  }

  function pick(list, id) {
    setSelected(id);
    setForm(list.find((c) => c.id === id) || {});
    setMsg(null);
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/cards", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ ...form, id: selected }),
    });
    setBusy(false);
    const data = await res.json();
    if (!res.ok) return setMsg({ type: "err", text: data.error || "Erreur" });
    setCards((prev) => prev.map((c) => (c.id === selected ? data : c)));
    setMsg({ type: "ok", text: "Enregistré ✓ — la carte NFC affiche déjà les nouvelles infos." });
  }

  function onPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMsg({ type: "err", text: "Choisissez une image." });
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = 320;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      canvas.getContext("2d").drawImage(img, sx, sy, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      setForm((prev) => ({ ...prev, photo: canvas.toDataURL("image/jpeg", 0.72) }));
      setMsg(null);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setMsg({ type: "err", text: "Impossible de lire cette image." });
    };
    img.src = url;
  }

  function logout() {
    sessionStorage.removeItem("nfc-admin-pass");
    setCards(null);
    setPassword("");
  }

  if (!cards) {
    return (
      <main className="admin">
        <header className="topbar">
          <div className="topbar-inner">
            <span className="mark" aria-hidden="true" />
            <span className="wordmark">STARTNEST</span>
          </div>
        </header>
        <form className="panel login" onSubmit={(e) => { e.preventDefault(); load(password); }}>
          <h1>Admin NFC</h1>
          <p className="sub">Gestion des cartes de visite</p>
          <label htmlFor="pw">Mot de passe</label>
          <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          <div className="bar">
            <button className="btn primary" style={{ width: "100%" }} disabled={busy}>{busy ? "…" : "Connexion"}</button>
          </div>
          {msg && <p className={`msg ${msg.type}`}>{msg.text}</p>}
        </form>
      </main>
    );
  }

  const link = `${origin}/c/${selected}`;

  return (
    <main className="admin">
      <header className="topbar">
        <div className="topbar-inner">
          <span className="mark" aria-hidden="true" />
          <span className="wordmark">STARTNEST</span>
        </div>
      </header>
      <div className="admin-body">
      <h1>Cartes NFC</h1>
      <p className="sub">{cards.length} cartes · modifiez les infos sans reprogrammer la puce NFC.</p>
      <div className="grid">
        <div className="panel list">
          {cards.map((c) => (
            <button key={c.id} className={c.id === selected ? "active" : ""} onClick={() => pick(cards, c.id)}>
              <b>Carte {c.id}</b>
              {c.fullName || <em style={{ opacity: 0.6 }}>vide</em>}
            </button>
          ))}
        </div>

        <form className="panel" onSubmit={save}>
          <h2 style={{ margin: 0 }}>Carte n°{selected}</h2>
          <label>Lien à écrire sur la puce NFC (une seule fois)</label>
          <div className="link">{link}</div>
          {link ? (
            <div className="qr-block admin-qr">
              <QrCode value={link} size={168} />
              <p className="qr-caption">QR code de cette carte</p>
            </div>
          ) : null}

          <label>Photo de profil</label>
          <div className="photo-row">
            {form.photo ? (
              <img className="photo-thumb" src={form.photo} alt="" />
            ) : (
              <div className="photo-thumb" aria-hidden="true" />
            )}
            <label className="btn photo-pick">
              Choisir une image
              <input type="file" accept="image/*" hidden onChange={onPhoto} />
            </label>
            {form.photo ? (
              <button type="button" className="btn" onClick={() => setForm({ ...form, photo: "" })}>Retirer</button>
            ) : null}
          </div>
          <p className="photo-hint">L'image est recadrée en carré et affichée sur la carte.</p>

          {FIELDS.map((f) => (
            <div key={f.key}>
              <label htmlFor={f.key}>{f.label}</label>
              <input
                id={f.key}
                type={f.type || "text"}
                placeholder={f.placeholder}
                value={form[f.key] || ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}

          <div className="bar">
            <button className="btn primary" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</button>
            <a className="btn" href={`/c/${selected}`} target="_blank" rel="noreferrer">Voir la carte</a>
            <button type="button" className="btn" onClick={() => navigator.clipboard?.writeText(link)}>Copier le lien</button>
            <button type="button" className="btn" onClick={logout}>Déconnexion</button>
          </div>
          {msg && <p className={`msg ${msg.type}`}>{msg.text}</p>}
        </form>

        <aside className="panel preview-panel">
          <h2>Aperçu — page NFC</h2>
          <p className="sub">Ce que le téléphone affiche au tap. L'aperçu suit les champs avant même d'enregistrer.</p>
          <div className="preview-stage">
            <CardFace card={form} id={selected} url={link} interactive={false} />
            <p className="tap-foot">Carte NFC n°{selected}</p>
          </div>
        </aside>
      </div>
      </div>
    </main>
  );
}
