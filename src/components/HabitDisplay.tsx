import { useMemo, useState } from "react";
import { Modal } from "./Modal";
import * as RadixModal from "@radix-ui/react-dialog";
import { api } from "../utils/api";
import { HabitDayDrop } from "@prisma/client";
import { HabitWithDayDrops } from "../server/api/routers/habitRouter";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Spinner } from "./Spinner";

interface IHabitDayDropTooltipProps {
  is_checked: boolean;
  on_click: () => void;
  content: string;
}
function HabitDayDropTooltip({
  is_checked,
  on_click,
  content,
}: IHabitDayDropTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={100} skipDelayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div
            className={`h-[20px] w-[20px] rounded-sm border border-pink-500 hover:cursor-pointer hover:brightness-110 md:rounded md:border lg:h-[30px] lg:w-[30px] ${is_checked ? "bg-pink-500" : ""
              }`}
            onClick={on_click}
          />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            //Taken from https://ui.shadcn.com/docs/primitives/tooltip
            className="animate-in fade-in-50 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 z-50 overflow-hidden rounded-md border border-slate-100 bg-white p-3 text-sm text-slate-700 shadow-md dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
          >
            {content}
            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

function use_create_day_drop() {
  const api_utils = api.useContext();
  return api.habit.create_day_drop.useMutation({
    onMutate: async (variables) => {
      const { habit_id, year, month, day } = variables;
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await api_utils.habit.get_all.cancel();

      // Get the data from the queryCache
      const prev_data = api_utils.habit.get_all.getData();
      if (!prev_data) {
        console.log("'prev_data' is undefined");
        return { prev_data: [] };
      }
      // Optimistically update the data with our new post
      api_utils.habit.get_all.setData(undefined, (old_habit_data) => {
        if (!old_habit_data) {
          console.log("'old_habit_data' is undefined");
          return [];
        }
        const filtered = old_habit_data.filter(
          (habit) => habit.id === habit_id
        );
        if (filtered.length === 0) {
          throw new Error(
            "'old_habit_data.filter((habit) => habit.id === habit_id)' is length zero"
          );
        }
        if (filtered.length > 1) {
          throw new Error(
            "'old_habit_data.filter((habit) => habit.id === habit_id)' is length greater than one"
          );
        }
        const habit_to_add_drop_to = filtered[0]!;
        habit_to_add_drop_to.habit_day_drops.push({
          id: "",
          habit_id: habit_id,
          year: year,
          month: month,
          day: day,
        });
        return old_habit_data;
      });

      // Return the previous data so we can revert if something goes wrong
      return { prev_data };
    },
    onError: (err, data, ctx) => {
      console.error(err);
      api_utils.habit.get_all.setData(undefined, ctx?.prev_data);
    },
    onSettled: () => {
      api_utils.habit.get_all.invalidate();
    },
  });
}
function use_delete_day_drop() {
  const api_utils = api.useContext();
  return api.habit.delete_day_drop.useMutation({
    async onMutate(variables) {
      const { habit_id, year, month, day } = variables;
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await api_utils.habit.get_all.cancel();

      // Get the data from the queryCache
      const prev_data = api_utils.habit.get_all.getData();
      if (!prev_data) {
        console.log("'prev_data' is undefined");
        return;
      }
      // Optimistically update the data with our new post
      api_utils.habit.get_all.setData(undefined, (old_habit_data) => {
        if (!old_habit_data) {
          console.log("'old_habit_data' is undefined");
          return [];
        }
        const filtered = old_habit_data.filter(
          (habit) => habit.id === habit_id
        );
        if (filtered.length === 0) {
          throw new Error(
            "'old_habit_data.filter((habit) => habit.id === habit_id)' is length zero"
          );
        }
        if (filtered.length > 1) {
          throw new Error(
            "'old_habit_data.filter((habit) => habit.id === habit_id)' is length greater than one"
          );
        }
        const habit_to_remove_drop_from = filtered[0]!;
        habit_to_remove_drop_from.habit_day_drops =
          habit_to_remove_drop_from.habit_day_drops.filter(
            (day_drop) =>
              day_drop.year !== year ||
              day_drop.month !== month ||
              day_drop.day !== day
          );
        return old_habit_data;
      });

      // Return the previous data so we can revert if something goes wrong
      return { prev_data };
    },
    onError(err, data, ctx) {
      console.error(err);
      api_utils.habit.get_all.setData(undefined, ctx?.prev_data);
    },
    onSettled() {
      // api_utils.habit.invalidate();
      api_utils.habit.get_all.invalidate();
    },
  });
};

interface IDeleteHabitProps {
  id: string;
}
const DeleteHabit = ({ id }: IDeleteHabitProps) => {
  const [loading, set_loading] = useState(false);
  const [is_modal_open, set_is_modal_open] = useState(false);

  const api_utils = api.useContext();
  const delete_habit = api.habit.delete.useMutation({
    onSuccess: () => {
      api_utils.habit.get_all.invalidate();
      // set_loading(false);
      set_is_modal_open(false); //TODO: Have to figure out how to close the modal once the new data comes in
    },
    onError: (err, data, ctx) => {
      alert("error");
    },
  });

  return (
    <Modal
      open={is_modal_open}
      trigger={
        <button
          type="button"
          className="rounded-full bg-red-500 py-2 px-4 text-sm font-semibold text-white hover:brightness-110 md:py-2 md:px-4 md:text-base"
          onClick={() => set_is_modal_open(true)}
        >
          Remove
        </button>
      }
      modal_frame_classNames="left-1/2 top-1/2 flex w-[20rem] -translate-x-1/2 -translate-y-1/2 flex-col border-t-8 border-t-red-500 px-5 py-3 lg:top-1/2 lg:w-[30rem] lg:px-8 lg:py-6"
      content={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            delete_habit.mutate({ id });
          }}
        >
          <RadixModal.Title className="whitespace-nowrap text-3xl font-bold text-slate-700">
            Delete Habit
          </RadixModal.Title>
          <div className="h-1 lg:h-4" />
          <div className="flex w-full flex-col gap-4">
            Are you sure you wish to delete this habit?
          </div>
          <div className="h-8" />
          <div className="flex justify-center gap-5">
            <button
              className="rounded-full bg-slate-500 px-5 py-3 text-xs font-semibold text-white outline-none hover:brightness-110 lg:text-base lg:font-bold"
              type="button"
              onClick={() => set_is_modal_open(false)}
            >
              Cancel
            </button>

            <button
              className="rounded-full bg-red-500 px-5 py-3 text-xs font-semibold text-white outline-none hover:brightness-110 lg:text-base lg:font-bold"
              type="submit"
            >
              {delete_habit.status === "loading" && (
                <Spinner className="h-4 w-4 border-2 border-solid border-white lg:mx-[1.33rem] lg:my-1" />
              )}
              {delete_habit.status !== "loading" && "Delete"}
            </button>
          </div>
        </form>
      }
    />
  );
}

