export const DEFAULT_QUESTION_PROMPT =
  'Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.   Chat History: {chat_history} Follow Up Input: {question} Standalone question:';

export const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant. If you don't know the answer, just say you don't know. DO NOT try to make up an answer. Question: {question} Helpful answer:`;

export const SUMMARIZE_PROMPT = `Generate a concise summary {file_path}, and highlight key insights about topic from the text. {summarize_text}`;
