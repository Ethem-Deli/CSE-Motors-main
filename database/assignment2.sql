-- ===========================================================
-- QUERY 1: Insert Tony Stark record into the account table
-- ===========================================================
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
-- ===========================================================
-- QUERY 2: Change Tony Stark’s account_type to 'Admin'
-- ===========================================================
UPDATE public.account
SET account_type = 'Admin'::account_type
WHERE account_firstname = 'Tony'
    AND account_lastname = 'Stark';
-- ===========================================================
-- QUERY 3: Delete the Tony Stark record from the account table
-- ===========================================================
DELETE FROM public.account
WHERE account_firstname = 'Tony'
    AND account_lastname = 'Stark';
-- ===========================================================
-- QUERY 4: Modify the "GM Hummer" description to say "a huge interior"
-- ===========================================================
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_make = 'GM'
    AND inv_model = 'Hummer';
-- ===========================================================
-- QUERY 5: Select make, model, and classification name 
-- for all inventory items in the 'Sport' category
-- ===========================================================
SELECT i.inv_make,
    i.inv_model,
    c.classification_name
FROM public.inventory AS i
    INNER JOIN public.classification AS c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';
-- ===========================================================
-- QUERY 6: Update all records in inventory table 
-- to include "/vehicles" in the image and thumbnail paths
-- ===========================================================
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');

    -- Create ENUM type if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type') THEN
        CREATE TYPE account_type AS ENUM ('Client', 'Admin');
    END IF;
END$$;

-- Create account table if missing
CREATE TABLE IF NOT EXISTS public.account (
    account_id SERIAL PRIMARY KEY,
    account_firstname VARCHAR(50),
    account_lastname VARCHAR(50),
    account_email VARCHAR(100) UNIQUE,
    account_password VARCHAR(255),
    account_type account_type DEFAULT 'Client'
);

-- 1. Insert Tony
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 2. Update Tony
UPDATE public.account SET account_type = 'Admin' WHERE account_firstname = 'Tony' AND account_lastname = 'Stark';

-- 3. Check results
SELECT * FROM public.account;
