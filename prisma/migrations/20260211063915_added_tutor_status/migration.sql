-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "TutorProfile" ADD COLUMN     "status" "ProfileStatus" NOT NULL DEFAULT 'PENDING';
