import React, { useState } from 'react';
import { useMirror } from '../context/MirrorContext';
import { useAuth } from '../context/AuthContext';
import { 
  CheckSquare, 
  StickyNote, 
  Calendar, 
  Cloud, 
  Settings,
  Plus,
  Trash2,
  Edit,
  Monitor,
  LayoutDashboard,
  User,
  LogOut
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import supabase from '../lib/supabase';


export const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const {
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
    updateDisplaySettings
  } = useMirror();

  useEffect(() => {
    if (user) {
      setProfileEmail(user.email || '');
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfileName(data.name || '');
      setProfileLocation(data.location || '');
    }
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isWeatherDialogOpen, setIsWeatherDialogOpen] = useState(false);

  // Form states
  const [taskText, setTaskText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [weatherTemp, setWeatherTemp] = useState(weather.temperature.toString());
  const [weatherCondition, setWeatherCondition] = useState(weather.condition);
  const [weatherLocation, setWeatherLocation] = useState(weather.location);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileLocation, setProfileLocation] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  const handleAddTask = () => {
    if (taskText.trim()) {
      addTask(taskText);
      setTaskText('');
      setIsTaskDialogOpen(false);
    }
  };

  const handleAddNote = () => {
    if (noteText.trim()) {
      addNote(noteText);
      setNoteText('');
      setIsNoteDialogOpen(false);
    }
  };

  const handleAddEvent = () => {
    if (eventTitle.trim() && eventDate) {
      addEvent({ title: eventTitle, date: eventDate, time: eventTime || undefined });
      setEventTitle('');
      setEventDate('');
      setEventTime('');
      setIsEventDialogOpen(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setProfileMessage('');

    const { error } = await supabase.from('profiles').upsert([
      {
        id: user.id,
        email: user.email,
        name: profileName,
        location: profileLocation,
      },
    ]);

    if (error) {
      setProfileMessage('Failed to save profile');
    } else {
      setProfileMessage('Profile saved successfully');
    }
  };

  const handleUpdateWeather = async () => {
    try {
      await refreshWeatherByCity(weatherLocation);
      setIsWeatherDialogOpen(false);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch weather from API');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks' , label: 'Tasks', icon: CheckSquare },
    { id: 'notes' , label: 'Notes', icon: StickyNote },
    { id: 'events' , label: 'Events', icon: Calendar },
    { id: 'weather' , label: 'Weather', icon: Cloud },
    { id: 'settings' , label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const completedTasks = tasks.filter(t => t.completed).length;
  const activeTasks = tasks.filter(t => !t.completed).length;
  const todayEvents = events.filter(e => e.date === format(new Date(), 'yyyy-MM-dd')).length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl">Smart Mirror</h1>
              <p className="text-xs text-slate-500">Control Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Button
            onClick={() => navigate('/mirror')}
            className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800"
          >
            <Monitor className="w-4 h-4 mr-2" />
            View Mirror Display
          </Button>
        </div>

        <div className="p-4 border-t border-slate-200">
          <Button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="mb-8">
                <h2 className="text-4xl mb-2">Dashboard Overview</h2>
                <p className="text-slate-500">Welcome back! Here's your daily summary.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                <Card className="border-l-4 border-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-600">Active Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl">{activeTasks}</div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-600">Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl">{completedTasks}</div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-purple-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-600">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl">{notes.length}</div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-cyan-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-600">Today's Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl">{todayEvents}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Recent Tasks */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Tasks</CardTitle>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab('tasks')}>
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {tasks.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No tasks yet</p>
                    ) : (
                      <div className="space-y-3">
                        {tasks.slice(0, 5).map(task => (
                          <div key={task.id} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => updateTask(task.id, { completed: !task.completed })}
                              className="w-4 h-4 rounded"
                            />
                            <span className={task.completed ? 'line-through text-slate-400' : ''}>
                              {task.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Upcoming Events</CardTitle>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab('events')}>
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {events.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No events scheduled</p>
                    ) : (
                      <div className="space-y-3">
                        {events
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .slice(0, 5)
                          .map(event => (
                            <div key={event.id} className="flex items-start gap-3">
                              <Calendar className="w-4 h-4 mt-1 text-slate-400" />
                              <div className="flex-1">
                                <div className="font-medium">{event.title}</div>
                                <div className="text-sm text-slate-500">
                                  {format(new Date(event.date), 'MMM d, yyyy')}
                                  {event.time && ` at ${event.time}`}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-4xl mb-2">Tasks</h2>
                  <p className="text-slate-500">Manage your daily tasks</p>
                </div>
                <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="task">Task Description</Label>
                        <Input
                          id="task"
                          value={taskText}
                          onChange={(e) => setTaskText(e.target.value)}
                          placeholder="Enter task description..."
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                        />
                      </div>
                      <Button onClick={handleAddTask} className="w-full">Add Task</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-slate-500 text-center py-8">No tasks yet. Add your first task to get started!</p>
                    </CardContent>
                  </Card>
                ) : (
                  tasks.map(task => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => updateTask(task.id, { completed: !task.completed })}
                              className="w-5 h-5 rounded"
                            />
                            <span className={task.completed ? 'line-through text-slate-400' : 'text-lg'}>
                              {task.text}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-4xl mb-2">Notes</h2>
                  <p className="text-slate-500">Quick notes and reminders</p>
                </div>
                <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Note</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="note">Note Content</Label>
                        <Textarea
                          id="note"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Write your note..."
                          rows={5}
                        />
                      </div>
                      <Button onClick={handleAddNote} className="w-full">Add Note</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {notes.length === 0 ? (
                  <Card className="col-span-3">
                    <CardContent className="pt-6">
                      <p className="text-slate-500 text-center py-8">No notes yet. Create your first note!</p>
                    </CardContent>
                  </Card>
                ) : (
                  notes.map(note => (
                    <Card key={note.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <p className="flex-1 leading-relaxed">{note.text}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNote(note.id)}
                            className="hover:bg-red-50 hover:text-red-600 -mt-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-slate-400">
                          {note.created_at && !isNaN(new Date(note.created_at).getTime())
                            ? format(new Date(note.created_at), 'MMM d, yyyy')
                            : 'No date'}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-4xl mb-2">Events</h2>
                  <p className="text-slate-500">Manage your calendar events</p>
                </div>
                <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Event</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="event-title">Event Title</Label>
                        <Input
                          id="event-title"
                          value={eventTitle}
                          onChange={(e) => setEventTitle(e.target.value)}
                          placeholder="Enter event title..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="event-date">Date</Label>
                        <Input
                          id="event-date"
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="event-time">Time (optional)</Label>
                        <Input
                          id="event-time"
                          type="time"
                          value={eventTime}
                          onChange={(e) => setEventTime(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleAddEvent} className="w-full">Add Event</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {events.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-slate-500 text-center py-8">No events scheduled. Add your first event!</p>
                    </CardContent>
                  </Card>
                ) : (
                  [...events]
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(event => (
                      <Card key={event.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4 flex-1">
                              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0">
                                <div className="text-xs font-medium">
                                  {format(new Date(event.date), 'MMM').toUpperCase()}
                                </div>
                                <div className="text-2xl font-bold">
                                  {format(new Date(event.date), 'd')}
                                </div>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl mb-1">{event.title}</h3>
                                <p className="text-slate-500">
                                  {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                                  {event.time && ` • ${event.time}`}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEvent(event.id)}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Weather Tab */}
          {activeTab === 'weather' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-4xl mb-2">Weather</h2>
                  <p className="text-slate-500">Configure weather display</p>
                </div>
                <Dialog open={isWeatherDialogOpen} onOpenChange={setIsWeatherDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                      <Edit className="w-4 h-4 mr-2" />
                      Update Weather
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Weather Information</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="temp">Temperature (°C)</Label>
                        <Input
                          id="temp"
                          type="number"
                          value={weatherTemp}
                          onChange={(e) => setWeatherTemp(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="condition">Condition</Label>
                        <Input
                          id="condition"
                          value={weatherCondition}
                          onChange={(e) => setWeatherCondition(e.target.value)}
                          placeholder="e.g., Sunny, Cloudy, Rainy"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={weatherLocation}
                          onChange={(e) => setWeatherLocation(e.target.value)}
                          placeholder="Enter location"
                        />
                      </div>
                      <Button onClick={handleUpdateWeather} className="w-full">Update Weather</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Current Weather Display</CardTitle>
                  <CardDescription>This information will be shown on your smart mirror</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-6xl font-light mb-2">{weather.temperature}°C</div>
                        <div className="text-2xl mb-1">{weather.condition}</div>
                        <div className="text-blue-100">{weather.location}</div>
                      </div>
                      <Cloud className="w-24 h-24 text-white/40" />
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">
                    💡 Note: This is a manual weather display. For production use, integrate with a weather API (OpenWeather, WeatherAPI, etc.) for real-time data.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <div className="mb-6">
                <h2 className="text-4xl mb-2">Settings</h2>
                <p className="text-slate-500">Configure your smart mirror display</p>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>Choose what to show on your mirror display</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <div className="font-medium mb-1">Show Clock</div>
                        <div className="text-sm text-slate-500">Display time and date</div>
                      </div>
                      <Switch
                        checked={displaySettings.showClock}
                        onCheckedChange={(checked) => updateDisplaySettings({ showClock: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <div className="font-medium mb-1">Show Weather</div>
                        <div className="text-sm text-slate-500">Display weather information</div>
                      </div>
                      <Switch
                        checked={displaySettings.showWeather}
                        onCheckedChange={(checked) => updateDisplaySettings({ showWeather: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <div className="font-medium mb-1">Show Tasks</div>
                        <div className="text-sm text-slate-500">Display your daily tasks</div>
                      </div>
                      <Switch
                        checked={displaySettings.showTasks}
                        onCheckedChange={(checked) => updateDisplaySettings({ showTasks: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <div className="font-medium mb-1">Show Notes</div>
                        <div className="text-sm text-slate-500">Display quick notes</div>
                      </div>
                      <Switch
                        checked={displaySettings.showNotes}
                        onCheckedChange={(checked) => updateDisplaySettings({ showNotes: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className="font-medium mb-1">Show Events</div>
                        <div className="text-sm text-slate-500">Display upcoming events</div>
                      </div>
                      <Switch
                        checked={displaySettings.showEvents}
                        onCheckedChange={(checked) => updateDisplaySettings({ showEvents: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mirror Display</CardTitle>
                    <CardDescription>View or fullscreen your smart mirror</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => navigate('/mirror')}
                      className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800"
                      size="lg"
                    >
                      <Monitor className="w-5 h-5 mr-2" />
                      Open Mirror Display
                    </Button>
                    <p className="text-sm text-slate-500 mt-4">
                      💡 Tip: Press F11 on the mirror screen for fullscreen mode
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <div className="mb-6">
                <h2 className="text-4xl mb-2">Profile</h2>
                <p className="text-slate-500">Manage your account settings</p>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>Your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={profileEmail}
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="City, Country"
                        value={profileLocation}
                        onChange={(e) => setProfileLocation(e.target.value)}
                      />
                    </div>
                    <Button className="w-full" onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                    {profileMessage && (
                      <p className="text-sm text-slate-500 mt-2">{profileMessage}</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Manage your application data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <div className="font-medium">Total Tasks</div>
                        <div className="text-sm text-slate-500">{tasks.length} tasks created</div>
                      </div>
                      <div className="text-2xl">{tasks.length}</div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <div className="font-medium">Total Notes</div>
                        <div className="text-sm text-slate-500">{notes.length} notes saved</div>
                      </div>
                      <div className="text-2xl">{notes.length}</div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className="font-medium">Total Events</div>
                        <div className="text-sm text-slate-500">{events.length} events scheduled</div>
                      </div>
                      <div className="text-2xl">{events.length}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" className="w-full">
                      Clear All Data
                    </Button>
                    <p className="text-sm text-slate-500 mt-2">
                      This will delete all your tasks, notes, and events permanently.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};