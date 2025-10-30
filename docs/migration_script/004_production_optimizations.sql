-- Migration: 004_production_optimizations.sql
-- Description: Production-ready optimizations, performance improvements, and data integrity
-- Created: October 30, 2025
-- Version: 1.0
-- Dependencies: All previous migrations

-- =================================
-- PERFORMANCE OPTIMIZATION TABLES
-- =================================

-- Query Performance Monitoring
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='query_performance_log' AND xtype='U')
BEGIN
    CREATE TABLE query_performance_log (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        query_type NVARCHAR(50) NOT NULL,
        query_hash NVARCHAR(64), -- Hash of the query for grouping
        execution_time_ms INT NOT NULL,
        cpu_time_ms INT,
        logical_reads INT,
        physical_reads INT,
        user_id UNIQUEIDENTIFIER,
        ip_address NVARCHAR(45),
        endpoint NVARCHAR(255),
        parameters NVARCHAR(MAX), -- JSON parameters
        executed_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Created table: query_performance_log';
END
GO

-- Cache Management Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='cache_entries' AND xtype='U')
BEGIN
    CREATE TABLE cache_entries (
        cache_key NVARCHAR(255) PRIMARY KEY,
        cache_value NVARCHAR(MAX) NOT NULL,
        value_type NVARCHAR(50) DEFAULT 'json',
        expires_at DATETIME2 NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        accessed_at DATETIME2 DEFAULT GETDATE(),
        access_count INT DEFAULT 0,
        size_bytes INT
    );
    PRINT 'Created table: cache_entries';
END
GO

-- =================================
-- DATA ARCHIVAL AND CLEANUP
-- =================================

-- Archive Configuration Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='archive_policies' AND xtype='U')
BEGIN
    CREATE TABLE archive_policies (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        table_name NVARCHAR(100) NOT NULL,
        retention_days INT NOT NULL,
        archive_enabled BIT DEFAULT 1,
        delete_after_archive BIT DEFAULT 0,
        last_run DATETIME2,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Created table: archive_policies';
END
GO

-- Archived Data Table (for important historical data)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='archived_data' AND xtype='U')
BEGIN
    CREATE TABLE archived_data (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        source_table NVARCHAR(100) NOT NULL,
        source_id NVARCHAR(50) NOT NULL,
        data_snapshot NVARCHAR(MAX) NOT NULL, -- JSON snapshot of original record
        archived_at DATETIME2 DEFAULT GETDATE(),
        reason NVARCHAR(255),
        
        INDEX idx_archived_source (source_table, source_id)
    );
    PRINT 'Created table: archived_data';
END
GO

-- =================================
-- ENHANCED SECURITY TABLES
-- =================================

-- Security Scan Results
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='security_scans' AND xtype='U')
BEGIN
    CREATE TABLE security_scans (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        scan_type NVARCHAR(50) NOT NULL CHECK (scan_type IN ('vulnerability', 'penetration', 'compliance', 'data_privacy')),
        target_component NVARCHAR(100),
        severity NVARCHAR(20) CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
        finding_title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        recommendation NVARCHAR(MAX),
        status NVARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'false_positive', 'accepted_risk')),
        assigned_to UNIQUEIDENTIFIER,
        due_date DATETIME2,
        resolved_at DATETIME2,
        scan_date DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL
    );
    PRINT 'Created table: security_scans';
END
GO

-- IP Whitelist/Blacklist
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ip_access_control' AND xtype='U')
BEGIN
    CREATE TABLE ip_access_control (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ip_address NVARCHAR(45) NOT NULL,
        ip_range NVARCHAR(50), -- CIDR notation for ranges
        access_type NVARCHAR(10) CHECK (access_type IN ('allow', 'deny')) DEFAULT 'allow',
        reason NVARCHAR(255),
        organization_id UNIQUEIDENTIFIER,
        is_active BIT DEFAULT 1,
        created_by UNIQUEIDENTIFIER,
        created_at DATETIME2 DEFAULT GETDATE(),
        expires_at DATETIME2,
        
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
    );
    PRINT 'Created table: ip_access_control';
END
GO

-- =================================
-- BUSINESS INTELLIGENCE TABLES
-- =================================

