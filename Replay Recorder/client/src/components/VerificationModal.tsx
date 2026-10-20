import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Hash,
  Activity,
  Gauge
} from 'lucide-react';
import { VerificationReport, ReplayMetadata, ReplayPayload } from '../types/replay';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: ReplayMetadata;
  payload: ReplayPayload;
  onRunRemoteVerification: () => Promise<VerificationReport | null>;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  metadata,
  onRunRemoteVerification
}) => {
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const res = await onRunRemoteVerification();
      if (res) {
        setReport(res);
      }
    } catch (err) {
      console.error('Remote verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-2xl bg-[#0E1424] border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold tracking-tight">
                TOURNAMENT ANTI-TAMPER & DESYNC VERIFIER
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Server-Authoritative Deterministic Replay Adjudication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Trigger Banner */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-300">
              AUDIT TARGET: <span className="text-sky-300 font-mono">{metadata.gameTitle}</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              HASH: {metadata.checksum?.slice(0, 24) || 'Pending verification'}...
            </span>
          </div>

          <button
            onClick={handleVerify}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 active:scale-95 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'EXECUTING SIMULATION...' : 'RUN HEADLESS AUDIT'}</span>
          </button>
        </div>

        {/* Audit Results Section */}
        {report ? (
          <div className="flex flex-col gap-5">
            {/* Top Score & Trust Badge */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              report.isValid
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
            }`}>
              <div className="flex items-center gap-3">
                {report.isValid ? (
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-8 h-8 text-rose-400" />
                )}
                <div>
                  <h3 className="text-sm font-bold tracking-wide">
                    {report.isValid ? 'CANONICAL INTEGRITY CERTIFIED' : 'ANOMALY / DESYNC FLAGGED'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {report.isValid
                      ? 'Replay matched canonical headless physics simulation with zero coordinate deviations.'
                      : `${report.violations.length} critical physical integrity rule violations detected.`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end font-mono">
                <span className="text-2xl font-black">{report.score}/100</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">TRUST SCORE</span>
              </div>
            </div>

            {/* Diagnostic Checks Breakdown */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Deterministic Sub-System Checks
              </h4>
              <div className="space-y-2">
                {report.checks.map((chk, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      {chk.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold text-slate-200 block">{chk.name}</span>
                        <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                          {chk.details}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider shrink-0 ${
                        chk.passed
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                      }`}
                    >
                      {chk.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Telemetry Metrics Panel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-mono text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  <span>INPUT RATE</span>
                </div>
                <span className="text-base font-bold text-slate-100">
                  {report.metrics.averageInputRateHz} Hz
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>PEAK VELOCITY</span>
                </div>
                <span className="text-base font-bold text-slate-100">
                  {report.metrics.maxObservedVelocity} px/s
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Cpu className="w-3.5 h-3.5 text-violet-400" />
                  <span>DESYNC FRAMES</span>
                </div>
                <span className="text-base font-bold text-slate-100">
                  {report.metrics.desyncFrameCount}
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Hash className="w-3.5 h-3.5 text-emerald-400" />
                  <span>MAX DEVIATION</span>
                </div>
                <span className="text-base font-bold text-slate-100">
                  {report.metrics.maxPositionalDeviation} px
                </span>
              </div>
            </div>

            {/* Violations Callout if Any */}
            {report.violations.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs flex flex-col gap-2">
                <span className="font-bold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Detected Integrity Infractions:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-[11px]">
                  {report.violations.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs text-center border border-dashed border-slate-800 rounded-xl p-6">
            <Cpu className="w-8 h-8 mb-2 text-slate-600 opacity-60" />
            <span>Click &quot;Run Headless Audit&quot; to execute deterministic physics validation against the Fastify backend engine.</span>
          </div>
        )}
      </div>
    </div>
  );
};
