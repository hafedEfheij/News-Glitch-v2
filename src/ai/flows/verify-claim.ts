'use server';
/**
 * @fileOverview Verifies a claim using web search.
 *
 * - verifyClaim - A function that verifies the claim's authenticity.
 * - VerifyClaimInput - The input type for the verifyClaim function.
 * - VerifyClaimOutput - The return type for the verifyClaim function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const VerifyClaimInputSchema = z.object({
  claimText: z.string().describe('النص أو الادعاء المطلوب التحقق من صحته.'), // The text or claim to verify.
});
export type VerifyClaimInput = z.infer<typeof VerifyClaimInputSchema>;

const VerifyClaimOutputSchema = z.object({
  verdict: z.enum(["مرجح أنه صحيح", "مرجح أنه خطأ", "غير مؤكد"]).describe('الحكم على صحة الادعاء بناءً على البحث.'), // Verdict on the claim's validity based on search.
  explanation: z.string().describe('شرح موجز لسبب الحكم.'), // Brief explanation for the verdict.
  supportingEvidence: z.array(z.string()).describe('قائمة بالأدلة الداعمة أو المصادر التي تم العثور عليها عبر الإنترنت (روابط أو ملخصات موجزة).'), // List of supporting evidence or sources found online (links or brief summaries).
});
export type VerifyClaimOutput = z.infer<typeof VerifyClaimOutputSchema>;

export async function verifyClaim(input: VerifyClaimInput): Promise<VerifyClaimOutput> {
  return verifyClaimFlow(input);
}

const verifyClaimPrompt = ai.definePrompt({
  name: 'verifyClaimPrompt',
  input: {
    schema: VerifyClaimInputSchema,
  },
  output: {
    schema: VerifyClaimOutputSchema,
  },
  prompt: `أنت مساعد بحث متخصص في التحقق من صحة الادعاءات باستخدام البحث على الإنترنت. مهمتك هي التحقق من الادعاء التالي بدقة وموضوعية:

الادعاء: "{{{claimText}}}"

اتبع هذه الخطوات للتحقق من الادعاء:

1. ابحث في الإنترنت عن معلومات تتعلق بهذا الادعاء بشكل شامل.
2. قم بتقييم مصداقية المصادر التي تجدها، مع التركيز على المصادر الموثوقة والمعترف بها.
3. قارن المعلومات من مصادر متعددة للتأكد من دقتها.
4. بناءً على بحثك، حدد حكمك النهائي على الادعاء:
   - "مرجح أنه صحيح" - إذا كانت الأدلة تدعم الادعاء بشكل قوي
   - "مرجح أنه خطأ" - إذا كانت الأدلة تتعارض مع الادعاء بشكل واضح
   - "غير مؤكد" - إذا كانت الأدلة غير كافية أو متضاربة
5. قدم شرحًا موجزًا ومنطقيًا لحكمك باللغة العربية.
6. اذكر أهم الأدلة الداعمة أو المصادر التي وجدتها (قدم روابط إن أمكن أو ملخصات قصيرة) باللغة العربية.

تأكد من أن تحليلك:
- يستند إلى حقائق وليس آراء شخصية
- يأخذ في الاعتبار السياق الكامل للادعاء
- يتجنب التحيز السياسي أو الأيديولوجي
- يعترف بحدود المعرفة المتاحة عندما تكون المعلومات غير كافية

تأكد من أن ردك يتبع مخطط الإخراج المحدد بدقة.`, // You are a research assistant specializing in verifying claims using web search. Your task is to verify the following claim with accuracy and objectivity:
});

const verifyClaimFlow = ai.defineFlow<
  typeof VerifyClaimInputSchema,
  typeof VerifyClaimOutputSchema
>({
  name: 'verifyClaimFlow',
  inputSchema: VerifyClaimInputSchema,
  outputSchema: VerifyClaimOutputSchema,
}, async input => {
    // Call the prompt function directly with the input.
    // The prompt definition itself instructs the model on how to behave,
    // including potential tool use if the model supports it based on the prompt text.
    const llmResponse = await verifyClaimPrompt(input);

    const output = llmResponse.output; // Access the output directly from the response object
    if (!output) {
        throw new Error("لم يتمكن النموذج من إنشاء استجابة للتحقق."); // Model failed to generate verification response.
    }
    return output;
});
