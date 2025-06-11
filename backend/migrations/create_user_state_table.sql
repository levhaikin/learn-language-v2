-- Create user_state table based on UserState interface
CREATE TABLE user_state (
    user_id INTEGER NOT NULL,
    accuracy_points INTEGER NOT NULL DEFAULT 0,
    speed_points INTEGER NOT NULL DEFAULT 0,
    owned_items TEXT NOT NULL DEFAULT '[]',
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Primary key
    PRIMARY KEY (user_id),
    
    -- Foreign key to users table (assuming you have a users table)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT check_accuracy_points_non_negative CHECK (accuracy_points >= 0),
    CONSTRAINT check_speed_points_non_negative CHECK (speed_points >= 0),
    CONSTRAINT check_timestamp_positive CHECK (timestamp > 0)
);

-- Create indexes for better performance
CREATE INDEX idx_user_state_user_id ON user_state(user_id);
CREATE INDEX idx_user_state_timestamp ON user_state(timestamp);
CREATE INDEX idx_user_state_points ON user_state(accuracy_points, speed_points);

-- Add comments for documentation
COMMENT ON TABLE user_state IS 'Stores user progress state including points and owned items';
COMMENT ON COLUMN user_state.user_id IS 'Foreign key reference to users table';
COMMENT ON COLUMN user_state.accuracy_points IS 'Points earned for correct answers';
COMMENT ON COLUMN user_state.speed_points IS 'Points earned for fast answers';
COMMENT ON COLUMN user_state.owned_items IS 'JSON array of owned store item IDs';
COMMENT ON COLUMN user_state.timestamp IS 'Unix timestamp in milliseconds when state was last updated';
COMMENT ON COLUMN user_state.created_at IS 'Timestamp when record was first created';
COMMENT ON COLUMN user_state.updated_at IS 'Timestamp when record was last updated';

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_state_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_state_updated_at
    BEFORE UPDATE ON user_state
    FOR EACH ROW
    EXECUTE FUNCTION update_user_state_updated_at(); 