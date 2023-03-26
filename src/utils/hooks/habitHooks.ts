import { api } from "../api";
import { HabitWithDayDrops } from "../types";

//This file used to have a bunch of duplicate code between the two functions. Then I tried to DRY it up. It still works, but is
//it as readable as before? Honestly, I'm not so sure...
interface IHabitMutationPayload {
  habit_id: string;
  year: number;
  month: number;
  day: number;
}
function get_function_for_optimistically_creating_habit_day_drop(
  habit_day_drop_shape_to_create: IHabitMutationPayload
) {
  const { habit_id, year, month, day } = habit_day_drop_shape_to_create;
  return (old_habit_data: HabitWithDayDrops[] | undefined) => {
    if (!old_habit_data) {
      console.log("'old_habit_data' is undefined");
      return [];
    }
    const filtered = old_habit_data.filter((habit) => habit.id === habit_id);
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
  };
}
function get_function_for_optimistically_deleting_habit_day_drop(
  habit_day_drop_shape_to_delete: IHabitMutationPayload
) {
  const { habit_id, year, month, day } = habit_day_drop_shape_to_delete;
  return (old_habit_data: HabitWithDayDrops[] | undefined) => {
    if (!old_habit_data) {
      console.log("'old_habit_data' is undefined");
      return [];
    }
    const filtered = old_habit_data.filter((habit) => habit.id === habit_id);
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
  };
}

function get_mutation_function(
  get_optimistic_update_function: (
    habit_shape_for_optimistic_update: IHabitMutationPayload
  ) => (old_habit_data: HabitWithDayDrops[] | undefined) => HabitWithDayDrops[]
) {
  const api_utils = api.useContext();
  return async (habit_shape_for_optimistic_update: IHabitMutationPayload) => {
    // Cancel outgoing fetches (so they don't overwrite our optimistic update)
    await api_utils.habit.get_all.cancel();
    // Get the data from the queryCache
    const prev_data = api_utils.habit.get_all.getData();
    if (!prev_data) {
      console.log("'prev_data' is undefined");
      return { prev_data: [] };
    }
    // Optimistically update the data with our new post
    api_utils.habit.get_all.setData(
      undefined,
      get_optimistic_update_function(habit_shape_for_optimistic_update)
    );
    // Return the previous data so we can revert if something goes wrong
    return { prev_data };
  };
}
export function use_create_day_drop() {
  const api_utils = api.useContext();
  return api.habit.create_day_drop.useMutation({
    onMutate: get_mutation_function(
      get_function_for_optimistically_creating_habit_day_drop
    ),
    onError: (err, data, ctx) => {
      console.error(err);
      api_utils.habit.get_all.setData(undefined, ctx?.prev_data);
    },
    onSettled: () => {
      api_utils.habit.get_all.invalidate();
    },
  });
}
export function use_delete_day_drop() {
  const api_utils = api.useContext();
  return api.habit.delete_day_drop.useMutation({
    onMutate: get_mutation_function(
      get_function_for_optimistically_deleting_habit_day_drop
    ),
    onError: (err, data, ctx) => {
      console.error(err);
      api_utils.habit.get_all.setData(undefined, ctx?.prev_data);
    },
    onSettled: () => {
      api_utils.habit.get_all.invalidate();
    },
  });
}
