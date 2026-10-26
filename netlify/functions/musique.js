export default async (req) => {
  const entetes = { "Content-Type": "application/json" };

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Méthode non autorisée" }), { status: 405, headers: entetes });
  }

  try {
    const jeton =
      Netlify.env.get("HF_TOKEN") ||
      Netlify.env.get("HUGGINGFACE_TOKEN") ||
      Netlify.env.get("HF_API_KEY");
    if (!jeton) {
      return new Response(JSON.stringify({ error: "Jeton Hugging Face manquant dans Netlify" }), { status: 500, headers: entetes });
    }

    let donnees = {};
    try {
      donnees = await req.json();
    } catch (e) {}
    const prompt = donnees.prompt || "afrobeat, epic, drums, bass";

    const url = "https://router.huggingface.co/hf-inference/models/facebook/musicgen-small";

    let res;
    for (let i = 0; i < 3; i++) {
      res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + jeton,
          "Content-Type": "application/json",
          Accept: "audio/flac",
        },
        body: JSON.stringify({ inputs: prompt }),
      });
      if (res.status !== 503) break;
      await new Promise((r) => setTimeout(r, 8000));
    }

    if (!res.ok) {
      const txt = await res.text();
      return new Response(JSON.stringify({ error: "HF " + res.status + ": " + txt.slice(0, 300) }), { status: res.status, headers: entetes });
    }

    const type = res.headers.get("content-type") || "audio/flac";
    const buf = Buffer.from(await res.arrayBuffer());
    return new Response(JSON.stringify({ audio: buf.toString("base64"), type }), { status: 200, headers: entetes });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: entetes });
  }
};
