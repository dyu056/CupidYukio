import { Context, Markup } from "telegraf";
import { questions, categories, getQuestionsByCategory } from "../data/questions";
import { logger } from "../utils/logger";
import { QuestionSelectionState } from "../types/session.types";
import { User } from "../models/user.model";
import { profileService } from "../services/profile.service";

const QUESTIONS_PER_PAGE = 3;

export function ensureQuestionSelection(ctx: Context) {
  if (!ctx.session) ctx.session = {};
  if (!ctx.session.questionSelection) {
    ctx.session.questionSelection = {
      currentCategoryIndex: 0,
      selectedQuestions: [],
      currentPage: 0,
      questionsPerPage: QUESTIONS_PER_PAGE,
    };
  }
}

export async function handleQuestionSelection(ctx: Context) {
  if (!ctx.message || !ctx.from) return;
  ensureQuestionSelection(ctx);

  const questionSelection = ctx.session.questionSelection;
  if (!questionSelection) return;
  
  const { currentCategoryIndex, selectedQuestions, currentPage } = questionSelection;

  if (!("text" in ctx.message)) {
    // Show category selection if no category is selected
    if (currentCategoryIndex === 0 && currentPage === 0 && selectedQuestions.length === 0) {
      return await showCategorySelection(ctx);
    }
    
    const currentCategory = categories[currentCategoryIndex];
    const categoryQuestions = getQuestionsByCategory(currentCategory);
    const totalPages = Math.ceil(categoryQuestions.length / QUESTIONS_PER_PAGE);
    return await showQuestionPage(ctx, currentCategory, categoryQuestions, currentPage, totalPages, selectedQuestions);
  }

  const text = ctx.message.text;

  // Handle category selection
  if (categories.includes(text) && ctx.session.questionSelection) {
    const categoryIndex = categories.indexOf(text);
    ctx.session.questionSelection.currentCategoryIndex = categoryIndex;
    ctx.session.questionSelection.currentPage = 0;
    
    const categoryQuestions = getQuestionsByCategory(text);
    const totalPages = Math.ceil(categoryQuestions.length / QUESTIONS_PER_PAGE);
    return await showQuestionPage(ctx, text, categoryQuestions, 0, totalPages, selectedQuestions);
  }

  // Handle "Back to Categories" button
  if (text === "⬅️ Back to Categories" && ctx.session.questionSelection) {
    ctx.session.questionSelection.currentCategoryIndex = 0;
    ctx.session.questionSelection.currentPage = 0;
    return await showCategorySelection(ctx);
  }

  // Handle navigation buttons
  if (text === "⬅️ Prev Page") {
    if (currentPage > 0 && ctx.session.questionSelection) {
      ctx.session.questionSelection.currentPage = currentPage - 1;
      const currentCategory = categories[currentCategoryIndex];
      const categoryQuestions = getQuestionsByCategory(currentCategory);
      const totalPages = Math.ceil(categoryQuestions.length / QUESTIONS_PER_PAGE);
      return await showQuestionPage(ctx, currentCategory, categoryQuestions, currentPage - 1, totalPages, selectedQuestions);
    }
  }

  if (text === "➡️ Next Page") {
    const currentCategory = categories[currentCategoryIndex];
    const categoryQuestions = getQuestionsByCategory(currentCategory);
    const totalPages = Math.ceil(categoryQuestions.length / QUESTIONS_PER_PAGE);
    if (currentPage < totalPages - 1 && ctx.session.questionSelection) {
      ctx.session.questionSelection.currentPage = currentPage + 1;
      return await showQuestionPage(ctx, currentCategory, categoryQuestions, currentPage + 1, totalPages, selectedQuestions);
    }
  }

  if (text === "✅ Done") {
    if (selectedQuestions.length === 0) {
      return await ctx.reply("Please select at least 1 question before proceeding.");
    }
    if (selectedQuestions.length > 5) {
      return await ctx.reply("You can only select up to 5 questions. Please deselect some questions.");
    }

    // Check if we're in update mode
    if (ctx.session.isUpdateMode) {
      try {
        // Save questions to user profile
        await profileService.updateProfile(ctx.from.id, {
          questions: selectedQuestions,
        });
        
        // Clear update mode and question selection
        delete ctx.session.isUpdateMode;
        if (ctx.session.questionSelection) {
          delete ctx.session.questionSelection;
        }

        await ctx.reply(
          "Questions updated successfully! ✨",
          Markup.keyboard([
            ["My Profile 👤", "Browse Matches 👥"],
            ["My Matches 💕", "Update Profile ✏️"],
          ]).resize()
        );
        return;
      } catch (error) {
        logger.error("Error updating questions:", error);
        await ctx.reply("Sorry, there was an error updating your questions. Please try again.");
        return;
      }
    }

    // Original flow for profile setup
    // Save selected questions to profile setup
    if (!ctx.session.profileSetup) {
      ctx.session.profileSetup = {
        step: "questions",
        data: {}
      };
    }
    ctx.session.profileSetup.data.questions = selectedQuestions;
    ctx.session.profileSetup.step = "photo";
    if (ctx.session.questionSelection) {
      delete ctx.session.questionSelection;
    }

    return await ctx.reply(
      "Great! Now, send me a photo of yourself (Max 1 photo).",
      Markup.removeKeyboard()
    );
  }

  if (text === "🗑️ Clear Selection") {
    if (ctx.session.questionSelection) {
      ctx.session.questionSelection.selectedQuestions = [];
    }
    const currentCategory = categories[currentCategoryIndex];
    const categoryQuestions = getQuestionsByCategory(currentCategory);
    const totalPages = Math.ceil(categoryQuestions.length / QUESTIONS_PER_PAGE);
    return await showQuestionPage(ctx, currentCategory, categoryQuestions, currentPage, totalPages, []);
  }

  // Handle cancel action
  if (text === "❌ Cancel") {
    const isUpdateMode = ctx.session.isUpdateMode;
    
    // Clear question selection and update mode
    if (ctx.session.questionSelection) {
      delete ctx.session.questionSelection;
    }
    delete ctx.session.isUpdateMode;

    if (isUpdateMode) {
      await ctx.reply(
        "Question update cancelled. Back to profile.",
        Markup.keyboard([
          ["My Profile 👤", "Browse Matches 👥"],
          ["My Matches 💕", "Update Profile ✏️"],
        ]).resize()
      );
    } else {
      await ctx.reply(
        "Question selection cancelled. Back to profile setup.",
        Markup.keyboard([["/start"]]).resize()
      );
    }
    return;
  }

  // Handle question selection/deselection
  const questionMatch = text.match(/^[✅❌]\sQ(\d+)$/);
  if (questionMatch) {
    const questionIndex = parseInt(questionMatch[1]) - 1;
    const currentCategory = categories[currentCategoryIndex];
    const categoryQuestions = getQuestionsByCategory(currentCategory);
    const startIndex = currentPage * QUESTIONS_PER_PAGE;
    const pageQuestions = categoryQuestions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);
    const question = pageQuestions[questionIndex];
    
    if (question && ctx.session.questionSelection) {
      const isSelected = selectedQuestions.includes(question.id);
      if (isSelected) {
        // Deselect question
        ctx.session.questionSelection.selectedQuestions = selectedQuestions.filter((id: string) => id !== question.id);
      } else {
        // Select question
        if (selectedQuestions.length >= 5) {
          return await ctx.reply("You can only select up to 5 questions. Please deselect some questions first.");
        }
        ctx.session.questionSelection.selectedQuestions = [...selectedQuestions, question.id];
      }
      
      const totalPages = Math.ceil(categoryQuestions.length / QUESTIONS_PER_PAGE);
      return await showQuestionPage(ctx, currentCategory, categoryQuestions, currentPage, totalPages, ctx.session.questionSelection.selectedQuestions);
    }
  }

  // If no valid action, show current page
  const currentCategory = categories[currentCategoryIndex];
  const categoryQuestions = getQuestionsByCategory(currentCategory);
  const totalPages = Math.ceil(categoryQuestions.length / QUESTIONS_PER_PAGE);
  return await showQuestionPage(ctx, currentCategory, categoryQuestions, currentPage, totalPages, selectedQuestions);
}

