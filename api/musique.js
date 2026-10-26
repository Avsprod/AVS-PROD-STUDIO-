module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }
  try {
    const jeton = process.env.HF_TOKEN;
    if (!jeton) {
      return res.status(500).json({ error: "HF_TOKEN manquant dans Vercel" });
    }
    const prompt = (req.body && req.body.prompt) || "afrobeat, epic, drums, bass";
    const url = "https://router.huggingface.co/hf-inference/models/facebook/musicgen-small";

    let rep;
    for (let i = 0; i < 3; i++) {
      rep = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + jeton,
          "Content-Type": "application/json",
          Accept: "audio/flac",
        },
        body: JSON.stringify({ inputs: prompt }),
      });
      if (rep.status !== 503) break;
      await new Promise((r) => setTimeout(r, 8000));
    }

    if (!rep.ok) {
      const txt = await rep.text();
      return res.status(rep.status).json({ error: "HF " + rep.status + ": " + txt.slice(0, 300) });
    }

    const type = rep.headers.get("content-type") || "audio/flac";
    const buf = Buffer.from(await rep.arrayBuffer());
    return res.status(200).json({ audio: buf.toString("base64"), type });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
};
