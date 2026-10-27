import { StoryCartridge } from '../types/engine';

// Compresses and encodes a StoryCartridge into a URL hash string
export function encodeCartridgeToUrlHash(cartridge: StoryCartridge): string {
  try {
    const jsonStr = JSON.stringify(cartridge);
    // Base64 encoding with UTF-8 support
    const encoded = btoa(
      encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
    return `#story=${encoded}`;
  } catch (err) {
    console.error('Failed to encode story cartridge:', err);
    return '';
  }
}

// Decodes a StoryCartridge from a URL hash string
export function decodeCartridgeFromUrlHash(hash: string): StoryCartridge | null {
  try {
    if (!hash || !hash.includes('#story=')) return null;
    const b64 = hash.replace(/^#story=/, '');
    const decodedUri = decodeURIComponent(
      Array.prototype.map
        .call(atob(b64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const cartridge = JSON.parse(decodedUri) as StoryCartridge;
    if (cartridge && cartridge.id && cartridge.startingRoomId && cartridge.rooms) {
      return cartridge;
    }
    return null;
  } catch (err) {
    console.error('Failed to decode story cartridge from URL hash:', err);
    return null;
  }
}

// Generates a standalone, self-contained playable HTML bundle containing the cartridge
export function exportStandalonePlayableHtml(cartridge: StoryCartridge): string {
  const cartridgeJson = JSON.stringify(cartridge, null, 2);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cartridge.title} — Text Adventure</title>
  <style>
    body {
      background: #080A0F;
      color: #E2E8F0;
      font-family: 'Newsreader', Georgia, serif;
      margin: 0;
      padding: 24px;
      line-height: 1.8;
      display: flex;
      justify-content: center;
    }
    .container {
      max-width: 760px;
      width: 100%;
    }
    h1 {
      color: #F59E0B;
      font-family: sans-serif;
      border-bottom: 1px solid #232D42;
      padding-bottom: 12px;
    }
    .synopsis {
      font-style: italic;
      color: #94A3B8;
      margin-bottom: 24px;
    }
    .badge {
      background: #141A29;
      color: #38BDF8;
      padding: 4px 10px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 13px;
    }
    .cartridge-box {
      background: #0E121B;
      border: 1px solid #232D42;
      border-radius: 8px;
      padding: 20px;
      margin-top: 24px;
    }
    button {
      background: #F59E0B;
      color: #080A0F;
      border: none;
      padding: 10px 20px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
    }
    button:hover { background: #FBBF24; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${cartridge.title}</h1>
    <div class="synopsis">By ${cartridge.author} • Version ${cartridge.version}</div>
    <p>${cartridge.synopsis}</p>
    <div class="cartridge-box">
      <h3>Standalone Story Cartridge</h3>
      <p>This adventure was exported from the <strong>Text Adventure Engine Studio</strong>. To play with the complete interactive parser, auto-cartographer radar, and sound engine, open it in the full studio.</p>
      <button onclick="downloadJson()">Download Story Cartridge (.json)</button>
    </div>
  </div>
  <script>
    const CARTRIDGE_DATA = ${cartridgeJson};
    function downloadJson() {
      const blob = new Blob([JSON.stringify(CARTRIDGE_DATA, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '${cartridge.id}.cartridge.json';
      a.click();
    }
  </script>
</body>
</html>`;
}
