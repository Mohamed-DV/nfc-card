import { externalUrl, whatsappUrl } from "@/lib/links";
import QrCode from "@/components/QrCode";

const Icon = {
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></>,
  facebook: <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z" fill="currentColor" stroke="none" />,
  linkedin: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 10v7M7 7h.01M11 17v-4.2a2 2 0 0 1 4 0V17" /></>,
  whatsapp: <path d="M20 11.5A8.5 8.5 0 0 1 7.6 18.7L4 20l1.4-3.5A8.5 8.5 0 1 1 20 11.5zM9 10.2c.1.3.6 1.4.6 1.5.1.2 0 .3-.1.5l-.4.4c-.1.1-.2.3 0 .6.3.5 1 1.2 1.8 1.5.2.1.4 0 .5-.1l.5-.6c.1-.2.3-.1.5-.1.2 0 1.2.6 1.4.7.2.1.3.2.3.4.1.5-.4 1.4-1.1 1.4-.8 0-2.6-.7-3.8-2.1-1-1.2-1.5-2.4-1.4-3.2.1-.4.6-1.1 1.1-1.1.2 0 .4 0 .5.1z" fill="currentColor" stroke="none" />,
};

function SocialIcon({ name }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {Icon[name]}
    </svg>
  );
}

function OrangeLogo() {
  return (
    <svg className="orange-logo" viewBox="0 0 132 32" role="img" aria-label="Orange">
      <text x="0" y="26" fill="#ffffff" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="30" fontWeight="700" letterSpacing="-0.8">orange</text>
    </svg>
  );
}

function initial(name = "") {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function Row({ label, value, href }) {
  if (!value) return null;
  const Tag = href ? "a" : "div";
  const external = href && /^https?:/i.test(href);
  return (
    <Tag className="tap-row" {...(href ? { href, ...(external ? { target: "_blank", rel: "noreferrer" } : {}) } : {})}>
      <small>{label}</small>
      <span>{value}</span>
    </Tag>
  );
}

export default function CardFace({ card, id, url, interactive = true }) {
  const tel = (card.phone || "").replace(/[^\d+]/g, "");
  const org = [card.entity, card.direction].filter(Boolean).join(" · ");
  const socials = [
    { key: "whatsapp", label: "WhatsApp", href: whatsappUrl(card.whatsapp) },
    { key: "instagram", label: "Instagram", href: externalUrl(card.instagram) },
    { key: "facebook", label: "Facebook", href: externalUrl(card.facebook) },
    { key: "linkedin", label: "LinkedIn", href: externalUrl(card.linkedin) },
  ].filter((s) => s.href);

  if (!card.fullName) {
    return (
      <article className="tap-card tap-empty">
        <div className="tap-cover"><OrangeLogo /></div>
        <h2>Carte non configurée</h2>
        <p>Cette carte NFC n°{id} n'a pas encore d'informations.</p>
      </article>
    );
  }

  return (
    <article className="tap-card">
      <div className="tap-cover"><OrangeLogo /></div>
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
      {socials.length > 0 && (
        <div className="socials">
          {socials.map((s) => (
            interactive ? (
              <a key={s.key} className={`social-btn ${s.key}`} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}><SocialIcon name={s.key} /></a>
            ) : (
              <span key={s.key} className={`social-btn ${s.key}`} aria-label={s.label}><SocialIcon name={s.key} /></span>
            )
          ))}
        </div>
      )}
      {url ? (
        <div className="qr-block">
          <QrCode value={url} size={148} />
          <p className="qr-caption">Scanner pour ouvrir la carte</p>
        </div>
      ) : null}
    </article>
  );
}
