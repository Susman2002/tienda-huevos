-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SELLER');

-- CreateEnum
CREATE TYPE "ProductFamily" AS ENUM ('NORMAL', 'WHITE', 'PACKAGED');

-- CreateEnum
CREATE TYPE "EggGrade" AS ENUM ('EXTRA', 'ESPECIAL', 'PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA', 'QUINTA');

-- CreateEnum
CREATE TYPE "PackSize" AS ENUM ('P30', 'P20', 'P10', 'P6');

-- CreateEnum
CREATE TYPE "BaseStockUnit" AS ENUM ('EGG', 'PACK');

-- CreateEnum
CREATE TYPE "TransactionUnit" AS ENUM ('GROUP', 'MAPLE', 'UNIT', 'PACK');

-- CreateEnum
CREATE TYPE "SalesChannel" AS ENUM ('RETAIL', 'WHOLESALE');

-- CreateEnum
CREATE TYPE "SupplierOrderStatus" AS ENUM ('DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SupplierOrderItemStatus" AS ENUM ('PENDING', 'PARTIAL', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');

-- CreateEnum
CREATE TYPE "WholesaleSaleStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'QR', 'CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "MovementDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('INITIAL_STOCK', 'PURCHASE_RECEIPT', 'WHOLESALE_SALE', 'RETAIL_SALE', 'ADJUSTMENT', 'RETURN_IN', 'RETURN_OUT');

