-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_postId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "totalComments" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalLikes" INTEGER NOT NULL DEFAULT 0;
