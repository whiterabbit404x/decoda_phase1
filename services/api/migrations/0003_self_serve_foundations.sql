ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS email_verification_token_hash TEXT NULL,
    ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS password_reset_token_hash TEXT NULL,
    ADD COLUMN IF NOT EXISTS password_reset_sent_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_users_email_verification_token_hash ON users (email_verification_token_hash);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token_hash ON users (password_reset_token_hash);

ALTER TABLE workspace_members DROP CONSTRAINT IF EXISTS workspace_members_role_check;
ALTER TABLE workspace_members ADD CONSTRAINT workspace_members_role_check CHECK (role IN ('workspace_owner', 'workspace_admin', 'workspace_member', 'workspace_viewer'));

CREATE TABLE IF NOT EXISTS workspace_invites (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    invited_role TEXT NOT NULL CHECK (invited_role IN ('workspace_owner', 'workspace_admin', 'workspace_member', 'workspace_viewer')),
    invite_token_hash TEXT NOT NULL UNIQUE,
    invited_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accepted_by_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_workspace_invites_workspace_id ON workspace_invites (workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_invited_email ON workspace_invites (invited_email);

CREATE TABLE IF NOT EXISTS workspace_billing (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    plan_code TEXT NOT NULL DEFAULT 'trial',
    subscription_status TEXT NOT NULL DEFAULT 'not_started',
    trial_ends_at TIMESTAMPTZ NULL,
    stripe_customer_id TEXT NULL,
    stripe_subscription_id TEXT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
