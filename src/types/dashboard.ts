export interface DashboardStats {
  inProgressCourses: number;
  completedCourses: number;
  totalCertificates: number;
  streak: number;
}

export interface NextLecture {
  id: number;
  title: string;
  url: string;
}

export interface RecentCourse {
  courseId: number;
  title: string;
  thumbnail: string | null;
  progress: number;
  totalLectures: number;
  completedLectures: number;
  lastAccessedAt: string | null;
  nextLecture: NextLecture | null;
}

export interface DashboardResponse {
  message: string;
  stats: DashboardStats;
  recentCourses: RecentCourse[];
}