-- CreateEnum
CREATE TYPE "MovementSourceType" AS ENUM ('SUPPLIER_ORDER', 'WHOLESALE_SALE', 'RETAIL_DAILY_SALE', 'MANUAL_ADJUSTMENT');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "family" "ProductFamily" NOT NULL,
    "grade" "EggGrade",
    "packSize" "PackSize",
    "baseStockUnit" "BaseStockUnit" NOT NULL,
    "unitsPerPack" INTEGER,
    "alertThreshold" INTEGER NOT NULL DEFAULT 600,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "onHand" INTEGER NOT NULL DEFAULT 0,
    "averageUnitCost" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPrice" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "priceDate" DATE NOT NULL,
    "channel" "SalesChannel" NOT NULL DEFAULT 'RETAIL',
    "salePrice" DECIMAL(12,2) NOT NULL,
    "setByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierOrder" (
    "id" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDeliveryDate" DATE,
    "status" "SupplierOrderStatus" NOT NULL DEFAULT 'ORDERED',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "orderedTotalEstimated" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "receivedTotalActual" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balanceDue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierOrderItem" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "orderedUnit" "TransactionUnit" NOT NULL,
    "orderedQuantity" DECIMAL(12,2) NOT NULL,
    "orderedBaseQuantity" INTEGER NOT NULL,
    "quotedUnitCost" DECIMAL(12,4),
    "receivedUnit" "TransactionUnit",
    "receivedQuantity" DECIMAL(12,2),
    "receivedBaseQuantity" INTEGER NOT NULL DEFAULT 0,
    "receivedUnitCost" DECIMAL(12,4),
    "lineStatus" "SupplierOrderItemStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierPayment" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "registeredByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WholesaleCustomer" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "documentNumber" TEXT,
    "creditLimit" DECIMAL(12,2),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WholesaleCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WholesaleSale" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "WholesaleSaleStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balanceDue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estimatedCostTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estimatedProfitTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WholesaleSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WholesaleSaleItem" (
    "id" UUID NOT NULL,
    "saleId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "saleUnit" "TransactionUnit" NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "baseQuantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "estimatedUnitCost" DECIMAL(12,4) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "estimatedProfit" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WholesaleSaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WholesalePayment" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "registeredByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WholesalePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WholesalePaymentAllocation" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "saleId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WholesalePaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailDailySale" (
    "id" UUID NOT NULL,
    "saleDate" DATE NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "grossTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estimatedCostTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estimatedProfitTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdByUserId" UUID NOT NULL,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetailDailySale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailDailySaleItem" (
    "id" UUID NOT NULL,
    "retailDailySaleId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "saleUnit" "TransactionUnit" NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "baseQuantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "estimatedUnitCost" DECIMAL(12,4) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "estimatedProfit" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetailDailySaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "type" "InventoryMovementType" NOT NULL,
    "direction" "MovementDirection" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "stockAfter" INTEGER NOT NULL,
    "unitCostSnapshot" DECIMAL(12,4),
    "unitPriceSnapshot" DECIMAL(12,2),
    "sourceType" "MovementSourceType",
    "sourceId" TEXT,
    "note" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_family_isActive_idx" ON "Product"("family", "isActive");

-- CreateIndex
CREATE INDEX "Product_grade_idx" ON "Product"("grade");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_productId_key" ON "Stock"("productId");

-- CreateIndex
CREATE INDEX "DailyPrice_priceDate_idx" ON "DailyPrice"("priceDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPrice_productId_priceDate_channel_key" ON "DailyPrice"("productId", "priceDate", "channel");

-- CreateIndex
CREATE INDEX "Supplier_name_idx" ON "Supplier"("name");

-- CreateIndex
CREATE INDEX "SupplierOrder_supplierId_orderedAt_idx" ON "SupplierOrder"("supplierId", "orderedAt");

-- CreateIndex
CREATE INDEX "SupplierOrder_status_paymentStatus_idx" ON "SupplierOrder"("status", "paymentStatus");

-- CreateIndex
CREATE INDEX "SupplierOrderItem_orderId_productId_idx" ON "SupplierOrderItem"("orderId", "productId");

-- CreateIndex
CREATE INDEX "SupplierPayment_orderId_paymentDate_idx" ON "SupplierPayment"("orderId", "paymentDate");

-- CreateIndex
CREATE UNIQUE INDEX "WholesaleCustomer_code_key" ON "WholesaleCustomer"("code");

-- CreateIndex
CREATE INDEX "WholesaleCustomer_businessName_idx" ON "WholesaleCustomer"("businessName");

-- CreateIndex
CREATE INDEX "WholesaleSale_customerId_saleDate_idx" ON "WholesaleSale"("customerId", "saleDate");

-- CreateIndex
CREATE INDEX "WholesaleSale_status_idx" ON "WholesaleSale"("status");

-- CreateIndex
CREATE INDEX "WholesaleSaleItem_saleId_productId_idx" ON "WholesaleSaleItem"("saleId", "productId");

-- CreateIndex
CREATE INDEX "WholesalePayment_customerId_paymentDate_idx" ON "WholesalePayment"("customerId", "paymentDate");

-- CreateIndex
CREATE INDEX "WholesalePaymentAllocation_saleId_idx" ON "WholesalePaymentAllocation"("saleId");

-- CreateIndex
CREATE UNIQUE INDEX "WholesalePaymentAllocation_paymentId_saleId_key" ON "WholesalePaymentAllocation"("paymentId", "saleId");

-- CreateIndex
CREATE INDEX "RetailDailySale_saleDate_idx" ON "RetailDailySale"("saleDate");

-- CreateIndex
CREATE UNIQUE INDEX "RetailDailySale_saleDate_createdByUserId_key" ON "RetailDailySale"("saleDate", "createdByUserId");

-- CreateIndex
CREATE INDEX "RetailDailySaleItem_productId_idx" ON "RetailDailySaleItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "RetailDailySaleItem_retailDailySaleId_productId_key" ON "RetailDailySaleItem"("retailDailySaleId", "productId");

-- CreateIndex
CREATE INDEX "InventoryMovement_productId_occurredAt_idx" ON "InventoryMovement"("productId", "occurredAt");

-- CreateIndex
CREATE INDEX "InventoryMovement_sourceType_sourceId_idx" ON "InventoryMovement"("sourceType", "sourceId");

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPrice" ADD CONSTRAINT "DailyPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPrice" ADD CONSTRAINT "DailyPrice_setByUserId_fkey" FOREIGN KEY ("setByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierOrder" ADD CONSTRAINT "SupplierOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierOrder" ADD CONSTRAINT "SupplierOrder_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierOrderItem" ADD CONSTRAINT "SupplierOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SupplierOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierOrderItem" ADD CONSTRAINT "SupplierOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPayment" ADD CONSTRAINT "SupplierPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SupplierOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPayment" ADD CONSTRAINT "SupplierPayment_registeredByUserId_fkey" FOREIGN KEY ("registeredByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WholesaleSale" ADD CONSTRAINT "WholesaleSale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "WholesaleCustomer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WholesaleSale" ADD CONSTRAINT "WholesaleSale_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WholesaleSaleItem" ADD CONSTRAINT "WholesaleSaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "WholesaleSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WholesaleSaleItem" ADD CONSTRAINT "WholesaleSaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WholesalePayment" ADD CONSTRAINT "WholesalePayment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "WholesaleCustomer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WholesalePayment" ADD CONSTRAINT "WholesalePayment_registeredByUserId_fkey" FOREIGN KEY ("registeredByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WholesalePaymentAllocation" ADD CONSTRAINT "WholesalePaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "WholesalePayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WholesalePaymentAllocation" ADD CONSTRAINT "WholesalePaymentAllocation_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "WholesaleSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailDailySale" ADD CONSTRAINT "RetailDailySale_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailDailySaleItem" ADD CONSTRAINT "RetailDailySaleItem_retailDailySaleId_fkey" FOREIGN KEY ("retailDailySaleId") REFERENCES "RetailDailySale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailDailySaleItem" ADD CONSTRAINT "RetailDailySaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
