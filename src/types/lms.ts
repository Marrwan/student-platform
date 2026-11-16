export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url?: string | null;
  price: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_published: boolean;
  category?: string;
  is_enrolled?: boolean;
  modules_count?: number;
  topics_count?: number;
  completed_topics_count?: number;
  total_topics_count?: number;
  progress_percentage?: number;
  prerequisites?: string[] | null;
  created_at: string;
  updated_at: string;
  modules?: Module[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  order_index: number;
  pass_score_percentage: number;
  deadline_days?: number | null;
  is_locked?: boolean;
  is_overdue?: boolean;
  late_fee_amount?: number;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  type: 'written' | 'video_embed' | 'video_link' | 'blog_link' | 'code_playground';
  runner_type?: 'browser_js' | 'html_css' | 'node_js' | 'php' | 'python';
  sandbox_config?: Record<string, any> | null;
  content_markdown?: string | null;
  body_markdown?: string | null;
  video_url?: string | null;
  starter_code?: Record<string, any> | string | null;
  solution_code?: Record<string, any> | string | null;
  order_index: number;
  estimated_minutes: number;
  deadline_hours?: number | null;
  is_completed?: boolean;
  is_locked?: boolean;
  user_progress?: {
    status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
    completed_at?: string | null;
  };
  assessment?: Assessment | null;
}

export interface Assessment {
  id: string;
  assessable_type: string;
  assessable_id: string;
  title: string;
  type: 'quiz' | 'coding';
  passing_score: number;
  time_limit_minutes?: number | null;
  late_fee_amount?: number;
  test_cases?: TestCase[];
  quiz_questions?: QuizQuestion[];
}

export interface TestCase {
  id: string;
  assessment_id: string;
  description: string;
  input_payload?: string | null;
  expected_output: string;
  is_hidden: boolean;
  points: number;
}

export interface QuizQuestion {
  id: string;
  assessment_id: string;
  question_text: string;
  type: 'single_choice' | 'multiple_choice';
  points: number;
  options?: QuizOption[];
}

export interface QuizOption {
  id: string;
  quiz_question_id: string;
  option_text: string;
  is_correct?: boolean;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'suspended';
  enrolled_at: string;
  completed_at?: string | null;
  current_module_id?: string | null;
  current_topic_id?: string | null;
  course?: Course;
}

export interface DiscussionComment {
  id: string;
  commentable_type: string;
  commentable_id: string;
  user_id: string;
  parent_id?: string | null;
  body_markdown: string;
  is_pinned: boolean;
  upvotes_count: number;
  user?: {
    id: string;
    full_name: string;
    avatar?: string | null;
  };
  replies?: DiscussionComment[];
  created_at: string;
}

export interface ProjectShowcase {
  id: string;
  project_id: string;
  user_id: string;
  live_url?: string | null;
  github_url?: string | null;
  preview_html?: string | null;
  score: number;
  likes_count: number;
  is_featured: boolean;
  status: string;
  admin_feedback?: string | null;
  submitted_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar?: string | null;
  };
  project?: {
    id: string;
    title: string;
    description: string;
  };
}

export interface Certificate {
  id: string;
  uuid: string;
  user_id: string;
  course_id: string;
  certificate_code: string;
  course_title?: string;
  issued_at: string;
  course?: Course;
  user?: {
    id: string;
    full_name: string;
  };
}

export interface StudentMetric {
  id: string;
  user_id: string;
  period_type: 'weekly' | 'monthly';
  period_identifier: string;
  total_rank_score: number;
  rank: number;
  score_breakdown: {
    accuracy: number;
    punctuality: number;
    streak: number;
    community: number;
    project: number;
  };
  user: {
    id: string;
    full_name: string;
    avatar?: string | null;
    streak_count: number;
  };
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ActivityHeatmap {
  total_contributions: number;
  current_streak: number;
  longest_streak: number;
  heatmap: HeatmapDay[];
}
