/*
  Warnings:

  - Added the required column `price` to the `ticket_services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ticket_services" ADD COLUMN     "price" DECIMAL(10,2) NOT NULL;
