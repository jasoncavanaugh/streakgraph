import { api } from "../api";

export function use_create_day_drop() {
  const api_utils = api.useUtils();
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
      console.log("onSettled create");
      api_utils.habit.get_all.invalidate();
    },
  });
}
export function use_delete_day_drop() {
  const api_utils = api.useUtils();
  return api.habit.delete_day_drop.useMutation({
    onMutate: async (variables) => {
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
        const old_habit_data_cloned = structuredClone(old_habit_data);
        if (!old_habit_data_cloned) {
          console.log("'old_habit_data' is undefined");
          return [];
        }
        const filtered = old_habit_data_cloned.filter(
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
        return old_habit_data_cloned;
      });

      // Return the previous data so we can revert if something goes wrong
      return { prev_data };
    },
    onError: (err, data, ctx) => {
      console.error(err);
      api_utils.habit.get_all.setData(undefined, ctx?.prev_data);
    },
    onSettled: () => {
      console.log("onSettled delete");
      api_utils.habit.get_all.invalidate();
    },
  });
}
