-- Add guardian_occupation column to parent_guardian_information table
ALTER TABLE parent_guardian_information
ADD COLUMN IF NOT EXISTS guardian_occupation VARCHAR(150);