-- Business Metrics Dashboard
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='business_metrics' AND xtype='U')
BEGIN
    CREATE TABLE business_metrics (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        metric_date DATE NOT NULL,
        metric_name NVARCHAR(100) NOT NULL,
        metric_value REAL NOT NULL,
        metric_unit NVARCHAR(20),
        category NVARCHAR(50),
        organization_id UNIQUEIDENTIFIER,
        calculated_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL,
        UNIQUE(metric_date, metric_name, organization_id)
    );
    PRINT 'Created table: business_metrics';
END
GO

-- Usage Quotas and Billing
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='usage_quotas' AND xtype='U')
BEGIN
    CREATE TABLE usage_quotas (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER,
        organization_id UNIQUEIDENTIFIER,
        quota_type NVARCHAR(50) NOT NULL CHECK (quota_type IN ('experiments', 'responses', 'api_calls', 'storage', 'exports')),
        quota_limit INT NOT NULL,
        quota_used INT DEFAULT 0,
        reset_period NVARCHAR(20) DEFAULT 'monthly' CHECK (reset_period IN ('daily', 'weekly', 'monthly', 'yearly')),
        last_reset DATETIME2,
        next_reset DATETIME2,
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
    );
    PRINT 'Created table: usage_quotas';
END
GO

-- =================================
-- API RATE LIMITING AND MONITORING
-- =================================

-- API Rate Limiting Buckets
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='rate_limit_buckets' AND xtype='U')
BEGIN
    CREATE TABLE rate_limit_buckets (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        identifier NVARCHAR(255) NOT NULL, -- user_id, ip_address, or api_key
        identifier_type NVARCHAR(20) NOT NULL CHECK (identifier_type IN ('user', 'ip', 'api_key', 'organization')),
        endpoint_pattern NVARCHAR(255),
        request_count INT DEFAULT 0,
        window_start DATETIME2 NOT NULL,
        window_duration_minutes INT NOT NULL,
        limit_per_window INT NOT NULL,
        is_blocked BIT DEFAULT 0,
        last_request DATETIME2 DEFAULT GETDATE(),
        
        UNIQUE(identifier, identifier_type, endpoint_pattern, window_start)
    );
    PRINT 'Created table: rate_limit_buckets';
END
GO

-- API Usage Analytics
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='api_usage_analytics' AND xtype='U')
BEGIN
    CREATE TABLE api_usage_analytics (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        date_hour DATETIME2 NOT NULL, -- Truncated to hour for aggregation
        endpoint NVARCHAR(255) NOT NULL,
        method NVARCHAR(10) NOT NULL,
        status_code INT NOT NULL,
        request_count INT DEFAULT 1,
        avg_response_time_ms REAL,
        min_response_time_ms INT,
        max_response_time_ms INT,
        total_bytes_sent BIGINT DEFAULT 0,
        total_bytes_received BIGINT DEFAULT 0,
        error_count INT DEFAULT 0,
        user_count INT DEFAULT 0, -- Distinct users in this hour
        organization_id UNIQUEIDENTIFIER,
        
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL,
        UNIQUE(date_hour, endpoint, method, status_code, organization_id)
    );
    PRINT 'Created table: api_usage_analytics';
END
GO

-- =================================
-- ENHANCED QUALITY METRICS
-- =================================

-- Quality Metric Weights (Configurable scoring)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='quality_metric_weights' AND xtype='U')
BEGIN
    CREATE TABLE quality_metric_weights (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER,
        organization_id UNIQUEIDENTIFIER,
        model_provider NVARCHAR(50),
        model_name NVARCHAR(100),
        use_case NVARCHAR(100), -- e.g., "creative_writing", "technical_documentation"
        coherence_weight REAL DEFAULT 1.0 CHECK (coherence_weight >= 0.0),
        completeness_weight REAL DEFAULT 1.0 CHECK (completeness_weight >= 0.0),
        readability_weight REAL DEFAULT 1.0 CHECK (readability_weight >= 0.0),
        creativity_weight REAL DEFAULT 1.0 CHECK (creativity_weight >= 0.0),
        specificity_weight REAL DEFAULT 1.0 CHECK (specificity_weight >= 0.0),
        length_appropriateness_weight REAL DEFAULT 1.0 CHECK (length_appropriateness_weight >= 0.0),
        is_default BIT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE SET NULL
    );
    PRINT 'Created table: quality_metric_weights';
