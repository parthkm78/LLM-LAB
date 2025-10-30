-- Migration: 003_advanced_features_and_analytics.sql
-- Description: Add advanced analytics, export functionality, and enhanced quality metrics
-- Created: October 30, 2025
-- Version: 1.0
-- Dependencies: 001_batch_experiments_complete.sql, 002_authentication_and_user_management.sql

-- =================================
-- EXPORT AND REPORTING TABLES
-- =================================

-- Export Jobs Table (Track export operations)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='export_jobs' AND xtype='U')
BEGIN
    CREATE TABLE export_jobs (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER NOT NULL,
        organization_id UNIQUEIDENTIFIER,
        job_type NVARCHAR(50) NOT NULL CHECK (job_type IN ('experiment', 'batch_experiment', 'comparison', 'analytics', 'report')),
        export_format NVARCHAR(20) NOT NULL CHECK (export_format IN ('json', 'csv', 'xlsx', 'pdf')),
        status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
        file_name NVARCHAR(255),
        file_path NVARCHAR(500),
        file_size BIGINT,
        download_url NVARCHAR(500),
        expires_at DATETIME2,
        parameters NVARCHAR(MAX), -- JSON parameters for export
        progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        error_message NVARCHAR(MAX),
        download_count INT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        completed_at DATETIME2,
        
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL
    );
    PRINT 'Created table: export_jobs';
END
GO

-- Report Templates Table (Predefined report configurations)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='report_templates' AND xtype='U')
BEGIN
    CREATE TABLE report_templates (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        template_type NVARCHAR(50) NOT NULL CHECK (template_type IN ('quality_analysis', 'parameter_optimization', 'cost_analysis', 'performance_report', 'comparison_report')),
        configuration NVARCHAR(MAX) NOT NULL, -- JSON configuration
        is_public BIT DEFAULT 0,
        created_by UNIQUEIDENTIFIER,
        organization_id UNIQUEIDENTIFIER,
        usage_count INT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL
    );
    PRINT 'Created table: report_templates';
END
GO

-- =================================
-- ADVANCED ANALYTICS TABLES
-- =================================

-- Experiment Insights Table (AI-generated insights)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='experiment_insights' AND xtype='U')
BEGIN
    CREATE TABLE experiment_insights (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        experiment_id INT,
        batch_experiment_id INT,
        user_id UNIQUEIDENTIFIER NOT NULL,
        insight_type NVARCHAR(50) NOT NULL CHECK (insight_type IN ('parameter_optimization', 'quality_improvement', 'cost_optimization', 'performance_analysis', 'anomaly_detection')),
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NOT NULL,
        confidence_score REAL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
        impact_score REAL CHECK (impact_score >= 0.0 AND impact_score <= 10.0),
        recommendation NVARCHAR(MAX),
        supporting_data NVARCHAR(MAX), -- JSON data supporting the insight
        is_actionable BIT DEFAULT 1,
        is_dismissed BIT DEFAULT 0,
        user_feedback NVARCHAR(MAX),
        generated_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (experiment_id) REFERENCES experiments (id) ON DELETE CASCADE,
        FOREIGN KEY (batch_experiment_id) REFERENCES batch_experiments (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        
        -- Ensure exactly one experiment reference
        CHECK ((experiment_id IS NOT NULL AND batch_experiment_id IS NULL) OR 
               (experiment_id IS NULL AND batch_experiment_id IS NOT NULL))
    );
    PRINT 'Created table: experiment_insights';
END
GO

-- Quality Trends Table (Historical quality metrics)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='quality_trends' AND xtype='U')
BEGIN
    CREATE TABLE quality_trends (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER NOT NULL,
        organization_id UNIQUEIDENTIFIER,
        date_recorded DATE NOT NULL,
        model_provider NVARCHAR(50),
        model_name NVARCHAR(100),
        experiment_type NVARCHAR(20) CHECK (experiment_type IN ('single', 'batch')),
        avg_coherence REAL,
        avg_completeness REAL,
        avg_readability REAL,
        avg_creativity REAL,
        avg_specificity REAL,
        avg_overall_quality REAL,
        experiment_count INT DEFAULT 0,
        response_count INT DEFAULT 0,
        total_cost REAL DEFAULT 0,
        avg_response_time REAL,
        created_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL,
        UNIQUE(user_id, date_recorded, model_provider, model_name, experiment_type)
    );
    PRINT 'Created table: quality_trends';
