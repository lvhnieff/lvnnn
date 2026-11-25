const form = document.querySelector("#search-form");
const input = document.querySelector("#video-url");
const button = document.querySelector("#search-button");
const statusBox = document.querySelector("#status");
const resultsSection = document.querySelector("#results-section");
const resultsBox = document.querySelector("#results");
const countBox = document.querySelector("#result-count");
const copyAllButton = document.querySelector("#copy-all");
let foundLinks = [];

document.querySelector("#year").textContent = new Date().getFullYear();

function setStatus(message, type = "") {
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
}
function validTikTokUrl(value) {
  try {
    const url = new URL(value);
    return ["tiktok.com", "www.tiktok.com", "m.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"].includes(url.hostname);
  } catch { return false; }
}
function escapeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    setStatus("Link berhasil disalin.", "success");
  } catch {
    setStatus("Tidak bisa menyalin otomatis. Salin link secara manual.", "error");
  }
}
function renderResults(items) {
  foundLinks = items;
  resultsBox.innerHTML = "";
  countBox.textContent = items.length;
  resultsSection.hidden = false;
  if (!items.length) {
    resultsBox.innerHTML = '<div class="empty">Belum ada link preset yang ditemukan pada komentar yang berhasil diambil.</div>';
    return;
  }
  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "result-card";
    const safeUrl = escapeText(item.url);
    card.innerHTML = `
      <div class="result-main">
        <div class="result-author">${escapeText(item.author || "Komentar TikTok")} · ${index + 1}</div>
        <a class="result-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>
      </div>
      <div class="result-actions">
        <button type="button" class="copy-button">Salin</button>
        <button type="button" class="open-button">Buka preset ↗</button>
      </div>`;
    card.querySelector(".copy-button").addEventListener("click", () => copyText(item.url));
    card.querySelector(".open-button").addEventListener("click", () => window.open(item.url, "_blank", "noopener,noreferrer"));
    resultsBox.appendChild(card);
  });
}
form.addEventListener("submit", async event => {
  event.preventDefault();
  const url = input.value.trim();
  if (!validTikTokUrl(url)) {
    setStatus("Masukkan URL video TikTok yang valid.", "error");
    input.focus();
    return;
  }
  button.disabled = true;
  button.classList.add("loading");
  resultsSection.hidden = true;
  setStatus("Sedang memeriksa komentar dan menyaring link preset…");
  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({url})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Pencarian gagal (${response.status}).`);
    renderResults(data.results || []);
    setStatus(`Selesai. ${data.commentsScanned ?? 0} komentar diperiksa.`, "success");
  } catch (error) {
    setStatus(error.message || "Terjadi kesalahan saat mencari komentar.", "error");
  } finally {
    button.disabled = false;
    button.classList.remove("loading");
  }
});
copyAllButton.addEventListener("click", () => {
  if (!foundLinks.length) return;
  copyText(foundLinks.map(item => item.url).join("\n"));
});
