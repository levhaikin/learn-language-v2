-- Add owned_items column to user_scores table
ALTER TABLE user_scores 
ADD COLUMN owned_items TEXT DEFAULT '[]';

-- Add comment to explain the column
COMMENT ON COLUMN user_scores.owned_items IS 'JSON array of owned store item IDs'; 