END
GO

-- Parameter Correlations Table (Statistical analysis of parameter impacts)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='parameter_correlations' AND xtype='U')
BEGIN
    CREATE TABLE parameter_correlations (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER NOT NULL,
        organization_id UNIQUEIDENTIFIER,
        model_provider NVARCHAR(50) NOT NULL,
        model_name NVARCHAR(100) NOT NULL,
        parameter_name NVARCHAR(50) NOT NULL,
        quality_metric NVARCHAR(50) NOT NULL,
        correlation_coefficient REAL CHECK (correlation_coefficient >= -1.0 AND correlation_coefficient <= 1.0),
        p_value REAL CHECK (p_value >= 0.0 AND p_value <= 1.0),
        sample_size INT CHECK (sample_size > 0),
        confidence_interval_lower REAL,
        confidence_interval_upper REAL,
        optimal_value REAL,
        optimal_range_min REAL,
        optimal_range_max REAL,
        analysis_date DATE NOT NULL,
        is_statistically_significant BIT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL,
        UNIQUE(user_id, model_provider, model_name, parameter_name, quality_metric, analysis_date)
    );
    PRINT 'Created table: parameter_correlations';
END
GO

-- =================================
-- COMPARISON AND FAVORITES TABLES
-- =================================

-- Response Comparisons Table (Track comparison sessions)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='response_comparisons' AND xtype='U')
BEGIN
    CREATE TABLE response_comparisons (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER NOT NULL,
        name NVARCHAR(255),
        description NVARCHAR(MAX),
        response_ids NVARCHAR(MAX) NOT NULL, -- JSON array of response IDs
        comparison_results NVARCHAR(MAX), -- JSON results of comparison analysis
        saved BIT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    PRINT 'Created table: response_comparisons';
END
GO

-- User Favorites Table (Bookmarked experiments and responses)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user_favorites' AND xtype='U')
BEGIN
    CREATE TABLE user_favorites (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER NOT NULL,
        item_type NVARCHAR(20) NOT NULL CHECK (item_type IN ('experiment', 'batch_experiment', 'response', 'comparison')),
        item_id NVARCHAR(50) NOT NULL, -- Can reference different table IDs
        notes NVARCHAR(MAX),
        tags NVARCHAR(MAX), -- JSON array of custom tags
        created_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, item_type, item_id)
    );
    PRINT 'Created table: user_favorites';
END
GO

-- =================================
-- NOTIFICATION AND ALERTS TABLES
-- =================================

-- Notifications Table (User notifications)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='notifications' AND xtype='U')
BEGIN
    CREATE TABLE notifications (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER NOT NULL,
        organization_id UNIQUEIDENTIFIER,
        type NVARCHAR(50) NOT NULL CHECK (type IN ('experiment_completed', 'batch_completed', 'insight_generated', 'export_ready', 'system_alert', 'cost_alert')),
        title NVARCHAR(255) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        data NVARCHAR(MAX), -- JSON data for notification
        is_read BIT DEFAULT 0,
        priority NVARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        expires_at DATETIME2,
        created_at DATETIME2 DEFAULT GETDATE(),
        read_at DATETIME2,
        
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL
    );
    PRINT 'Created table: notifications';
END
GO

-- Alert Rules Table (Configurable alert conditions)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='alert_rules' AND xtype='U')
BEGIN
    CREATE TABLE alert_rules (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER NOT NULL,
        organization_id UNIQUEIDENTIFIER,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        rule_type NVARCHAR(50) NOT NULL CHECK (rule_type IN ('cost_threshold', 'quality_drop', 'experiment_failure', 'usage_limit', 'performance_degradation')),
        conditions NVARCHAR(MAX) NOT NULL, -- JSON conditions
        is_active BIT DEFAULT 1,
        notification_methods NVARCHAR(MAX), -- JSON array: ['email', 'in_app', 'webhook']
        last_triggered DATETIME2,
        trigger_count INT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL
    );
    PRINT 'Created table: alert_rules';
