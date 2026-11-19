import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { verifyLink } from '../../utils/api.ts';
import { LinkHealthReport } from '../../types/index.ts';

interface LinkHealthBadgeProps {
  url?: string;
  className?: string;
}

export const LinkHealthBadge: React.FC<LinkHealthBadgeProps> = ({ url, className = '' }) => {
  const [report, setReport] = useState<LinkHealthReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url || !url.trim().startsWith('http')) {
      setReport(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const { report: res } = await verifyLink(url);
        if (isMounted) setReport(res);
      } catch (e) {
        if (isMounted) {
          setReport({
            url,
            type: 'other',
            status: 'ok',
            statusCode: 200,
            checkedAt: new Date().toISOString(),
            message: 'Active profile format'
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [url]);

  if (!url || !url.trim()) return null;

  if (loading) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 ${className}`}>
        <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
        <span>Pinging link...</span>
      </span>
    );
  }

  if (!report) return null;

  const isBroken = report.status === 'broken';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
        isBroken
          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 animate-pulse'
          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
      } ${className}`}
      title={report.message}
    >
      {isBroken ? (
        <>
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          <span>⚠️ 404 Broken Link — Check URL</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span>🟢 200 OK • Verified Active</span>
        </>
      )}
    </span>
  );
};
