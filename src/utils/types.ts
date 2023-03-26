import { Habit, HabitDayDrop } from "@prisma/client";

export type HabitWithDayDrops = Habit & { habit_day_drops: HabitDayDrop[]; };
