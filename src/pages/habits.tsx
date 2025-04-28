import { GetServerSideProps } from "next";
import { Modal } from "../components/Modal";
import * as RadixModal from "@radix-ui/react-dialog";
import { getServerAuthSession } from "../server/auth";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { RefObject, useEffect, useRef, useState } from "react";
import Spinner from "../components/Spinner";
import { api } from "../utils/api";
import {
  COLOR_OPTIONS,
  COLOR_TO_CLASSNAME,
  ColorOption,
  HabitWithDayDrops,
} from "../utils/types";
import HabitDisplay from "../components/HabitDisplay";
import { cn } from "../utils/cn";

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
        <Spinner className="h-16 w-16 border-4 border-solid border-white lg:border-8" />
      </div>
    );
  }

  return (
    <div className="p-1 md:p-4">
      <div className="flex items-end justify-between gap-2 px-1 pt-2  md:flex-row md:pt-0">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">
            <span className="text-pink-500">STREAK</span>
            <span className="text-white">GRAPH</span>
          </span>
        </div>
        <button
          className="rounded bg-pink-500 px-3 py-1 text-sm font-semibold text-white shadow-sm shadow-pink-500 hover:brightness-110 md:px-5 md:text-lg"
          onClick={() => void signOut()}
          ref={ref}
        >
          Log Out
        </button>
      </div>
      <div className="h-2 md:h-4" />
      <HabitsList parent_ref={ref} />
      <AddNewHabitButtonAndModal />
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
          <Spinner className="h-16 w-16 border-4 border-solid border-white lg:border-8" />
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
      {all_habits.status === "success" &&
        all_habits.data.length > 0 &&
        render_habits(all_habits.data, parent_ref)}
    </ul>
  );
}

function render_habits(
  habits: HabitWithDayDrops[],
  parent_ref: RefObject<HTMLButtonElement>
) {
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

function AddNewHabitButtonAndModal() {
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
    <Modal
      open={is_modal_open}
      trigger={
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
      }
      className="left-1/2 top-1/3 flex w-[30rem] -translate-x-1/2 -translate-y-1/2 flex-col border-t-8 border-t-pink-500 px-5 py-3 lg:top-1/2 lg:px-8 lg:py-6"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.length === 0 || color === "") {
            return;
          }
          create_habit.mutate({ name, color });
        }}
      >
        <RadixModal.Title className="whitespace-nowrap text-3xl font-bold text-slate-700">
          Create New Habit
        </RadixModal.Title>
        <div className="h-1 lg:h-4" />
        <div className="flex w-full flex-col gap-4">
          <label htmlFor="habit-name">Name</label>
          <input
            name="habit-name"
            onChange={(e) => set_name(e.target.value)}
            className="rounded border border-slate-600 px-2 py-1"
            autoComplete="off"
            type="text"
          ></input>
          <p>Color</p>
          <div className="maureen">
            <ColorSelection
              selected_color={color}
              on_select_color={set_color}
            />
          </div>
        </div>
        <div className="h-8" />
        <div className="flex justify-center gap-5">
          <button
            className="rounded-full bg-slate-500 px-3 py-2 text-xs font-semibold text-white hover:brightness-110 lg:px-5 lg:py-3 lg:text-base lg:font-bold"
            type="button"
            onClick={() => {
              set_is_modal_open(false);
              set_name("");
              set_color("");
            }}
          >
            Cancel
          </button>
          <button
            className={`rounded-full bg-pink-500 px-3 py-2 text-xs font-semibold text-white lg:px-5 lg:py-3 lg:text-base lg:font-bold ${
              add_habit_disabled
                ? "opacity-50"
                : "hover:cursor-pointer hover:brightness-110"
            }`}
            type="submit"
            disabled={add_habit_disabled}
          >
            {create_habit.status === "loading" && (
              <Spinner className="mx-[2.1rem] h-4 w-4 border-2 border-solid border-white lg:mx-[3.1rem] lg:my-1" />
            )}
            {create_habit.status !== "loading" && "Create Habit"}
          </button>
        </div>
      </form>
    </Modal>
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