END
GO

-- =================================
-- SYSTEM CONFIGURATION TABLES
-- =================================

-- System Settings Table (Global configuration)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='system_settings' AND xtype='U')
BEGIN
    CREATE TABLE system_settings (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        setting_key NVARCHAR(100) UNIQUE NOT NULL,
        setting_value NVARCHAR(MAX),
        setting_type NVARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
        description NVARCHAR(MAX),
        is_public BIT DEFAULT 0,
        category NVARCHAR(50),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Created table: system_settings';
END
GO

-- Feature Flags Table (Feature toggles)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='feature_flags' AND xtype='U')
BEGIN
    CREATE TABLE feature_flags (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        flag_name NVARCHAR(100) UNIQUE NOT NULL,
        description NVARCHAR(MAX),
        is_enabled BIT DEFAULT 0,
        rollout_percentage INT DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
        target_users NVARCHAR(MAX), -- JSON array of user IDs
        target_organizations NVARCHAR(MAX), -- JSON array of org IDs
        conditions NVARCHAR(MAX), -- JSON conditions for activation
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Created table: feature_flags';
END
GO

-- =================================
-- UPDATE EXISTING TABLES
-- =================================

-- Add provider column to responses table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('responses') AND name = 'provider')
BEGIN
    ALTER TABLE responses ADD provider NVARCHAR(50) DEFAULT 'openai';
    PRINT 'Added provider column to responses table';
END
GO

-- Add request_id to responses table for tracking
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('responses') AND name = 'request_id')
BEGIN
    ALTER TABLE responses ADD request_id NVARCHAR(100);
    PRINT 'Added request_id column to responses table';
END
GO

-- Add model_version to quality_metrics
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('quality_metrics') AND name = 'model_version')
BEGIN
    ALTER TABLE quality_metrics ADD model_version NVARCHAR(20) DEFAULT '1.0';
    PRINT 'Added model_version column to quality_metrics table';
END
GO

-- Add length_appropriateness to quality_metrics to match API spec
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('quality_metrics') AND name = 'length_appropriateness')
BEGIN
    ALTER TABLE quality_metrics ADD length_appropriateness REAL CHECK (length_appropriateness >= 0.0 AND length_appropriateness <= 100.0);
    PRINT 'Added length_appropriateness column to quality_metrics table';
END
GO

-- =================================
-- INDEXES FOR PERFORMANCE
-- =================================

-- Export jobs indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_export_jobs_user_id')
BEGIN
    CREATE INDEX idx_export_jobs_user_id ON export_jobs(user_id);
    PRINT 'Created index: idx_export_jobs_user_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_export_jobs_status')
BEGIN
    CREATE INDEX idx_export_jobs_status ON export_jobs(status);
    PRINT 'Created index: idx_export_jobs_status';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_export_jobs_expires_at')
BEGIN
    CREATE INDEX idx_export_jobs_expires_at ON export_jobs(expires_at);
    PRINT 'Created index: idx_export_jobs_expires_at';
END
GO

-- Insights indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_insights_experiment_id')
BEGIN
    CREATE INDEX idx_insights_experiment_id ON experiment_insights(experiment_id);
    PRINT 'Created index: idx_insights_experiment_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_insights_batch_id')
BEGIN
    CREATE INDEX idx_insights_batch_id ON experiment_insights(batch_experiment_id);
    PRINT 'Created index: idx_insights_batch_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_insights_user_id')
BEGIN
    CREATE INDEX idx_insights_user_id ON experiment_insights(user_id);
    PRINT 'Created index: idx_insights_user_id';
END
GO

-- Quality trends indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_quality_trends_user_date')
BEGIN
    CREATE INDEX idx_quality_trends_user_date ON quality_trends(user_id, date_recorded DESC);
    PRINT 'Created index: idx_quality_trends_user_date';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_quality_trends_model')
