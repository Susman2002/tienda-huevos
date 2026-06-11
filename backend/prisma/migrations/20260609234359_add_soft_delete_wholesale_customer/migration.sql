-- AlterTable
ALTER TABLE "WholesaleCustomer" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedByUserId" UUID;

-- AddForeignKey
ALTER TABLE "WholesaleCustomer" ADD CONSTRAINT "WholesaleCustomer_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
