export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Méthode non autorisée", { status: 405 });
  }

  let donnees;
  try {
    donnees = await req.json();
  } catch {
    return new Response("Requête invalide", { status: 400 });
  }

  const { prompt, secondes = 30, code } = donnees;

  if (!code || code !== Netlify.env.get("ACCESS_CODE")) {
    return new Response("Code d'accès invalide", { status: 401 });
  }
  if (!prompt || typeof prompt !== "string" || prompt.length > 1000) {
    return new Response("Description manquante ou trop longue", { status: 400 });
  }

  const duree = Math.min(Math.max(Number(secondes) || 30, 10), 60);

  const reponse = await fetch("https://api.elevenlabs.io/v1/music", {
    method: "POST",
    headers: {
      "xi-api-key": Netlify.env.get("ELEVENLABS_API_KEY"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, music_length_ms: duree * 1000 }),
  });

  if (!reponse.ok) {
    return new Response("Le service audio a refusé la demande", { status: 502 });
  }

  return new Response(reponse.body, {
    headers: { "Content-Type": "audio/mpeg" },
  });
};

export const config = { path: "/api/musique" };
