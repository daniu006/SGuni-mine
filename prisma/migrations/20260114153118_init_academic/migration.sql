/*
  Warnings:

  - You are about to drop the `career_reference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cycle_reference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `speciality_reference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_subject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subject_assignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subject_reference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teacher_profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_reference` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "student_profile" DROP CONSTRAINT "student_profile_career_id_fkey";

-- DropForeignKey
ALTER TABLE "student_profile" DROP CONSTRAINT "student_profile_user_id_fkey";

-- DropForeignKey
ALTER TABLE "student_subject" DROP CONSTRAINT "student_subject_cycleId_fkey";

-- DropForeignKey
ALTER TABLE "student_subject" DROP CONSTRAINT "student_subject_student_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "student_subject" DROP CONSTRAINT "student_subject_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "subject_assignment" DROP CONSTRAINT "subject_assignment_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "subject_assignment" DROP CONSTRAINT "subject_assignment_teacher_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "teacher_profile" DROP CONSTRAINT "teacher_profile_career_id_fkey";

-- DropForeignKey
ALTER TABLE "teacher_profile" DROP CONSTRAINT "teacher_profile_speciality_id_fkey";

-- DropForeignKey
ALTER TABLE "teacher_profile" DROP CONSTRAINT "teacher_profile_user_id_fkey";

-- DropTable
DROP TABLE "career_reference";

-- DropTable
DROP TABLE "cycle_reference";

-- DropTable
DROP TABLE "speciality_reference";

-- DropTable
DROP TABLE "student_profile";

-- DropTable
DROP TABLE "student_subject";

-- DropTable
DROP TABLE "subject_assignment";

-- DropTable
DROP TABLE "subject_reference";

-- DropTable
DROP TABLE "teacher_profile";

-- DropTable
DROP TABLE "user_reference";

-- CreateTable
CREATE TABLE "cycle" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speciality" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "speciality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "total_cicles" INTEGER NOT NULL,
    "duration_years" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "career_id" INTEGER NOT NULL,
    "cicle_number" INTEGER NOT NULL,
    "cycle_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "totalSpots" INTEGER NOT NULL DEFAULT 30,
    "availableSpots" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cycle_year_period_key" ON "cycle"("year", "period");

-- CreateIndex
CREATE UNIQUE INDEX "speciality_name_key" ON "speciality"("name");

-- CreateIndex
CREATE UNIQUE INDEX "career_name_key" ON "career"("name");

-- CreateIndex
CREATE INDEX "subject_career_id_cicle_number_idx" ON "subject"("career_id", "cicle_number");

-- CreateIndex
CREATE INDEX "subject_cycle_id_idx" ON "subject"("cycle_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_career_id_cicle_number_name_key" ON "subject"("career_id", "cicle_number", "name");

-- AddForeignKey
ALTER TABLE "subject" ADD CONSTRAINT "subject_career_id_fkey" FOREIGN KEY ("career_id") REFERENCES "career"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject" ADD CONSTRAINT "subject_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "cycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
