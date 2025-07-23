import React, { useEffect, useState } from 'react';
import BaseUrl from '../Api';
import { TrendingUp, School, Event, AssignmentTurnedIn, CheckCircle, HourglassEmpty, Cancel, EmojiEvents } from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const pieColors = ['#a3e635', '#f472b6', '#818cf8'];

// Define a constant for the title color
const TITLE_COLOR = '#7c3aed'; // Tailwind purple-600

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BaseUrl}/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const data = await res.json();
        setDashboard(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Loading & error states
  if (loading) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div></div>;
  if (error) return <div className="text-center text-red-400 font-bold py-10">{error}</div>;
  if (!dashboard) return null;

  // Metrics
  const totalCourses = dashboard.enrolledCourses.length;
  const completedCourses = dashboard.completedCourses.length;
  const inProgressCourses = dashboard.enrolledCourses.filter(c => !c.isCompleted).length;
  const events = dashboard.registeredEvents.length;
  const enrollments = dashboard.enrolledCourses.length;
  const progressPercent = totalCourses ? Math.round((completedCourses / totalCourses) * 100) : 0;

  const metricData = [
    { label: 'Total Courses', value: totalCourses, icon: School, iconBg: 'from-purple-400 to-purple-700', iconColor: 'text-purple-100', card: 'from-purple-400/30 to-purple-700/30' },
    { label: 'Completed', value: completedCourses, icon: CheckCircle, iconBg: 'from-green-400 to-green-600', iconColor: 'text-green-100', card: 'from-green-400/30 to-green-600/30' },
    { label: 'Progress', value: `${progressPercent}%`, icon: TrendingUp, iconBg: 'from-pink-400 to-pink-600', iconColor: 'text-pink-100', card: 'from-pink-400/30 to-pink-600/30' },
    { label: 'Events', value: events, icon: Event, iconBg: 'from-blue-400 to-blue-700', iconColor: 'text-blue-100', card: 'from-blue-400/30 to-blue-700/30' },
    { label: 'Enrollments', value: enrollments, icon: AssignmentTurnedIn, iconBg: 'from-yellow-400 to-yellow-600', iconColor: 'text-yellow-100', card: 'from-yellow-400/30 to-yellow-600/30' },
  ];

  // Pie chart data
  const pieData = [
    { name: 'Completed', value: completedCourses },
    { name: 'In Progress', value: inProgressCourses },
    { name: 'Not Started', value: totalCourses - completedCourses - inProgressCourses },
  ];

  // Area chart: fake progress over months for now
  const progressData = [
    { month: 'Jan', progress: Math.round(progressPercent * 0.2) },
    { month: 'Feb', progress: Math.round(progressPercent * 0.4) },
    { month: 'Mar', progress: Math.round(progressPercent * 0.6) },
    { month: 'Apr', progress: Math.round(progressPercent * 0.8) },
    { month: 'May', progress: progressPercent },
    { month: 'Jun', progress: progressPercent },
  ];

  // Courses
  const courses = dashboard.enrolledCourses.map((enroll) => {
    const isCompleted = enroll.isCompleted;
    return {
      name: enroll.course.title,
      status: isCompleted ? 'Completed' : 'In Progress',
      progress: isCompleted ? 100 : Math.round((enroll.completedModules?.length || 0) / (enroll.course.modules?.length || 1) * 100),
      color: isCompleted ? 'bg-green-400' : 'bg-pink-400',
      icon: isCompleted ? CheckCircle : HourglassEmpty,
      iconColor: isCompleted ? 'text-green-400' : 'text-pink-400',
      coverImage: enroll.course.coverImage,
      certificateUrl: enroll.certificateUrl,
    };
  });

  // Certificates
  const certificates = dashboard.certificates || [];

  // Events
  const eventsList = dashboard.registeredEvents || [];

  return (
    <div className="space-y-10 pb-10">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {metricData.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className={`relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br ${m.card} backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden`}
            >
              {/* Animated icon circle */}
              <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg bg-gradient-to-br ${m.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3`}> 
                <Icon sx={{ fontSize: '2rem' }} className={`${m.iconColor} drop-shadow-lg`} />
              </div>
              <div className="z-10 flex flex-col items-center mt-10">
                <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider animate-gradient-x bg-gradient-to-r from-white via-purple-300 to-purple-700 bg-clip-text text-transparent">{m.value}</div>
                <div className="text-sm font-medium mt-1 tracking-wide uppercase text-purple-100/90">{m.label}</div>
              </div>
              {/* Glow effect */}
              <div className={`absolute inset-0 rounded-2xl pointer-events-none group-hover:opacity-60 opacity-0 transition-all duration-300 bg-gradient-to-br ${m.iconBg} blur-2xl`} />
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Area Chart */}
        <div className="col-span-2 bg-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10">
          {/* Fancy Header for Progress Over Time */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 shadow-lg">
              <TrendingUp className="text-white text-3xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white  tracking-wide drop-shadow-lg">Progress Over Time</div>
              <div className="text-sm text-pink-100/80 mt-1">Visualize your learning journey month by month</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={progressData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#c4b5fd"/>
              <YAxis stroke="#c4b5fd"/>
              <Tooltip contentStyle={{ background: '#312e81', border: 'none', color: '#fff' }}/>
              <Area type="monotone" dataKey="progress" stroke="#a78bfa" fillOpacity={1} fill="url(#colorProgress)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Pie Chart */}
        <div className="bg-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center backdrop-blur-xl border border-white/10">
          {/* Fancy Header for Course Completion */}
          <div className="mb-8 flex items-center gap-4 w-full">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-400 via-pink-400 to-purple-400 shadow-lg">
              <CheckCircle className="text-white text-3xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white  tracking-wide drop-shadow-lg">Course</div>
              <div className="text-sm text-green-100/80 mt-1">See your course completion breakdown</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              {/* Custom Tooltip for PieChart */}
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const { name, value } = payload[0].payload;
                    return (
                      <div className="bg-black/60 text-gray-200 text-base rounded-lg shadow-lg px-3 py-2 border border-gray-200">
                        <div className="text-base font-semibold mb-1/2 tracking-wide">{name}</div>
                        <div className="text-lg font-bold text-gray-200">{value} courses</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course Details */}
      <div className="bg-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10">
        {/* Fancy Header for Courses */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 shadow-lg">
            <School className="text-white text-3xl drop-shadow-lg" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white  tracking-wide drop-shadow-lg">Your Courses</div>
            <div className="text-sm text-purple-100/80 mt-1">Track your learning journey and progress</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, idx) => {
            const StatusIcon = course.icon;
            return (
              <div key={course.name + idx} className="rounded-xl p-5 bg-gradient-to-br from-[#312e81]/80 to-[#0a081e]/80 shadow-xl flex flex-col gap-3 hover:scale-105 transition-transform duration-300 border border-white/10 relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/10 border border-white/20 ${course.iconColor} text-xl shadow-lg`}>
                    <StatusIcon className={`text-2xl ${course.iconColor}`} />
                  </span>
                  <span className="font-bold text-white text-lg drop-shadow-lg">{course.name}</span>
                  <span className={`ml-auto text-xs px-2 py-1 rounded-full ${course.status === 'Completed' ? 'bg-green-500/20 text-green-200 border-green-400/30' : 'bg-pink-500/20 text-pink-200 border-pink-400/30'} border`}>{course.status}</span>
                </div>
                {course.coverImage && <img src={course.coverImage} alt="cover" className="rounded-lg w-full h-32 object-cover mb-2 border border-white/10 shadow-md" />}
                <div className="w-full bg-purple-900/30 rounded-full h-3 mt-2">
                  <div
                    className={`h-3 rounded-full ${course.color}`}
                    style={{ width: `${course.progress}%`, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }}
                  ></div>
                </div>
                <div className="text-xs text-purple-200 mt-1">Progress: {course.progress}%</div>
                {course.certificateUrl && (
                  <a href={course.certificateUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-green-300 hover:underline"><EmojiEvents className="text-yellow-400" fontSize="small" /> View Certificate</a>
                )}
                {/* Glow effect */}
                {/* <div className={`absolute inset-0 rounded-xl pointer-events-none group-hover:opacity-60 opacity-0 transition-all duration-300 blur-2xl ${course.color}`} /> */}
              </div>
            );
          })}
        </div>
      </div>

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <div className="bg-gradient-to-br from-green-400/10 to-purple-400/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10 mt-10">
          {/* Fancy Header for Certificates */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 via-green-400 to-purple-400 shadow-lg">
              <EmojiEvents className="text-white text-3xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white  tracking-wide drop-shadow-lg">Certificates</div>
              <div className="text-sm text-green-100/80 mt-1">Celebrate your achievements and download your certificates</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certificates.map(cert => (
              <div key={cert._id} className="rounded-xl p-5 bg-gradient-to-br from-green-400/20 to-purple-400/20 shadow-xl flex flex-col gap-2 border border-white/10 relative">
                <div className="flex items-center gap-2 mb-2">
                  <EmojiEvents className="text-yellow-400 text-2xl" />
                  <span className="font-bold text-white text-lg">{cert.course.title}</span>
                  <span className="ml-auto text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-200 border border-green-400/30">Score: {cert.score}</span>
                </div>
                <div className="text-xs text-purple-200">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</div>
                <a href={cert.downloadLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-green-300 hover:underline"><EmojiEvents className="text-yellow-400" fontSize="small" /> Download Certificate</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Section */}
      {eventsList.length > 0 && (
        <div className="bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10 mt-10">
          {/* Fancy Header for Events */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 shadow-lg">
              <Event className="text-white text-3xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white  tracking-wide drop-shadow-lg">Registered Events</div>
              <div className="text-sm text-blue-100/80 mt-1">See your upcoming and past event registrations</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventsList.map(ev => (
              <div key={ev._id} className="rounded-xl p-5 bg-gradient-to-br from-blue-400/20 to-purple-400/20 shadow-xl flex flex-col gap-2 border border-white/10 relative">
                <img src={ev.bannerImage} alt="event banner" className="rounded-lg w-full h-32 object-cover mb-2 border border-white/10 shadow-md" />
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-white text-lg">{ev.title}</span>
                  <span className="ml-auto text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">{ev.category}</span>
                </div>
                <div className="text-xs text-purple-200">{new Date(ev.date).toLocaleDateString()} | {ev.startTime} - {ev.endTime}</div>
                <div className="text-xs text-purple-200">Location: {ev.location} ({ev.mode})</div>
                <div className="flex items-center gap-2 mt-2">
                  <img src={ev.speaker.photo} alt="speaker" className="w-8 h-8 rounded-full border border-white/20" />
                  <span className="text-sm text-white font-semibold">{ev.speaker.name}</span>
                  <span className="text-xs text-purple-200">{ev.speaker.designation}</span>
                  <a href={ev.speaker.linkedIn} target="_blank" rel="noopener noreferrer" className="ml-auto text-blue-300 hover:underline text-xs">LinkedIn</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage; 