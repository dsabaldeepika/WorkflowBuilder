-- Create messaging tables

-- Table for messaging platform integrations
CREATE TABLE IF NOT EXISTS messaging_integrations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'whatsapp', 'instagram', etc.
    auth_type TEXT NOT NULL, -- 'oauth2', 'api_key'
    credentials JSONB NOT NULL, -- Encrypted credentials
    webhook_secret TEXT,
    webhook_url TEXT,
    rate_limit_per_minute INTEGER DEFAULT 60,
    quota_used INTEGER DEFAULT 0,
    quota_reset_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for message tracking
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER REFERENCES messaging_integrations(id) ON DELETE CASCADE,
    external_message_id TEXT,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'text', 'image', 'video', etc.
    sender_id TEXT NOT NULL,
    recipient_id TEXT NOT NULL,
    direction TEXT NOT NULL, -- 'inbound', 'outbound'
    status TEXT NOT NULL, -- 'pending', 'sent', 'delivered', 'read', 'failed'
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for message templates
CREATE TABLE IF NOT EXISTS message_templates (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER REFERENCES messaging_integrations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    variables JSONB, -- Array of variable names used in template
    is_approved BOOLEAN DEFAULT false,
    approval_status TEXT, -- 'pending', 'approved', 'rejected'
    language TEXT DEFAULT 'en',
    category TEXT, -- 'marketing', 'transactional', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for webhook events
CREATE TABLE IF NOT EXISTS webhook_events (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER REFERENCES messaging_integrations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processing_errors TEXT[],
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_integration_id ON messages(integration_id);
CREATE INDEX IF NOT EXISTS idx_messages_external_id ON messages(external_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_integration ON webhook_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_message_templates_integration ON message_templates(integration_id);
