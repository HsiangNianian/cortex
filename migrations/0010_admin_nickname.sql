-- Add optional nickname column to admins table
-- Nickname is used as display name in review info; falls back to username if null
-- Uniqueness is enforced at the application layer (API checks)
ALTER TABLE admins ADD COLUMN nickname TEXT;
