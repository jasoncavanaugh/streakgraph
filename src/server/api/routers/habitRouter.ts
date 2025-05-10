import { z } from "zod";
import {
  COLOR_OPTIONS,
  ColorOption,
  HabitWithDayDrops,
} from "../../../utils/types";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

//API
export const habit_router = createTRPCRouter({
  get_all: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.habit.findMany({
      where: {
        user_id: ctx.session.user.id,
      },
      include: {
        habit_day_drops: true,
      },
    });
  }),
  create: protectedProcedure
    .input(z.object({ name: z.string(), color: z.enum(COLOR_OPTIONS) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.habit.create({
        data: {
          name: input.name,
          color: input.color,
          streak: 0,
          user_id: ctx.session.user.id,
        },
      });
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.enum(COLOR_OPTIONS),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.habit.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          color: input.color,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.habit.deleteMany({
        where: {
          AND: [{ id: input.id }, { user_id: ctx.session.user.id }],
        },
      });
    }),
  create_day_drop: protectedProcedure
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
});
