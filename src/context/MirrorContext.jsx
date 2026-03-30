import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import { useAuth } from './AuthContext';

const MirrorContext = createContext(undefined);

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export const MirrorProvider = ({ children }) => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [events, setEvents] = useState([]);
  const [weather, setWeather] = useState({
    temperature: 22,
    condition: 'Partly Cloudy',
    location: 'San Francisco',
  });

  const [displaySettings, setDisplaySettings] = useState({
    showClock: true,
    showWeather: true,
    showTasks: true,
    showNotes: true,
    showEvents: true,
  });

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setNotes([]);
      setEvents([]);
      setWeather({
        temperature: 22,
        condition: 'Partly Cloudy',
        location: 'San Francisco',
      });
      setDisplaySettings({
        showClock: true,
        showWeather: true,
        showTasks: true,
        showNotes: true,
        showEvents: true,
      });
      return;
    }

    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;

    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('Load tasks error:', tasksError);
    }

    const { data: notesData, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (notesError) {
      console.error('Load notes error:', notesError);
    }

    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (eventsError) {
      console.error('Load events error:', eventsError);
    }

    const { data: weatherData, error: weatherError } = await supabase
      .from('weather_cache')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (weatherError) {
      console.error('Load weather error:', weatherError);
    }

    const { data: settingsData, error: settingsError } = await supabase
      .from('display_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (settingsError) {
      console.error('Load display settings error:', settingsError);
    }

    setTasks(tasksData || []);
    setNotes(notesData || []);
    setEvents(eventsData || []);

    if (weatherData) {
      setWeather({
        temperature: weatherData.temperature,
        condition: weatherData.condition,
        location: weatherData.location,
      });
    }

    if (settingsData) {
      setDisplaySettings({
        showClock: settingsData.show_clock,
        showWeather: settingsData.show_weather,
        showTasks: settingsData.show_tasks,
        showNotes: settingsData.show_notes,
        showEvents: settingsData.show_events,
      });
    }
  };

  const addTask = async (text) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ user_id: user.id, text, completed: false }])
      .select();

    if (error) {
      console.error('Add task error:', error);
      return;
    }

    if (data) {
      setTasks((prev) => [data[0], ...prev]);
    }
  };

  const updateTask = async (id, updates) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Update task error:', error);
      return;
    }

    if (data) {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? data[0] : task))
      );
    }
  };

  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      console.error('Delete task error:', error);
      return;
    }

    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const addNote = async (text) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notes')
      .insert([{ user_id: user.id, text }])
      .select();

    if (error) {
      console.error('Add note error:', error);
      return;
    }

    if (data) {
      setNotes((prev) => [data[0], ...prev]);
    }
  };

  const updateNote = async (id, text) => {
    const { data, error } = await supabase
      .from('notes')
      .update({ text })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Update note error:', error);
      return;
    }

    if (data) {
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? data[0] : note))
      );
    }
  };

  const deleteNote = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);

    if (error) {
      console.error('Delete note error:', error);
      return;
    }

    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const addEvent = async (event) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('events')
      .insert([{ user_id: user.id, ...event }])
      .select();

    if (error) {
      console.error('Add event error:', error);
      return;
    }

    if (data) {
      setEvents((prev) => [...prev, data[0]]);
    }
  };

  const updateEvent = async (id, updates) => {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Update event error:', error);
      return;
    }

    if (data) {
      setEvents((prev) =>
        prev.map((event) => (event.id === id ? data[0] : event))
      );
    }
  };

  const deleteEvent = async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) {
      console.error('Delete event error:', error);
      return;
    }

    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const updateWeather = async (newWeather) => {
    if (!user) return;

    const { data: existing, error: existingError } = await supabase
      .from('weather_cache')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingError) {
      console.error('Load weather error:', existingError);
      return;
    }

    if (existing) {
      const { error } = await supabase
        .from('weather_cache')
        .update({
          temperature: newWeather.temperature,
          condition: newWeather.condition,
          location: newWeather.location,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Update weather error:', error);
        return;
      }
    } else {
      const { error } = await supabase.from('weather_cache').insert([
        {
          user_id: user.id,
          temperature: newWeather.temperature,
          condition: newWeather.condition,
          location: newWeather.location,
        },
      ]);

      if (error) {
        console.error('Insert weather error:', error);
        return;
      }
    }

    setWeather(newWeather);
  };

  const refreshWeatherByCity = async (city) => {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('Missing VITE_OPENWEATHER_API_KEY');
    }

    const query = encodeURIComponent(city);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    console.log('Weather URL:', url);

    const response = await fetch(url);
    const text = await response.clone().text();

    console.log('Weather response status:', response.status);
    console.log('Weather response text:', text);

    if (!response.ok) {
      throw new Error(`Failed to fetch weather: ${response.status} ${text}`);
    }

    const data = await response.json();

    const liveWeather = {
      temperature: Math.round(data.main.temp),
      condition: data.weather?.[0]?.main || 'Unknown',
      location: data.name || city,
    };

    await updateWeather(liveWeather);
    return liveWeather;
  };

  const updateDisplaySettings = async (settings) => {
    if (!user) return;

    const merged = {
      ...displaySettings,
      ...settings,
    };

    const payload = {
      user_id: user.id,
      show_clock: merged.showClock,
      show_weather: merged.showWeather,
      show_tasks: merged.showTasks,
      show_notes: merged.showNotes,
      show_events: merged.showEvents,
    };

    const { data: existing, error: existingError } = await supabase
      .from('display_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingError) {
      console.error('Load display settings error:', existingError);
      return;
    }

    if (existing) {
      const { error } = await supabase
        .from('display_settings')
        .update(payload)
        .eq('user_id', user.id);

      if (error) {
        console.error('Update display settings error:', error);
        return;
      }
    } else {
      const { error } = await supabase.from('display_settings').insert([payload]);

      if (error) {
        console.error('Insert display settings error:', error);
        return;
      }
    }

    setDisplaySettings(merged);
  };

  return (
    <MirrorContext.Provider
      value={{
        tasks,
        notes,
        events,
        weather,
        displaySettings,
        addTask,
        updateTask,
        deleteTask,
        addNote,
        updateNote,
        deleteNote,
        addEvent,
        updateEvent,
        deleteEvent,
        updateWeather,
        refreshWeatherByCity,
        updateDisplaySettings,
      }}
    >
      {children}
    </MirrorContext.Provider>
  );
};

export const useMirror = () => {
  const context = useContext(MirrorContext);

  if (!context) {
    throw new Error('useMirror must be used within MirrorProvider');
  }

  return context;
};