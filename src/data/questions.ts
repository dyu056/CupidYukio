export interface Question {
  id: string;
  text: string;
  category: string;
}

export const questions: Question[] = [
  // Core Values & Life Philosophy - 10 questions
  {
    id: "cv_1",
    text: "How do you define a 'successful' life? How important is this to you?",
    category: "Core Values & Life Philosophy"
  },
  {
    id: "cv_2", 
    text: "Where do you think the main meaning of life comes from? (e.g., career achievements, intimate relationships, personal growth, serving society, spiritual pursuits, etc.)",
    category: "Core Values & Life Philosophy"
  },
  {
    id: "cv_3",
    text: "Describe what your ideal daily life state would be like?",
    category: "Core Values & Life Philosophy"
  },
  {
    id: "cv_4",
    text: "What role does money play in your life? How do you view financial planning?",
    category: "Core Values & Life Philosophy"
  },
  {
    id: "cv_5",
    text: "Do you believe in fate/destiny, or do you believe more in 'where there's a will, there's a way'?",
    category: "Core Values & Life Philosophy"
  },
  {
    id: "cv_6",
    text: "How do you understand the balance between 'freedom' and 'responsibility'?",
    category: "Core Values & Life Philosophy"
  },
  {
    id: "cv_7",
    text: "How do you view personal growth? What are you currently learning or challenging yourself with?",
    category: "Core Values & Life Philosophy"
  },
  {
    id: "cv_8",
    text: "Describe an experience that had a profound impact on your life (positive or negative).",
    category: "Core Values & Life Philosophy"
  },
  {
    id: "cv_9",
    text: "What do you think is the most important quality in a person? (Please list 1-3)",
    category: "Core Values & Life Philosophy"
  },
  {
    id: "cv_10",
    text: "How do you understand 'loyalty'? Does it mean the same thing in different relationships (partner, friends, family)?",
    category: "Core Values & Life Philosophy"
  },

  // Emotional Patterns & Intimacy Needs - 10 questions
  {
    id: "ep_1",
    text: "In a long-term partnership, what do you think is most indispensable? (e.g., trust, communication, passion, shared goals, mutual respect, etc.)",
    category: "Emotional Patterns & Intimacy Needs"
  },
  {
    id: "ep_2",
    text: "How do you express love? How do you hope to be loved? (e.g., words of affirmation, acts of service, gifts, physical touch, quality time, etc.)",
    category: "Emotional Patterns & Intimacy Needs"
  },
  {
    id: "ep_3",
    text: "When you feel stressed, depressed, or vulnerable, how do you usually handle it? How do you hope your partner will support you?",
    category: "Emotional Patterns & Intimacy Needs"
  },
  {
    id: "ep_4",
    text: "How do you view independent space and personal time between partners?",
    category: "Emotional Patterns & Intimacy Needs"
  },
  {
    id: "ep_5",
    text: "Describe what you think is a healthy way to resolve emotional conflicts.",
    category: "Emotional Patterns & Intimacy Needs"
  },
  {
    id: "ep_6",
    text: "How do you think trust is built? Once broken, can it be repaired? Under what conditions?",
    category: "Emotional Patterns & Intimacy Needs"
  },
  {
    id: "ep_7",
    text: "How do you view commitment? (e.g., is it a natural result of emotions, or a choice that requires effort to maintain?)",
    category: "Emotional Patterns & Intimacy Needs"
  },
  {
    id: "ep_8",
    text: "What is your ideal sense of intimacy like? (spiritual, emotional, physical levels)",
    category: "Emotional Patterns & Intimacy Needs"
  },
  {
    id: "ep_9",
    text: "What is your biggest fear in a relationship?",
    category: "Emotional Patterns & Intimacy Needs"
  },
  {
    id: "ep_10",
    text: "What does the term 'soulmate' mean to you? Do you believe it exists?",
    category: "Emotional Patterns & Intimacy Needs"
  },

  // Communication Style & Conflict Resolution - 9 questions
  {
    id: "cs_1",
    text: "When you and your partner disagree, what is your typical reaction? (e.g., calm communication, avoidance, argument, seeking compromise, etc.)",
    category: "Communication Style & Conflict Resolution"
  },
  {
    id: "cs_2",
    text: "What do you think is the key to effective communication?",
    category: "Communication Style & Conflict Resolution"
  },
  {
    id: "cs_3",
    text: "Are you willing to actively express your needs and feelings in communication, even if it makes you uncomfortable?",
    category: "Communication Style & Conflict Resolution"
  },
  {
    id: "cs_4",
    text: "When your partner points out your flaws or mistakes, how do you usually react?",
    category: "Communication Style & Conflict Resolution"
  },
  {
    id: "cs_5",
    text: "How important do you think apology and forgiveness are in relationships? How do you practice them?",
    category: "Communication Style & Conflict Resolution"
  },
  {
    id: "cs_6",
    text: "Do you prefer direct and frank communication, or subtle and implicit expression? Why?",
    category: "Communication Style & Conflict Resolution"
  },
  {
    id: "cs_7",
    text: "When your partner is feeling down, do you tend to provide solutions or emotional support?",
    category: "Communication Style & Conflict Resolution"
  },
  {
    id: "cs_8",
    text: "Describe an experience where you successfully resolved an interpersonal conflict (not limited to intimate relationships).",
    category: "Communication Style & Conflict Resolution"
  },
  {
    id: "cs_9",
    text: "How do you view criticism? Can you distinguish between constructive criticism and personal attacks?",
    category: "Communication Style & Conflict Resolution"
  },

  // Life Goals & Future Planning - 10 questions
  {
    id: "lg_1",
    text: "What are your core life goals for the next 5-10 years? (career, life, personal growth, etc.)",
    category: "Life Goals & Future Planning"
  },
  {
    id: "lg_2",
    text: "How important is your settlement location to you? Where is your ideal place to live? Why?",
    category: "Life Goals & Future Planning"
  },
  {
    id: "lg_3",
    text: "What are your thoughts on starting a family (including whether to have children, how many)? Is this a must-have, a bonus, or not a consideration for you?",
    category: "Life Goals & Future Planning"
  },
  {
    id: "lg_4",
    text: "How do you view work-life balance? What is your current state?",
    category: "Life Goals & Future Planning"
  },
  {
    id: "lg_5",
    text: "What long-term hobbies or passions do you have?",
    category: "Life Goals & Future Planning"
  },
  {
    id: "lg_6",
    text: "What role does travel play in your life? What type of travel do you prefer?",
    category: "Life Goals & Future Planning"
  },
  {
    id: "lg_7",
    text: "How do you view a healthy lifestyle (diet, exercise, sleep schedule)? How important is this to you?",
    category: "Life Goals & Future Planning"
  },
  {
    id: "lg_8",
    text: "What are your future financial goals? (e.g., buying a house, investing, early retirement, etc.)",
    category: "Life Goals & Future Planning"
  },
  {
    id: "lg_9",
    text: "If your partner has a very attractive job opportunity but requires moving far away, how would you consider this?",
    category: "Life Goals & Future Planning"
  },
  {
    id: "lg_10",
    text: "Do you have any vision for your retirement life?",
    category: "Life Goals & Future Planning"
  },

  // Social & Family - 7 questions
  {
    id: "sf_1",
    text: "What role do friends play in your life? How do you maintain friendships?",
    category: "Social & Family"
  },
  {
    id: "sf_2",
    text: "How would you describe your relationship with your family of origin? Does this affect your current view of intimate relationships?",
    category: "Social & Family"
  },
  {
    id: "sf_3",
    text: "How do you expect your partner to integrate or handle relationships with your friends and family?",
    category: "Social & Family"
  },
  {
    id: "sf_4",
    text: "On weekends or holidays, do you prefer lively social activities or quiet time for two/alone time?",
    category: "Social & Family"
  },
  {
    id: "sf_5",
    text: "Do you think partners should become each other's best friends?",
    category: "Social & Family"
  },
  {
    id: "sf_6",
    text: "How do you handle boundaries between partners and opposite-sex friends?",
    category: "Social & Family"
  },
  {
    id: "sf_7",
    text: "What kind of family atmosphere do you hope for in the future?",
    category: "Social & Family"
  },

  // Sensitive but Important Topics - 9 questions
  {
    id: "si_1",
    text: "How do you view the relationship between sex and love? (e.g., inseparable, can be moderately separated, completely separate, etc.) Why?",
    category: "Sensitive but Important Topics"
  },
  {
    id: "si_2",
    text: "What is your view on platonic love (spiritual love)? (Please choose: Very unacceptable / Unacceptable but respectful / Indifferent / Acceptable but hope to develop / Completely acceptable and can enjoy)",
    category: "Sensitive but Important Topics"
  },
  {
    id: "si_3",
    text: "What is your view on open relationships or non-monogamous relationships?",
    category: "Sensitive but Important Topics"
  },
  {
    id: "si_4",
    text: "How do you view the institution of marriage? Is it a necessity?",
    category: "Sensitive but Important Topics"
  },
  {
    id: "si_5",
    text: "What role do religious or spiritual beliefs play in your life? Do you hope your partner has similar beliefs?",
    category: "Sensitive but Important Topics"
  },
  {
    id: "si_6",
    text: "How tolerant are you of political differences? What core issues do you think are irreconcilable?",
    category: "Sensitive but Important Topics"
  },
  {
    id: "si_7",
    text: "How do you view mental health issues (such as depression, anxiety)? If your partner experiences these, how would you support them?",
    category: "Sensitive but Important Topics"
  },
  {
    id: "si_8",
    text: "Have you ever had major health issues? How has this affected your attitude toward life?",
    category: "Sensitive but Important Topics"
  },
  {
    id: "si_9",
    text: "How do you view and handle relationships with ex-partners? Do you think it's acceptable for partners to maintain contact with ex-partners? To what extent?",
    category: "Sensitive but Important Topics"
  },

  // Self-awareness & Habits - 10 questions
  {
    id: "sh_1",
    text: "Use 3-5 keywords to describe yourself and explain why.",
    category: "Self-awareness & Habits"
  },
  {
    id: "sh_2",
    text: "What is your biggest strength? What is your biggest weakness (or area you're working to improve)?",
    category: "Self-awareness & Habits"
  },
  {
    id: "sh_3",
    text: "How do you cope with setbacks and failures in life?",
    category: "Self-awareness & Habits"
  },
  {
    id: "sh_4",
    text: "Are you more of a plan-oriented person or a go-with-the-flow person?",
    category: "Self-awareness & Habits"
  },
  {
    id: "sh_5",
    text: "What are your daily living habits like? (e.g., sleep schedule, household chore preferences, cleanliness standards, etc.)",
    category: "Self-awareness & Habits"
  },
  {
    id: "sh_6",
    text: "What 'quirks' or particularly persistent small habits do you have?",
    category: "Self-awareness & Habits"
  },
  {
    id: "sh_7",
    text: "How do you spend your alone time?",
    category: "Self-awareness & Habits"
  },
  {
    id: "sh_8",
    text: "Are you someone who easily gets bored? How do you create fun for yourself?",
    category: "Self-awareness & Habits"
  },
  {
    id: "sh_9",
    text: "How do you define 'personal space'? How much personal space do you need?",
    category: "Self-awareness & Habits"
  },
  {
    id: "sh_10",
    text: "Are you someone who likes to try new things, or do you prefer to stay in your comfort zone?",
    category: "Self-awareness & Habits"
  },

  // Hobbies & Cultural Taste - 10 questions
  {
    id: "hc_1",
    text: "What's the most recent book that left a deep impression on you? What about it moved you?",
    category: "Hobbies & Cultural Taste"
  },
  {
    id: "hc_2",
    text: "What's your favorite movie genre? Is there a movie you've watched repeatedly? Why?",
    category: "Hobbies & Cultural Taste"
  },
  {
    id: "hc_3",
    text: "What role does music play in your life? What's your favorite music genre or artist/band?",
    category: "Hobbies & Cultural Taste"
  },
  {
    id: "hc_4",
    text: "What's your favorite way to relax?",
    category: "Hobbies & Cultural Taste"
  },
  {
    id: "hc_5",
    text: "Do you like cooking? How do you view household chore division?",
    category: "Hobbies & Cultural Taste"
  },
  {
    id: "hc_6",
    text: "Are you interested in art (painting, photography, theater, etc.)? What type do you like?",
    category: "Hobbies & Cultural Taste"
  },
  {
    id: "hc_7",
    text: "Do you like outdoor activities? What do you enjoy?",
    category: "Hobbies & Cultural Taste"
  },
  {
    id: "hc_8",
    text: "Are you a pet person? Do you have experience or plans for keeping pets?",
    category: "Hobbies & Cultural Taste"
  },
  {
    id: "hc_9",
    text: "Do you like playing games (video games/board games)? What type do you prefer?",
    category: "Hobbies & Cultural Taste"
  },
  {
    id: "hc_10",
    text: "What's something that recently made you feel truly happy or excited?",
    category: "Hobbies & Cultural Taste"
  },

  // Situational Questions - 10 questions
  {
    id: "sq_1",
    text: "If you won a huge lottery, how would you plan to use this money?",
    category: "Situational Questions"
  },
  {
    id: "sq_2",
    text: "If you discovered your best friend was cheating on their partner, what would you do?",
    category: "Situational Questions"
  },
  {
    id: "sq_3",
    text: "When witnessing unfair incidents in public (such as discrimination, bullying), what action do you usually take?",
    category: "Situational Questions"
  },
  {
    id: "sq_4",
    text: "When your plans are disrupted, what's your first reaction?",
    category: "Situational Questions"
  },
  {
    id: "sq_5",
    text: "Do you think 'white lies' are acceptable in intimate relationships? Under what circumstances?",
    category: "Situational Questions"
  },
  {
    id: "sq_6",
    text: "How do you define 'betrayal'? What behaviors are absolutely unforgivable to you?",
    category: "Situational Questions"
  },
  {
    id: "sq_7",
    text: "If you and your partner have fundamental disagreements on major decisions (like buying a house, changing jobs, whether to have children), how would you handle it?",
    category: "Situational Questions"
  },
  {
    id: "sq_8",
    text: "Do you think partners should completely share passwords and privacy? Why?",
    category: "Situational Questions"
  },
  {
    id: "sq_9",
    text: "How do you feel about partners showcasing their relationship on social media?",
    category: "Situational Questions"
  },
  {
    id: "sq_10",
    text: "How do you hope your partner would celebrate your important days (birthday, anniversaries, etc.)?",
    category: "Situational Questions"
  },

  // Expectations for Partner - 10 questions
  {
    id: "ep_1",
    text: "When choosing a partner, what traits do you consider absolutely indispensable? (Please clearly distinguish between 'must-haves' and 'bonus points')",
    category: "Expectations for Partner"
  },
  {
    id: "ep_2",
    text: "What quality do you most admire in a partner?",
    category: "Expectations for Partner"
  },
  {
    id: "ep_3",
    text: "In what ways do you hope your partner can support you?",
    category: "Expectations for Partner"
  },
  {
    id: "ep_4",
    text: "What behaviors or traits in a partner are you unable to tolerate?",
    category: "Expectations for Partner"
  },
  {
    id: "ep_5",
    text: "What do you think an ideal partner relationship should be like? (e.g., like comrades, like confidants, like playmates, etc.)",
    category: "Expectations for Partner"
  },
  {
    id: "ep_6",
    text: "How do you hope your partner would share their life with you (including joys and troubles)?",
    category: "Expectations for Partner"
  },
  {
    id: "ep_7",
    text: "How do you view your partner's independence? Do you hope they have their own goals and pursuits?",
    category: "Expectations for Partner"
  },
  {
    id: "ep_8",
    text: "How much change or sacrifice do you think partners should make for the relationship?",
    category: "Expectations for Partner"
  },
  {
    id: "ep_9",
    text: "How do you hope your partner would interact with your friends and family?",
    category: "Expectations for Partner"
  },
  {
    id: "ep_10",
    text: "Do you have specific preferences for your partner's appearance, body type, or clothing style? How important is this?",
    category: "Expectations for Partner"
  },

  // Reflection & Growth - 5 questions
  {
    id: "rg_1",
    text: "Looking back on past relationships, what's the most important lesson you've learned?",
    category: "Reflection & Growth"
  },
  {
    id: "rg_2",
    text: "What do you think is the area you most need to improve in intimate relationships?",
    category: "Reflection & Growth"
  },
  {
    id: "rg_3",
    text: "How do you understand the role of 'compromise' in long-term relationships?",
    category: "Reflection & Growth"
  },
  {
    id: "rg_4",
    text: "What do you think is the most crucial factor in maintaining a long-term healthy relationship?",
    category: "Reflection & Growth"
  },
  {
    id: "rg_5",
    text: "What efforts are you willing to make to find/become a 'soulmate'?",
    category: "Reflection & Growth"
  }
];

export const categories = [
  "Core Values & Life Philosophy",
  "Emotional Patterns & Intimacy Needs", 
  "Communication Style & Conflict Resolution",
  "Life Goals & Future Planning",
  "Social & Family",
  "Sensitive but Important Topics",
  "Self-awareness & Habits",
  "Hobbies & Cultural Taste",
  "Situational Questions",
  "Expectations for Partner",
  "Reflection & Growth"
];

export function getQuestionsByCategory(category: string): Question[] {
  return questions.filter(q => q.category === category);
}

export function getAllCategories(): string[] {
  return categories;
} 