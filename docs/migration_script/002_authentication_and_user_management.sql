-- Migration: 002_authentication_and_user_management.sql
-- Description: Add user authentication, authorization, and multi-tenancy support
-- Created: October 30, 2025
-- Version: 1.0
-- Dependencies: 001_batch_experiments_complete.sql

-- =================================
-- USER MANAGEMENT TABLES
-- =================================

-- Users Table (Core authentication)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        email NVARCHAR(255) UNIQUE NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        first_name NVARCHAR(100),
        last_name NVARCHAR(100),
        role NVARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
        subscription_tier NVARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
        organization_id UNIQUEIDENTIFIER,
        is_active BIT DEFAULT 1,
        email_verified BIT DEFAULT 0,
        last_login DATETIME2,
        login_count INT DEFAULT 0,
        failed_login_attempts INT DEFAULT 0,
        locked_until DATETIME2,
        password_reset_token NVARCHAR(255),
        password_reset_expires DATETIME2,
        email_verification_token NVARCHAR(255),
        preferences NVARCHAR(MAX), -- JSON preferences
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Created table: users';
END
GO

-- Organizations Table (Multi-tenancy support)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='organizations' AND xtype='U')
BEGIN
    CREATE TABLE organizations (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(255) NOT NULL,
        slug NVARCHAR(100) UNIQUE NOT NULL,
        description NVARCHAR(MAX),
        subscription_plan NVARCHAR(50) DEFAULT 'free',
        billing_email NVARCHAR(255),
        max_users INT DEFAULT 5,
        max_experiments INT DEFAULT 100,
        is_active BIT DEFAULT 1,
        settings NVARCHAR(MAX), -- JSON settings
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Created table: organizations';
END
GO

-- User Sessions Table (Session management)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user_sessions' AND xtype='U')
BEGIN
    CREATE TABLE user_sessions (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER NOT NULL,
        session_token NVARCHAR(255) UNIQUE NOT NULL,
        refresh_token NVARCHAR(255) UNIQUE,
        ip_address NVARCHAR(45),
        user_agent NVARCHAR(MAX),
        is_active BIT DEFAULT 1,
        expires_at DATETIME2 NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        last_activity DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    PRINT 'Created table: user_sessions';
END
GO

-- API Keys Table (LLM provider API key management)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='api_keys' AND xtype='U')
BEGIN
    CREATE TABLE api_keys (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER NOT NULL,
        organization_id UNIQUEIDENTIFIER,
        provider NVARCHAR(50) NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'azure', 'cohere')),
        key_name NVARCHAR(100) NOT NULL,
        encrypted_key NVARCHAR(MAX) NOT NULL, -- Encrypted API key
        key_hash NVARCHAR(255) NOT NULL, -- Hash for verification
        is_active BIT DEFAULT 1,
        last_used DATETIME2,
        usage_count INT DEFAULT 0,
        monthly_usage_limit REAL,
        monthly_usage_current REAL DEFAULT 0,
        expires_at DATETIME2,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL,
        UNIQUE(user_id, provider, key_name)
    );
    PRINT 'Created table: api_keys';
END
GO

-- =================================
-- MODEL MANAGEMENT TABLES
-- =================================

-- LLM Models Table (Available models and their configurations)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='llm_models' AND xtype='U')
BEGIN
    CREATE TABLE llm_models (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        provider NVARCHAR(50) NOT NULL,
        model_name NVARCHAR(100) NOT NULL,
        display_name NVARCHAR(255) NOT NULL,
        model_type NVARCHAR(50) DEFAULT 'text-generation' CHECK (model_type IN ('text-generation', 'chat', 'completion', 'embedding')),
        max_tokens INT,
        context_window INT,
        cost_per_1k_input_tokens REAL,
        cost_per_1k_output_tokens REAL,
        capabilities NVARCHAR(MAX), -- JSON array of capabilities
        parameters_schema NVARCHAR(MAX), -- JSON schema for valid parameters
        is_active BIT DEFAULT 1,
        is_beta BIT DEFAULT 0,
        deprecation_date DATETIME2,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        UNIQUE(provider, model_name)
    );
    PRINT 'Created table: llm_models';
END
GO

