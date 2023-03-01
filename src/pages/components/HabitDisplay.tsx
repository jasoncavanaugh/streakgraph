import { useMemo, useState } from "react";
import { Modal } from "./Modal";
import * as RadixModal from "@radix-ui/react-dialog";
import { api } from "../../utils/api";
import { Habit, HabitDayDrop } from "@prisma/client";
import { HabitWithDayDrops } from "../../server/api/routers/habitRouter";
import { create } from "domain";

interface DeleteHabitProps {
  id: string;
}
const DeleteHabit: React.FC<DeleteHabitProps> = ({ id }) => {
  const delete_habit = api.habit.delete.useMutation();

  return (
    <Modal
      trigger={
        <button
          type="button"
          className="rounded-full bg-red-500 py-1 px-2 text-sm font-semibold text-white outline-none hover:brightness-110 md:py-2 md:px-4 md:text-base lg:text-base"
        >
          Remove
        </button>
      }
      content={
        <div>
          <RadixModal.Title className="text-3xl font-bold text-slate-700">
            Delete habit
          </RadixModal.Title>
          <div className="h-1 lg:h-4" />
          <div className="flex w-full flex-col gap-4">
            Are you sure you wish to delete this habit?
          </div>
          <div className="h-8" />
          <div className="flex justify-center gap-5">
            <RadixModal.Close
              className="rounded-full bg-slate-500 px-3 py-2 text-xs font-semibold text-white outline-none hover:brightness-110 lg:px-5 lg:py-3 lg:text-base lg:font-bold"
              type="button"
            >
              Cancel
            </RadixModal.Close>
            <button
              className="rounded-full bg-red-500 px-3 py-2 text-xs font-semibold text-white outline-none hover:brightness-110 lg:px-5 lg:py-3 lg:text-base lg:font-bold"
              type="button"
              onClick={() => delete_habit.mutate({ id })}
            >
              Delete
            </button>
          </div>
        </div>
      }
    />
  );
};

