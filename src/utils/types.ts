import { Habit, HabitDayDrop } from "@prisma/client";

type HabitWithColor = Omit<Habit, "color"> & { color: ColorOption };
export type HabitWithDayDrops = HabitWithColor & {
  habit_day_drops: HabitDayDrop[];
};

//All of this is unfortunately necessary because of Tailwind purge.
//See this part of this video for more information: https://www.youtube.com/watch?v=HZn2LtBT59w&t=530s
export const COLOR_OPTIONS = [
  "rose-500",
  "pink-500",
  "fuchsia-500",
  "purple-500",
  "violet-500",
  "indigo-500",
  "blue-500",
  "sky-500",
  "cyan-500",
  "teal-500",
  "emerald-500",
  "green-500",
  "lime-500",
  "yellow-500",
  "amber-500",
  "orange-500",
  "red-500",
  "slate-500",
] as const;
export type ColorOption = (typeof COLOR_OPTIONS)[number];

const BG_COLOR_OPTIONS = [
  "bg-rose-500",
  "bg-pink-500",
  "bg-fuchsia-500",
  "bg-purple-500",
  "bg-violet-500",
  "bg-indigo-500",
  "bg-blue-500",
  "bg-sky-500",
  "bg-cyan-500",
  "bg-teal-500",
  "bg-emerald-500",
  "bg-green-500",
  "bg-lime-500",
  "bg-yellow-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-slate-500",
] as const;
type BgColorOption = (typeof BG_COLOR_OPTIONS)[number];

const BORDER_COLOR_OPTIONS = [
  "border-rose-500",
  "border-pink-500",
  "border-fuchsia-500",
  "border-purple-500",
  "border-violet-500",
  "border-indigo-500",
  "border-blue-500",
  "border-sky-500",
  "border-cyan-500",
  "border-teal-500",
  "border-emerald-500",
  "border-green-500",
  "border-lime-500",
  "border-yellow-500",
  "border-amber-500",
  "border-orange-500",
  "border-red-500",
  "border-slate-500",
] as const;
type BorderColorOption = (typeof BORDER_COLOR_OPTIONS)[number];

export const COLOR_TO_CLASSNAME: {
  [key in ColorOption]: { bg: BgColorOption; border: BorderColorOption };
} = {
  "rose-500": {
    bg: "bg-rose-500",
    border: "border-rose-500",
  },
  "pink-500": {
    bg: "bg-pink-500",
    border: "border-pink-500",
  },
  "fuchsia-500": {
    bg: "bg-fuchsia-500",
    border: "border-fuchsia-500",
  },
  "purple-500": {
    bg: "bg-purple-500",
    border: "border-purple-500",
  },
  "violet-500": {
    bg: "bg-violet-500",
    border: "border-violet-500",
  },
  "indigo-500": {
    bg: "bg-indigo-500",
    border: "border-indigo-500",
  },
  "blue-500": {
    bg: "bg-blue-500",
    border: "border-blue-500",
  },
  "sky-500": {
    bg: "bg-sky-500",
    border: "border-sky-500",
  },
  "cyan-500": {
    bg: "bg-cyan-500",
    border: "border-cyan-500",
  },
  "teal-500": {
    bg: "bg-teal-500",
    border: "border-teal-500",
  },
  "emerald-500": {
    bg: "bg-emerald-500",
    border: "border-emerald-500",
  },
  "green-500": {
    bg: "bg-green-500",
    border: "border-green-500",
  },
  "lime-500": {
    bg: "bg-lime-500",
    border: "border-lime-500",
  },
  "yellow-500": {
    bg: "bg-yellow-500",
    border: "border-yellow-500",
  },
  "amber-500": {
    bg: "bg-amber-500",
    border: "border-amber-500",
  },
  "orange-500": {
    bg: "bg-orange-500",
    border: "border-orange-500",
  },
  "red-500": {
    bg: "bg-red-500",
    border: "border-red-500",
  },
  "slate-500": {
    bg: "bg-slate-500",
    border: "border-slate-500",
  },
} as const;
