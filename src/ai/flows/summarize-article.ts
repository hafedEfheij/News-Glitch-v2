'use server';
/**
 * @fileOverview Summarizes a news article from a given URL.
 *
 * - summarizeArticle - A function that summarizes the article.
 * - SummarizeArticleInput - The input type for the summarizeArticle function.
 * - SummarizeArticleOutput - The return type for the summarizeArticle function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeArticleInputSchema = z.object({
  articleUrl: z.string().describe('The URL of the news article to summarize.'),
  articleContent: z.string().describe('The extracted content of the news article.').optional(),
});
export type SummarizeArticleInput = z.infer<typeof SummarizeArticleInputSchema>;

const SummarizeArticleOutputSchema = z.object({
  summary: z.string().describe('ملخص موجز للمقال الإخباري.'), // A concise summary of the news article in Arabic.
});
export type SummarizeArticleOutput = z.infer<typeof SummarizeArticleOutputSchema>;

export async function summarizeArticle(input: SummarizeArticleInput): Promise<SummarizeArticleOutput> {
  return summarizeArticleFlow(input);
}

const summarizeArticlePrompt = ai.definePrompt({
  name: 'summarizeArticlePrompt',
  input: {
    schema: z.object({
      articleUrl: z.string().describe('The URL of the news article to summarize.'),
      articleContent: z.string().describe('The extracted content of the news article.').optional(),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('ملخص موجز للمقال الإخباري.'), // A concise summary of the news article in Arabic.
    }),
  },
  prompt: `أنت ملخص أخبار محترف. لخص المقال الإخباري التالي بطريقة موجزة وباللغة العربية.

رابط المقال: {{{articleUrl}}}

محتوى المقال:
{{{articleContent}}}

قم بتلخيص المقال بشكل دقيق ومحايد، مع التركيز على النقاط الرئيسية والحقائق المهمة. تجنب إضافة أي معلومات غير موجودة في المقال الأصلي.`, // You are a professional news summarizer. Summarize the following news article in a concise manner and in Arabic.
});

const summarizeArticleFlow = ai.defineFlow<
  typeof SummarizeArticleInputSchema,
  typeof SummarizeArticleOutputSchema
>({
  name: 'summarizeArticleFlow',
  inputSchema: SummarizeArticleInputSchema,
  outputSchema: SummarizeArticleOutputSchema,
}, async input => {
  const {output} = await summarizeArticlePrompt(input);
  return output!;
});
