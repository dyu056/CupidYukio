export interface ProfileSetupState {
  step: "age" | "gender" | "interests" | "photo" | "complete";
  data: {
    age?: string;
    gender?: "male" | "female" | "other";
    interests?: string[];
    photoUrl?: string;
  };
}

export interface SessionData {
  profileSetup?: ProfileSetupState;
}

// Extend Telegraf Context to include our session data
declare module "telegraf" {
  interface Context {
    session: SessionData;
  }
}
