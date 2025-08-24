'use server';

/**
 * @fileOverview Provides an AI-powered tool to suggest optimal token purchase amounts based on user spending habits,
 * day of the week, and available canteen menus.
 *
 * @module suggestTokenPurchase
 * - `suggestTokenPurchase`: The main function to generate token purchase suggestions.
 * - `SuggestTokenPurchaseInput`: The input type for the `suggestTokenPurchase` function.
 * - `SuggestTokenPurchaseOutput`: The output type for the `suggestTokenPurchase` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Input schema for the token purchase suggestion flow.
 */
const SuggestTokenPurchaseInputSchema = z.object({
  spendingHabits: z
    .string()
    .describe(
      'A summary of the user historical spending habits, including frequency and amounts.'
    ),
  dayOfWeek: z
    .string()
    .describe(
      'The current day of the week, e.g., Monday, Tuesday, Wednesday, etc.'
    ),
  availableMenus: z
    .string()
    .describe('A description of the available canteen menus for the day.'),
  currentBalance: z
    .number()
    .describe('The current token balance of the user.'),
});
export type SuggestTokenPurchaseInput = z.infer<typeof SuggestTokenPurchaseInputSchema>;

/**
 * Output schema for the token purchase suggestion flow.
 */
const SuggestTokenPurchaseOutputSchema = z.object({
  suggestedPurchaseAmount: z
    .number()
    .describe('The suggested token purchase amount.'),
  reasoning:
    z.string()
    .describe(
      'The AI reasoning behind the suggested purchase amount, considering spending habits, day of week, and available menus.'
    ),
});
export type SuggestTokenPurchaseOutput = z.infer<typeof SuggestTokenPurchaseOutputSchema>;

/**
 * Wrapper function to call the suggestTokenPurchaseFlow.
 *
 * @param input - The input parameters for the token purchase suggestion.
 * @returns A promise resolving to the token purchase suggestion output.
 */
export async function suggestTokenPurchase(
  input: SuggestTokenPurchaseInput
): Promise<SuggestTokenPurchaseOutput> {
  return suggestTokenPurchaseFlow(input);
}

/**
 * Prompt definition for generating token purchase suggestions.
 */
const suggestTokenPurchasePrompt = ai.definePrompt({
  name: 'suggestTokenPurchasePrompt',
  input: {schema: SuggestTokenPurchaseInputSchema},
  output: {schema: SuggestTokenPurchaseOutputSchema},
  prompt: `You are an AI assistant designed to suggest optimal token purchase amounts for canteen users.

  Consider the user's spending habits, the current day of the week, and the available canteen menus to provide a personalized suggestion.
  The user's current balance is {{currentBalance}}.

  Spending Habits: {{{spendingHabits}}}
  Day of the Week: {{{dayOfWeek}}}
  Available Menus: {{{availableMenus}}}

  Based on this information, what is the optimal token purchase amount to suggest to the user?
  Explain your reasoning.

  Ensure that the suggestedPurchaseAmount allows the user to purchase lunch for the rest of the week without having an excessive number of tokens left over.
  Provide a suggestedPurchaseAmount as a number.
  The reasoning should clearly explain why this amount is suggested.
  `,
});

/**
 * Flow definition for generating token purchase suggestions.
 */
const suggestTokenPurchaseFlow = ai.defineFlow(
  {
    name: 'suggestTokenPurchaseFlow',
    inputSchema: SuggestTokenPurchaseInputSchema,
    outputSchema: SuggestTokenPurchaseOutputSchema,
  },
  async input => {
    const {output} = await suggestTokenPurchasePrompt(input);
    return output!;
  }
);
