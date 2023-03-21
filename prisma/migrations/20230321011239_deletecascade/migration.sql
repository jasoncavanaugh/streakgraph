-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Habit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "streak" INTEGER NOT NULL,
    "color" TEXT NOT NULL
);
INSERT INTO "new_Habit" ("color", "id", "name", "streak") SELECT "color", "id", "name", "streak" FROM "Habit";
DROP TABLE "Habit";
ALTER TABLE "new_Habit" RENAME TO "Habit";
CREATE TABLE "new_HabitDayDrop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "habit_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    CONSTRAINT "HabitDayDrop_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "Habit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_HabitDayDrop" ("day", "habit_id", "id", "month", "year") SELECT "day", "habit_id", "id", "month", "year" FROM "HabitDayDrop";
DROP TABLE "HabitDayDrop";
ALTER TABLE "new_HabitDayDrop" RENAME TO "HabitDayDrop";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
