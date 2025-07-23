import React, { useEffect, useState } from 'react';
import BaseUrl from '../Api';
import {
  TrendingUp,
  School,
  CheckCircle,
  HourglassEmpty,
  EmojiEvents,
  PlayCircle,
  AccessTime as Clock,
  CalendarToday,
  Star,
  Timeline,
  BarChart,
  PieChart as PieChartIcon,
  Close as CloseIcon,
  Visibility
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart as RechartsBarChart,
  Bar
} from 'recharts';
import ReactDOM from 'react-dom';

const Progress = () => {
  const [progressData, setProgressData] = useState([]);
  const [stats, setStats] = useState({ registered: 0, completed: 0, inProgress: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  // Remove bodyScrollLocked state and main scroll lock logic

  useEffect(() => {
    const fetchProgressData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        // Fetch progress summary
        const summaryRes = await fetch(`${BaseUrl}/progress/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Fetch stats metrics
        const statsRes = await fetch(`${BaseUrl}/progress/stats/metrics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!summaryRes.ok || !statsRes.ok) {
          throw new Error('Failed to fetch progress data');
        }
        const summaryData = await summaryRes.json();
        const statsData = await statsRes.json();
        setProgressData(summaryData.data || []);
        setStats(statsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  // Modal open handler
  const handleOpenModal = async (courseId) => {
    setSelectedCourseId(courseId);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch course progress details
      const res = await fetch(`${BaseUrl}/progress/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Fetch updated stats
      const statsRes = await fetch(`${BaseUrl}/progress/stats/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok || !statsRes.ok) throw new Error('Failed to fetch course details');
      const data = await res.json();
      const statsData = await statsRes.json();
      setSelectedCourseDetails(data);
      setStats(statsData);
    } catch (err) {
      setSelectedCourseDetails(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCourseId(null);
    setSelectedCourseDetails(null);
  };

  // Loading & error states
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 font-bold py-10">
        {error}
      </div>
    );
  }

  // Calculate overall statistics
  const totalCourses = progressData.length;
  const completedCourses = progressData.filter(course => course.isCompleted).length;
  const inProgressCourses = totalCourses - completedCourses;
  const overallProgress = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  // Chart data for overall progress
  const progressChartData = [
    { name: 'Completed', value: completedCourses, color: '#10b981' },
    { name: 'In Progress', value: inProgressCourses, color: '#f59e0b' },
  ];

  // Monthly progress data (simulated based on completion dates)
  const monthlyProgressData = progressData
    .filter(course => course.isCompleted)
    .reduce((acc, course) => {
      const month = new Date(course.updatedAt).toLocaleDateString('en-US', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

  const monthlyData = Object.entries(monthlyProgressData).map(([month, count]) => ({
    month,
    completed: count
  }));

  return (
    <div className="space-y-10 pb-10">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl p-8 shadow-2xl backdrop-blur-xl border border-white/10">
        <div className="flex items-center gap-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg">
            <TrendingUp className="text-white text-4xl drop-shadow-lg" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">
              Learning Progress
            </h1>
            <p className="text-lg text-purple-100/80 mt-2">
              Track your educational journey and celebrate your achievements
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-purple-400/30 to-purple-700/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3">
            <School className="text-2xl text-purple-100 drop-shadow-lg" />
          </div>
          <div className="z-10 flex flex-col items-center mt-10">
            <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{totalCourses}</div>
            <div className="text-sm font-medium mt-1 tracking-wide uppercase text-purple-100/90">Total Courses</div>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-green-400/30 to-green-600/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3">
            <CheckCircle className="text-2xl text-green-100 drop-shadow-lg" />
          </div>
          <div className="z-10 flex flex-col items-center mt-10">
            <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{completedCourses}</div>
            <div className="text-sm font-medium mt-1 tracking-wide uppercase text-green-100/90">Completed</div>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3">
            <HourglassEmpty className="text-2xl text-yellow-100 drop-shadow-lg" />
          </div>
          <div className="z-10 flex flex-col items-center mt-10">
            <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{inProgressCourses}</div>
            <div className="text-sm font-medium mt-1 tracking-wide uppercase text-yellow-100/90">In Progress</div>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-pink-400/30 to-pink-600/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3">
            <TrendingUp className="text-2xl text-pink-100 drop-shadow-lg" />
          </div>
          <div className="z-10 flex flex-col items-center mt-10">
            <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{overallProgress}%</div>
            <div className="text-sm font-medium mt-1 tracking-wide uppercase text-pink-100/90">Overall Progress</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Distribution Pie Chart */}
        <div className="bg-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-400 via-pink-400 to-purple-400 shadow-lg">
              <PieChartIcon className="text-white text-3xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg">Course Status</div>
              <div className="text-sm text-green-100/80 mt-1">Distribution of your courses</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={progressChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {progressChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
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

        {/* Monthly Progress Bar Chart */}
        <div className="col-span-2 bg-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 shadow-lg">
              <BarChart className="text-white text-3xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg">Monthly Achievements</div>
              <div className="text-sm text-blue-100/80 mt-1">Courses completed by month</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsBarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#c4b5fd"/>
              <YAxis stroke="#c4b5fd"/>
              <Tooltip contentStyle={{ background: '#312e81', border: 'none', color: '#fff' }}/>
              <Bar dataKey="completed" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course Progress Details */}
      <div className="bg-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 shadow-lg">
            <Timeline className="text-white text-3xl drop-shadow-lg" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-wide drop-shadow-lg">Course Progress Details</div>
            <div className="text-sm text-purple-100/80 mt-1">Detailed breakdown of your learning journey</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {progressData.map((course, idx) => {
            const isCompleted = course.isCompleted;
            const moduleProgress = course.progress.modules.percent;
            const lessonProgress = course.progress.lessons.percent;
            return (
              <div key={course.courseId + idx} className="group relative h-full">
                {/* View Icon Button */}
                <button
                  className="absolute top-3 right-3 z-20 bg-white/20 hover:bg-purple-500/80 text-purple-200 hover:text-white rounded-full p-2 shadow-lg transition-all duration-200"
                  onClick={() => handleOpenModal(course.courseId)}
                  title="View Details"
                >
                  <Visibility />
                </button>
                {/* Main Card */}
                <div className="relative h-full rounded-2xl p-5 bg-gradient-to-br from-[#312e81]/95 to-[#0a081e]/95 shadow-2xl hover:scale-105 transition-all duration-500 border border-white/20 overflow-hidden flex flex-col">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-xl"></div>
                  </div>

                  {/* Header Row */}
                  <div className="relative z-10 flex items-start gap-4 mb-4 flex-shrink-0">
                    {/* Course Image */}
                    <div className="relative flex-shrink-0">
                      {course.coverImage ? (
                        <img
                          src={course.coverImage}
                          alt={course.courseTitle}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-white/20 shadow-lg group-hover:border-purple-400/50 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white/20 shadow-lg">
                          <School className="text-white text-xl" />
                        </div>
                      )}
                      {/* Status Badge */}
                      <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-yellow-500 text-white'
                      }`}>
                        {isCompleted ? '✓' : '●'}
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg leading-tight drop-shadow-lg line-clamp-2 group-hover:text-purple-200 transition-colors duration-300 mb-2">
                        {course.courseTitle}
                      </h3>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="text-purple-300 text-xs" />
                          <span className="text-xs text-purple-200 font-medium">{course.duration}</span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          isCompleted
                            ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                        }`}>
                          {isCompleted ? 'Completed' : 'In Progress'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bars Row */}
                  <div className="relative z-10 space-y-3 mb-4 flex-1">
                    {/* Modules Progress */}
                    <div className="bg-white/8 rounded-lg p-3 border border-white/15 backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <School className="text-white text-xs" />
                          </div>
                          <span className="text-xs text-purple-200 font-semibold">Modules</span>
                        </div>
                        <span className="text-xs text-purple-200 font-bold">
                          {course.progress.modules.completed}/{course.progress.modules.total}
                        </span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-purple-900/40 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 shadow-lg"
                            style={{
                              width: `${moduleProgress}%`,
                              transition: 'width 1.5s cubic-bezier(0.4,0,0.2,1)',
                              backgroundSize: '200% 100%',
                              animation: 'gradient-x 3s ease infinite'
                            }}
                          ></div>
                        </div>
                        <div className="absolute top-0 right-0 text-xs text-purple-200 font-bold mt-0.5">
                          {moduleProgress}%
                        </div>
                      </div>
                    </div>

                    {/* Lessons Progress */}
                    <div className="bg-white/8 rounded-lg p-3 border border-white/15 backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <PlayCircle className="text-white text-xs" />
                          </div>
                          <span className="text-xs text-purple-200 font-semibold">Lessons</span>
                        </div>
                        <span className="text-xs text-purple-200 font-bold">
                          {course.progress.lessons.completed}/{course.progress.lessons.total}
                        </span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-blue-900/40 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 shadow-lg"
                            style={{
                              width: `${lessonProgress}%`,
                              transition: 'width 1.5s cubic-bezier(0.4,0,0.2,1)',
                              backgroundSize: '200% 100%',
                              animation: 'gradient-x 3s ease infinite'
                            }}
                          ></div>
                        </div>
                        <div className="absolute top-0 right-0 text-xs text-blue-200 font-bold mt-0.5">
                          {lessonProgress}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Certificate & Footer Row */}
                  <div className="relative z-10 flex-shrink-0">
                    {/* Certificate Section */}
                    {isCompleted && course.certificateUrl && (
                      <div className="bg-gradient-to-r from-green-500/25 to-emerald-500/25 rounded-lg p-3 border border-green-400/40 backdrop-blur-sm mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                              <EmojiEvents className="text-white text-sm" />
                            </div>
                            <div>
                              <div className="text-xs text-green-200 font-semibold">Certificate Earned!</div>
                              <div className="text-xs text-green-300/80">Download achievement</div>
                            </div>
                          </div>
                          <a
                            href={course.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-md hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-purple-200/80 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <CalendarToday className="text-xs" />
                        <span>Updated: {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="text-yellow-400 text-xs" />
                        <span className="font-semibold">{moduleProgress + lessonProgress}/200</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  {/* <div className={`absolute inset-0 rounded-2xl pointer-events-none group-hover:opacity-60 opacity-0 transition-all duration-500 blur-2xl ${
                    isCompleted ? 'bg-green-400' : 'bg-yellow-400'
                  }`} /> */}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {progressData.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <School className="text-4xl text-purple-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Courses Found</h3>
            <p className="text-purple-200/80">Start your learning journey by enrolling in courses!</p>
          </div>
        )}
      </div>

      {/* Achievement Summary */}
      <div className="bg-gradient-to-br from-yellow-400/10 to-purple-400/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 shadow-lg">
            <EmojiEvents className="text-white text-3xl drop-shadow-lg" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-wide drop-shadow-lg">Achievement Summary</div>
            <div className="text-sm text-yellow-100/80 mt-1">Celebrate your learning milestones</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-xl border border-green-400/30">
            <div className="text-4xl font-bold text-green-300 mb-2">{completedCourses}</div>
            <div className="text-green-200 font-semibold">Courses Completed</div>
            <div className="text-xs text-green-300/80 mt-1">Great job! Keep going!</div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-xl border border-blue-400/30">
            <div className="text-4xl font-bold text-blue-300 mb-2">
              {progressData.reduce((total, course) => total + course.progress.modules.completed, 0)}
            </div>
            <div className="text-blue-200 font-semibold">Modules Completed</div>
            <div className="text-xs text-blue-300/80 mt-1">Knowledge gained!</div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-xl border border-purple-400/30">
            <div className="text-4xl font-bold text-purple-300 mb-2">
              {progressData.reduce((total, course) => total + course.progress.lessons.completed, 0)}
            </div>
            <div className="text-purple-200 font-semibold">Lessons Completed</div>
            <div className="text-xs text-purple-300/80 mt-1">Skills mastered!</div>
          </div>
          
        </div>
      </div>

      {/* Modal for course details (moved outside main content grid) */}
      {modalOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
          <div className="relative w-full max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto min-w-[320px] bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-purple-400/30 flex flex-col max-h-[85vh] overflow-hidden ring-2 ring-pink-400/10 animate-modalPop">
            {/* Accent Header Bar */}
            <div className="h-3 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
            {/* Close Button */}
            <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={handleCloseModal}>
              <CloseIcon fontSize="large" />
            </button>
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar">
              {modalLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
                </div>
              ) : selectedCourseDetails ? (
                <div className="space-y-6">
                  {/* Course Header */}
                  <div className="flex items-center gap-6">
                    <img src={selectedCourseDetails.course.coverImage} alt={selectedCourseDetails.course.title} className="w-24 h-24 rounded-xl object-cover border-2 border-white/20 shadow-lg" />
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-glow">{selectedCourseDetails.course.title}</h2>
                      <div className="text-purple-200 mb-1">{selectedCourseDetails.course.duration} | {selectedCourseDetails.course.level} | {selectedCourseDetails.course.language}</div>
                      <div className="text-sm text-purple-100 mb-2 line-clamp-3">{selectedCourseDetails.course.description}</div>
                      <div className="flex gap-2 text-xs">
                        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-400/30">{selectedCourseDetails.isCompleted ? 'Completed' : 'In Progress'}</span>
                        {selectedCourseDetails.certificateUrl && (
                          <a href={selectedCourseDetails.certificateUrl} target="_blank" rel="noopener noreferrer" className="bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-400/30 hover:bg-yellow-400/40 transition">Certificate</a>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Modules & Lessons */}
                  <div className="space-y-4">
                    {selectedCourseDetails.course.modules.map((mod, mIdx) => (
                      <div key={mod._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="font-bold text-lg text-purple-100 mb-1 flex items-center gap-2"><School className="text-purple-300" />{mod.moduleTitle}</div>
                        <div className="text-purple-200 text-xs mb-2">{mod.moduleDescription}</div>
                        <div className="space-y-2">
                          {mod.lessons.map((lesson, lIdx) => (
                            <div key={lesson._id} className="bg-purple-900/20 rounded-lg p-3">
                              <div className="font-semibold text-white flex items-center gap-2"><PlayCircle className="text-blue-300" />{lesson.title}</div>
                              <div className="text-purple-200 text-xs mb-1">{lesson.summary}</div>
                              {/* Topics */}
                              <div className="ml-4 space-y-1">
                                {lesson.topics.map((topic, tIdx) => (
                                  <div key={topic._id} className="text-xs text-purple-100 flex items-center gap-2">
                                    <span className="font-bold">• {topic.title}</span>
                                    <span className="italic">{topic.description}</span>
                                    {topic.videoUrl && <a href={topic.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline ml-2">Video</a>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Progress & Stats */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-xl p-4 flex-1 min-w-[180px]">
                      <div className="text-xs text-blue-200 mb-1">Modules Completed</div>
                      <div className="text-2xl font-bold text-white">
                        {progressData.reduce((total, course) => total + course.progress.modules.completed, 0)}
                        /
                        {progressData.reduce((total, course) => total + course.progress.modules.total, 0)}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-xl p-4 flex-1 min-w-[180px]">
                      <div className="text-xs text-purple-200 mb-1">Lessons Completed</div>
                      <div className="text-2xl font-bold text-white">
                        {progressData.reduce((total, course) => total + course.progress.lessons.completed, 0)}
                        /
                        {progressData.reduce((total, course) => total + course.progress.lessons.total, 0)}
                      </div>
                    </div>
                  </div>
                  {/* Last Updated & Certificate */}
                  <div className="flex items-center gap-4 mt-4 text-xs text-purple-200">
                    <CalendarToday className="text-xs" />
                    <span>Updated: {selectedCourseDetails.updatedAt ? new Date(selectedCourseDetails.updatedAt).toLocaleDateString() : '-'}</span>
                    {selectedCourseDetails.certificateUrl && (
                      <a href={selectedCourseDetails.certificateUrl} target="_blank" rel="noopener noreferrer" className="ml-4 text-green-300 underline">View Certificate</a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-400 font-bold py-10">Failed to load course details.</div>
              )}
            </div>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fadeIn {
              animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1);
            }
            @keyframes modalPop {
              0% { transform: scale(0.95) translateY(40px); opacity: 0; }
              100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            .animate-modalPop {
              animation: modalPop 0.4s cubic-bezier(0.4,0,0.2,1);
            }
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #a78bfa55;
              border-radius: 8px;
            }
          `}</style>
        </div>,
        document.getElementById('modal-root')
      )}
    </div>
  );
};

export default Progress; 