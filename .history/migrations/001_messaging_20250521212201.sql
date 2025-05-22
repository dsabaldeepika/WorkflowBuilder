-- Messaging and Integration Tables
CREATE TABLE IF NOT EXISTS integrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    api_key TEXT NOT NULL,
    phone_number_id TEXT,  -- For WhatsApp integrations
    business_account_id TEXT, -- For Instagram/Facebook integrations
    webhook_url TEXT,
    webhook_secret TEXT,
    config JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'inactive',
    last_verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_platform CHECK (platform IN ('whatsapp', 'instagram', 'facebook', 'telegram'))
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER NOT NULL REFERENCES integrations(id),
    workflow_id INTEGER REFERENCES workflows(id) ON DELETE SET NULL,
    message_type TEXT NOT NULL,
    content TEXT NOT NULL,
    sender_id VARCHAR(100) NOT NULL,
    receiver_id VARCHAR(100) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_message_type CHECK (message_type IN ('incoming', 'outgoing')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed'))
);

CREATE TABLE IF NOT EXISTS message_logs (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_action CHECK (action IN ('received', 'queued', 'sent', 'delivered', 'read', 'failed', 'retry'))
);

CREATE TABLE IF NOT EXISTS webhook_events (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER NOT NULL REFERENCES integrations(id),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messaging_quotas (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER NOT NULL REFERENCES integrations(id),
    messages_sent_24h INTEGER NOT NULL DEFAULT 0,
    messages_limit_24h INTEGER NOT NULL,
    reset_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS message_templates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    is_approved BOOLEAN NOT NULL DEFAULT false,
    external_template_id TEXT,
    category TEXT,
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_platform CHECK (platform IN ('whatsapp', 'instagram', 'facebook', 'telegram'))
);

CREATE TABLE IF NOT EXISTS message_template_versions (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES message_templates(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    version INTEGER NOT NULL,
    changelog TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_messages_integration_id ON messages(integration_id);
CREATE INDEX idx_messages_workflow_id ON messages(workflow_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_message_logs_message_id ON message_logs(message_id);
CREATE INDEX idx_message_logs_timestamp ON message_logs(timestamp);
CREATE INDEX idx_webhook_events_integration_id ON webhook_events(integration_id);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at);
CREATE INDEX idx_message_templates_user_id ON message_templates(user_id);
CREATE INDEX idx_message_templates_platform ON message_templates(platform);
CREATE INDEX idx_template_versions_template_id ON message_template_versions(template_id);
