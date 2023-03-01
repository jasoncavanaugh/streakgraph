/*
  Warnings:

  - Added the required column `day` to the `HabitDayDrop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `HabitDayDrop` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `HabitDayDrop` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Habit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "streak" INTEGER NOT NULL DEFAULT 0,
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
    CONSTRAINT "HabitDayDrop_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "Habit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HabitDayDrop" ("habit_id", "id") SELECT "habit_id", "id" FROM "HabitDayDrop";
DROP TABLE "HabitDayDrop";
ALTER TABLE "new_HabitDayDrop" RENAME TO "HabitDayDrop";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
