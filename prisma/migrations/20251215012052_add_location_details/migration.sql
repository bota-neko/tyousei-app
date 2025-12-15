-- AlterTable
ALTER TABLE "Event" ADD COLUMN "address" TEXT;
ALTER TABLE "Event" ADD COLUMN "fee" TEXT;
ALTER TABLE "Event" ADD COLUMN "location" TEXT;
ALTER TABLE "Event" ADD COLUMN "siteUrl" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "contactInfo" TEXT,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "confirmedSlotId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'polled',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "checkInCode" TEXT,
    "checkedInAt" DATETIME,
    CONSTRAINT "Participant_confirmedSlotId_fkey" FOREIGN KEY ("confirmedSlotId") REFERENCES "EventSlot" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Participant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Participant" ("checkInCode", "checkedInAt", "confirmedSlotId", "contactInfo", "createdAt", "eventId", "id", "memo", "nickname", "status", "token", "updatedAt") SELECT "checkInCode", "checkedInAt", "confirmedSlotId", "contactInfo", "createdAt", "eventId", "id", "memo", "nickname", "status", "token", "updatedAt" FROM "Participant";
DROP TABLE "Participant";
ALTER TABLE "new_Participant" RENAME TO "Participant";
CREATE UNIQUE INDEX "Participant_token_key" ON "Participant"("token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
