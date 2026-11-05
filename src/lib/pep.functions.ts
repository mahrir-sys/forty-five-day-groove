import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const input = z.object({
  language: z.enum(["en", "sv", "fr"]),
  summary: z.object({
    day: z.number().int().min(0).max(45),
    streak: z.number().int().min(0).max(45),
    firstName: z.string().max(60).nullable(),
    mood: z.enum(["struggling", "onTrack"]),
    challenges: z.array(z.object({
      name: z.string().trim().min(1).max(200),
      checkedDays: z.number().int().min(0).max(45),
      elapsedDays: z.number().int().min(0).max(45),
      percent: z.number().min(0).max(100),
      currentStreak: z.number().int().min(0).max(45),
      missedLast7: z.number().int().min(0).max(7),
    })).min(1).max(30),
  }),
});

export const generatePep = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => input.parse(data))
  .handler(async ({ data }) => {
    const { writePep } = await import("./pep.server");
    return writePep(data.summary, data.language);
  });
