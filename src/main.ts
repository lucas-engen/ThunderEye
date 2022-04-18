import dotenv from "dotenv";
import Bot from "./bot";
import { Forum } from "./forum";
import { logError } from "./log";

// flag to check if dev server is open
let devServerOpen = false;

function loadEnv() {
  dotenv.config();
}

function fetchForum(posts: string[], channelId: string, bot: Bot) {
  posts.forEach((p) => {
    const post = p.toLowerCase();

    if (post.indexOf("dev server is now closed") !== -1) {
      devServerOpen = false;
    } else if (post.indexOf("dev server opening") !== -1 && !devServerOpen) {
      // Extract date interval
      const postSplit = post.split("!");
      const msg = postSplit[0];
      const date = postSplit[1];
      const interval = date.substring(1, 23);

      // Send message to telegram channel
      bot.sendMsg(channelId, `${msg}\n\nStart - end: ${interval}`);
      devServerOpen = true;
    }
  });
}

async function main() {
  // Load environment variables
  loadEnv();

  const { CHANNEL_ID } = process.env;

  if (CHANNEL_ID === undefined) {
    logError("channel ID isn't defined");
    process.exit(1);
  }

  // Load telegram bot
  const bot = new Bot();
  bot.setupTriggers();

  // Setup forum parser service (page 1 have been selected)
  const forum = new Forum();

  setInterval(async () => {
    const posts = await forum.getPostItems();
    fetchForum(posts, CHANNEL_ID, bot);
  }, 600000);
}

main();