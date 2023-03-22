import { HabitDayDrop, prisma } from "@prisma/client";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

//WTF is this
const habit_with_habit_day_drops = Prisma.validator<Prisma.HabitArgs>()({
  include: { habit_day_drops: true },
});
export type HabitWithDayDrops = Prisma.HabitGetPayload<
  typeof habit_with_habit_day_drops
>;

//API
export const habit_router = createTRPCRouter({
  get_all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.habit.findMany({
      include: {
        habit_day_drops: true,
      },
    });
  }),
  create: publicProcedure
    .input(z.object({ name: z.string(), color: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.habit.create({
        data: {
          name: input.name,
          color: input.color,
          streak: 0,
        },
      });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.habit.delete({ where: { id: input.id } });
    }),
  create_day_drop: publicProcedure
    .input(
      z.object({
        habit_id: z.string(),
        year: z.number().gte(1),
        month: z.number().gte(1).lte(12),
        day: z.number().gte(1).lte(31),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.habitDayDrop.create({
        data: input,
      });
    }),
  delete_day_drop: publicProcedure
    .input(
      z.object({
        habit_id: z.string(),
        year: z.number().gte(1),
        month: z.number().gte(1).lte(12),
        day: z.number().gte(1).lte(31),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.habitDayDrop.deleteMany({
        where: {
          habit_id: input.habit_id,
          year: input.year,
          month: input.month,
          day: input.day,
        },
      });
    }),

  // getAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.example.findMany();
  // }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});
