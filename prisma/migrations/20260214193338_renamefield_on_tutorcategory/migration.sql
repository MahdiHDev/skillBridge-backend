/*
  Warnings:

  - You are about to drop the column `categoryId` on the `TutorCategory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tutorProfileId,subjectId]` on the table `TutorCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subjectId` to the `TutorCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TutorCategory" DROP CONSTRAINT "TutorCategory_categoryId_fkey";

-- DropIndex
DROP INDEX "TutorCategory_tutorProfileId_categoryId_key";

-- AlterTable
ALTER TABLE "TutorCategory" DROP COLUMN "categoryId",
ADD COLUMN     "subjectId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TutorCategory_tutorProfileId_subjectId_key" ON "TutorCategory"("tutorProfileId", "subjectId");

-- AddForeignKey
ALTER TABLE "TutorCategory" ADD CONSTRAINT "TutorCategory_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
