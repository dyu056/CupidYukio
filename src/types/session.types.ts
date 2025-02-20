export interface ProfileSetupState {
  step: "age" | "gender" | "interests" | "about" | "photo" | "complete";
  data: {
    age?: string;
    gender?: "male" | "female" | "other";
    interests?: string[];
    photoUrl?: string;
    name?: string;
    about?: string;
  };
}

export interface SessionData {
  profileSetup?: ProfileSetupState;
  updateField?: "name" | "age" | "gender" | "interests" | "photo" | "about";
  newInterests?: string[];
  browsing?: {
    currentMatchId: string;
    matches: string[];
    dailySwipes: number;
    lastSwipeDate: string;
  };
}

// Extend Telegraf Context to include our session data
declare module "telegraf" {
  interface Context {
    session: SessionData;
  }
}
