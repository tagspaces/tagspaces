export const DEFAULT_QUESTION_PROMPT =
  'Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.   Chat History: {chat_history} Follow Up Input: {question} Standalone question:';

export const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant. If you don't know the answer, just say you don't know. DO NOT try to make up an answer. Question: {question} Helpful answer:`;

export const SUMMARIZE_PROMPT = `You will give a follow-up question.  You need to rephrase the follow-up question if needed so it is a standalone question that can be used by the AI model to search the internet.

Example:

Follow-up question: What are the symptoms of a heart attack?

Rephrased question: Symptoms of a heart attack.

Follow-up question: Where is the upcoming Olympics being held?

Rephrased question: Location of the upcoming Olympics.

Follow-up question: Taylor Swift's latest album?

Rephrased question: Name of Taylor Swift's latest album.

Follow-up question: {question}

Rephrased question:
`;
