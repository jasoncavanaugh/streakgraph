import {
  useMemo,
  useState,
  useRef,
  useEffect,
  forwardRef,
  RefObject,
} from "react";
import { Modal } from "./Modal";
import * as RadixModal from "@radix-ui/react-dialog";
import { api } from "../utils/api";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Spinner } from "./Spinner";
import {
  check_if_marked,
  determine_whether_today_is_marked,
  get_day_and_month,
  get_day_name,
  get_day_out_of_year,
  get_first_day_of_year,
  get_number_of_days_in_year,
} from "../utils/calendar";
import {
  use_create_day_drop,
  use_delete_day_drop,
} from "../utils/hooks/habitHooks";
import {
  ColorOption,
  COLOR_TO_CLASSNAME,
  HabitWithDayDrops,
} from "../utils/types";
import { cn } from "../utils/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface IHabitDisplayProps {
  habit: HabitWithDayDrops;
  color: ColorOption;
  parent_ref: RefObject<HTMLButtonElement>;
  is_last: boolean;
}
export const HabitDisplay = (props: IHabitDisplayProps) => {
  const create_day_drop = use_create_day_drop();
  const delete_day_drop = use_delete_day_drop();
  const is_today_marked = determine_whether_today_is_marked(
    props.habit.habit_day_drops
  );
  const [year, set_year] = useState(new Date().getFullYear());

  return (
    <li key={props.habit.id} className="rounded-lg border bg-white p-2 md:p-4">
      <div className="flex justify-between">
        <h1 className="flex justify-start text-xl font-semibold text-slate-700 md:text-2xl lg:text-3xl">
          {props.habit.name}
        </h1>
        <button
          className="rounded-full bg-pink-500 px-4 text-sm font-semibold text-white hover:brightness-110 md:text-base"
          onClick={(e) => {
            e.preventDefault();
            const payload = {
              habit_id: props.habit.id,
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1,
              day: new Date().getDate(),
            };
            is_today_marked
              ? delete_day_drop.mutate(payload)
              : create_day_drop.mutate(payload);
          }}
        >
          {is_today_marked ? "Unmark" : "Mark"}
        </button>
      </div>
      <div className="h-2 md:h-4" />
      <div className="flex gap-0">
        <div className="mb-4 mr-2 mt-[-0.25rem] flex flex-col justify-around text-xs lg:mr-4 lg:text-base">
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
              parent_ref={props.parent_ref}
              is_last={props.is_last}
              color={props.color}
              habit={props.habit}
              year={year}
            />
          </div>
        </div>
      </div>
      <div className="h-2 md:h-4" />
      <div className="flex flex-col justify-between gap-3 md:flex-row">
        <div className="flex gap-2">
          <DeleteHabit id={props.habit.id} />
          <TotalDisplay habit={props.habit} year={year} />
        </div>
        <YearPicker year={year} habit={props.habit} set_year={set_year} />
      </div>
    </li>
  );
};

export default HabitDisplay;

function get_min_max_year(habit: HabitWithDayDrops) {
  let min_year = new Date().getFullYear();
  let max_year = 0;
  const day_drops = habit.habit_day_drops;
  for (const day_drop of day_drops) {
    min_year = Math.min(min_year, day_drop.year);
    max_year = Math.max(max_year, day_drop.year);
  }

  return { min_year, max_year };
}

function YearPicker({
  year,
  habit,
  set_year,
}: {
  year: number;
  habit: HabitWithDayDrops;
  set_year: (new_year: number) => void;
}) {
  const { min_year, max_year } = get_min_max_year(habit);
  let year_options = [];
  for (let y = min_year; y <= max_year; y++) {
    year_options.push(
      <SelectItem key={y} value={y.toString()}>
        {y}
      </SelectItem>
    );
  }
  return (
    <Select
      onValueChange={(new_year_str) => {
        set_year(parseInt(new_year_str));
      }}
      value={year.toString()}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Year" defaultValue={year} />
      </SelectTrigger>
      <SelectContent>{year_options}</SelectContent>
    </Select>
  );
}

function TotalDisplay({
  habit,
  year,
}: {
  habit: HabitWithDayDrops;
  year: number;
}) {
  let total = habit.habit_day_drops.filter((drop) => drop.year === year).length;
  return (
    <div
      title="Total"
      className={cn(
        "flex min-w-[1.9rem] items-center justify-center rounded-lg border-2 border-pink-500 px-1 py-0.5 text-sm font-bold text-pink-500 md:min-w-[2.5rem] md:border-2 md:text-xl"
      )}
    >
      {total}
    </div>
  );
}

