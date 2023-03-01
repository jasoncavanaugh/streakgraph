/*
  Warnings:

  - You are about to drop the column `habitId` on the `HabitDayDrop` table. All the data in the column will be lost.
  - Added the required column `habit_id` to the `HabitDayDrop` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HabitDayDrop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "habit_id" TEXT NOT NULL,
    CONSTRAINT "HabitDayDrop_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "Habit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HabitDayDrop" ("id") SELECT "id" FROM "HabitDayDrop";
DROP TABLE "HabitDayDrop";
ALTER TABLE "new_HabitDayDrop" RENAME TO "HabitDayDrop";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
