import { useMemo, useState, useRef, useEffect, RefObject } from "react";
import { api } from "../utils/api";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as RadixVisuallyHidden from "@radix-ui/react-visually-hidden";
import { Spinner, SPINNER_SM_CLASSNAMES } from "./Spinner";
import {
  check_if_marked,
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
  COLOR_OPTIONS,
} from "../utils/types";
import { cn } from "../utils/cn";
import { SelectContent, SelectItem } from "./ui/select";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Button } from "./ui/button";
import { ChevronDown, EditIcon, Trash2Icon } from "lucide-react";
import { Input } from "./ui/input";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Label } from "./ui/label";

export const HabitDisplay = (props: {
  habit: HabitWithDayDrops;
  color: ColorOption;
  parent_ref: RefObject<HTMLButtonElement>;
  is_last: boolean;
}) => {
  const today_ref = useRef<HTMLDivElement>(null);
  const [year, set_year] = useState(new Date().getFullYear());
  const total = props.habit.habit_day_drops.filter(
    (drop) => drop.year === year
  ).length;

  return (
    <li key={props.habit.id} className="rounded-lg border bg-white p-2 md:p-4">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <h1 className="flex justify-start text-xl font-semibold text-slate-700 md:text-2xl lg:text-3xl">
            {props.habit.name}
          </h1>
          <EditHabit
            id={props.habit.id}
            cur_name={props.habit.name}
            cur_color={props.habit.color}
          />
        </div>
        <Button
          className="h-8 rounded bg-pink-500 px-4 text-sm font-semibold text-white hover:bg-pink-600 md:text-base"
          onMouseDown={(e) => {
            e.preventDefault();
            today_ref.current?.dispatchEvent(
              new MouseEvent("mousedown", { bubbles: true })
            );
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            today_ref.current?.dispatchEvent(
              new MouseEvent("mouseup", { bubbles: true })
            );
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
          <DeleteHabit id={props.habit.id} name={props.habit.name} />
          <div
            title="Total"
            className="flex min-w-[2.25rem] items-center justify-center rounded-lg border-2 border-pink-500 px-1 py-0.5 text-sm font-bold text-pink-500 md:min-w-[2.5rem] md:border-2 md:text-xl"
          >
            {total}
          </div>
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
        today_ref={i === day_out_of_year_for_today ? today_ref : null}
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

interface HabitDayDropTooltipProps {
  is_checked: boolean;
  on_click: () => void;
  tooltip_content: string;
  color: ColorOption;
  today_ref: RefObject<HTMLDivElement> | null;
}
export function HabitDayDropTooltip({
  is_checked,
  on_click,
  tooltip_content,
  color,
  today_ref,
}: HabitDayDropTooltipProps) {
  const [animation_state, set_animation_state] =
    useState<AnimationState>("idle");

  useEffect(() => {
    if (animation_state === "shrinking") {
      const handle_pointer_up = () => {
        set_animation_state("expanding");
        on_click();
      };
      window.addEventListener("mouseup", handle_pointer_up);
      return () => window.removeEventListener("mouseup", handle_pointer_up);
    }
  }, [animation_state]);

  return (
    <Tooltip.Provider delayDuration={100} skipDelayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div
            ref={today_ref}
            className={cn(
              "h-[20px] w-[20px] rounded-sm border",
              COLOR_TO_CLASSNAME[color]["border"],
              get_animation_class(animation_state),
              "hover:cursor-pointer hover:brightness-110 lg:h-[30px] lg:w-[30px]",
              is_checked ? COLOR_TO_CLASSNAME[color]["bg"] : ""
            )}
            onMouseDown={() => set_animation_state("shrinking")}
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

function EditHabit({
  id,
  cur_name,
  cur_color,
}: {
  id: string;
  cur_name: string;
  cur_color: ColorOption;
}) {
  const api_utils = api.useUtils();
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [color, set_color] = useState<ColorOption>(cur_color);
  const [name, set_name] = useState(cur_name);
  const edit_habit = api.habit.edit.useMutation({
    onSuccess: () => {
      api_utils.habit.invalidate();
      set_is_modal_open(false);
    },
  });

  return (
    <AlertDialog open={is_modal_open} onOpenChange={set_is_modal_open}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <EditIcon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-t-solid border-t-4 border-transparent border-t-pink-500">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Habit</AlertDialogTitle>
        </AlertDialogHeader>
        <RadixVisuallyHidden.Root>
          <AlertDialogDescription>
            Edit habit "{cur_name}". Change the name or color.
          </AlertDialogDescription>
        </RadixVisuallyHidden.Root>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.length === 0) {
              return;
            }
            edit_habit.mutate({ id, name, color });
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              autoComplete="off"
              id="name"
              value={name}
              onChange={(e) => set_name(e.target.value)}
              placeholder="Name"
              required
            />
          </div>
          <div className="h-6" />
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color_option) => (
                <button
                  key={color_option}
                  type="button"
                  className={cn(
                    "h-7 w-7 rounded-full",
                    color === color_option
                      ? "scale-105 ring-2 ring-black ring-offset-1 dark:ring-white"
                      : "hover:scale-105",
                    COLOR_TO_CLASSNAME[color_option]["bg"]
                  )}
                  onClick={() => set_color(color_option)}
                />
              ))}
            </div>
          </div>
          <div className="h-6" />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              className="md:w-24"
              disabled={name.length === 0}
              type="submit"
            >
              {edit_habit.status === "loading" && (
                <Spinner className={cn(SPINNER_SM_CLASSNAMES)} />
              )}
              {edit_habit.status !== "loading" && "Save"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
function DeleteHabit({ id, name }: { id: string; name: string }) {
  const [is_modal_open, set_is_modal_open] = useState(false);
  const api_utils = api.useUtils();
  const delete_habit = api.habit.delete.useMutation({
    onSuccess: () => {
      api_utils.habit.get_all.invalidate();
      set_is_modal_open(false);
    },
    onError: () => {
      alert("error");
    },
  });

  return (
    <AlertDialog open={is_modal_open} onOpenChange={set_is_modal_open}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          className="rounded bg-red-500 p-3 text-white hover:brightness-110"
          onClick={() => set_is_modal_open(true)}
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-t-solid border-t-4 border-transparent border-t-red-500">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{name}"</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          Are you sure you want to delete this habit? This action cannot be
          undone.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            className="md:w-24"
            type="submit"
            onClick={() => delete_habit.mutate({ id })}
          >
            {delete_habit.status === "loading" && (
              <Spinner className={cn(SPINNER_SM_CLASSNAMES)} />
            )}
            {delete_habit.status !== "loading" && "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
