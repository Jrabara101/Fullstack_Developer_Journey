import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUtcTime(utcString: string): { utc: string; local: string; relative: string } {
  try {
    const d = new Date(utcString);
    if (isNaN(d.getTime())) return { utc: 'TBD', local: 'TBD', relative: 'Upcoming' };

    const utc = d.toUTCString().replace(':00 GMT', ' UTC');
    const local = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const diff = d.getTime() - Date.now();
    const diffHours = Math.round(diff / (1000 * 60 * 60));
    let relative = 'Today';
    if (diffHours > 24) relative = `In ${Math.ceil(diffHours / 24)} days`;
    else if (diffHours > 0) relative = `In ${diffHours}h`;
    else if (diffHours < 0 && diffHours > -5) relative = 'Recent';
    else if (diffHours <= -5) relative = 'Concluded';

    return { utc, local, relative };
  } catch {
    return { utc: 'TBD', local: 'TBD', relative: 'TBD' };
  }
}
