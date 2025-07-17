"use server";

import { z } from "zod";
import { env } from "~/env";
import { returnValidationErrors } from "next-safe-action";
import { actionClient } from "~/lib/safe-action";
import { db } from "~/server/db";
import { currentUser } from "@clerk/nextjs/server";
import { ERROR_MESSAGES } from "../constants";

const generateMarketingStrengthSchema = z.object({
  selectedEpisodes: z
    .array(z.string())
    .min(1, "At least one episode must be selected"),
  campaignGoal: z.string().min(1, "Campaign goal is required"),
  campaignKPIs: z
    .array(z.string())
    .min(1, "At least one KPI must be specified"),
  gender: z.string().min(1, "Gender is required"),
  ethnicity: z
    .array(z.string())
    .min(1, "At least one ethnicity must be specified"),
  age: z.array(z.string()).min(1, "At least one age range must be specified"),
  fansOf: z
    .array(z.string())
    .min(1, "At least one fan preference must be specified"),
});

export const generateMarketingStrength = actionClient
  .inputSchema(generateMarketingStrengthSchema)
  .action(async ({ parsedInput: data }) => {
    try {
      // Check authentication
      const user = await currentUser();
      if (!user) {
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }

      const prompt = `You are a senior marketing strategist specializing in audience segmentation and campaign strategy. Given the campaign parameters and audience profile below, generate a compelling and insight-driven "Marketing Strength" paragraph. The output should be clear, creative, and optimized for use in pitch decks or media kits.

## CAMPAIGN PARAMETERS
- Selected Episodes: ${data.selectedEpisodes.join(", ")}
- Campaign Goal: ${data.campaignGoal}
- Campaign KPIs: ${data.campaignKPIs.join(", ")}

## AUDIENCE PROFILE
- Gender: ${data.gender}
- Ethnicity: ${data.ethnicity.join(", ")}
- Age: ${data.age.join(", ")}
- Fans of: ${data.fansOf.join(", ")}

## OUTPUT GUIDELINES
- Emphasize why this audience is uniquely aligned with the brand or product.
- Include any cultural, emotional, or trend-based insights relevant to the audience.
- Highlight how the campaign parameters support the goal and KPIs.
- Tone should be confident, marketing-savvy, and forward-thinking.

Now generate the "Marketing Strength" section. Should be brief and less than 10 sentences.`;

      // Generate 3 variations with different temperatures for variety
      const variations = await Promise.all([
        generateVariation(prompt, 0.8),
        generateVariation(prompt, 0.9),
        generateVariation(prompt, 0.7),
      ]);

      // Save to database
      const marketingStrength = await db.marketingStrength.create({
        data: {
          episodes: data.selectedEpisodes,
          goals: data.campaignGoal,
          kpis: data.campaignKPIs,
          gender: data.gender,
          ethnicity: data.ethnicity,
          ages: data.age,
          fans: data.fansOf,
          userId: user.id,
          output1: variations[0],
          output2: variations[1],
          output3: variations[2],
        },
      });

      return {
        strengths: variations,
        id: marketingStrength.id,
      };
    } catch (error) {
      if (error instanceof Error) {
        return returnValidationErrors(generateMarketingStrengthSchema, {
          _errors: [error.message],
        });
      }
      return returnValidationErrors(generateMarketingStrengthSchema, {
        _errors: [ERROR_MESSAGES.PROCESSING_FAILED],
      });
    }
  });

// Action to retrieve marketing strength data for a user
export const getMarketingStrengthHistory = actionClient.action(async () => {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Get all marketing strength records for the user
    const history = await db.marketingStrength.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // Limit to last 10 records
    });

    return {
      history,
    };
  } catch (error) {
    if (error instanceof Error) {
      return returnValidationErrors(generateMarketingStrengthSchema, {
        _errors: [error.message],
      });
    }
    return returnValidationErrors(generateMarketingStrengthSchema, {
      _errors: [ERROR_MESSAGES.PROCESSING_FAILED],
    });
  }
});

interface OpenAIMessage {
  role: string;
  content: string;
}

interface OpenAIChoice {
  message: OpenAIMessage;
}

interface OpenAIResponse {
  choices?: OpenAIChoice[];
}

async function generateVariation(
  basePrompt: string,
  temperature: number,
): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a senior marketing strategist with expertise in audience segmentation and campaign strategy. Generate compelling, insight-driven marketing content.",
          },
          {
            role: "user",
            content: basePrompt,
          },
        ],
        temperature,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`,
      );
    }

    const result = (await response.json()) as OpenAIResponse;
    const generatedText = result.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error("No content generated from OpenAI");
    }

    return generatedText;
  } catch (error) {
    return `${ERROR_MESSAGES.PROCESSING_FAILED}: ${error instanceof Error ? error.message : ERROR_MESSAGES.PROCESSING_FAILED}`;
  }
}