BEGIN
    CREATE INDEX idx_quality_trends_model ON quality_trends(model_provider, model_name);
    PRINT 'Created index: idx_quality_trends_model';
END
GO

-- Correlations indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_correlations_user_model')
BEGIN
    CREATE INDEX idx_correlations_user_model ON parameter_correlations(user_id, model_provider, model_name);
    PRINT 'Created index: idx_correlations_user_model';
END
GO

-- Notifications indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_notifications_user_id')
BEGIN
    CREATE INDEX idx_notifications_user_id ON notifications(user_id);
    PRINT 'Created index: idx_notifications_user_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_notifications_is_read')
BEGIN
    CREATE INDEX idx_notifications_is_read ON notifications(is_read);
    PRINT 'Created index: idx_notifications_is_read';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_notifications_created_at')
BEGIN
    CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
    PRINT 'Created index: idx_notifications_created_at';
END
GO

-- Favorites indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_favorites_user_type')
BEGIN
    CREATE INDEX idx_favorites_user_type ON user_favorites(user_id, item_type);
    PRINT 'Created index: idx_favorites_user_type';
END
GO

-- =================================
-- STORED PROCEDURES
-- =================================

-- Procedure to calculate daily quality trends
IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_calculate_daily_trends')
BEGIN
    EXEC('
    CREATE PROCEDURE sp_calculate_daily_trends
        @user_id UNIQUEIDENTIFIER,
        @date DATE
    AS
    BEGIN
        SET NOCOUNT ON;
        
        -- Delete existing trends for the date
        DELETE FROM quality_trends 
        WHERE user_id = @user_id AND date_recorded = @date;
        
        -- Calculate and insert new trends
        INSERT INTO quality_trends (
            user_id, organization_id, date_recorded, model_provider, model_name,
            experiment_type, avg_coherence, avg_completeness, avg_readability,
            avg_creativity, avg_specificity, avg_overall_quality,
            experiment_count, response_count, total_cost, avg_response_time
        )
        SELECT 
            e.user_id,
            e.organization_id,
            CAST(r.created_at AS DATE) as date_recorded,
            ''openai'' as model_provider, -- This should be dynamic based on actual provider
            e.model as model_name,
            e.experiment_type,
            AVG(qm.coherence_score) as avg_coherence,
            AVG(qm.completeness_score) as avg_completeness,
            AVG(qm.readability_score) as avg_readability,
            AVG(qm.creativity_score) as avg_creativity,
            AVG(qm.specificity_score) as avg_specificity,
            AVG(qm.overall_score) as avg_overall_quality,
            COUNT(DISTINCT e.id) as experiment_count,
            COUNT(r.id) as response_count,
            SUM(r.cost) as total_cost,
            AVG(r.response_time) as avg_response_time
        FROM experiments e
        INNER JOIN responses r ON e.id = r.experiment_id
        INNER JOIN quality_metrics qm ON r.id = qm.response_id
        WHERE e.user_id = @user_id 
        AND CAST(r.created_at AS DATE) = @date
        GROUP BY e.user_id, e.organization_id, CAST(r.created_at AS DATE), e.model, e.experiment_type;
    END
    ');
    PRINT 'Created procedure: sp_calculate_daily_trends';
END
GO

-- =================================
-- VIEWS FOR ANALYTICS
-- =================================

-- Comprehensive experiment analytics view
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'experiment_analytics_view')
BEGIN
    EXEC('
    CREATE VIEW experiment_analytics_view AS
    SELECT 
        e.id as experiment_id,
        e.name,
        e.experiment_type,
        e.status,
        e.model,
        e.user_id,
        u.email as user_email,
        e.organization_id,
        o.name as organization_name,
        e.created_at,
        e.total_cost,
        e.response_count,
        e.quality_score,
        COUNT(r.id) as actual_response_count,
        AVG(qm.overall_score) as avg_quality,
        MIN(qm.overall_score) as min_quality,
        MAX(qm.overall_score) as max_quality,
        AVG(r.response_time) as avg_response_time,
        SUM(r.cost) as calculated_total_cost,
        COUNT(ei.id) as insight_count
    FROM experiments e
    LEFT JOIN users u ON e.user_id = u.id
    LEFT JOIN organizations o ON e.organization_id = o.id
    LEFT JOIN responses r ON e.id = r.experiment_id
    LEFT JOIN quality_metrics qm ON r.id = qm.response_id
    LEFT JOIN experiment_insights ei ON e.id = ei.experiment_id
    GROUP BY e.id, e.name, e.experiment_type, e.status, e.model, e.user_id, 
             u.email, e.organization_id, o.name, e.created_at, e.total_cost, 
             e.response_count, e.quality_score
    ');
    PRINT 'Created view: experiment_analytics_view';
END
GO

-- =================================
-- SAMPLE DATA
-- =================================

-- Insert default system settings
IF NOT EXISTS (SELECT * FROM system_settings WHERE setting_key = 'max_export_file_size')
BEGIN
    INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category) VALUES
    ('max_export_file_size', '104857600', 'number', 'Maximum export file size in bytes (100MB)', 'export'),
    ('export_retention_days', '30', 'number', 'Number of days to keep export files', 'export'),
    ('max_concurrent_exports', '5', 'number', 'Maximum concurrent export jobs per user', 'export'),
    ('quality_analysis_enabled', 'true', 'boolean', 'Enable automatic quality analysis', 'analysis'),
    ('insight_generation_enabled', 'true', 'boolean', 'Enable AI insight generation', 'analysis'),
    ('notification_retention_days', '90', 'number', 'Number of days to keep notifications', 'notifications');
    PRINT 'Inserted system settings';
