import { IUser } from "../models/user.model";

export interface ProfileSetupState {
  step: "age" | "gender" | "questions" | "photo" | "complete";
  data: {
    age?: string;
    gender?: "male" | "female" | "other";
    questions?: string[];
    photoUrl?: string;
    name?: string;
  };
}

export interface QuestionSelectionState {
  currentCategoryIndex: number;
  selectedQuestions: string[];
  currentPage: number;
  questionsPerPage: number;
}

export interface BrowsingSession {
  matches: (IUser & { _id: string })[];
  dailySwipes: number;
  lastSwipeDate: string;
  currentMatchId: string;
}

export interface SessionData {
  profileSetup?: ProfileSetupState;
  questionSelection?: QuestionSelectionState;
  browsing?: BrowsingSession;
  updateField?: string;
  newInterests?: string[];
}

// Extend Telegraf Context to include our session data
declare module "telegraf" {
  interface Context {
    session: SessionData;
  }
}
