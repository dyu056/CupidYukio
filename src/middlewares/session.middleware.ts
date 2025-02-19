import { Context } from "telegraf";
import { Session } from "../models/session.model";
import { logger } from "../utils/logger";

export async function mongoSession(ctx: Context, next: () => Promise<void>) {
  const key = ctx.from?.id.toString();
  if (!key) return next();

  try {
    // Get session from MongoDB
    let session = await Session.findOne({ key });

    if (!session) {
      session = await Session.create({
        key,
        data: {},
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    }

    ctx.session = session.data;

    await next();

    // Save session after update
    await Session.updateOne(
      { key },
      {
        $set: {
          data: ctx.session,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }
    );
  } catch (error) {
    logger.error("Session middleware error:", error);
    await next();
  }
}
