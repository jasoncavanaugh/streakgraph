import type { NextPage } from "next";
import * as RadixModal from "@radix-ui/react-dialog";
import { RefObject, useRef, useState } from "react";
import { api } from "../utils/api";
import { Modal } from "../components/Modal";
import { HabitDisplay } from "../components/HabitDisplay";
import { Spinner } from "../components/Spinner";
import { get_years } from "../utils/calendar";
import { ColorOption, COLOR_OPTIONS, COLOR_TO_CLASSNAME, HabitWithDayDrops } from "../utils/types";
import { signIn, signOut, useSession } from "next-auth/react";
import { getServerAuthSession } from "../server/auth";
import { type GetServerSideProps } from "next";

//I should probably understand how this works, but I just ripped it from https://create.t3.gg/en/usage/next-auth
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: { session },
  };
};
const Home: NextPage = () => {
  const all_habits = api.habit.get_all.useQuery();
  const ref = useRef<HTMLButtonElement>(null);
  const [filter_text, set_filter_text] = useState("");
  const session = useSession();

  if (all_habits.status === "error") {
    console.error(all_habits.error);
  }

  if (session.status === "loading") {
    return (
      <div className="flex h-[95vh] items-center justify-center p-1 md:p-4">
        <Spinner className="h-16 w-16 border-4 border-solid border-white lg:border-8" />
      </div>
    );
  }

  if (session.status === "unauthenticated") {
    return <SignInPage />;
  }

  return (
    <div className="p-1 md:p-4">
      <div className="flex flex-col-reverse items-end justify-between gap-2 px-1 pt-2  md:flex-row md:pt-0">
        <input
          autoComplete="off"
          className="w-full rounded-full px-3 py-1 outline-0 md:w-1/3"
          placeholder="Search..."
          value={filter_text}
          onChange={(e) => set_filter_text(e.target.value)}
          type="search"
        ></input>
        <button
          className="rounded-full bg-pink-500 px-3 py-1 text-sm font-semibold text-white shadow-sm shadow-pink-500 hover:brightness-110 md:px-5 md:text-lg"
          onClick={() => void signOut()}
          ref={ref}
        >
          Log Out
        </button>
      </div>
      <div className="h-2 md:h-4" />
      <ul className="flex flex-col gap-4 rounded-lg bg-slate-500 p-2 md:p-4">
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
          render_habits(all_habits.data
            .filter((habit) => {
              if (filter_text.length === 0) return true;
              const filter_text_lower = filter_text.toLowerCase();
              const habit_name_lower = habit.name.toLowerCase();
              return (
                filter_text_lower.includes(habit_name_lower) ||
                habit_name_lower.includes(filter_text_lower)
              );
            }), ref)}
      </ul>
      <AddNewHabitButtonAndModal />
    </div>
  );
};

export default Home;

function render_habits(habits: HabitWithDayDrops[], parent_ref: RefObject<HTMLButtonElement>) {
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

function SignInPage() {
  return (
    <div className="h-[95vh] p-1 md:p-4">
      <div className="flex justify-end">
        <button
          className="rounded-full bg-pink-500 px-3 py-1 font-semibold text-white shadow-sm shadow-pink-500 hover:brightness-110 md:px-6 md:py-2 md:text-xl"
          onClick={() => void signIn()}
        >
          Sign In
        </button>
      </div>
      <div className="h-8" />
      <div className="ml-[3rem] flex flex-col gap-3 ">
        <h1 className="text-2xl font-extrabold tracking-wider md:text-6xl lg:text-8xl">
          <span
            className="bg-gradient-to-l from-pink-400 to-pink-600 bg-clip-text text-transparent"
          //className="text-gradient-to-r text-pink-500"
          >
            STREAK
          </span>
          <span className="text-white">GRAPH</span>
        </h1>
        <div className="ml-2 text-sm font-semibold leading-relaxed text-white md:text-xl">
          <p>Track your habits with a simple grid.</p>
          <p>Inspired by the Github contributions graph.</p>
        </div>
      </div>
    </div>
  );
}

function AddNewHabitButtonAndModal() {
  const [name, set_name] = useState("");
  const [color, set_color] = useState<ColorOption | "">("");
  const [is_modal_open, set_is_modal_open] = useState(false);

  const api_utils = api.useContext();
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
          className="fixed bottom-5 right-5 h-14 w-14 rounded-full bg-pink-600 text-3xl font-bold text-white hover:brightness-110 md:bottom-16 md:right-16 lg:shadow-md lg:shadow-pink-500 lg:transition-all lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:shadow-pink-500"
          onClick={() => set_is_modal_open(true)}
        >
          +
        </button>
      }
      className="top-1/3 left-1/2 flex w-[30rem] -translate-x-1/2 -translate-y-1/2 flex-col border-t-8 border-t-pink-500 px-5 py-3 lg:top-1/2 lg:px-8 lg:py-6"
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
            className={`rounded-full bg-pink-500 px-3 py-2 text-xs font-semibold text-white lg:px-5 lg:py-3 lg:text-base lg:font-bold ${add_habit_disabled
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
            className={`${COLOR_TO_CLASSNAME[option]["bg"]
              } h-6 w-6 rounded-md border-2 ${props.selected_color === option
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
