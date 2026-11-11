import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CloudSun,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Sparkles,
  Palette,
} from 'lucide-react';
import { ItineraryItem } from '../../types/editorial';
import { sounds } from '../../services/soundEffects';

interface InteractiveItineraryProps {
  itinerary: ItineraryItem[];
  eventTitle: string;
}

export const InteractiveItinerary: React.FC<InteractiveItineraryProps> = ({
  itinerary,
  eventTitle,
}) => {
  const [useDeviceTimeZone, setUseDeviceTimeZone] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<string>(itinerary[0]?.id || '');

  const toggleExpand = (id: string) => {
    sounds.playCardSnap();
    setExpandedId((prev) => (prev === id ? '' : id));
  };

  // Generate Google Calendar Link
  const getGoogleCalendarUrl = (item: ItineraryItem) => {
    const title = encodeURIComponent(`${eventTitle}: ${item.title}`);
    const details = encodeURIComponent(`${item.description}\nDress Code: ${item.dressCodeTitle} - ${item.dressCodeDescription}`);
    const location = encodeURIComponent(item.location);
    // Approximate 2026-09-19 dates
    const dates = '20260919T143000Z/20260919T230000Z';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  };

  // Generate Apple Calendar .ics File
  const downloadIcsFile = (item: ItineraryItem) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Bespoke Editorial//Event Guest Suite//EN
BEGIN:VEVENT
SUMMARY:${eventTitle}: ${item.title}
DESCRIPTION:${item.description} (Dress Code: ${item.dressCodeTitle})
LOCATION:${item.location}
DTSTART:20260919T163000Z
DTEND:20260919T230000Z
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${item.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    sounds.playMasteredSound();
  };

  return (
    <section id="itinerary" className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-700 font-bold block">
            SCROLLYTELLING SCHEDULE
          </span>
          <h2 className="text-3xl font-serif text-stone-900 mt-1">Interactive Celebration Itinerary</h2>
          <p className="text-xs text-stone-500 mt-1 max-w-lg">
            Every chapter of the celebration with dress code moodboards, live weather outlook, and calendar integration.
          </p>
        </div>

        {/* Dynamic Time-Zone Toggle */}
        <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-2xl border border-stone-200 text-xs self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-stone-500 ml-1.5" />
          <button
            onClick={() => {
              setUseDeviceTimeZone(false);
              sounds.playCardSnap();
            }}
            className={`px-3 py-1 rounded-xl font-medium transition-all cursor-pointer ${
              !useDeviceTimeZone ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600'
            }`}
          >
            Venue Local Time
          </button>
          <button
            onClick={() => {
              setUseDeviceTimeZone(true);
              sounds.playCardSnap();
            }}
            className={`px-3 py-1 rounded-xl font-medium transition-all cursor-pointer ${
              useDeviceTimeZone ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600'
            }`}
          >
            Your Device Time
          </button>
        </div>
      </div>

      {/* Scrollytelling Timeline */}
      <div className="relative border-l-2 border-stone-200 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-8">
        {itinerary.map((item, index) => {
          const isExpanded = expandedId === item.id;
          return (
            <div key={item.id} className="relative group">
              {/* Timeline Pin Node */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-4 border-white transition-all ${
                  isExpanded ? 'bg-amber-600 scale-125 shadow-md ring-4 ring-amber-100' : 'bg-stone-400 group-hover:bg-amber-500'
                }`}
              />

              {/* Itinerary Card */}
              <div
                className={`rounded-3xl border transition-all duration-300 overflow-hidden bg-white ${
                  isExpanded
                    ? 'border-amber-300 shadow-lg'
                    : 'border-stone-200/80 shadow-2xs hover:border-stone-300'
                }`}
              >
                {/* Header row (Clickable to expand) */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {useDeviceTimeZone ? `${item.time} (Converted)` : item.time}
                      </span>
                      <span className="text-xs text-stone-400 font-mono">Chapter 0{index + 1}</span>
                    </div>
                    <h3 className="text-xl font-serif text-stone-900 font-semibold">{item.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <MapPin className="w-3.5 h-3.5 text-amber-700" />
                      <span>{item.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-1.5 text-xs text-stone-500 font-mono">
                      <CloudSun className="w-4 h-4 text-amber-500" />
                      <span>{item.weatherForecast.split('•')[0]}</span>
                    </div>

                    <button
                      type="button"
                      className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-all cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Details Tray */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-stone-100 space-y-6 animate-fade-in bg-stone-50/50">
                    <p className="text-xs text-stone-700 leading-relaxed max-w-2xl">
                      {item.description}
                    </p>

                    {/* Dress Code Moodboard Grid */}
                    <div className="p-4 rounded-2xl bg-white border border-stone-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                        <Palette className="w-3.5 h-3.5 text-amber-700" />
                        <span>Dress Code Moodboard: {item.dressCodeTitle}</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {item.dressCodeDescription}
                      </p>
                      {/* Color Palette Swatches */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-mono uppercase text-stone-400">Palette:</span>
                        {item.dressCodeColors.map((hex, i) => (
                          <div
                            key={i}
                            title={hex}
                            className="w-5 h-5 rounded-full border border-black/10 shadow-2xs hover:scale-125 transition-transform"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Live Weather Forecast Pill */}
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900">
                      <CloudSun className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Forecast: <strong>{item.weatherForecast}</strong></span>
                    </div>

                    {/* Action Calendar Pills */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <a
                        href={getGoogleCalendarUrl(item)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all shadow-2xs"
                      >
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        <span>Add to Google Calendar</span>
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </a>

                      <button
                        onClick={() => downloadIcsFile(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-stone-500" />
                        <span>Download Apple .ics</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

