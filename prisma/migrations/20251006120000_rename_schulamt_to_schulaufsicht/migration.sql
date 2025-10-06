-- Rename ActorRole enum value from SCHULAMT to SCHULAUFSICHT (if it exists)
DO $$
BEGIN
    -- Check if SCHULAMT exists and SCHULAUFSICHT doesn't
    IF EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'ActorRole' AND e.enumlabel = 'SCHULAMT'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'ActorRole' AND e.enumlabel = 'SCHULAUFSICHT'
    ) THEN
        ALTER TYPE "ActorRole" RENAME VALUE 'SCHULAMT' TO 'SCHULAUFSICHT';
        RAISE NOTICE 'Renamed SCHULAMT to SCHULAUFSICHT';
    END IF;
END $$;

-- Rename User column from schulamtName to schulaufsichtName (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'schulamtName'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'schulaufsichtName'
    ) THEN
        ALTER TABLE "User" RENAME COLUMN "schulamtName" TO "schulaufsichtName";
        RAISE NOTICE 'Renamed schulamtName to schulaufsichtName';
    END IF;
END $$;