END
GO

-- Custom Quality Metrics (User-defined metrics)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='custom_quality_metrics' AND xtype='U')
BEGIN
    CREATE TABLE custom_quality_metrics (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        response_id INT NOT NULL,
        metric_name NVARCHAR(100) NOT NULL,
        metric_value REAL NOT NULL CHECK (metric_value >= 0.0 AND metric_value <= 100.0),
        metric_description NVARCHAR(MAX),
        calculation_method NVARCHAR(50),
        created_by UNIQUEIDENTIFIER,
        created_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (response_id) REFERENCES responses (id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
        UNIQUE(response_id, metric_name)
    );
    PRINT 'Created table: custom_quality_metrics';
END
GO

-- =================================
-- COMPREHENSIVE INDEXES
-- =================================

-- Performance monitoring indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_perf_log_query_type_time')
BEGIN
    CREATE INDEX idx_perf_log_query_type_time ON query_performance_log(query_type, executed_at DESC);
    PRINT 'Created index: idx_perf_log_query_type_time';
END
GO

-- Cache indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_cache_expires_at')
BEGIN
    CREATE INDEX idx_cache_expires_at ON cache_entries(expires_at);
    PRINT 'Created index: idx_cache_expires_at';
END
GO

-- Security scan indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_security_scans_severity_status')
BEGIN
    CREATE INDEX idx_security_scans_severity_status ON security_scans(severity, status);
    PRINT 'Created index: idx_security_scans_severity_status';
END
GO

-- Rate limiting indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_rate_limit_identifier_window')
BEGIN
    CREATE INDEX idx_rate_limit_identifier_window ON rate_limit_buckets(identifier, window_start DESC);
    PRINT 'Created index: idx_rate_limit_identifier_window';
END
GO

-- API analytics indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_api_analytics_date_endpoint')
BEGIN
    CREATE INDEX idx_api_analytics_date_endpoint ON api_usage_analytics(date_hour DESC, endpoint);
    PRINT 'Created index: idx_api_analytics_date_endpoint';
END
GO

-- Business metrics indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_business_metrics_date_name')
BEGIN
    CREATE INDEX idx_business_metrics_date_name ON business_metrics(metric_date DESC, metric_name);
    PRINT 'Created index: idx_business_metrics_date_name';
END
GO

-- Usage quotas indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_quotas_user_type')
BEGIN
    CREATE INDEX idx_quotas_user_type ON usage_quotas(user_id, quota_type);
    PRINT 'Created index: idx_quotas_user_type';
END
GO

-- Quality metric weights indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_metric_weights_user_model')
BEGIN
    CREATE INDEX idx_metric_weights_user_model ON quality_metric_weights(user_id, model_provider, model_name);
    PRINT 'Created index: idx_metric_weights_user_model';
END
GO

-- =================================
-- ADVANCED STORED PROCEDURES
-- =================================

-- Cleanup expired data procedure
IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_cleanup_expired_data')
BEGIN
    EXEC('
    CREATE PROCEDURE sp_cleanup_expired_data
    AS
    BEGIN
        SET NOCOUNT ON;
        
        DECLARE @rows_affected INT = 0;
        DECLARE @total_cleaned INT = 0;
        
        -- Clean expired cache entries
        DELETE FROM cache_entries WHERE expires_at < GETDATE();
        SET @rows_affected = @@ROWCOUNT;
        SET @total_cleaned = @total_cleaned + @rows_affected;
        PRINT ''Cleaned '' + CAST(@rows_affected AS NVARCHAR) + '' expired cache entries'';
        
        -- Clean expired export jobs
        DELETE FROM export_jobs WHERE expires_at < GETDATE() AND status = ''completed'';
        SET @rows_affected = @@ROWCOUNT;
        SET @total_cleaned = @total_cleaned + @rows_affected;
        PRINT ''Cleaned '' + CAST(@rows_affected AS NVARCHAR) + '' expired export jobs'';
        
        -- Clean old notifications (older than retention period)
        DECLARE @notification_retention_days INT = (
            SELECT CAST(setting_value AS INT) 
            FROM system_settings 
            WHERE setting_key = ''notification_retention_days''
        );
        
        DELETE FROM notifications 
        WHERE created_at < DATEADD(day, -@notification_retention_days, GETDATE());
        SET @rows_affected = @@ROWCOUNT;
        SET @total_cleaned = @total_cleaned + @rows_affected;
        PRINT ''Cleaned '' + CAST(@rows_affected AS NVARCHAR) + '' old notifications'';
        
        -- Clean old rate limit buckets
        DELETE FROM rate_limit_buckets 
        WHERE window_start < DATEADD(hour, -24, GETDATE());
        SET @rows_affected = @@ROWCOUNT;
        SET @total_cleaned = @total_cleaned + @rows_affected;
        PRINT ''Cleaned '' + CAST(@rows_affected AS NVARCHAR) + '' old rate limit buckets'';
        
        -- Clean old query performance logs (keep last 30 days)
        DELETE FROM query_performance_log 
        WHERE executed_at < DATEADD(day, -30, GETDATE());
        SET @rows_affected = @@ROWCOUNT;
        SET @total_cleaned = @total_cleaned + @rows_affected;
        PRINT ''Cleaned '' + CAST(@rows_affected AS NVARCHAR) + '' old performance logs'';
        
        PRINT ''Total records cleaned: '' + CAST(@total_cleaned AS NVARCHAR);
    END
    ');
    PRINT 'Created procedure: sp_cleanup_expired_data';
END
GO

-- Calculate business metrics procedure
IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_calculate_business_metrics')
BEGIN
    EXEC('
    CREATE PROCEDURE sp_calculate_business_metrics
        @metric_date DATE
    AS
    BEGIN
        SET NOCOUNT ON;
        
        -- Delete existing metrics for the date
        DELETE FROM business_metrics WHERE metric_date = @metric_date;
        
        -- Calculate daily active users
        INSERT INTO business_metrics (metric_date, metric_name, metric_value, metric_unit, category)
        SELECT @metric_date, ''daily_active_users'', COUNT(DISTINCT user_id), ''count'', ''user_engagement''
        FROM user_sessions 
        WHERE CAST(last_activity AS DATE) = @metric_date;
        
        -- Calculate total experiments created
        INSERT INTO business_metrics (metric_date, metric_name, metric_value, metric_unit, category)
        SELECT @metric_date, ''experiments_created'', COUNT(*), ''count'', ''usage''
        FROM experiments 
        WHERE CAST(created_at AS DATE) = @metric_date;
        
        -- Calculate total API calls
        INSERT INTO business_metrics (metric_date, metric_name, metric_value, metric_unit, category)
        SELECT @metric_date, ''api_calls_total'', SUM(request_count), ''count'', ''api_usage''
        FROM api_usage_analytics 
        WHERE CAST(date_hour AS DATE) = @metric_date;
        
        -- Calculate average quality score
        INSERT INTO business_metrics (metric_date, metric_name, metric_value, metric_unit, category)
        SELECT @metric_date, ''avg_quality_score'', AVG(overall_score), ''percentage'', ''quality''
        FROM quality_metrics qm
        INNER JOIN responses r ON qm.response_id = r.id
        WHERE CAST(r.created_at AS DATE) = @metric_date;
        
        -- Calculate total cost
        INSERT INTO business_metrics (metric_date, metric_name, metric_value, metric_unit, category)
        SELECT @metric_date, ''total_cost'', SUM(cost), ''currency'', ''financial''
        FROM responses 
        WHERE CAST(created_at AS DATE) = @metric_date;
        
        PRINT ''Business metrics calculated for '' + CAST(@metric_date AS NVARCHAR);
    END
    ');
    PRINT 'Created procedure: sp_calculate_business_metrics';
END
GO

-- =================================
-- DATA INTEGRITY CONSTRAINTS
-- =================================

-- Add check constraints for data quality
ALTER TABLE experiments ADD CONSTRAINT chk_experiments_quality_score 
CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 100));

ALTER TABLE experiments ADD CONSTRAINT chk_experiments_total_cost 
CHECK (total_cost >= 0);

ALTER TABLE experiments ADD CONSTRAINT chk_experiments_response_count 
CHECK (response_count >= 0);

-- Add check constraints for usage quotas
ALTER TABLE usage_quotas ADD CONSTRAINT chk_quotas_positive_limits 
CHECK (quota_limit > 0 AND quota_used >= 0 AND quota_used <= quota_limit * 1.1); -- Allow 10% overage

-- Add check constraints for rate limiting
ALTER TABLE rate_limit_buckets ADD CONSTRAINT chk_rate_limit_positive_values 
CHECK (request_count >= 0 AND window_duration_minutes > 0 AND limit_per_window > 0);

PRINT 'Added data integrity constraints';

-- =================================
-- DEFAULT DATA
-- =================================

-- Insert default archive policies
IF NOT EXISTS (SELECT * FROM archive_policies WHERE table_name = 'audit_logs')
BEGIN
    INSERT INTO archive_policies (table_name, retention_days, archive_enabled) VALUES
    ('audit_logs', 365, 1),
    ('query_performance_log', 90, 1),
    ('system_events', 180, 1),
    ('export_jobs', 30, 0),
    ('notifications', 90, 0),
    ('user_sessions', 30, 0);
    PRINT 'Inserted default archive policies';
END
GO

-- Insert default quality metric weights
IF NOT EXISTS (SELECT * FROM quality_metric_weights WHERE is_default = 1)
BEGIN
    INSERT INTO quality_metric_weights (
        use_case, coherence_weight, completeness_weight, readability_weight,
        creativity_weight, specificity_weight, length_appropriateness_weight, is_default
    ) VALUES
    ('general', 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1),
    ('creative_writing', 1.2, 1.1, 0.9, 1.5, 0.8, 1.0, 1),
    ('technical_documentation', 1.3, 1.4, 1.2, 0.7, 1.3, 1.1, 1),
    ('marketing_copy', 1.1, 1.2, 1.0, 1.3, 1.0, 0.9, 1);
    PRINT 'Inserted default quality metric weights';
END
GO

-- Insert system settings for production
IF NOT EXISTS (SELECT * FROM system_settings WHERE setting_key = 'rate_limit_default_per_minute')
BEGIN
    INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category) VALUES
    ('rate_limit_default_per_minute', '60', 'number', 'Default rate limit per minute for API calls', 'rate_limiting'),
    ('rate_limit_burst_size', '10', 'number', 'Burst size for rate limiting', 'rate_limiting'),
    ('cache_default_ttl_seconds', '3600', 'number', 'Default cache TTL in seconds', 'caching'),
    ('max_concurrent_batch_experiments', '3', 'number', 'Maximum concurrent batch experiments per user', 'performance'),
    ('quality_analysis_timeout_seconds', '30', 'number', 'Timeout for quality analysis operations', 'performance'),
    ('export_timeout_minutes', '60', 'number', 'Timeout for export operations', 'export'),
    ('cleanup_job_interval_hours', '24', 'number', 'Interval for running cleanup jobs', 'maintenance');
    PRINT 'Inserted production system settings';
END
GO

-- =================================
-- MIGRATION COMPLETION
-- =================================

-- Insert migration record
IF NOT EXISTS (SELECT * FROM schema_migrations WHERE version = '004_production_optimizations')
BEGIN
    INSERT INTO schema_migrations (version) VALUES ('004_production_optimizations');
    PRINT 'Recorded migration: 004_production_optimizations';
END
GO

-- Update database statistics for better query performance
UPDATE STATISTICS experiments;
UPDATE STATISTICS responses;
UPDATE STATISTICS quality_metrics;
UPDATE STATISTICS batch_experiments;
UPDATE STATISTICS users;

-- Verify all new tables were created
SELECT 
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN (
    'query_performance_log',
    'cache_entries',
    'archive_policies',
    'archived_data',
    'security_scans',
    'ip_access_control',
    'business_metrics',
    'usage_quotas',
    'rate_limit_buckets',
    'api_usage_analytics',
    'quality_metric_weights',
    'custom_quality_metrics'
)
ORDER BY TABLE_NAME;

SELECT 'Migration 004_production_optimizations - COMPLETED successfully' as status;
PRINT 'Production optimizations migration completed successfully!';
PRINT 'Database is now production-ready with comprehensive monitoring, security, and performance features!';
GO
