import { type NextPage } from "next";
import * as RadixModal from "@radix-ui/react-dialog";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { FormEvent, useRef, useState } from "react";

import { api } from "../utils/api";
import { Modal } from "./components/Modal";
import { HabitDisplay } from "./components/HabitDisplay";
import { Spinner } from "./components/Spinner";

const input_classes = "rounded border border-slate-600 px-2 py-1";
function AddNewHabitButton() {
  const [name, set_name] = useState("");
  const [color, set_color] = useState("");
  const [is_modal_open, set_is_modal_open] = useState(false);

  const api_utils = api.useContext();
  const create_habit = api.habit.create.useMutation({
    onMutate: () => {

    },
    onSuccess: () => {
      api_utils.habit.get_all.invalidate();
      set_is_modal_open(false);
    }
  });

  const add_habit_disabled = name.length === 0 || color.length === 0 || create_habit.status === "loading";
  return (
    <Modal
      open={is_modal_open}
      trigger={
        <button
          type="button"
          className="fixed bottom-5 right-5 h-14 w-14 rounded-full bg-pink-600 text-3xl font-bold text-white md:bottom-16 md:right-16 lg:shadow-md lg:shadow-pink-500 lg:transition-all lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:shadow-pink-500 lg:hover:brightness-110"
          onClick={() => set_is_modal_open(true)}
        >
          +
        </button>
      }
      modal_frame_classNames="top-1/2 left-1/2 w-[30rem] flex -translate-x-1/2 -translate-y-1/2 flex-col border-t-8 border-t-pink-500 px-5 py-3 lg:top-1/2 lg:px-8 lg:py-6"
      content={
        <form onSubmit={(e) => {
          e.preventDefault();
          if (name.length === 0 || color.length === 0) {
            return;
          }
          create_habit.mutate({ name, color });
        }
        }>
          <RadixModal.Title className="text-3xl font-bold text-slate-700 whitespace-nowrap">
            Create New Habit
          </RadixModal.Title>
          <div className="h-1 lg:h-4" />
          <div className="flex w-full flex-col gap-4">
            <label htmlFor="habit-name">Name:</label>
            <input
              name="habit-name"
              onChange={(e) => set_name(e.target.value)}
              className={input_classes}
              autoComplete="off"
              type="text"
            ></input>
            <label htmlFor="habit-color">Color:</label>
            <input
              name="habit-color"
              onChange={(e) => set_color(e.target.value)}
              autoComplete="off"
              className={input_classes}
              type="text"
            ></input>
          </div>
          <div className="h-8" />
          <div className="flex justify-center gap-5">
            <button
              className="rounded-full bg-slate-500 px-3 py-2 text-xs font-semibold text-white hover:brightness-110 lg:px-5 lg:py-3 lg:text-base lg:font-bold"
              type="button"
              onClick={() => set_is_modal_open(false)}
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
              {create_habit.status === "loading" && <Spinner className="h-4 w-4 border-2 border-solid border-white lg:mx-[1.33rem] lg:my-1" />}
              {create_habit.status !== "loading" && "Create Habit"}
            </button>
          </div>
        </form>
      }
    />
  );
}
const Home: NextPage = () => {
  const all_habits = api.habit.get_all.useQuery();
  const [filter_text, set_filter_text] = useState("");

  if (all_habits.status === "loading") {
    return <div>Loading...</div>;
  }
  if (all_habits.status === "error") {
    console.error(all_habits.error);
  }

  return (
    <div className="p-1 md:p-4">
      <input
        autoComplete="off"
        className="w-full rounded-full px-3 py-1 outline-0 md:w-1/3"
        placeholder="Search..."
        value={filter_text}
        onChange={(e) => set_filter_text(e.target.value)}
        type="search"
      ></input>
      <div className="h-2 md:h-4" />
      <ul className="flex flex-col gap-4 rounded-lg bg-slate-500 p-2 md:p-4">
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
          all_habits.data
            .filter((habit) => {
              const filter_text_lower = filter_text.toLowerCase();
              const habit_name_lower = habit.name.toLowerCase();
              return (
                filter_text.length === 0 ||
                filter_text_lower.includes(habit_name_lower) ||
                habit_name_lower.includes(filter_text_lower)
              );
            })
            .map((habit) => {
              return <HabitDisplay habit={habit} year={2023} />;
            }))}
      </ul>
      <AddNewHabitButton />
    </div>
  );
};

export default Home;
