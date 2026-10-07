import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import type { SaveMetadata } from '../../types/save';
import { sfx } from '../../sounds/sfx';
import {
  QrCode,
  Copy,
  Check,
  Upload,
  FileText,
  AlertCircle,
  Smartphone,
  ShieldCheck
} from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSlotId: string | null;
  slots: Record<string, SaveMetadata>;
  onExportCapsuleString: (slotId: string) => Promise<string>;
  onImportCapsuleString: (capsuleStr: string) => Promise<string>;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  activeSlotId,
  slots,
  onExportCapsuleString,
  onImportCapsuleString
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [selectedSlotId, setSelectedSlotId] = useState<string>(activeSlotId || Object.keys(slots)[0] || 'quicksave_0');
  const [capsuleString, setCapsuleString] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [importInput, setImportInput] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate capsule string & QR code when selectedSlotId changes
  useEffect(() => {
    if (!isOpen) return;

    if (selectedSlotId) {
      onExportCapsuleString(selectedSlotId)
        .then(async (capStr) => {
          setCapsuleString(capStr);

          // Generate QR Code data URL
          // If capsule is large, create a compact QR containing slot summary & short token or chunk
          const qrPayload = capStr.length > 2000 ? capStr.slice(0, 1800) : capStr;
          try {
            const qrUrl = await QRCode.toDataURL(qrPayload, {
              width: 240,
              margin: 1,
              color: {
                dark: '#38BDF8',
                light: '#07090E'
              }
            });
            setQrDataUrl(qrUrl);
          } catch (qrErr) {
            console.warn('QR code generation error:', qrErr);
          }
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [isOpen, selectedSlotId, onExportCapsuleString]);

  const handleCopy = async () => {
    if (!capsuleString) return;
    await navigator.clipboard.writeText(capsuleString);
    setCopied(true);
    sfx.playSyncSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportSubmit = async () => {
    setImportError(null);
    setImportSuccess(null);
    if (!importInput.trim()) {
      setImportError('Please provide a valid encrypted save capsule string.');
      sfx.playAlert();
      return;
    }

    try {
      const importedSlotId = await onImportCapsuleString(importInput.trim());
      setImportSuccess(`Successfully hydrated checkpoint into slot: [${importedSlotId}]!`);
      sfx.playSyncSuccess();
      setImportInput('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setImportError(err.message || 'Malformed capsule string.');
      sfx.playAlert();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        const importedId = await onImportCapsuleString(content);
        setImportSuccess(`File [${file.name}] successfully imported as [${importedId}]!`);
        sfx.playSyncSuccess();
        setTimeout(() => onClose(), 1500);
      } catch (err: any) {
        setImportError(err.message || 'File contents could not be verified.');
        sfx.playAlert();
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="CROSS-DEVICE SAVE CAPSULE & PORTABILITY"
      description="Transfer your game profile across desktop, handhelds, and mobile without account registration."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Tab Toggle: Export vs Import */}
        <div className="flex items-center gap-2 p-1 bg-[#07090E] rounded-lg border border-slate-800">
          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('export');
            }}
            className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode size={14} />
            <span>Generate Capsule & QR</span>
          </button>
          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('import');
            }}
            className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'import'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload size={14} />
            <span>Hydrate / Import Capsule</span>
          </button>
        </div>

        {/* Tab: Export */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            {/* Slot Selector */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-mono text-slate-400 whitespace-nowrap">
                SELECT CARTRIDGE:
              </label>
              <select
                value={selectedSlotId}
                onChange={(e) => setSelectedSlotId(e.target.value)}
                className="w-full bg-[#07090E] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
              >
                {Object.values(slots).map((slot) => (
                  <option key={slot.slotId} value={slot.slotId}>
                    {slot.slotId.toUpperCase()} — {slot.title} (LVL {slot.summary.level})
                  </option>
                ))}
              </select>
            </div>

            {/* QR Code and Device Portability */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#07090E] border border-slate-800 rounded-xl p-4">
              <div className="sm:col-span-5 flex flex-col items-center justify-center">
                {qrDataUrl ? (
                  <div className="p-2 bg-black rounded-lg border border-cyan-500/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                    <img src={qrDataUrl} alt="Save Capsule QR Code" className="w-36 h-36" />
                  </div>
                ) : (
                  <div className="w-36 h-36 bg-black flex items-center justify-center text-slate-600 font-mono text-xs border border-slate-800 rounded-lg">
                    Generating...
                  </div>
                )}
                <span className="text-[10px] font-mono text-cyan-400 mt-2 flex items-center gap-1">
                  <Smartphone size={12} />
                  SCAN WITH MOBILE CAMERA
                </span>
              </div>

              <div className="sm:col-span-7 space-y-2.5 font-mono text-xs">
                <div className="text-white font-bold flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>ENCRYPTED RECOVERY STRING</span>
                </div>
                <p className="text-slate-400 text-[11px] font-sans">
                  The Save Capsule packages your world state, inventory, and quest journal with an SHA-256 verification signature.
                </p>

                <div className="relative">
                  <textarea
                    readOnly
                    value={capsuleString}
                    rows={3}
                    className="w-full bg-black/80 border border-slate-800 rounded p-2 text-[10px] font-mono text-cyan-300 resize-none focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="cyan"
                    size="sm"
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY CAPSULE STRING'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Import */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                <FileText size={14} className="text-cyan-400" />
                <span>PASTE CAPSULE STRING (CRYO_CAPSULE_V1...)</span>
              </label>
              <textarea
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder="CRYO_CAPSULE_V1.f8a2b3... or paste raw .sav JSON"
                rows={4}
                className="w-full bg-[#07090E] border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Drag & Drop File Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-xl bg-[#07090E]/60 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-400 hover:text-white"
            >
              <Upload size={24} className="text-cyan-400 mb-2" />
              <span className="text-xs font-mono font-semibold">
                OR DROP YOUR .SAV FILE HERE
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-1">
                JSON or Base64 game saves validated automatically
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".sav,.json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Error or Success Feedback */}
            {importError && (
              <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg flex items-center gap-2 text-xs font-mono text-red-300">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <span>{importError}</span>
              </div>
            )}
            {importSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-lg flex items-center gap-2 text-xs font-mono text-emerald-300">
                <Check size={16} className="text-emerald-400 shrink-0" />
                <span>{importSuccess}</span>
              </div>
            )}

            <Button
              variant="cyan"
              size="md"
              onClick={handleImportSubmit}
              className="w-full py-2.5 font-bold"
            >
              VALIDATE & HYDRATE INTO VAULT
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
};