function get_month_and_day_from_day_out_of_365(day_out_of_365: number) {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 31, 31];
}
// const calc = (day_num: number) => {
//   let idx = 0;
//   let cur_month = 1;
//   while (idx < days.length && day_num > days[idx]!) {
//     day_num -= days[idx]!;
//     idx++;
//     cur_month++;
//   }
//   return cur_month + " " + day_num;
// };
function get_first_day_of_year(year: number) {
  const january = 0;
  const first = 1;
  return new Date(year, january, first).getDay();
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
function get_number_of_total_squares_including_hidden(year: number) {
  console.log("Running get_number_of_total_squares_including_hidden");
  return get_number_of_days_in_year(year) + get_first_day_of_year(year);
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

function get_day_month(
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
  const create_day_drop = api.habit.create_day_drop.useMutation();
  const delete_day_drop = api.habit.delete_day_drop.useMutation({
    onSuccess() {},
  });
  // const [habit_drop_lookup, set_habit_drop_lookup] = useState({});

  let output = [];
  for (let i = 0; i < first_day_of_year; i++) {
    output.push(<div className="h-[20px] w-[20px] opacity-0"></div>);
  }
  for (
    let i = first_day_of_year;
    i < number_of_total_squares_including_hidden;
    i++
  ) {
    const is_checked = check_if_checked(
      i - first_day_of_year + 1,
      habit.habit_day_drops,
      year
    );
    const [month, day] = get_day_month(
      i - first_day_of_year + 1,
      habit.habit_day_drops,
      year
    );
    if (!month || !day) {
      throw new Error("Eff my life");
    }
    output.push(
      <div
        className={`h-[20px] w-[20px] rounded-sm border border-pink-500 md:rounded md:border lg:h-[30px] lg:w-[30px] ${
          i < first_day_of_year
            ? "opacity-0"
            : "hover:cursor-pointer hover:brightness-110 "
        } ${is_checked ? "bg-pink-500" : ""}`}
        onClick={() => {
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
      ></div>
    );
  }
  // for (let i = 0; i < number_of_total_squares_including_hidden; i++) {
  //   output.push(
  //     <div
  //       onClick={() =>
  //         i < first_day_of_year
  //           ? () => {}
  //           : on_habit_square_click(i - first_day_of_year + 1)
  //       }
  //       key={i}
  //       className={`h-[20px] w-[20px] rounded-sm border border-pink-500 md:rounded md:border lg:h-[30px] lg:w-[30px] ${
  //         i < first_day_of_year
  //           ? "opacity-0"
  //           : "hover:cursor-pointer hover:brightness-110 "
  //       }
  //       ${}
  //       `}
  //     ></div>
  //   );
  // }
  //I hate this
  return <>{output}</>;
};

/*
const get_squares = ({
  number_of_total_squares_including_hidden,
  first_day_of_year,
  on_habit_square_click,
}: {
  number_of_total_squares_including_hidden: number;
  first_day_of_year: number;
  on_habit_square_click: (idx: number) => void;
}) => {
  let output = [];
  for (let i = 0; i < number_of_total_squares_including_hidden; i++) {
    output.push(
      <div
        onClick={() =>
          i < first_day_of_year
            ? () => {}
            : on_habit_square_click(i - first_day_of_year + 1)
        }
        key={i}
        className={`h-[20px] w-[20px] rounded-sm border border-pink-500 md:rounded md:border lg:h-[30px] lg:w-[30px] ${
          i < first_day_of_year
            ? "opacity-0"
            : "hover:cursor-pointer hover:brightness-110 "
        }`}
      >
        {/* {calc(i + 1)} */ //}
//       </div>
//     );
//   }
//   return output;
// };

function get_month_and_day_from_day_in_year({
  day_out_of_number_of_days_in_year,
  year,
}: {
  day_out_of_number_of_days_in_year: number;
  year: number;
}) {
  return [0, 0];
}

interface Props {
  habit: HabitWithDayDrops;
  year: number;
}

export const HabitDisplay: React.FC<Props> = (props) => {
  // const [day, set_day] = useState("1 1");
  // const number_of_days_in_year = get_number_of_days_in(year);

  // const handle_click = (day_num: number) => {
  //   let idx = 0;
  //   let cur_month = 1;
  //   while (idx < days.length && day_num > days[idx]!) {
  //     day_num -= days[idx]!;
  //     idx++;
  //     cur_month++;
  //   }
  //   set_day(cur_month + " " + day_num);
  //   // return cur_month + " " + day_num;
  // };
  const [number_of_total_squares_including_hidden, first_day_of_year] = useMemo(
    () => [
      get_number_of_total_squares_including_hidden(props.year),
      get_first_day_of_year(props.year),
    ],
    [props.year]
  );
  // const first_day_of_year = useMemo(
  //   () => get_first_day_of(props.year),
  //   [props.year]
  // );

  // console.log(habit.habit_day_drops);
  return (
    <li
      key={props.habit.id}
      className="rounded-lg border bg-white py-1 px-2 md:p-4"
    >
      <h1 className="flex justify-start text-xl font-semibold text-slate-700 md:text-2xl lg:text-3xl">
        {props.habit.name}
      </h1>
      <div className="h-2 md:h-4" />
      {/* <div className="grid grid-rows-6 gap-1 border border-green-500"> */}
      <div className="flex flex-col overflow-x-auto">
        {/* <div className="flex py-2">
          <h2 className="w-20">Jan</h2>
          <h2 className="w-20">Feb</h2>
          <h2 className="w-20">Mar</h2>
          <h2 className="w-20">Apr</h2>
          <h2 className="w-20">May</h2>
          <h2 className="w-20">Jun</h2>
          <h2 className="w-20">Jul</h2>
          <h2 className="w-20">Aug</h2>
          <h2 className="w-20">Sep</h2>
          <h2 className="w-20">Oct</h2>
          <h2 className="w-20">Nov</h2>
          <h2 className="w-20">Dec</h2>
        </div> */}
        <div className="jason gap-[0.15rem] md:gap-[0.2rem] lg:gap-[0.3rem]">
          {/* {get_squares({
            number_of_total_squares_including_hidden,
            first_day_of_year,
            on_habit_square_click: (day_out_of_365: number) => {
              const [month, day] =
                get_month_and_day_from_day_out_of_365(day_out_of_365);
              add_habit_drop.mutate({
                habit_id: props.habit.id,
                year: props.year,
                month: month,
                day: day,
              }});
            }
          )} */}
          <HabitSquaresDisplay
            number_of_total_squares_including_hidden={
              number_of_total_squares_including_hidden
            }
            first_day_of_year={first_day_of_year}
            habit={props.habit}
            year={props.year}
          />
        </div>
        <div className="h-2 md:h-4" />
      </div>
      <div className="h-2 md:h-4" />
      <DeleteHabit id={props.habit.id} />
    </li>
  );
};
