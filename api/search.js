
const ALLOWED_HOSTS = new Set([
  "alight.link",
  "www.alight.link",
  "alightmotion.com",
  "www.alightmotion.com"
]);

function isTikTokUrl(value) {
  try {
    const url = new URL(value);
    return [
      "tiktok.com",
      "www.tiktok.com",
      "m.tiktok.com",
      "vm.tiktok.com",
      "vt.tiktok.com"
    ].includes(url.hostname);
  } catch {
    return false;
  }
}

function extractPresetLinks(text) {
  const matches = String(text || "").match(/https?:\/\/[^\s<>"'`]+/gi) || [];

  return matches
    .map(url => url.replace(/[),.!?]+$/, ""))
    .filter(value => {
      try {
        return ALLOWED_HOSTS.has(new URL(value).hostname.toLowerCase());
      } catch {
        return false;
      }
    });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const videoUrl = req.body?.url;

  if (typeof videoUrl !== "string" || !isTikTokUrl(videoUrl)) {
    return res.status(400).json({ error: "URL TikTok tidak valid" });
  }

  const providerUrl = process.env.TIKTOK_COMMENTS_API_URL;
  const apiKey = process.env.TIKTOK_COMMENTS_API_KEY;

  if (!providerUrl || !apiKey) {
    return res.status(503).json({
      error: "API komentar belum dikonfigurasi"
    });
  }

  try {
    const endpoint = new URL(providerUrl);
    endpoint.searchParams.set("url", videoUrl);

    const response = await fetch(endpoint, {
      headers: {
        "x-api-key": apiKey,
        "Accept": "application/json"
      },
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
      return res.status(502).json({
        error: "API provider gagal merespons"
      });
    }

    const data = await response.json();

    if (!Array.isArray(data.comments)) {
      return res.status(502).json({
        error: "Format data komentar tidak valid"
      });
    }

    const results = new Map();

    for (const comment of data.comments) {
      const text = typeof comment === "string"
        ? comment
        : comment?.text;

      if (!text) continue;

      for (const link of extractPresetLinks(text)) {
        if (!results.has(link)) {
          results.set(link, {
            url: link,
            author: comment?.author || ""
          });
        }
      }
    }

    return res.status(200).json({
      commentsScanned: data.comments.length,
      results: [...results.values()]
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Gagal mengambil komentar"
    });
  }
};

