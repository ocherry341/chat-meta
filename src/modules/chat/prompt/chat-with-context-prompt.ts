//TODO user a better prompt
export const CHAT_WITH_CONTEXT_PROMPT = `
Context information is list below.
---------------------
{context}
---------------------
Given the context information and not prior knowledge, answer the question: {question}.
`;

export function getPrompt(context: string[]): string {
  const contextString = context.join('\n');
  return CHAT_WITH_CONTEXT_PROMPT.replace('{context}', contextString);
}