const day_names = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
function get_day_name(year: number, month_idx: number, day: number) {
  return day_names[new Date(year, month_idx, day).getDay()]!;
}

function get_number_of_days_in_year(year: number) {
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

function check_if_checked(
  day_out_of_year: number,
  drops: HabitDayDrop[],
  year: number
) {
  let months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (get_number_of_days_in_year(year) === 366) {
    months[1] += 1;
  }
  let idx = 0;
  for (; idx < months.length && day_out_of_year > months[idx]!; idx++) {
    day_out_of_year -= months[idx]!;
  }

  return (
    drops.filter(
      (drop) => drop.month === idx + 1 && drop.day === day_out_of_year
    ).length > 0
  );
}

function get_day_and_month(
  day_out_of_year: number,
  year: number
) {
  let months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (get_number_of_days_in_year(year) === 366) {
    months[1] += 1;
  }
  let idx = 0;
  for (; idx < months.length && day_out_of_year > months[idx]!; idx++) {
    day_out_of_year -= months[idx]!;
  }

  return [idx + 1, day_out_of_year];
}

interface IHabitSquaresDisplay {
  number_of_total_squares_including_hidden: number;
  first_day_of_year: number;
  habit: HabitWithDayDrops;
  year: number;
}
const HabitSquaresDisplay = ({
  number_of_total_squares_including_hidden,
  first_day_of_year,
  habit,
  year,
}: IHabitSquaresDisplay) => {
  const create_day_drop = use_create_day_drop();
  const delete_day_drop = use_delete_day_drop();
  //UI
  let output = [];
  for (let i = 1; i < first_day_of_year; i++) {
    output.push(<div className="h-[20px] w-[20px] opacity-0"></div>);
  }
  for (
    let i = first_day_of_year;
    i <= number_of_total_squares_including_hidden;
    i++
  ) {
    const is_checked = check_if_checked(
      i - first_day_of_year + 1,
      habit.habit_day_drops,
      year
    );
    const [month, day] = get_day_and_month(i - first_day_of_year + 1, year);
    if (!month || !day) {
      throw new Error("Eff my life");
    }

    const day_name = get_day_name(year, month - 1, day);
    output.push(
      <HabitDayDropTooltip
        key={i}
        is_checked={is_checked}
        on_click={() => {
          if (is_checked) {
            delete_day_drop.mutate({
              habit_id: habit.id,
              year: year,
              month: month,
              day: day,
            });
          } else {
            create_day_drop.mutate({
              habit_id: habit.id,
              year: year,
              month: month,
              day: day,
            });
          }
        }}
        content={`${day_name} ${month}-${day}`}
      />
    );
  }
  //I hate this
  return <>{output}</>;
};

function determine_whether_today_is_marked(habit_day_drops: HabitDayDrop[]) {
  const today = new Date();
  const today_day = today.getDate();//Wtf. Why is it called this
  const today_month = today.getMonth();
  const today_year = today.getFullYear();

  return habit_day_drops.filter((drop) => {
    return drop.year === today_year && drop.month === today_month + 1 && drop.day === today_day;
  }).length > 0;
}

function get_first_day_of_year(year: number) {
  const january = 0;
  const first = 1;
  return new Date(year, january, first).getDay() + 1;
}

interface IHabitDisplayProps {
  habit: HabitWithDayDrops;
  year: number;
}
export const HabitDisplay = (props: IHabitDisplayProps) => {
  const create_day_drop = use_create_day_drop();
  const delete_day_drop = use_delete_day_drop();
  const [number_of_total_squares_including_hidden, first_day_of_year] = useMemo(
    () => {
      const first_day_of_year = get_first_day_of_year(props.year);
      const number_of_total_squares_including_hidden = get_number_of_days_in_year(props.year) + first_day_of_year - 1;
      return [
        number_of_total_squares_including_hidden,
        first_day_of_year
      ]
    },
    []
  );
  const is_today_marked = determine_whether_today_is_marked(props.habit.habit_day_drops);
  return (
    <li key={props.habit.id} className="rounded-lg border bg-white p-2 md:p-4">
      <div className="flex justify-between">
        <h1 className="flex justify-start text-xl font-semibold text-slate-700 md:text-2xl lg:text-3xl">
          {props.habit.name}
        </h1>
        <button
          className="rounded-full border bg-pink-500 px-4 text-sm font-semibold text-white hover:brightness-110 md:text-base"
          onClick={(e) => {
            e.preventDefault();
            if (is_today_marked) {
              delete_day_drop.mutate({ habit_id: props.habit.id, year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() });
            } else {
              create_day_drop.mutate({ habit_id: props.habit.id, year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() });
            }
          }}
        >
          {is_today_marked ? "Unmark today" : "Mark today"}
        </button>
      </div>
      <div className="h-2 md:h-4" />
      <div className="flex gap-0">
        <div className="mt-[-0.25rem] mr-2 mb-4 flex flex-col justify-around text-xs lg:mr-4 lg:text-base">
          <p>Sun</p>
          <p>Mon</p>
          <p>Tue</p>
          <p>Wed</p>
          <p>Thu</p>
          <p>Fri</p>
          <p>Sat</p>
        </div>
        <div className="overflow-x-auto">
          <div className="jason mb-4 gap-[0.15rem] md:gap-[0.2rem] lg:gap-[0.3rem]">
            <HabitSquaresDisplay
              number_of_total_squares_including_hidden={
                number_of_total_squares_including_hidden
              }
              first_day_of_year={first_day_of_year}
              habit={props.habit}
              year={props.year}
            />
          </div>
        </div>
      </div>
      <div className="h-2 md:h-4" />
      <DeleteHabit id={props.habit.id} />
    </li>
  );
};

export default HabitDisplay;