async function showCategorySelection(ctx: Context) {
  const categoryButtons = categories.map(category => [category]);
  const actionButtons = ["✅ Done", "🗑️ Clear Selection", "❌ Cancel"];
  
  const keyboard = [
    ...categoryButtons,
    actionButtons
  ];

  const selectedCount = ctx.session.questionSelection?.selectedQuestions?.length || 0;
  const message = [
    "📝 **Question Selection**",
    `Selected: ${selectedCount}/5 questions`,
    "",
    "Choose a category to browse questions:",
    ...categories.map(category => `• ${category}`)
  ].join("\n");

  await ctx.reply(message, {
    parse_mode: "Markdown",
    ...Markup.keyboard(keyboard).resize()
  });
}

async function showQuestionPage(
  ctx: Context, 
  category: string, 
  questions: any[], 
  page: number, 
  totalPages: number, 
  selectedQuestions: string[]
) {
  const startIndex = page * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const pageQuestions = questions.slice(startIndex, endIndex);

  const questionButtons = pageQuestions.map((q, index) => {
    const isSelected = selectedQuestions.includes(q.id);
    return [`${isSelected ? '✅' : '❌'} Q${index + 1}`];
  });

  const navigationButtons = [];
  if (totalPages > 1) {
    if (page > 0) {
      navigationButtons.push("⬅️ Prev Page");
    }
    if (page < totalPages - 1) {
      navigationButtons.push("➡️ Next Page");
    }
  }

  const actionButtons = ["✅ Done", "🗑️ Clear Selection", "⬅️ Back to Categories", "❌ Cancel"];
  
  const keyboard = [
    ...questionButtons,
    ...(navigationButtons.length > 0 ? [navigationButtons] : []),
    actionButtons
  ];

  const selectedCount = selectedQuestions.length;
  const message = [
    `📝 **Question Selection - ${category}**`,
    `Page ${page + 1} of ${totalPages}`,
    `Selected: ${selectedCount}/5 questions`,
    "",
    "Select questions by tapping the buttons below:",
    ...pageQuestions.map((q, index) => `**Q${index + 1}:** ${q.text}`)
  ].join("\n");

  await ctx.reply(message, {
    parse_mode: "Markdown",
    ...Markup.keyboard(keyboard).resize()
  });
}

