import { useState } from 'react';
import { useEngineStore } from '../../store/engineStore';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CLOCKWORK_OBSERVATORY } from '../../data/clockworkObservatory';
import { WHISPERING_CRYPT } from '../../data/whisperingCrypt';
import {
  encodeCartridgeToUrlHash,
  exportStandalonePlayableHtml,
} from '../../lib/urlSeed';
import {
  BookOpen,
  Download,
  Upload,
  Link,
  FileCode,
  Check,
  Compass,
  Play,
  RotateCcw,
} from 'lucide-react';
import { sound } from '../../lib/audio';

export function CartridgeModal() {
  const {
    isCartridgeModalOpen,
    setCartridgeModalOpen,
    cartridge,
    loadCartridge,
    updateCartridgeMeta,
  } = useEngineStore();

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [cartridgeTitle, setCartridgeTitle] = useState(cartridge.title);
  const [cartridgeAuthor, setCartridgeAuthor] = useState(cartridge.author);
  const [cartridgeSynopsis, setCartridgeSynopsis] = useState(cartridge.synopsis);

  const handleCopyUrlSeed = () => {
    const hash = encodeCartridgeToUrlHash(cartridge);
    const fullUrl = `${window.location.origin}${window.location.pathname}${hash}`;

    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedUrl(true);
      sound.playPickup();
      setTimeout(() => setCopiedUrl(false), 2500);
    });
  };

  const handleDownloadJson = () => {
    sound.playPickup();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cartridge, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${cartridge.id || 'story'}.cartridge.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadHtml = () => {
    sound.playPickup();
    const htmlContent = exportStandalonePlayableHtml(cartridge);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `${cartridge.id || 'story'}.html`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.id && parsed.rooms && parsed.startingRoomId) {
            loadCartridge(parsed);
            sound.playDiscoveryChime();
            setCartridgeModalOpen(false);
          } else {
            alert('Invalid Story Cartridge format. Missing required rooms or startingRoomId.');
          }
        } catch {
          alert('Failed to parse JSON file.');
        }
      };
    }
  };

  const handleSaveMeta = () => {
    updateCartridgeMeta({
      title: cartridgeTitle,
      author: cartridgeAuthor,
      synopsis: cartridgeSynopsis,
    });
    sound.playParchmentTap();
  };

  return (
    <Dialog
      open={isCartridgeModalOpen}
      onOpenChange={setCartridgeModalOpen}
      maxWidth="2xl"
      title="Story Cartridge Hub & Seed Exporter"
      description="Load pre-built story cartridges, export portable JSON files, standalone HTML bundles, or compressed shareable URL seeds."
    >
      <div className="space-y-6 pt-2 font-sans text-xs">
        {/* 1. Pre-loaded Story Cartridges */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Pre-Loaded Story Cartridges</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Demo 1: Clockwork Observatory */}
            <div
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                cartridge.id === CLOCKWORK_OBSERVATORY.id
                  ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-elevated/70 border-subtle-border hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-bold text-prose-display text-sm">
                    {CLOCKWORK_OBSERVATORY.title}
                  </h5>
                  <Badge variant="amber">6 Chambers</Badge>
                </div>
                <p className="text-prose-muted text-[11px] line-clamp-2 mb-2">
                  {CLOCKWORK_OBSERVATORY.synopsis}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-subtle-border/60">
                <span className="text-[10px] text-slate-500">
                  By {CLOCKWORK_OBSERVATORY.author}
                </span>
                <Button
                  size="sm"
                  variant={cartridge.id === CLOCKWORK_OBSERVATORY.id ? 'amber' : 'outline'}
                  onClick={() => {
                    loadCartridge(CLOCKWORK_OBSERVATORY);
                    setCartridgeModalOpen(false);
                  }}
                  className="h-7 text-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{cartridge.id === CLOCKWORK_OBSERVATORY.id ? 'Active Story' : 'Load Demo'}</span>
                </Button>
              </div>
            </div>

            {/* Demo 2: Whispering Crypt */}
            <div
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                cartridge.id === WHISPERING_CRYPT.id
                  ? 'bg-purple-950/30 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                  : 'bg-elevated/70 border-subtle-border hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-bold text-prose-display text-sm">
                    {WHISPERING_CRYPT.title}
                  </h5>
                  <Badge variant="purple">4 Chambers</Badge>
                </div>
                <p className="text-prose-muted text-[11px] line-clamp-2 mb-2">
                  {WHISPERING_CRYPT.synopsis}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-subtle-border/60">
                <span className="text-[10px] text-slate-500">
                  By {WHISPERING_CRYPT.author}
                </span>
                <Button
                  size="sm"
                  variant={cartridge.id === WHISPERING_CRYPT.id ? 'amber' : 'outline'}
                  onClick={() => {
                    loadCartridge(WHISPERING_CRYPT);
                    setCartridgeModalOpen(false);
                  }}
                  className="h-7 text-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{cartridge.id === WHISPERING_CRYPT.id ? 'Active Story' : 'Load Demo'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Active Cartridge Metadata Edit */}
        <div className="p-3.5 rounded-xl bg-void/50 border border-subtle-border space-y-3">
          <h4 className="font-bold text-sky-300 uppercase tracking-wider text-[11px]">
            Edit Active Cartridge Metadata
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                Story Title
              </label>
              <input
                type="text"
                value={cartridgeTitle}
                onChange={(e) => setCartridgeTitle(e.target.value)}
                onBlur={handleSaveMeta}
                className="w-full bg-elevated border border-subtle-border rounded px-2.5 py-1 text-xs text-prose-main font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                Author
              </label>
              <input
                type="text"
                value={cartridgeAuthor}
                onChange={(e) => setCartridgeAuthor(e.target.value)}
                onBlur={handleSaveMeta}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
              Synopsis & Lore
            </label>
            <textarea
              rows={2}
              value={cartridgeSynopsis}
              onChange={(e) => setCartridgeSynopsis(e.target.value)}
              onBlur={handleSaveMeta}
              className="w-full bg-elevated border border-subtle-border rounded p-2 text-xs text-slate-300 resize-none"
            />
          </div>
        </div>

        {/* 3. Export & Share Tools */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
            Export & Share Options
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Share URL */}
            <Button
              variant="outline"
              onClick={handleCopyUrlSeed}
              className="flex items-center justify-center gap-2 h-10 text-xs w-full"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Link className="w-4 h-4 text-sky-400" />}
              <span>{copiedUrl ? 'Seed Copied!' : 'Copy URL Hash'}</span>
            </Button>

            {/* Export JSON */}
            <Button
              variant="outline"
              onClick={handleDownloadJson}
              className="flex items-center justify-center gap-2 h-10 text-xs w-full"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export .JSON</span>
            </Button>

            {/* Standalone HTML */}
            <Button
              variant="outline"
              onClick={handleDownloadHtml}
              className="flex items-center justify-center gap-2 h-10 text-xs w-full"
            >
              <FileCode className="w-4 h-4 text-purple-400" />
              <span>Standalone HTML</span>
            </Button>
          </div>

          {/* Import JSON File Input */}
          <div className="pt-2 border-t border-subtle-border/60 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Import custom story cartridge from your computer:
            </span>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-elevated border border-subtle-border text-xs text-prose-main hover:bg-slate-700 transition-colors">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Upload .json</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
