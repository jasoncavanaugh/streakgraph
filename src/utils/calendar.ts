import { HabitDayDrop } from "@prisma/client";
import { HabitWithDayDrops } from "./types";

export function get_day_name(year: number, month: number, day: number) {
  const day_names = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
  return day_names[new Date(year, month - 1, day).getDay()]!;
}

export function get_number_of_days_in_year(year: number) {
  if (year % 4 !== 0) {
    return 365;
  }
  if (year % 100 !== 0) {
    return 366;
  }
  if (year % 400 !== 0) {
    return 365;
  }
  return 366;
}

export function check_if_marked(
  day_out_of_year: number,
  drops: Array<{ year: number; month: number; day: number }>,
  year: number
) {
  let months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const is_leap_year = get_number_of_days_in_year(year) === 366;
  if (is_leap_year) {
    months[1]! += 1;
  }
  let idx = 0;
  for (; idx < months.length && day_out_of_year > months[idx]!; idx++) {
    day_out_of_year -= months[idx]!;
  }

  return (
    drops.filter(
      (drop) =>
        drop.month === idx + 1 &&
        drop.day === day_out_of_year &&
        drop.year === year
    ).length > 0
  );
}

export function get_day_and_month(day_out_of_year: number, year: number) {
  let months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const is_leap_year = get_number_of_days_in_year(year) === 366;
  if (is_leap_year) {
    months[1]! += 1;
  }
  let idx = 0;
  for (; idx < months.length && day_out_of_year > months[idx]!; idx++) {
    day_out_of_year -= months[idx]!;
  }

  return [idx + 1, day_out_of_year];
}

export function determine_whether_today_is_marked(
  habit_day_drops: Array<{ year: number; month: number; day: number }>
) {
  const today = new Date();
  const today_day = today.getDate(); //Wtf. Why is it called this
  const today_month = today.getMonth() + 1;
  const today_year = today.getFullYear();
  return (
    habit_day_drops.filter(
      (drop) =>
        drop.year === today_year &&
        drop.month === today_month &&
        drop.day === today_day
    ).length > 0
  );
}

export function get_first_day_of_year(year: number) {
  const january = 0;
  const first = 1;
  return new Date(year, january, first).getDay() + 1;
}

export function get_day_out_of_year(date: Date) {
  let year = date.getFullYear();
  let months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const is_leap_year = get_number_of_days_in_year(year) === 366;
  if (is_leap_year) {
    months[1]! += 1;
  }

  let day = date.getDate();
  let month_idx = date.getMonth();
  let day_out_of_year = 0;
  for (let i = 0; i < month_idx; i++) {
    day_out_of_year += months[i]!;
  }
  day_out_of_year += day;
  return day_out_of_year;
}

export function get_years(habit: HabitWithDayDrops) {
  const years_set = new Set<number>();
  for (const drop of habit.habit_day_drops) {
    if (!years_set.has(drop.year)) {
      years_set.add(drop.year);
    }
  }
  return Array.from(years_set).sort();
}

export function get_year_values(years: Array<{ year: number }>) {
  const year_values: Array<number> = [];
  for (const y of years) {
    if (!year_values.includes(y.year)) {
      year_values.push(y.year);
    }
  }
  year_values.sort();
  return year_values;
}
