const court = (v, max) => String(v || "").slice(0, max);

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Méthode non autorisée", { status: 405 });
  }

  let d;
  try {
    d = await req.json();
  } catch {
    return new Response("Requête invalide", { status: 400 });
  }

  if (!d.code || d.code !== Netlify.env.get("ACCESS_CODE")) {
    return new Response("Code d'accès invalide", { status: 401 });
  }

  const nom = court(d.nom, 80);
  if (!nom) return new Response("Le nom est obligatoire", { status: 400 });

  const consigne =
    `Tu es parolier et directeur artistique. Écris une chanson courte (refrain et 2 couplets) en ${court(d.langue, 60)}, ` +
    `style ${court(d.style, 40)}, pour ${nom}. Occasion : ${court(d.occasion, 60)}. ` +
    `Détails : ${court(d.details, 400) || "aucun"}. ` +
    `Si l'occasion est une publicité, le ton est celui d'un jingle accrocheur qui cite le nom et les détails. ` +
    `Réponds uniquement avec un objet JSON de la forme ` +
    `{"paroles":"...","style_musical":"description en anglais du style, du tempo, des instruments et de l'ambiance, sans nom d'artiste ni titre de chanson","voix":"description en anglais de la voix et de l'énergie"}.`;

  const reponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": Netlify.env.get("ANTHROPIC_API_KEY"),
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5-5",
      max_tokens: 1000,
      messages: [{ role: "user", content: consigne }],
    }),
  });

  if (!reponse.ok) {
    return new Response("Le service de paroles a refusé la demande", { status: 502 });
  }

  try {
    const data = await reponse.json();
    const texte = data.content.map((b) => b.text || "").join("");
    const json = JSON.parse(texte.replace(/```json|```/g, "").trim());
    return Response.json({
      paroles: json.paroles,
      style_musical: json.style_musical,
      voix: json.voix,
    });
  } catch {
    return new Response("Réponse illisible, réessaie", { status: 502 });
  }
};

export const config = { path: "/api/paroles" };
