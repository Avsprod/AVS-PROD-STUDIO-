exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Méthode non autorisée" };
  }
  try {
    const { prompt } = JSON.parse(event.body || "{}");
    if (!prompt || prompt.length > 300) {
      return { statusCode: 400, body: JSON.stringify({ error: "Description invalide" }) };
    }
    const res = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-small",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "audio/flac",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );
    if (!res.ok) {
      const txt = await res.text();
      return { statusCode: res.status, body: JSON.stringify({ error: txt }) };
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio: buffer.toString("base64"), type: "audio/flac" }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
