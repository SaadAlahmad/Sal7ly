export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  is_admin: boolean;
  status: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Craftsman {
  id: number;
  name: string;
  email: string;
  mobile: string;
  category_id: number;
  city: string;
  bio: string;
  avatar_path: string | null;
  years_experience: number | null;
  availability: boolean;
  is_verified: boolean;
  status: string;
  subscription_tier: string;
  is_featured: boolean;
  is_badge_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
}

export interface JobRequest {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  details: string;
  city: string;
  location: string;
  budget: string | null;
  status: string;
  closure_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: number;
  request_id: number;
  craftsman_id: number;
  cover_letter: string | null;
  proposed_price: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  request_id: number;
  application_id: number;
  craftsman_id: number;
  user_id: number;
  status: string;
  auto_complete_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  project_id: number;
  direction: string;
  rating: number;
  review_text: string | null;
  status: string;
  created_at: string;
}

export interface CraftsmanRating {
  id: number;
  craftsman_id: number;
  reviews_count: number;
  average_rating: string;
  bayesian_score: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  user_type: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export type UserType = "user" | "craftsman";

export interface AuthState {
  token: string | null;
  user: User | Craftsman | null;
  userType: UserType | null;
  login: (
    token: string,
    user: User | Craftsman,
    userType: "user" | "craftsman",
  ) => void;
  logout: () => void;
}
