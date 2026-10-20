import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  Moon, 
  Sun, 
  Globe, 
  Check, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Sparkles, 
  Smartphone,
  Save,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationMatrixTable = () => {
  const { preferences, updatePreferenceMatrix, releaseDndMorningStack, fatigueEngine } = useNotifications();
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pushStatus, setPushStatus] = useState(preferences.global.pushGranted ? 'granted' : 'default');

  const toggleGroupCollapse = (groupId) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleGlobalChange = (key, value) => {
    updatePreferenceMatrix((prev) => ({
      ...prev,
      global: {
        ...prev.global,
        [key]: value,
      },
    }));
    triggerSavedFeedback();
  };

  const handleEventToggleInApp = (categoryId, eventId, currentVal) => {
    updatePreferenceMatrix((prev) => {
      const nextCategories = prev.categories.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          events: cat.events.map((ev) => (ev.id === eventId ? { ...ev, inApp: !currentVal } : ev)),
        };
      });
      return { ...prev, categories: nextCategories };
    });
    triggerSavedFeedback();
  };

  const handleEventEmailChange = (categoryId, eventId, newEmailMode) => {
    updatePreferenceMatrix((prev) => {
      const nextCategories = prev.categories.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          events: cat.events.map((ev) => (ev.id === eventId ? { ...ev, email: newEmailMode } : ev)),
        };
      });
      return { ...prev, categories: nextCategories };
    });
    triggerSavedFeedback();
  };

  const triggerSavedFeedback = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1800);
  };

  const requestBrowserPush = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        setPushStatus(permission);
        if (permission === 'granted') {
          handleGlobalChange('pushGranted', true);
        }
      });
    } else {
      alert('Browser desktop push notifications are simulated in this environment.');
      setPushStatus('granted');
      handleGlobalChange('pushGranted', true);
    }
  };

  const heldCount = fatigueEngine.heldQuietQueue.length;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0A0B0E] p-6 lg:p-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header Stage */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Notification Preferences
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Control how and where you receive updates across in-app, email, and push channels.
            </p>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 text-xs font-semibold animate-fade-in">
              <Check className="w-4 h-4" />
              <span>Preferences saved</span>
            </div>
          )}
        </div>

        {/* Global Overrides Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Do Not Disturb (DND) Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#131418] border border-slate-200 dark:border-[#242730] shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Do Not Disturb (Quiet Hours)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Mutes non-urgent alerts during rest hours
                  </p>
                </div>
              </div>

              {/* Toggle DND */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.global.dndEnabled}
                  onChange={(e) => handleGlobalChange('dndEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {preferences.global.dndEnabled && (
              <div className="pt-3 border-t border-slate-100 dark:border-[#242730] flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={preferences.global.dndStart}
                      onChange={(e) => handleGlobalChange('dndStart', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={preferences.global.dndEnd}
                      onChange={(e) => handleGlobalChange('dndEnd', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Timezone:</span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-200">
                      {preferences.global.timezone}
                    </span>
                  </div>

                  {heldCount > 0 && (
                    <button
                      onClick={releaseDndMorningStack}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-[11px] font-semibold border border-purple-200 dark:border-purple-800/40"
                    >
                      Release {heldCount} held items
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Push & Circadian Recap Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#131418] border border-slate-200 dark:border-[#242730] shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Desktop Browser Push
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Instant system badges when window is in background
                  </p>
                </div>
              </div>

              {pushStatus === 'granted' ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 text-xs font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Enabled
                </span>
              ) : (
                <button
                  onClick={requestBrowserPush}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Enable Push
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#242730] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Circadian Morning Digest
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Releases held overnight queue as a unified 08:30 AM briefing stack
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.global.circadianMorningDigest}
                    onChange={(e) => handleGlobalChange('circadianMorningDigest', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Rate Ceiling Burnout Safeguard */}
              <div className="mt-1 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Burnout Safeguard Ceiling:
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {preferences.global.burnoutSafeguardMaxPerDay} alerts / day max
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Grid Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#242730] bg-white dark:bg-[#131418] shadow-sm overflow-hidden">
          {/* Table Column Headers */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-100/70 dark:bg-[#191B20] border-b border-slate-200 dark:border-[#242730] text-xs font-semibold text-slate-600 dark:text-slate-300">
            <div className="col-span-12 sm:col-span-6">Category & Event</div>
            <div className="col-span-4 sm:col-span-2 text-center flex items-center justify-center gap-1">
              <Bell className="w-3.5 h-3.5 text-blue-500" />
              <span>In-App Bell</span>
            </div>
            <div className="col-span-4 sm:col-span-2 text-center flex items-center justify-center gap-1">
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              <span>Email Delivery</span>
            </div>
            <div className="col-span-4 sm:col-span-2 text-center hidden sm:block">
              <span>Escalation Rule</span>
            </div>
          </div>

          {/* Group Accordions */}
          <div className="divide-y divide-slate-200 dark:divide-[#242730]">
            {preferences.categories.map((category) => {
              const isCollapsed = collapsedGroups[category.id];

              return (
                <div key={category.id} className="flex flex-col">
                  {/* Category Header Row */}
                  <div
                    onClick={() => toggleGroupCollapse(category.id)}
                    className="flex items-center justify-between px-6 py-3 bg-slate-50/70 dark:bg-[#16181E] cursor-pointer hover:bg-slate-100/60 dark:hover:bg-[#1A1D24] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          {category.name}
                          {category.isMandatory && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Mandatory
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-slate-400 font-mono">
                      {category.events.length} events
                    </span>
                  </div>

                  {/* Category Events Rows */}
                  {!isCollapsed && (
                    <div className="divide-y divide-slate-100 dark:divide-[#242730]/60">
                      {category.events.map((ev) => (
                        <div
                          key={ev.id}
                          className="grid grid-cols-12 gap-4 px-6 py-3.5 items-center hover:bg-slate-50/50 dark:hover:bg-[#15171D] transition-colors text-xs"
                        >
                          {/* Event Name */}
                          <div className="col-span-12 sm:col-span-6 font-medium text-slate-800 dark:text-slate-200">
                            {ev.label}
                          </div>

                          {/* In-App Toggle */}
                          <div className="col-span-4 sm:col-span-2 flex justify-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={ev.inApp}
                                onChange={() =>
                                  handleEventToggleInApp(category.id, ev.id, ev.inApp)
                                }
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          {/* Email Mode Selector */}
                          <div className="col-span-4 sm:col-span-2 flex justify-center">
                            {ev.emailLocked ? (
                              <div
                                title="Mandatory for account security & compliance"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-medium text-[11px] border border-slate-200 dark:border-zinc-700"
                              >
                                <Lock className="w-3 h-3 text-amber-500" />
                                <span>Instant (Locked)</span>
                              </div>
                            ) : (
                              <select
                                value={ev.email}
                                onChange={(e) =>
                                  handleEventEmailChange(category.id, ev.id, e.target.value)
                                }
                                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="instant">Instant</option>
                                <option value="daily_digest">Daily Digest</option>
                                <option value="disabled">Off</option>
                              </select>
                            )}
                          </div>

                          {/* Escalation Rule */}
                          <div className="col-span-4 sm:col-span-2 text-center hidden sm:block text-[11px] text-slate-400 font-mono">
                            {ev.email === 'instant' ? (
                              <span className="text-emerald-500">Immediate</span>
                            ) : ev.inApp ? (
                              <span className="text-amber-500">Escalate after 30m</span>
                            ) : (
                              <span className="text-slate-400">None</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
