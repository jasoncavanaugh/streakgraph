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
  get_year_values,
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
import { SelectContent, SelectItem } from "./ui/select";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Button } from "./ui/button";
import { ChevronDown, Trash2Icon } from "lucide-react";
import { Input } from "./ui/input";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

export const HabitDisplay = (props: {
  habit: HabitWithDayDrops;
  color: ColorOption;
  parent_ref: RefObject<HTMLButtonElement>;
  is_last: boolean;
}) => {
  const today_ref = useRef<HTMLDivElement>(null);
  const [year, set_year] = useState(new Date().getFullYear());

  return (
    <li key={props.habit.id} className="rounded-lg border bg-white p-2 md:p-4">
      <div className="flex justify-between">
        <h1 className="flex justify-start text-xl font-semibold text-slate-700 md:text-2xl lg:text-3xl">
          {props.habit.name}
        </h1>
        <Button
          className="h-8 rounded bg-pink-500 px-4 text-sm font-semibold text-white hover:bg-pink-600 md:text-base"
          onClick={(e) => {
            e.preventDefault();
            today_ref.current?.click();
          }}
        >
          Today
        </Button>
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
        <ScrollArea>
          <div className="jason mb-4 gap-[0.15rem] md:gap-[0.2rem] lg:gap-[0.3rem]">
            <HabitSquaresDisplay
              today_ref={today_ref}
              parent_ref={props.parent_ref}
              is_last={props.is_last}
              color={props.color}
              habit={props.habit}
              year={year}
            />
            <ScrollBar orientation="horizontal" />
          </div>
        </ScrollArea>
      </div>
      <div className="h-2 md:h-4" />
      <div className="flex justify-between gap-3">
        <div className="flex gap-2">
          <DeleteHabit id={props.habit.id} />
          <TotalDisplay habit={props.habit} year={year} />
        </div>
        <YearPicker
          year={year}
          year_values={get_year_values(props.habit.habit_day_drops)}
          set_year={set_year}
        />
      </div>
    </li>
  );
};

export default HabitDisplay;

export function YearPicker({
  year,
  year_values,
  set_year,
}: {
  year: number;
  year_values: Array<number>;
  set_year: (new_year: number) => void;
}) {
  const [year_value, set_year_value] = useState(year.toString());
  let year_options = [];
  for (const y of year_values) {
    year_options.push(
      <SelectItem
        className="hover:cursor-pointer"
        key={y}
        value={y.toString()}
        onSelect={() => {
          set_year_value(y.toString());
          set_year(y);
        }}
      >
        {y}
      </SelectItem>
    );
  }

  return (
    <div className="flex">
      <Input
        className="w-24 rounded-r-none border-r-transparent focus-visible:ring-1 focus-visible:ring-offset-1"
        value={year_value}
        onChange={(e) => {
          const is_four_dig_num = /^[1-9]\d{3}$/.test(e.target.value);
          if (is_four_dig_num) {
            set_year(parseInt(e.target.value));
          }
          set_year_value(e.target.value);
        }}
      />
      <SelectPrimitive.Root
        disabled={year_options.length === 0}
        value={year.toString()}
        onValueChange={(new_value) => {
          set_year_value(new_value);
          set_year(parseInt(new_value));
        }}
      >
        <SelectPrimitive.Trigger asChild>
          <Button size="icon" className="rounded-none rounded-r-md">
            <ChevronDown className="h-4 w-4 font-bold text-white" />
          </Button>
        </SelectPrimitive.Trigger>
        <SelectContent align="end">{year_options}</SelectContent>
      </SelectPrimitive.Root>
    </div>
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
      className="flex min-w-[2.25rem] items-center justify-center rounded-lg border-2 border-pink-500 px-1 py-0.5 text-sm font-bold text-pink-500 md:min-w-[2.5rem] md:border-2 md:text-xl"
    >
      {total}
    </div>
  );
}

interface HabitSquaresDisplayProps {
  habit: HabitWithDayDrops;
  year: number;
  color: ColorOption;
  is_last: boolean;
  parent_ref: RefObject<HTMLButtonElement>;
  today_ref: RefObject<HTMLDivElement>;
}

function HabitSquaresDisplay({
  habit,
  year,
  color,
  is_last,
  parent_ref,
  today_ref,
}: HabitSquaresDisplayProps) {
  const create_day_drop = use_create_day_drop();
  const delete_day_drop = use_delete_day_drop();
  useEffect(() => {
    today_ref?.current?.scrollIntoView({ block: "end", inline: "nearest" });
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
        ref={i === day_out_of_year_for_today ? today_ref : null}
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
        tooltip_content={`${day_name} ${month}-${day}`}
      />
    );
  }
  for (; i <= number_of_days_in_year; i++) {
    output.push(
      <div
        key={i}
        className={cn(
          "h-[20px] w-[20px] rounded-sm border",
          COLOR_TO_CLASSNAME[color]["border"],
          "opacity-30 lg:h-[30px] lg:w-[30px]"
        )}
      ></div>
    );
  }
  return <>{output}</>;
}

interface HabitDayDropTooltipProps {
  is_checked: boolean;
  on_click: () => void;
  tooltip_content: string;
  color: ColorOption;
}
type AnimationState = "idle" | "shrinking" | "expanding";
function get_animation_class(animation_state: AnimationState) {
  switch (animation_state) {
    case "expanding":
      return "animate-expand";
    case "shrinking":
      return "animate-shrink";
    default: //idle
      return "";
  }
}

export const HabitDayDropTooltip = forwardRef<
  HTMLDivElement | null,
  HabitDayDropTooltipProps
>(
  (
    { is_checked, on_click, tooltip_content, color }: HabitDayDropTooltipProps,
    ref
  ) => {
    const [animation_state, set_animation_state] =
      useState<AnimationState>("idle");

    function on_mouse_down() {
      set_animation_state("shrinking");
    }
    function on_mouse_up() {
      set_animation_state("expanding");
      on_click();
    }

    useEffect(() => {
      if (animation_state === "expanding") {
        const timer = setTimeout(() => {
          set_animation_state("idle");
        }, 400); // Match this to the expansion animation duration
        return () => clearTimeout(timer);
      }
    }, [animation_state]);

    return (
      <Tooltip.Provider delayDuration={100} skipDelayDuration={0}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <div
              ref={ref}
              className={cn(
                "h-[20px] w-[20px] rounded-sm border",
                COLOR_TO_CLASSNAME[color]["border"],
                get_animation_class(animation_state),
                "hover:cursor-pointer hover:brightness-110 lg:h-[30px] lg:w-[30px]",
                is_checked ? COLOR_TO_CLASSNAME[color]["bg"] : ""
              )}
              onClick={() => {
                on_mouse_down();
                on_mouse_up();
              }}
              onMouseDown={on_mouse_down}
              onMouseUp={on_mouse_up}
            />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="z-50 overflow-hidden rounded-md border border-slate-100 bg-white p-3 text-sm text-slate-700 shadow-md animate-in fade-in-50 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
              {tooltip_content}
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

  const api_utils = api.useUtils();
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
          className="rounded bg-red-500 p-3 text-white hover:brightness-110"
          onClick={() => set_is_modal_open(true)}
        >
          <Trash2Icon className="h-4 w-4" />
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
