import { z } from "zod";

export const updatePresenceSchema = z.object({
    situation: z.enum(["pending", "confirmed", "absent"]),
});

export type PresenceSituation = z.infer<typeof updatePresenceSchema>["situation"];
