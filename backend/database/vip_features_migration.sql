-- Migration for VIP features and account status

-- 1. Add account_status to users table
ALTER TABLE users 
ADD COLUMN account_status ENUM('active', 'locked', 'banned') DEFAULT 'active' AFTER role;

-- Update existing users to active
UPDATE users SET account_status = 'active' WHERE account_status IS NULL;

-- 2. Update role enum to include 'vip'
ALTER TABLE users 
MODIFY COLUMN role ENUM('reader', 'vip', 'admin') DEFAULT 'reader';

-- 3. Update chapters status to include 'vip'
ALTER TABLE chapters 
MODIFY COLUMN status ENUM('open', 'closed', 'vip') DEFAULT 'open';

-- 4. Add access_status to comics table
ALTER TABLE comics 
ADD COLUMN access_status ENUM('open', 'closed', 'vip') DEFAULT 'open' AFTER status;

-- Update existing comics to open
UPDATE comics SET access_status = 'open' WHERE access_status IS NULL;

