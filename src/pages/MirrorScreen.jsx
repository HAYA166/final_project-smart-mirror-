import React, { useState, useEffect } from 'react';
import { useMirror } from '../context/MirrorContext';
import { format } from 'date-fns';
import {
  Cloud,
  Sun,
  CloudRain,
  Wind,
  CloudSnow,
  CloudDrizzle,
  Shirt,
  Umbrella,
  Snowflake,
  Shield,
  SunMedium,
} from 'lucide-react';
export const MirrorScreen = () => {
  const { tasks, notes, events, weather, displaySettings } = useMirror();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get today's events
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayEvents = events.filter(event => event.date === today);

  // Get upcoming events (next 7 days)
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate > now && eventDate <= weekFromNow;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getWeatherIcon = () => {
    const condition = weather.condition.toLowerCase();
    if (condition.includes('rain')) return <CloudRain className="w-20 h-20" />;
    if (condition.includes('snow')) return <CloudSnow className="w-20 h-20" />;
    if (condition.includes('drizzle')) return <CloudDrizzle className="w-20 h-20" />;
    if (condition.includes('cloud')) return <Cloud className="w-20 h-20" />;
    if (condition.includes('wind')) return <Wind className="w-20 h-20" />;
    return <Sun className="w-20 h-20" />;
  };

  // Filter incomplete tasks for display
  const activeTasks = tasks.filter(task => !task.completed);
  

  const getWearSuggestion = () => {
    const temp = weather.temperature;
    const condition = weather.condition.toLowerCase();

    if (condition.includes('snow')) {
      return {
        icon: <Snowflake className="w-8 h-8 text-cyan-300" />,
        title: 'Heavy coat',
        subtitle: 'Winter clothes recommended',
        cardClass:
          'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/30',
      };
    }

    if (condition.includes('rain') || condition.includes('drizzle')) {
      return {
        icon: <Umbrella className="w-8 h-8 text-blue-300" />,
        title: temp < 18 ? 'Jacket + umbrella' : 'Light jacket + umbrella',
        subtitle: 'Rain expected outside',
        cardClass:
          'bg-gradient-to-r from-blue-500/20 to-slate-500/20 border-blue-400/30',
      };
    }

    if (temp >= 30) {
      return {
        icon: <SunMedium className="w-8 h-8 text-yellow-300" />,
        title: 'T-shirt',
        subtitle: 'Light clothes recommended',
        cardClass:
          'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30',
      };
    }

    if (temp >= 22) {
      return {
        icon: <Shirt className="w-8 h-8 text-green-300" />,
        title: 'Light clothes',
        subtitle: 'Comfortable weather',
        cardClass:
          'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30',
      };
    }

    if (temp >= 15) {
      return {
        icon: <Shield className="w-8 h-8 text-purple-300" />,
        title: 'Light jacket',
        subtitle: 'Cool weather outside',
        cardClass:
          'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-purple-400/30',
      };
    }

    if (temp >= 8) {
      return {
        icon: <Shield className="w-8 h-8 text-indigo-300" />,
        title: 'Jacket / hoodie',
        subtitle: 'Chilly weather outside',
        cardClass:
          'bg-gradient-to-r from-indigo-500/20 to-slate-500/20 border-indigo-400/30',
      };
    }

    return {
      icon: <Shield className="w-8 h-8 text-pink-300" />,
      title: 'Warm coat',
      subtitle: 'Cold weather outside',
      cardClass:
        'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-400/30',
    };
  };


  const wearSuggestion = getWearSuggestion();


  return (
    <div className="min-h-screen bg-black text-white p-16 flex flex-col relative overflow-hidden">
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-blue-900/5 pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top Section - Clock and Date */}
        {displaySettings.showClock && (
          <div className="absolute top-12 left-1 text-left w-[360px]">
            <div className="text-[90px] font-extralight leading-none text-white/95">
              {format(currentTime, 'HH:mm')}
            </div>
            <div className="text-2xl font-light text-white/60 mt-3 leading-tight">
              {format(currentTime, 'EEEE, MMMM d, yyyy')}
            </div>
          </div>
        )}

        {/* Weather - Top Right Corner */}
        {displaySettings.showWeather && (
          <div className="absolute top-[59px] right-1">
            <div className="flex items-center gap-6">
              <div className="text-white/80">
                {getWeatherIcon()}
              </div>
              <div>
                <div className="text-7xl font-extralight text-white/95">
                  {weather.temperature}°
                </div>
                <div className="text-xl text-white/50 mt-2">{weather.condition}</div>
                <div className="text-lg text-white/30">{weather.location}</div>
              </div>
            </div>
          </div>
        )}


        {displaySettings.showWeather && (
          <div
            className={`absolute top-12 left-[325px] w-[300px] rounded-2xl border p-4 backdrop-blur-sm shadow-lg ${wearSuggestion.cardClass}`}
          >
            <div className="text-xs uppercase tracking-[0.2em] text-white/45 mb-3">
              What to wear
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1">{wearSuggestion.icon}</div>
              <div>
                <div className="text-xl font-light text-white/95">
                  {wearSuggestion.title}
                </div>
                <div className="text-sm text-white/60 mt-1">
                  {wearSuggestion.subtitle}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-16 flex-1 pt-72 px-8">
          {/* Tasks Column */}
          {displaySettings.showTasks && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
                <h2 className="text-3xl font-light text-white/80">Today's Tasks</h2>
              </div>
              <div className="space-y-5">
                {activeTasks.length === 0 ? (
                  <div className="text-white/30 text-xl font-light">
                    All tasks completed
                  </div>
                ) : (
                  activeTasks.slice(0, 6).map(task => (
                    <div
                      key={task.id}
                      className="flex items-start gap-4 text-xl font-light group"
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-white/40 mt-1 flex-shrink-0 group-hover:border-blue-400 transition-colors" />
                      <span className="text-white/75 leading-relaxed">
                        {task.text}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Notes Column */}
          {displaySettings.showNotes && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full" />
                <h2 className="text-3xl font-light text-white/80">Notes</h2>
              </div>
              <div className="space-y-5">
                {notes.length === 0 ? (
                  <div className="text-white/30 text-xl font-light">
                    No notes
                  </div>
                ) : (
                  notes.slice(0, 4).map(note => (
                    <div
                      key={note.id}
                      className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <p className="text-lg font-light leading-relaxed text-white/75">
                        {note.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Events Column */}
          {displaySettings.showEvents && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full" />
                <h2 className="text-3xl font-light text-white/80">Upcoming</h2>
              </div>
              <div className="space-y-5">
                {todayEvents.length === 0 && upcomingEvents.length === 0 ? (
                  <div className="text-white/30 text-xl font-light">
                    No upcoming events
                  </div>
                ) : (
                  <>
                    {todayEvents.map(event => (
                      <div
                        key={event.id}
                        className="border-l-4 border-cyan-400 pl-5 py-2"
                      >
                        <div className="text-cyan-400 text-sm font-medium mb-2 tracking-wider">
                          TODAY
                        </div>
                        <div className="text-xl font-light text-white/90">
                          {event.title}
                        </div>
                        {event.time && (
                          <div className="text-white/50 mt-1">
                            {event.time}
                          </div>
                        )}
                      </div>
                    ))}
                    {upcomingEvents.slice(0, 5).map(event => (
                      <div
                        key={event.id}
                        className="border-l-4 border-white/20 pl-5 py-2 hover:border-white/40 transition-colors"
                      >
                        <div className="text-white/40 text-sm font-medium mb-2 tracking-wider">
                          {format(new Date(event.date), 'MMM d').toUpperCase()}
                        </div>
                        <div className="text-xl font-light text-white/75">
                          {event.title}
                        </div>
                        {event.time && (
                          <div className="text-white/40 mt-1">
                            {event.time}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