export async function startQuestionSelectionForUpdate(ctx: Context) {
  if (!ctx.from) return;
  
  try {
    // Get current user data to load existing questions
    const currentUser = await User.findOne({ telegramId: ctx.from.id });
    if (!currentUser) {
      throw new Error("User not found");
    }

    ensureQuestionSelection(ctx);
    if (ctx.session.questionSelection) {
      ctx.session.questionSelection.currentCategoryIndex = 0;
      ctx.session.questionSelection.currentPage = 0;
      // Load existing questions as selected
      ctx.session.questionSelection.selectedQuestions = currentUser.questions || [];
    }

    // Set update mode flag
    if (!ctx.session) ctx.session = {};
    ctx.session.isUpdateMode = true;

    await showCategorySelection(ctx);
  } catch (error) {
    logger.error("Error starting question selection for update:", error);
    await ctx.reply("Sorry, there was an error. Please try again.");
  }
}

export async function startQuestionSelection(ctx: Context) {
  if (!ctx.from) return;
  
  ensureQuestionSelection(ctx);
  if (ctx.session.questionSelection) {
    ctx.session.questionSelection.currentCategoryIndex = 0;
    ctx.session.questionSelection.currentPage = 0;
    ctx.session.questionSelection.selectedQuestions = [];
  }

  await showCategorySelection(ctx);
} 