END
GO

-- Insert default feature flags
IF NOT EXISTS (SELECT * FROM feature_flags WHERE flag_name = 'advanced_analytics')
BEGIN
    INSERT INTO feature_flags (flag_name, description, is_enabled, rollout_percentage) VALUES
    ('advanced_analytics', 'Enable advanced analytics features', 1, 100),
    ('ai_insights', 'Enable AI-powered insights generation', 1, 100),
    ('batch_experiments', 'Enable batch experiment functionality', 1, 100),
    ('export_to_pdf', 'Enable PDF export functionality', 1, 100),
    ('real_time_notifications', 'Enable real-time notifications', 1, 100),
    ('parameter_optimization', 'Enable automatic parameter optimization', 0, 0);
    PRINT 'Inserted feature flags';
END
GO

-- Insert default report templates
IF NOT EXISTS (SELECT * FROM report_templates WHERE name = 'Quality Analysis Report')
BEGIN
    INSERT INTO report_templates (name, description, template_type, configuration, is_public) VALUES
    ('Quality Analysis Report', 'Comprehensive quality metrics analysis', 'quality_analysis', 
     '{"include_trends": true, "include_comparisons": true, "include_recommendations": true}', 1),
    ('Parameter Optimization Report', 'Parameter performance and optimization analysis', 'parameter_optimization',
     '{"include_correlations": true, "include_optimal_ranges": true, "include_statistical_significance": true}', 1),
    ('Cost Analysis Report', 'Cost breakdown and optimization recommendations', 'cost_analysis',
     '{"include_trends": true, "include_projections": true, "include_cost_optimization": true}', 1);
    PRINT 'Inserted report templates';
END
GO

-- ===================
-- MIGRATION COMPLETION
-- ===================

-- Insert migration record
IF NOT EXISTS (SELECT * FROM schema_migrations WHERE version = '003_advanced_features_and_analytics')
BEGIN
    INSERT INTO schema_migrations (version) VALUES ('003_advanced_features_and_analytics');
    PRINT 'Recorded migration: 003_advanced_features_and_analytics';
END
GO

-- Verify all new tables were created
SELECT 
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN (
    'export_jobs', 
    'report_templates', 
    'experiment_insights',
    'quality_trends',
    'parameter_correlations',
    'response_comparisons',
    'user_favorites',
    'notifications',
    'alert_rules',
    'system_settings',
    'feature_flags'
)
ORDER BY TABLE_NAME;

SELECT 'Migration 003_advanced_features_and_analytics - COMPLETED successfully' as status;
PRINT 'Advanced features and analytics schema migration completed successfully!';
GO
