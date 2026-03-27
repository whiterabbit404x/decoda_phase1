ALTER TABLE monitoring_worker_state
    ADD COLUMN IF NOT EXISTS last_cycle_due_targets INTEGER NOT NULL DEFAULT 0;