-- Model Usage Statistics
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='model_usage_stats' AND xtype='U')
BEGIN
    CREATE TABLE model_usage_stats (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        model_id UNIQUEIDENTIFIER NOT NULL,
        user_id UNIQUEIDENTIFIER NOT NULL,
        organization_id UNIQUEIDENTIFIER,
        date_used DATE NOT NULL,
        request_count INT DEFAULT 0,
        input_tokens INT DEFAULT 0,
        output_tokens INT DEFAULT 0,
        total_cost REAL DEFAULT 0,
        average_response_time REAL,
        success_rate REAL,
        error_count INT DEFAULT 0,
        
        FOREIGN KEY (model_id) REFERENCES llm_models (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL,
        UNIQUE(model_id, user_id, date_used)
    );
    PRINT 'Created table: model_usage_stats';
END
GO

-- =================================
-- AUDIT AND LOGGING TABLES
-- =================================

-- Audit Log Table (Security and compliance)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='audit_logs' AND xtype='U')
BEGIN
    CREATE TABLE audit_logs (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER,
        organization_id UNIQUEIDENTIFIER,
        action NVARCHAR(100) NOT NULL,
        resource_type NVARCHAR(50) NOT NULL,
        resource_id NVARCHAR(255),
        details NVARCHAR(MAX), -- JSON details
        ip_address NVARCHAR(45),
        user_agent NVARCHAR(MAX),
        result NVARCHAR(20) DEFAULT 'success' CHECK (result IN ('success', 'failure', 'error')),
        created_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL
    );
    PRINT 'Created table: audit_logs';
END
GO

-- System Events Table (Application events and monitoring)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='system_events' AND xtype='U')
BEGIN
    CREATE TABLE system_events (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        event_type NVARCHAR(50) NOT NULL,
        severity NVARCHAR(20) DEFAULT 'info' CHECK (severity IN ('critical', 'error', 'warning', 'info', 'debug')),
        message NVARCHAR(MAX) NOT NULL,
        details NVARCHAR(MAX), -- JSON details
        source NVARCHAR(100),
        user_id UNIQUEIDENTIFIER,
        organization_id UNIQUEIDENTIFIER,
        created_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL
    );
    PRINT 'Created table: system_events';
END
GO

-- =================================
-- UPDATE EXISTING TABLES
-- =================================

-- Add user_id to experiments table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('experiments') AND name = 'user_id')
BEGIN
    ALTER TABLE experiments ADD user_id UNIQUEIDENTIFIER;
    PRINT 'Added user_id column to experiments table';
END
GO

-- Add organization_id to experiments table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('experiments') AND name = 'organization_id')
BEGIN
    ALTER TABLE experiments ADD organization_id UNIQUEIDENTIFIER;
    PRINT 'Added organization_id column to experiments table';
END
GO

-- Add status column to experiments if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('experiments') AND name = 'status')
BEGIN
    ALTER TABLE experiments ADD status NVARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'failed', 'cancelled'));
    PRINT 'Added status column to experiments table';
END
GO

-- Add cost tracking columns to experiments
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('experiments') AND name = 'total_cost')
BEGIN
    ALTER TABLE experiments ADD total_cost REAL DEFAULT 0;
    PRINT 'Added total_cost column to experiments table';
END
GO

-- Add response_count to experiments
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('experiments') AND name = 'response_count')
BEGIN
    ALTER TABLE experiments ADD response_count INT DEFAULT 0;
    PRINT 'Added response_count column to experiments table';
END
GO

-- Add quality_score to experiments
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('experiments') AND name = 'quality_score')
BEGIN
    ALTER TABLE experiments ADD quality_score REAL;
    PRINT 'Added quality_score column to experiments table';
END
GO

-- Add user_id to batch_experiments table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('batch_experiments') AND name = 'user_id')
BEGIN
    ALTER TABLE batch_experiments ADD user_id UNIQUEIDENTIFIER;
    PRINT 'Added user_id column to batch_experiments table';
END
GO

-- Add organization_id to batch_experiments table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('batch_experiments') AND name = 'organization_id')
BEGIN
    ALTER TABLE batch_experiments ADD organization_id UNIQUEIDENTIFIER;
    PRINT 'Added organization_id column to batch_experiments table';
END
GO

-- =================================
-- ADD FOREIGN KEY CONSTRAINTS
-- =================================

-- Add foreign key constraints for user_id in experiments
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_experiments_users')
BEGIN
    ALTER TABLE experiments 
    ADD CONSTRAINT FK_experiments_users 
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL;
    PRINT 'Added foreign key: FK_experiments_users';
END
GO

-- Add foreign key constraints for organization_id in experiments
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_experiments_organizations')
BEGIN
    ALTER TABLE experiments 
    ADD CONSTRAINT FK_experiments_organizations 
    FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL;
    PRINT 'Added foreign key: FK_experiments_organizations';
END
GO

