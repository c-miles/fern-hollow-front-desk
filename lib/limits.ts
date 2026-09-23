export const MAX_QUESTION_CHARS = 1000;
export const MAX_HISTORY_MESSAGES = 12;
export const MAX_HISTORY_CHARS = 24_000;
export const MAX_REPLY_TOKENS = 1024;

export const RATE_LIMITED_MESSAGE =
  "You've asked a lot of questions in a short time. Please wait a few minutes and try again, or call the front desk.";
export const BUSY_MESSAGE =
  "Wren is taking a break for today. Please call the front desk and we'll be happy to help.";
export const TOO_LONG_MESSAGE =
  `That message is a bit long for Wren. Please keep questions under ${MAX_QUESTION_CHARS} characters.`;

// The chat transport turns a failed response's body into error.message, so the UI matches on these.
export const LIMIT_MESSAGES = [RATE_LIMITED_MESSAGE, BUSY_MESSAGE, TOO_LONG_MESSAGE];
