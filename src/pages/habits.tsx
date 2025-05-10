import { GetServerSideProps } from "next";
import * as RadixVisuallyHidden from "@radix-ui/react-visually-hidden";
import { getServerAuthSession } from "../server/auth";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { RefObject, useEffect, useRef, useState } from "react";
import {
  Spinner,
  SPINNER_LG_CLASSNAMES,
  SPINNER_SM_CLASSNAMES,
} from "../components/Spinner";
import { api } from "../utils/api";
import {
  COLOR_OPTIONS,
  COLOR_TO_CLASSNAME,
  ColorOption,
  HabitWithDayDrops,
} from "../utils/types";
import { HabitDisplay } from "../components/HabitDisplay";
import { cn } from "../utils/cn";
import { Button } from "../components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: { session },
  };
};
export default function Habits() {
  const router = useRouter();
  const session = useSession();
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/home");
    }
  }, []);
  if (session.status === "loading") {
    return (
      <div className="flex h-[95vh] items-center justify-center p-1 md:p-4">
        <Spinner className={SPINNER_LG_CLASSNAMES} />
      </div>
    );
  }

  return (
    <div className="px-2 py-2 md:px-8">
      <header className="flex items-center justify-between gap-2 px-1 pt-2  md:flex-row md:pt-0">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">
            <span className="text-pink-500">STREAK</span>
            <span className="text-white">GRAPH</span>
          </span>
        </div>
        <Button
          className="bg-pink-500 px-2 py-2 text-sm font-medium text-white hover:bg-pink-600 md:px-3"
          ref={ref}
          onClick={() => void signOut()}
        >
          Log Out
        </Button>
      </header>
      <div className="h-2 md:h-4" />
      <HabitsList parent_ref={ref} />
      <CreateHabit />
    </div>
  );
}

function HabitsList({
  parent_ref,
}: {
  parent_ref: RefObject<HTMLButtonElement>;
}) {
  const all_habits = api.habit.get_all.useQuery();

  return (
    <ul className="flex flex-col gap-4">
      {all_habits.status === "loading" && (
        <div className="flex h-[95vh] items-center justify-center">
          <Spinner className={SPINNER_LG_CLASSNAMES} />
        </div>
      )}
      {all_habits.status === "error" && (
        <div className="flex h-[95vh] items-center justify-center">
          <h1 className="text-white">
            Uh oh, there was a problem loading your habits.
          </h1>
        </div>
      )}
      {all_habits.status === "success" && all_habits.data.length === 0 && (
        <div className="flex h-[95vh] items-center justify-center">
          <h1 className="text-white">
            Click the '+' button to add a new habit.
          </h1>
        </div>
      )}
      {all_habits.status === "success" && all_habits.data.length > 0 && (
        <RenderHabits
          habits={all_habits.data as Array<HabitWithDayDrops>}
          parent_ref={parent_ref}
        />
      )}
    </ul>
  );
}

function RenderHabits({
  habits,
  parent_ref,
}: {
  habits: HabitWithDayDrops[];
  parent_ref: RefObject<HTMLButtonElement>;
}) {
  return (
    <>
      {habits.map((habit, i) => {
        return (
          <HabitDisplay
            parent_ref={parent_ref}
            color={habit.color as ColorOption}
            key={habit.id}
            habit={habit}
            is_last={i === habits.length - 1}
          />
        );
      })}
    </>
  );
}

function CreateHabit() {
  const [name, set_name] = useState("");
  const [color, set_color] = useState<ColorOption | "">("");
  const [is_modal_open, set_is_modal_open] = useState(false);

  const api_utils = api.useUtils();
  const create_habit = api.habit.create.useMutation({
    onSuccess: () => {
      api_utils.habit.get_all.invalidate();
      set_name("");
      set_color("");
      set_is_modal_open(false);
    },
  });

  const add_habit_disabled =
    name.length === 0 ||
    color.length === 0 ||
    create_habit.status === "loading";

  return (
    <AlertDialog open={is_modal_open} onOpenChange={set_is_modal_open}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          onClick={() => set_is_modal_open(true)}
          className={cn(
            "fixed bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 p-0 shadow shadow-pink-300 hover:cursor-pointer",
            "md:bottom-14 md:right-14 md:h-14 md:w-14",
            "lg:shadow-md lg:shadow-pink-300 lg:transition-all lg:hover:-translate-y-0.5 lg:hover:shadow-lg lg:hover:shadow-pink-300 lg:hover:brightness-110"
          )}
        >
          <Fab />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-t-solid border-t-4 border-transparent border-t-pink-500">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Habit</AlertDialogTitle>
        </AlertDialogHeader>
        <RadixVisuallyHidden.Root>
          <AlertDialogDescription>
            Add a new habit to track. Give it a name and choose a color.
          </AlertDialogDescription>
        </RadixVisuallyHidden.Root>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.length === 0 || color === "") {
              return;
            }
            create_habit.mutate({ name, color });
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
            <AlertDialogCancel
              onClick={() => {
                set_name("");
                set_color("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              className="md:w-24"
              disabled={add_habit_disabled}
              type="submit"
            >
              {create_habit.status === "loading" && (
                <Spinner className={cn(SPINNER_SM_CLASSNAMES)} />
              )}
              {create_habit.status !== "loading" && "Create"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ColorSelection(props: {
  on_select_color: (option: ColorOption) => void;
  selected_color: ColorOption | "";
}) {
  return (
    <>
      {COLOR_OPTIONS.map((option) => {
        return (
          <div
            key={option}
            className={`${
              COLOR_TO_CLASSNAME[option]["bg"]
            } h-6 w-6 rounded-md border-2 ${
              props.selected_color === option
                ? "border-slate-900 brightness-110"
                : "border-white hover:cursor-pointer hover:border-slate-900 hover:brightness-110"
            } lg:h-8 lg:w-8`}
            onClick={() => props.on_select_color(option)}
          />
        );
      })}
    </>
  );
}

function Fab() {
  /* https://tailwindcomponents.com/component/tailwind-css-fab-buttons */
  return (
    <svg
      viewBox="0 0 20 20"
      enableBackground="new 0 0 20 20"
      className={cn("inline-block h-6 w-6")}
    >
      <path
        fill="#FFFFFF"
        d="M16,10c0,0.553-0.048,1-0.601,1H11v4.399C11,15.951,10.553,16,10,16c-0.553,0-1-0.049-1-0.601V11H4.601 C4.049,11,4,10.553,4,10c0-0.553,0.049-1,0.601-1H9V4.601C9,4.048,9.447,4,10,4c0.553,0,1,0.048,1,0.601V9h4.399 C15.952,9,16,9.447,16,10z"
      />
    </svg>
  );
}