-- Add foreign key constraints for organization_id in users
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_users_organizations')
BEGIN
    ALTER TABLE users 
    ADD CONSTRAINT FK_users_organizations 
    FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL;
    PRINT 'Added foreign key: FK_users_organizations';
END
GO

-- Add foreign key constraints for user_id in batch_experiments
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_batch_experiments_users')
BEGIN
    ALTER TABLE batch_experiments 
    ADD CONSTRAINT FK_batch_experiments_users 
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL;
    PRINT 'Added foreign key: FK_batch_experiments_users';
END
GO

-- Add foreign key constraints for organization_id in batch_experiments
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_batch_experiments_organizations')
BEGIN
    ALTER TABLE batch_experiments 
    ADD CONSTRAINT FK_batch_experiments_organizations 
    FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL;
    PRINT 'Added foreign key: FK_batch_experiments_organizations';
END
GO

-- =================================
-- INDEXES FOR PERFORMANCE
-- =================================

-- User management indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_email')
BEGIN
    CREATE UNIQUE INDEX idx_users_email ON users(email);
    PRINT 'Created index: idx_users_email';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_organization_id')
BEGIN
    CREATE INDEX idx_users_organization_id ON users(organization_id);
    PRINT 'Created index: idx_users_organization_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_role')
BEGIN
    CREATE INDEX idx_users_role ON users(role);
    PRINT 'Created index: idx_users_role';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_is_active')
BEGIN
    CREATE INDEX idx_users_is_active ON users(is_active);
    PRINT 'Created index: idx_users_is_active';
END
GO

-- Organization indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_organizations_slug')
BEGIN
    CREATE UNIQUE INDEX idx_organizations_slug ON organizations(slug);
    PRINT 'Created index: idx_organizations_slug';
END
GO

-- Session indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_sessions_user_id')
BEGIN
    CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
    PRINT 'Created index: idx_sessions_user_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_sessions_token')
BEGIN
    CREATE UNIQUE INDEX idx_sessions_token ON user_sessions(session_token);
    PRINT 'Created index: idx_sessions_token';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_sessions_expires_at')
BEGIN
    CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);
    PRINT 'Created index: idx_sessions_expires_at';
END
GO

-- API Keys indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_api_keys_user_id')
BEGIN
    CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
    PRINT 'Created index: idx_api_keys_user_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_api_keys_provider')
BEGIN
    CREATE INDEX idx_api_keys_provider ON api_keys(provider);
    PRINT 'Created index: idx_api_keys_provider';
END
GO

-- Model indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_models_provider_name')
BEGIN
    CREATE UNIQUE INDEX idx_models_provider_name ON llm_models(provider, model_name);
    PRINT 'Created index: idx_models_provider_name';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_models_is_active')
BEGIN
    CREATE INDEX idx_models_is_active ON llm_models(is_active);
    PRINT 'Created index: idx_models_is_active';
END
GO

-- Audit log indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_audit_logs_user_id')
BEGIN
    CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
    PRINT 'Created index: idx_audit_logs_user_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_audit_logs_created_at')
BEGIN
    CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
    PRINT 'Created index: idx_audit_logs_created_at';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_audit_logs_action')
BEGIN
    CREATE INDEX idx_audit_logs_action ON audit_logs(action);
    PRINT 'Created index: idx_audit_logs_action';
END
GO

-- Update existing experiment indexes to include user_id
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_experiments_user_id')
BEGIN
    CREATE INDEX idx_experiments_user_id ON experiments(user_id);
    PRINT 'Created index: idx_experiments_user_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_experiments_organization_id')
BEGIN
    CREATE INDEX idx_experiments_organization_id ON experiments(organization_id);
    PRINT 'Created index: idx_experiments_organization_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_experiments_status')
BEGIN
    CREATE INDEX idx_experiments_status ON experiments(status);
    PRINT 'Created index: idx_experiments_status';
END
GO

-- =================================
-- SAMPLE DATA FOR TESTING
-- =================================

-- Insert default organization
IF NOT EXISTS (SELECT * FROM organizations WHERE name = 'Default Organization')
BEGIN
    INSERT INTO organizations (name, slug, description) 
    VALUES ('Default Organization', 'default', 'Default organization for single-user mode');
    PRINT 'Inserted default organization';
END
GO

