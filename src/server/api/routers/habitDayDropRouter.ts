import { HabitDayDrop, prisma } from "@prisma/client";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const habit_day_drop_router = createTRPCRouter({
  get_or_create_drops_for_year: publicProcedure
    .input(z.object({ year: z.number().gte(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.habitDayDrop.create({
        data: {
          name: input.name,
          color: input.color,
          streak: 0,
        },
      });
    }),
});