interface IHabitSquaresDisplay {
  habit: HabitWithDayDrops;
  year: number;
  color: ColorOption;
  is_last: boolean;
  parent_ref: RefObject<HTMLButtonElement>;
}
const HabitSquaresDisplay = ({
  habit,
  year,
  color,
  is_last,
  parent_ref,
}: IHabitSquaresDisplay) => {
  const create_day_drop = use_create_day_drop();
  const delete_day_drop = use_delete_day_drop();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.scrollIntoView({ block: "end", inline: "nearest" });
    if (is_last) {
      parent_ref.current?.scrollIntoView({ block: "end", inline: "nearest" });
    }
  }, []);

  const [number_of_days_in_year, first_day_of_year] = useMemo(
    () => [get_number_of_days_in_year(year), get_first_day_of_year(year)],
    [year]
  );

  //UI
  let output = [];
  for (let i = 1; i < first_day_of_year; i++) {
    output.push(
      <div
        key={i - first_day_of_year}
        className="h-[20px] w-[20px] opacity-0"
      />
    );
  }
  const day_out_of_year_for_today =
    new Date().getFullYear() === year
      ? get_day_out_of_year(new Date())
      : new Date().getFullYear() < year
      ? 0
      : number_of_days_in_year;

  let i = 1;
  for (; i <= day_out_of_year_for_today; i++) {
    const is_checked = check_if_marked(i, habit.habit_day_drops, year);
    const [month, day] = get_day_and_month(i, year);
    if (!month || !day) {
      throw new Error("!month || !day");
    }
    const day_name = get_day_name(year, month, day);
    output.push(
      <HabitDayDropTooltip
        ref={i === day_out_of_year_for_today ? ref : null}
        key={i}
        color={color}
        is_checked={is_checked}
        on_click={() => {
          const payload = {
            habit_id: habit.id,
            year: year,
            month: month,
            day: day,
          };
          is_checked
            ? delete_day_drop.mutate(payload)
            : create_day_drop.mutate(payload);
        }}
        content={`${day_name} ${month}-${day}`}
      />
    );
  }
  for (; i <= number_of_days_in_year; i++) {
    output.push(
      <div
        key={i}
        className={`h-[20px] w-[20px] rounded-sm border ${COLOR_TO_CLASSNAME[color]["border"]} opacity-30 md:rounded md:border lg:h-[30px] lg:w-[30px]`}
      ></div>
    );
  }
  return <>{output}</>;
};
interface IHabitDayDropTooltipProps {
  is_checked: boolean;
  on_click: () => void;
  content: string;
  color: ColorOption;
}
const HabitDayDropTooltip = forwardRef<
  HTMLDivElement | null,
  IHabitDayDropTooltipProps
>(
  (
    { is_checked, on_click, content, color }: IHabitDayDropTooltipProps,
    ref
  ) => {
    return (
      <Tooltip.Provider delayDuration={100} skipDelayDuration={0}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <div
              ref={ref}
              className={`h-[20px] w-[20px] rounded-sm border ${
                COLOR_TO_CLASSNAME[color]["border"]
              } hover:cursor-pointer hover:brightness-110 md:rounded md:border lg:h-[30px] lg:w-[30px] ${
                is_checked ? COLOR_TO_CLASSNAME[color]["bg"] : ""
              }`}
              onClick={on_click}
            />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              //Taken from https://ui.shadcn.com/docs/primitives/tooltip
              className="z-50 overflow-hidden rounded-md border border-slate-100 bg-white p-3 text-sm text-slate-700 shadow-md animate-in fade-in-50 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
            >
              {content}
              <Tooltip.Arrow className="fill-white" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  }
);

interface IDeleteHabitProps {
  id: string;
}
const DeleteHabit = ({ id }: IDeleteHabitProps) => {
  const [is_modal_open, set_is_modal_open] = useState(false);

  const api_utils = api.useContext();
  const delete_habit = api.habit.delete.useMutation({
    onSuccess: () => {
      api_utils.habit.get_all.invalidate();
      set_is_modal_open(false); //TODO: Have to figure out how to close the modal once the new data comes in
    },
    onError: () => {
      alert("error");
    },
  });

  return (
    <Modal
      open={is_modal_open}
      trigger={
        <button
          type="button"
          className="rounded-full bg-red-500 px-4 py-1 text-sm font-semibold text-white hover:brightness-110 md:text-base"
          onClick={() => set_is_modal_open(true)}
        >
          Remove
        </button>
      }
      className="left-1/2 top-1/2 flex w-[20rem] -translate-x-1/2 -translate-y-1/2 flex-col border-t-8 border-t-red-500 px-5 py-3 lg:top-1/2 lg:w-[30rem] lg:px-8 lg:py-6"
    >
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
    </Modal>
  );
};
