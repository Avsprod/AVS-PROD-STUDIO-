(function () {
  function valeur(label) {
    var els = document.querySelectorAll("*");
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.children.length === 0 && e.textContent.trim() === label) {
        var n = e.nextElementSibling;
        if (n) return n.textContent.trim();
      }
    }
    return "";
  }

  var STYLES = {
    "Afro": "afrobeat", "Afrobeat": "afrobeat", "Zouglou": "zouglou african",
    "Zouk": "zouk", "Amapiano": "amapiano"
  };
  var AMBIANCES = {
    "Épique": "epic, powerful, cinematic", "Joyeuse": "joyful, happy",
    "Calme": "calm, soft", "Romantique": "romantic, smooth"
  };
  var VITESSES = {
    "Lente": "slow tempo", "Normale": "medium tempo", "Rapide": "fast tempo"
  };

  function construirePrompt() {
    var style = valeur("Style"), amb = valeur("Ambiance"), vit = valeur("Vitesse");
    return [
      STYLES[style] || style || "afrobeat",
      AMBIANCES[amb] || amb || "joyful",
      VITESSES[vit] || "medium tempo",
      "african percussion, drums, bass, celebration"
    ].join(", ");
  }

  function boutonCreer() {
    var b = document.querySelectorAll("button, a");
    for (var i = 0; i < b.length; i++) {
      if (/Créer ma/i.test(b[i].textContent)) return b[i];
    }
    return null;
  }

  function cacheAncienMessage() {
    var els = document.querySelectorAll("p, div, span");
    els.forEach(function (e) {
      if (/moteur de chanson n.est pas encore/i.test(e.textContent) && e.children.length === 0) {
        e.style.display = "none";
      }
    });
  }

  function base64VersBlob(b64, type) {
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: type || "audio/flac" });
  }

  async function generer(bouton) {
    var zone = document.getElementById("zone-resultat");
    if (!zone) {
      zone = document.createElement("div");
      zone.id = "zone-resultat";
      zone.style.cssText = "margin:16px;text-align:center;font-size:16px;color:#333";
      bouton.parentNode.insertBefore(zone, bouton);
    }
    var ancienTexte = bouton.textContent;
    bouton.textContent = "Création en cours…";
    bouton.style.pointerEvents = "none";
    zone.textContent = "Patiente 30 à 60 secondes…";
    try {
      var res = await fetch("/.netlify/functions/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: construirePrompt() })
      });
      var data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Erreur " + res.status);
      var url = URL.createObjectURL(base64VersBlob(data.audio, data.type));
      zone.innerHTML = "";
      var audio = document.createElement("audio");
      audio.controls = true; audio.src = url; audio.style.width = "100%";
      var dl = document.createElement("a");
      dl.href = url; dl.download = "chanson-avs-prod.flac";
      dl.textContent = "Télécharger"; dl.style.cssText = "display:block;margin-top:8px;font-weight:bold";
      zone.appendChild(audio); zone.appendChild(dl);
      audio.play();
    } catch (e) {
      zone.textContent = "Erreur : " + e.message;
    }
    bouton.textContent = ancienTexte;
    bouton.style.pointerEvents = "";
  }

  document.addEventListener("click", function (ev) {
    var b = boutonCreer();
    if (b && (ev.target === b || b.contains(ev.target))) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      generer(b);
    }
  }, true);

  setInterval(cacheAncienMessage, 1000);
})();
