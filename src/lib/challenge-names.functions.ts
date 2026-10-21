import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const translateChallengeNames = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ names: z.array(z.string().trim().min(1).max(500)).min(1).max(50) }).parse(input))
  .handler(async ({ data }) => {
    const { translateNames } = await import("./challenge-names.server");
    return translateNames(data.names);
  });