import { COMPANY } from "@/lib/brand";

function initial(name = "") {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function Row({ label, value, href }) {
  if (!value) return null;
  const Tag = href ? "a" : "div";
  return (
    <Tag className="tap-row" {...(href ? { href } : {})}>
      <small>{label}</small>
      <span>{value}</span>
    </Tag>
  );
}

export default function CardFace({ card, id, interactive = true }) {
  const tel = (card.phone || "").replace(/[^\d+]/g, "");
  const org = [card.entity, card.direction].filter(Boolean).join(" · ");

  if (!card.fullName) {
    return (
      <article className="tap-card tap-empty">
        <div className="tap-cover"><p className="tap-brand">{COMPANY}</p></div>
        <h2>Carte non configurée</h2>
        <p>Cette carte NFC n°{id} n'a pas encore d'informations.</p>
      </article>
    );
  }

  return (
    <article className="tap-card">
      <div className="tap-cover">
        <p className="tap-brand">{COMPANY}</p>
      </div>
      <div className="tap-head">
        <div className="tap-avatar" aria-hidden="true">
          {card.photo ? <img src={card.photo} alt="" /> : initial(card.fullName)}
        </div>
        <h1>{card.fullName}</h1>
        {card.jobTitle ? <p className="tap-role">{card.jobTitle}</p> : null}
        {org ? <p className="tap-org">{org}</p> : null}
      </div>
      <div className="tap-actions">
        {interactive ? (
          <a className="tap-btn primary" href={`/c/${id}/vcard`}>Enregistrer le contact</a>
        ) : (
          <span className="tap-btn primary">Enregistrer le contact</span>
        )}
        {card.phone ? (
          interactive ? <a className="tap-btn" href={`tel:${tel}`}>Appeler</a> : <span className="tap-btn">Appeler</span>
        ) : null}
        {card.email ? (
          interactive ? <a className="tap-btn" href={`mailto:${card.email}`}>E-mail</a> : <span className="tap-btn">E-mail</span>
        ) : null}
      </div>
      <div className="tap-rows">
        <Row label="Fonction / Poste actuel" value={card.jobTitle} />
        <Row label="Entité" value={card.entity} />
        <Row label="Direction" value={card.direction} />
        <Row label="Téléphone professionnel" value={card.phone} href={interactive && tel ? `tel:${tel}` : undefined} />
        <Row label="Adresse e-mail professionnelle" value={card.email} href={interactive && card.email ? `mailto:${card.email}` : undefined} />
      </div>
    </article>
  );
}
