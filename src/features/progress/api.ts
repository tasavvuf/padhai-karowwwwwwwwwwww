import { apiRequest } from "@/services/api-client";

export interface StudyStreakDay {
  date: string;
  label: string;
  completed: boolean;
  isToday: boolean;
  focusedMinutes: number;
  plannedMinutes: number;
}

export interface StudyStreakResponse {
  streak: number;
  days: StudyStreakDay[];
  todayFocusedMinutes: number;
  todayPlannedMinutes: number;
}

export interface WeeklyProgressDay {
  date: string;
  label: string;
  focusedMinutes: number;
  plannedMinutes: number;
  tasksCompleted: number;
  tasksTotal: number;
  completionPercentage: number;
  isToday: boolean;
}

export interface WeeklyProgressResponse {
  weekStart: string;
  weekEnd: string;
  totalPlannedMinutes: number;
  totalFocusedMinutes: number;
  totalInterruptedMinutes: number;
  overallCompletion: number;
  tasksTotal: number;
  tasksCompleted: number;
  tasksMissed: number;
  strongestDay: string;
  weakestDay: string;
  streak: number;
  days: WeeklyProgressDay[];
}

export const progressApi = {
  getDaily: (date?: string) => {
    const q = date ? `?date=${date}` : "";
    return apiRequest(`/progress/daily${q}`);
  },
  getWeekly: (week?: string) => {
    const q = week ? `?week=${week}` : "";
    return apiRequest<WeeklyProgressResponse>(`/progress/weekly${q}`);
  },
  getStreak: () => apiRequest<StudyStreakResponse>("/progress/streak"),
};
