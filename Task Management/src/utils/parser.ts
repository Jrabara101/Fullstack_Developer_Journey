import type { Priority, EnergyLevel, ParsedTaskTokens } from '../types';

export function parseNaturalLanguageInput(rawInput: string): ParsedTaskTokens {
  let text = rawInput.trim();
  const tags: string[] = [];
  let priority: Priority | undefined;
  let dueDate: string | undefined;
  let dueTime: string | undefined;
  let scheduledDate: string | undefined;
  let estimatedMinutes: number | undefined;
  let energy: EnergyLevel | undefined;
  let projectHint: string | undefined;

  // 1. Extract Tags: #tagname
  const tagMatches = text.match(/#([\w-]+)/g);
  if (tagMatches) {
    tagMatches.forEach((t) => {
      const tag = t.replace('#', '').toLowerCase();
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
      text = text.replace(t, '');
    });
  }

  // 2. Extract Project Hint: +projectname
  const projectMatch = text.match(/\+([\w-]+)/);
  if (projectMatch) {
    projectHint = projectMatch[1];
    text = text.replace(projectMatch[0], '');
  }

  // 3. Extract Energy Level: @deepwork, @deep, @quickhit, @quick, @lowenergy, @admin
  const energyMatch = text.match(/@(deepwork|deep|quickhit|quick|lowenergy|admin|low)/i);
  if (energyMatch) {
    const val = energyMatch[1].toLowerCase();
    if (val === 'deepwork' || val === 'deep') {
      energy = 'deep_work';
    } else if (val === 'quickhit' || val === 'quick') {
      energy = 'quick_hit';
    } else if (val === 'lowenergy' || val === 'admin' || val === 'low') {
      energy = 'low_energy';
    }
    text = text.replace(energyMatch[0], '');
  }

  // 4. Extract Estimated Duration: ~45m, ~1h, ~1.5h, ~30min
  const durationMatch = text.match(/~(\d+(\.\d+)?)(m|min|h|hr|hours)?/i);
  if (durationMatch) {
    const num = parseFloat(durationMatch[1]);
    const unit = (durationMatch[3] || 'm').toLowerCase();
    if (unit.startsWith('h')) {
      estimatedMinutes = Math.round(num * 60);
    } else {
      estimatedMinutes = Math.round(num);
    }
    text = text.replace(durationMatch[0], '');
  }

  // 5. Extract Priority: p1, p2, p3, p4, !p1, !p2, !p3, !p4, !urgent, !high, !medium, !low
  const priorityMatch = text.match(/\b(!p[1-4]|p[1-4]|!urgent|!crucial|!high|!medium|!low)\b/i);
  if (priorityMatch) {
    const rawP = priorityMatch[1].toLowerCase().replace('!', '');
    if (rawP === 'p1' || rawP === 'urgent' || rawP === 'crucial') priority = 'p1';
    else if (rawP === 'p2' || rawP === 'high') priority = 'p2';
    else if (rawP === 'p3' || rawP === 'medium') priority = 'p3';
    else if (rawP === 'p4' || rawP === 'low') priority = 'p4';
    text = text.replace(priorityMatch[0], '');
  }

  // 6. Extract Time: 3pm, 3:30pm, 15:00, 9am, 10:45am
  const timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridiem = timeMatch[3].toLowerCase();
    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    dueTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    text = text.replace(timeMatch[0], '');
  } else {
    // 24hr format like 14:30
    const time24Match = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    if (time24Match) {
      dueTime = time24Match[0];
      text = text.replace(time24Match[0], '');
    }
  }

  // 7. Extract Date Keywords: today, tomorrow, tonight, next week, monday...sunday
  const today = new Date();
  const formatISO = (d: Date) => d.toISOString().split('T')[0];

  const dateKeywordsMatch = text.match(/\b(today|tonight|tomorrow|next week|this weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
  if (dateKeywordsMatch) {
    const kw = dateKeywordsMatch[1].toLowerCase();
    const target = new Date(today);

    if (kw === 'today' || kw === 'tonight') {
      dueDate = formatISO(today);
      scheduledDate = formatISO(today);
    } else if (kw === 'tomorrow') {
      target.setDate(today.getDate() + 1);
      dueDate = formatISO(target);
      scheduledDate = formatISO(target);
    } else if (kw === 'next week') {
      target.setDate(today.getDate() + 7);
      dueDate = formatISO(target);
    } else if (kw === 'this weekend') {
      const dayOfWeek = today.getDay();
      const daysUntilSat = (6 - dayOfWeek + 7) % 7 || 7;
      target.setDate(today.getDate() + daysUntilSat);
      dueDate = formatISO(target);
    } else {
      // Day of week
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = days.indexOf(kw);
      if (targetDay !== -1) {
        let diff = (targetDay - today.getDay() + 7) % 7;
        if (diff === 0) diff = 7; // Next occurrence
        target.setDate(today.getDate() + diff);
        dueDate = formatISO(target);
      }
    }
    text = text.replace(dateKeywordsMatch[0], '');
  }

  // Clean remaining text
  const cleanTitle = text
    .replace(/\s+/g, ' ')
    .replace(/^[-–—]\s*/, '')
    .trim();

  return {
    cleanTitle: cleanTitle || rawInput.trim(),
    priority,
    dueDate,
    dueTime,
    scheduledDate,
    estimatedMinutes,
    tags,
    projectHint,
    energy,
  };
}

export function formatDateLabel(dateStr?: string, timeStr?: string): { label: string; isOverdue: boolean; isToday: boolean } {
  if (!dateStr) return { label: 'No date', isOverdue: false, isToday: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = dateStr.split('-');
  const targetDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let isOverdue = diffDays < 0;
  let isToday = diffDays === 0;

  let baseLabel = '';
  if (diffDays === -1) baseLabel = 'Yesterday';
  else if (diffDays < -1) baseLabel = `${Math.abs(diffDays)}d overdue`;
  else if (diffDays === 0) baseLabel = 'Today';
  else if (diffDays === 1) baseLabel = 'Tomorrow';
  else if (diffDays < 7) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    baseLabel = days[targetDate.getDay()];
  } else {
    baseLabel = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (timeStr) {
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h, 10);
    const meridiem = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    baseLabel += ` ${hour}:${m} ${meridiem}`;
  }

  return { label: baseLabel, isOverdue, isToday };
}