-- Insert sample LLM models
IF NOT EXISTS (SELECT * FROM llm_models WHERE provider = 'openai' AND model_name = 'gpt-4')
BEGIN
    INSERT INTO llm_models (
        provider, model_name, display_name, model_type,
        max_tokens, context_window,
        cost_per_1k_input_tokens, cost_per_1k_output_tokens,
        capabilities
    ) VALUES 
    ('openai', 'gpt-4', 'GPT-4', 'chat', 4096, 8192, 0.03, 0.06, '["text-generation", "conversation", "analysis"]'),
    ('openai', 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 'chat', 4096, 4096, 0.0015, 0.002, '["text-generation", "conversation"]'),
    ('anthropic', 'claude-3-sonnet', 'Claude 3 Sonnet', 'chat', 4096, 200000, 0.003, 0.015, '["text-generation", "analysis", "reasoning"]'),
    ('anthropic', 'claude-3-haiku', 'Claude 3 Haiku', 'chat', 4096, 200000, 0.00025, 0.00125, '["text-generation", "conversation"]');
    PRINT 'Inserted sample LLM models';
END
GO

-- Insert sample admin user
IF NOT EXISTS (SELECT * FROM users WHERE email = 'admin@llm-lab.com')
BEGIN
    DECLARE @org_id UNIQUEIDENTIFIER = (SELECT id FROM organizations WHERE slug = 'default');
    
    INSERT INTO users (
        email, password_hash, first_name, last_name, role, 
        organization_id, is_active, email_verified
    ) VALUES (
        'admin@llm-lab.com', 
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewfBweXBdgQNgRMm', -- 'admin123'
        'Admin', 'User', 'admin', 
        @org_id, 1, 1
    );
    PRINT 'Inserted sample admin user';
END
GO

-- =================================
-- TRIGGERS FOR AUTOMATION
-- =================================

-- Trigger to update updated_at timestamp on users
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_users_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER trg_users_updated_at
    ON users
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE users 
        SET updated_at = GETDATE()
        FROM users u
        INNER JOIN inserted i ON u.id = i.id;
    END
    ');
    PRINT 'Created trigger: trg_users_updated_at';
END
GO

-- Trigger to update updated_at timestamp on organizations
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_organizations_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER trg_organizations_updated_at
    ON organizations
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE organizations 
        SET updated_at = GETDATE()
        FROM organizations o
        INNER JOIN inserted i ON o.id = i.id;
    END
    ');
    PRINT 'Created trigger: trg_organizations_updated_at';
END
GO

-- Trigger to update last_activity on sessions
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_sessions_activity')
BEGIN
    EXEC('
    CREATE TRIGGER trg_sessions_activity
    ON user_sessions
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE user_sessions 
        SET last_activity = GETDATE()
        FROM user_sessions s
        INNER JOIN inserted i ON s.id = i.id;
    END
    ');
    PRINT 'Created trigger: trg_sessions_activity';
END
GO

-- =================================
-- VIEWS FOR ANALYTICS
-- =================================

-- User analytics view
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'user_analytics')
BEGIN
    EXEC('
    CREATE VIEW user_analytics AS
    SELECT 
        u.id,
        u.email,
        u.role,
        u.subscription_tier,
        u.organization_id,
        o.name as organization_name,
        u.is_active,
        u.created_at,
        u.last_login,
        u.login_count,
        COUNT(e.id) as experiment_count,
        COUNT(be.id) as batch_experiment_count,
        COALESCE(SUM(e.total_cost), 0) as total_cost
    FROM users u
    LEFT JOIN organizations o ON u.organization_id = o.id
    LEFT JOIN experiments e ON u.id = e.user_id
    LEFT JOIN batch_experiments be ON u.id = be.user_id
    GROUP BY u.id, u.email, u.role, u.subscription_tier, u.organization_id, 
             o.name, u.is_active, u.created_at, u.last_login, u.login_count
    ');
    PRINT 'Created view: user_analytics';
END
GO

-- ===================
-- MIGRATION COMPLETION
-- ===================

-- Insert migration record
IF NOT EXISTS (SELECT * FROM schema_migrations WHERE version = '002_authentication_and_user_management')
BEGIN
    INSERT INTO schema_migrations (version) VALUES ('002_authentication_and_user_management');
    PRINT 'Recorded migration: 002_authentication_and_user_management';
END
GO

-- Verify all new tables were created
SELECT 
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN (
    'users', 
    'organizations', 
    'user_sessions',
    'api_keys',
    'llm_models',
    'model_usage_stats',
    'audit_logs',
    'system_events'
)
ORDER BY TABLE_NAME;

SELECT 'Migration 002_authentication_and_user_management - COMPLETED successfully' as status;
PRINT 'Authentication and user management schema migration completed successfully!';
GO
