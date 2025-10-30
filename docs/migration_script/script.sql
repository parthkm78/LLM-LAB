-- Migration: 001_batch_experiments_complete.sql
-- Description: Complete LLM Lab database schema with batch experiment functionality
-- Created: October 30, 2025
-- Version: 1.0
-- Note: This script creates ALL tables and can run on any fresh database

-- =================================
-- BASE TABLES (ORIGINAL SCHEMA)
-- =================================

-- Experiments Table (Base table for single experiments)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='experiments' AND xtype='U')
BEGIN
    CREATE TABLE experiments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        prompt NVARCHAR(MAX) NOT NULL,
        model NVARCHAR(100) DEFAULT 'gpt-3.5-turbo',
        temperature REAL DEFAULT 0.7 CHECK (temperature >= 0.0 AND temperature <= 2.0),
        top_p REAL DEFAULT 1.0 CHECK (top_p >= 0.0 AND top_p <= 1.0),
        max_tokens INT DEFAULT 100 CHECK (max_tokens > 0),
        frequency_penalty REAL DEFAULT 0.0 CHECK (frequency_penalty >= -2.0 AND frequency_penalty <= 2.0),
        presence_penalty REAL DEFAULT 0.0 CHECK (presence_penalty >= -2.0 AND presence_penalty <= 2.0),
        experiment_type NVARCHAR(20) DEFAULT 'single' CHECK (experiment_type IN ('single', 'batch')),
        tags NVARCHAR(MAX), -- JSON array of tags
        favorited BIT DEFAULT 0,
        archived BIT DEFAULT 0,
        estimated_duration INT, -- in seconds
        actual_duration INT, -- in seconds
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Created table: experiments';
END
ELSE
BEGIN
    PRINT 'Table experiments already exists';
END
GO

-- Responses Table (Base table for experiment responses)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='responses' AND xtype='U')
BEGIN
    CREATE TABLE responses (
        id INT IDENTITY(1,1) PRIMARY KEY,
        experiment_id INT,
        batch_experiment_id INT,
        response_content NVARCHAR(MAX) NOT NULL,
        response_time REAL CHECK (response_time >= 0),
        prompt_tokens INT CHECK (prompt_tokens >= 0),
        completion_tokens INT CHECK (completion_tokens >= 0),
        total_tokens INT CHECK (total_tokens >= 0),
        cost REAL CHECK (cost >= 0),
        error_message NVARCHAR(MAX),
        provider NVARCHAR(50) DEFAULT 'openai',
        request_id NVARCHAR(100), -- For tracking API requests
        created_at DATETIME2 DEFAULT GETDATE(),
        
        -- Foreign Keys
        FOREIGN KEY (experiment_id) REFERENCES experiments (id) ON DELETE CASCADE
    );
    PRINT 'Created table: responses';
END
ELSE
BEGIN
    PRINT 'Table responses already exists';
END
GO

-- Quality Metrics Table (Base table for quality assessments)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='quality_metrics' AND xtype='U')
BEGIN
    CREATE TABLE quality_metrics (
        id INT IDENTITY(1,1) PRIMARY KEY,
        response_id INT NOT NULL,
        coherence_score REAL CHECK (coherence_score >= 0.0 AND coherence_score <= 100.0),
        completeness_score REAL CHECK (completeness_score >= 0.0 AND completeness_score <= 100.0),
        readability_score REAL CHECK (readability_score >= 0.0 AND readability_score <= 100.0),
        creativity_score REAL CHECK (creativity_score >= 0.0 AND creativity_score <= 100.0),
        specificity_score REAL CHECK (specificity_score >= 0.0 AND specificity_score <= 100.0),
        overall_score REAL CHECK (overall_score >= 0.0 AND overall_score <= 100.0),
        confidence_score REAL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
        analysis_version NVARCHAR(20) DEFAULT '1.0',
        processing_time REAL CHECK (processing_time >= 0),
        algorithm_used NVARCHAR(50) DEFAULT 'standard',
        created_at DATETIME2 DEFAULT GETDATE(),
        
        -- Foreign Key
        FOREIGN KEY (response_id) REFERENCES responses (id) ON DELETE CASCADE
    );
    PRINT 'Created table: quality_metrics';
END
ELSE
BEGIN
    PRINT 'Table quality_metrics already exists';
END
GO

-- =================================
-- BATCH EXPERIMENT TABLES
-- =================================

-- Batch Experiments Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='batch_experiments' AND xtype='U')
BEGIN
    CREATE TABLE batch_experiments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        prompt NVARCHAR(MAX) NOT NULL,
        model NVARCHAR(100) DEFAULT 'gpt-3.5-turbo',
        status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
        progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        total_combinations INT NOT NULL CHECK (total_combinations > 0),
        completed_combinations INT DEFAULT 0 CHECK (completed_combinations >= 0),
        parameter_ranges NVARCHAR(MAX) NOT NULL, -- JSON string containing parameter configurations
        results_summary NVARCHAR(MAX), -- JSON string containing aggregated results
        error_message NVARCHAR(MAX),
        started_at DATETIME2,
        completed_at DATETIME2,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        -- Constraints
        CHECK (completed_combinations <= total_combinations)
    );
    PRINT 'Created table: batch_experiments';
END
ELSE
BEGIN
    PRINT 'Table batch_experiments already exists';
END
GO

-- Batch Results Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='batch_results' AND xtype='U')
BEGIN
    CREATE TABLE batch_results (
        id INT IDENTITY(1,1) PRIMARY KEY,
        batch_experiment_id INT NOT NULL,
        temperature REAL NOT NULL CHECK (temperature >= 0.0 AND temperature <= 2.0),
        top_p REAL NOT NULL CHECK (top_p >= 0.0 AND top_p <= 1.0),
        max_tokens INT CHECK (max_tokens > 0),
        frequency_penalty REAL DEFAULT 0.0 CHECK (frequency_penalty >= -2.0 AND frequency_penalty <= 2.0),
        presence_penalty REAL DEFAULT 0.0 CHECK (presence_penalty >= -2.0 AND presence_penalty <= 2.0),
        response_content NVARCHAR(MAX) NOT NULL,
        quality_scores NVARCHAR(MAX) NOT NULL, -- JSON string containing all quality metrics
        usage_stats NVARCHAR(MAX), -- JSON string containing token usage, cost, etc.
        response_time REAL CHECK (response_time >= 0),
        model_used NVARCHAR(100),
        prompt_tokens INT CHECK (prompt_tokens >= 0),
        completion_tokens INT CHECK (completion_tokens >= 0),
        total_tokens INT CHECK (total_tokens >= 0),
        cost REAL CHECK (cost >= 0),
        error_message NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE(),
        
        -- Foreign Key
        FOREIGN KEY (batch_experiment_id) REFERENCES batch_experiments (id) ON DELETE CASCADE
    );
    PRINT 'Created table: batch_results';
END
ELSE
BEGIN
    PRINT 'Table batch_results already exists';
END
GO

-- Parameter Insights Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='parameter_insights' AND xtype='U')
BEGIN
    CREATE TABLE parameter_insights (
        id INT IDENTITY(1,1) PRIMARY KEY,
        batch_experiment_id INT NOT NULL,
        parameter_name NVARCHAR(50) NOT NULL CHECK (parameter_name IN ('temperature', 'top_p', 'max_tokens', 'frequency_penalty', 'presence_penalty')),
        optimal_value REAL NOT NULL,
        correlation_score REAL CHECK (correlation_score >= -1.0 AND correlation_score <= 1.0),
        insight_text NVARCHAR(MAX),
        confidence_score REAL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
        quality_metric NVARCHAR(50) DEFAULT 'overall_score', -- Which quality metric this insight refers to
        sample_size INT CHECK (sample_size > 0),
        statistical_significance REAL CHECK (statistical_significance >= 0.0 AND statistical_significance <= 1.0),
        created_at DATETIME2 DEFAULT GETDATE(),
        
        -- Foreign Key
        FOREIGN KEY (batch_experiment_id) REFERENCES batch_experiments (id) ON DELETE CASCADE,
        
        -- Unique constraint to prevent duplicate insights
        UNIQUE(batch_experiment_id, parameter_name, quality_metric)
    );
    PRINT 'Created table: parameter_insights';
END
ELSE
BEGIN
    PRINT 'Table parameter_insights already exists';
END
GO

-- Quality Analytics Table (Enhanced version for all experiments)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='quality_analytics' AND xtype='U')
BEGIN
    CREATE TABLE quality_analytics (
        id INT IDENTITY(1,1) PRIMARY KEY,
        experiment_id INT, -- For single experiments
        batch_experiment_id INT, -- For batch experiments
        metric_type NVARCHAR(50) NOT NULL CHECK (metric_type IN ('coherence', 'completeness', 'readability', 'creativity', 'specificity', 'overall')),
        average_score REAL CHECK (average_score >= 0.0 AND average_score <= 100.0),
        median_score REAL CHECK (median_score >= 0.0 AND median_score <= 100.0),
        std_deviation REAL CHECK (std_deviation >= 0.0),
        min_score REAL CHECK (min_score >= 0.0 AND min_score <= 100.0),
        max_score REAL CHECK (max_score >= 0.0 AND max_score <= 100.0),
        trend_direction NVARCHAR(20) CHECK (trend_direction IN ('increasing', 'decreasing', 'stable', 'volatile')),
        trend_strength REAL CHECK (trend_strength >= 0.0 AND trend_strength <= 1.0),
        data_points NVARCHAR(MAX), -- JSON array of historical data points
        sample_count INT CHECK (sample_count > 0),
        calculation_method NVARCHAR(50) DEFAULT 'statistical',
        calculated_at DATETIME2 DEFAULT GETDATE(),
        
        -- Foreign Keys (exactly one should be non-null)
        FOREIGN KEY (experiment_id) REFERENCES experiments (id) ON DELETE CASCADE,
        FOREIGN KEY (batch_experiment_id) REFERENCES batch_experiments (id) ON DELETE CASCADE,
        
        -- Ensure exactly one foreign key is set
        CHECK ((experiment_id IS NOT NULL AND batch_experiment_id IS NULL) OR 
               (experiment_id IS NULL AND batch_experiment_id IS NOT NULL))
    );
    PRINT 'Created table: quality_analytics';
END
ELSE
BEGIN
    PRINT 'Table quality_analytics already exists';
END
GO

-- ===================
-- ADD FOREIGN KEY FOR RESPONSES TO BATCH EXPERIMENTS
-- ===================

-- Add foreign key constraint for batch_experiment_id in responses if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_responses_batch_experiments')
BEGIN
    ALTER TABLE responses 
    ADD CONSTRAINT FK_responses_batch_experiments 
    FOREIGN KEY (batch_experiment_id) REFERENCES batch_experiments (id) ON DELETE CASCADE;
    PRINT 'Added foreign key: FK_responses_batch_experiments';
END
GO

-- ===================
-- INDEXES FOR PERFORMANCE
-- ===================

-- Base Tables Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_experiments_type')
BEGIN
    CREATE INDEX idx_experiments_type ON experiments(experiment_type);
    PRINT 'Created index: idx_experiments_type';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_experiments_created_at')
BEGIN
    CREATE INDEX idx_experiments_created_at ON experiments(created_at DESC);
    PRINT 'Created index: idx_experiments_created_at';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_experiments_favorited')
BEGIN
    CREATE INDEX idx_experiments_favorited ON experiments(favorited);
    PRINT 'Created index: idx_experiments_favorited';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_experiments_archived')
BEGIN
    CREATE INDEX idx_experiments_archived ON experiments(archived);
    PRINT 'Created index: idx_experiments_archived';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_responses_experiment_id')
BEGIN
    CREATE INDEX idx_responses_experiment_id ON responses(experiment_id);
    PRINT 'Created index: idx_responses_experiment_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_responses_batch_id')
BEGIN
    CREATE INDEX idx_responses_batch_id ON responses(batch_experiment_id);
    PRINT 'Created index: idx_responses_batch_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_responses_provider')
BEGIN
    CREATE INDEX idx_responses_provider ON responses(provider);
    PRINT 'Created index: idx_responses_provider';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_quality_metrics_response_id')
BEGIN
    CREATE INDEX idx_quality_metrics_response_id ON quality_metrics(response_id);
    PRINT 'Created index: idx_quality_metrics_response_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_quality_metrics_confidence')
BEGIN
    CREATE INDEX idx_quality_metrics_confidence ON quality_metrics(confidence_score);
    PRINT 'Created index: idx_quality_metrics_confidence';
END
GO

-- Batch Experiments Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_batch_experiments_status')
BEGIN
    CREATE INDEX idx_batch_experiments_status ON batch_experiments(status);
    PRINT 'Created index: idx_batch_experiments_status';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_batch_experiments_created_at')
BEGIN
    CREATE INDEX idx_batch_experiments_created_at ON batch_experiments(created_at DESC);
    PRINT 'Created index: idx_batch_experiments_created_at';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_batch_experiments_model')
BEGIN
    CREATE INDEX idx_batch_experiments_model ON batch_experiments(model);
    PRINT 'Created index: idx_batch_experiments_model';
END
GO

-- Batch Results Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_batch_results_batch_id')
BEGIN
    CREATE INDEX idx_batch_results_batch_id ON batch_results(batch_experiment_id);
    PRINT 'Created index: idx_batch_results_batch_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_batch_results_temperature')
BEGIN
    CREATE INDEX idx_batch_results_temperature ON batch_results(temperature);
    PRINT 'Created index: idx_batch_results_temperature';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_batch_results_top_p')
BEGIN
    CREATE INDEX idx_batch_results_top_p ON batch_results(top_p);
    PRINT 'Created index: idx_batch_results_top_p';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_batch_results_created_at')
BEGIN
    CREATE INDEX idx_batch_results_created_at ON batch_results(created_at DESC);
    PRINT 'Created index: idx_batch_results_created_at';
END
GO

-- Parameter Insights Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_parameter_insights_batch_id')
BEGIN
    CREATE INDEX idx_parameter_insights_batch_id ON parameter_insights(batch_experiment_id);
    PRINT 'Created index: idx_parameter_insights_batch_id';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_parameter_insights_parameter')
BEGIN
    CREATE INDEX idx_parameter_insights_parameter ON parameter_insights(parameter_name);
    PRINT 'Created index: idx_parameter_insights_parameter';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_parameter_insights_confidence')
BEGIN
    CREATE INDEX idx_parameter_insights_confidence ON parameter_insights(confidence_score DESC);
    PRINT 'Created index: idx_parameter_insights_confidence';
END
GO

-- Quality Analytics Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_quality_analytics_experiment')
BEGIN
    CREATE INDEX idx_quality_analytics_experiment ON quality_analytics(experiment_id);
    PRINT 'Created index: idx_quality_analytics_experiment';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_quality_analytics_batch')
BEGIN
    CREATE INDEX idx_quality_analytics_batch ON quality_analytics(batch_experiment_id);
    PRINT 'Created index: idx_quality_analytics_batch';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_quality_analytics_metric_type')
BEGIN
    CREATE INDEX idx_quality_analytics_metric_type ON quality_analytics(metric_type);
    PRINT 'Created index: idx_quality_analytics_metric_type';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_quality_analytics_calculated_at')
BEGIN
    CREATE INDEX idx_quality_analytics_calculated_at ON quality_analytics(calculated_at DESC);
    PRINT 'Created index: idx_quality_analytics_calculated_at';
END
GO

-- ===================
-- TRIGGERS FOR AUTOMATION
-- ===================

-- Trigger to update batch experiment progress
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_update_batch_progress')
BEGIN
    EXEC('
    CREATE TRIGGER trg_update_batch_progress
    ON batch_results
    AFTER INSERT
    AS
    BEGIN
        SET NOCOUNT ON;
        
        UPDATE be
        SET completed_combinations = (
            SELECT COUNT(*) 
            FROM batch_results br 
            WHERE br.batch_experiment_id = i.batch_experiment_id
        ),
        progress = ROUND(
            (SELECT COUNT(*) FROM batch_results br2 WHERE br2.batch_experiment_id = i.batch_experiment_id) * 100.0 / 
            be.total_combinations, 0
        ),
        updated_at = GETDATE()
        FROM batch_experiments be
        INNER JOIN inserted i ON be.id = i.batch_experiment_id;
    END
    ');
    PRINT 'Created trigger: trg_update_batch_progress';
END
GO

-- Trigger to update batch experiment status when completed
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_update_batch_completion')
BEGIN
    EXEC('
    CREATE TRIGGER trg_update_batch_completion
    ON batch_experiments
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        
        UPDATE batch_experiments 
        SET status = ''completed'', 
            completed_at = GETDATE(),
            updated_at = GETDATE()
        FROM batch_experiments be
        INNER JOIN inserted i ON be.id = i.id
        WHERE i.completed_combinations >= i.total_combinations 
        AND i.status = ''running'';
    END
    ');
    PRINT 'Created trigger: trg_update_batch_completion';
END
GO

-- Trigger to update timestamps
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_update_batch_experiments_timestamp')
BEGIN
    EXEC('
    CREATE TRIGGER trg_update_batch_experiments_timestamp
    ON batch_experiments
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        
        UPDATE batch_experiments 
        SET updated_at = GETDATE()
        FROM batch_experiments be
        INNER JOIN inserted i ON be.id = i.id;
    END
    ');
    PRINT 'Created trigger: trg_update_batch_experiments_timestamp';
END
GO

-- ===================
-- VIEWS FOR ANALYTICS
-- ===================

-- Create a view for batch experiment statistics
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'batch_experiment_stats')
BEGIN
    EXEC('
    CREATE VIEW batch_experiment_stats AS
    SELECT 
        be.id,
        be.name,
        be.status,
        be.progress,
        be.total_combinations,
        be.completed_combinations,
        COUNT(br.id) as actual_results_count,
        AVG(CAST(JSON_VALUE(br.quality_scores, ''$.overall_score'') AS REAL)) as avg_quality_score,
        MIN(CAST(JSON_VALUE(br.quality_scores, ''$.overall_score'') AS REAL)) as min_quality_score,
        MAX(CAST(JSON_VALUE(br.quality_scores, ''$.overall_score'') AS REAL)) as max_quality_score,
        AVG(br.response_time) as avg_response_time,
        SUM(br.cost) as total_cost,
        be.created_at,
        be.updated_at
    FROM batch_experiments be
    LEFT JOIN batch_results br ON be.id = br.batch_experiment_id
    GROUP BY be.id, be.name, be.status, be.progress, be.total_combinations, 
             be.completed_combinations, be.created_at, be.updated_at
    ');
    PRINT 'Created view: batch_experiment_stats';
END
GO

-- ===================
-- SAMPLE DATA FOR TESTING
-- ===================

-- Insert a sample batch experiment for testing
IF NOT EXISTS (SELECT * FROM batch_experiments WHERE name = 'Sample Batch Experiment')
BEGIN
    INSERT INTO batch_experiments (
        name, 
        description, 
        prompt, 
        model, 
        total_combinations, 
        parameter_ranges
    ) 
    VALUES (
        'Sample Batch Experiment',
        'A sample batch experiment for testing the new schema',
        'Write a creative story about artificial intelligence',
        'gpt-3.5-turbo',
        4,
        '{"temperature": [0.7, 1.0], "top_p": [0.9, 1.0], "max_tokens": [100, 200]}'
    );
    PRINT 'Inserted sample batch experiment';
END
GO

-- ===================
-- MIGRATION COMPLETION
-- ===================

-- Insert migration record (if you want to track migrations)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='schema_migrations' AND xtype='U')
BEGIN
    CREATE TABLE schema_migrations (
        version NVARCHAR(50) PRIMARY KEY,
        applied_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Created table: schema_migrations';
END
GO

-- Insert migration record
IF NOT EXISTS (SELECT * FROM schema_migrations WHERE version = '001_batch_experiments_complete')
BEGIN
    INSERT INTO schema_migrations (version) VALUES ('001_batch_experiments_complete');
    PRINT 'Recorded migration: 001_batch_experiments_complete';
END
GO

-- Insert sample data for testing
IF NOT EXISTS (SELECT * FROM experiments WHERE name = 'Sample Single Experiment')
BEGIN
    INSERT INTO experiments (
        name, 
        description, 
        prompt, 
        model,
        experiment_type
    ) 
    VALUES (
        'Sample Single Experiment',
        'A sample single experiment for testing',
        'Write a short story about technology',
        'gpt-3.5-turbo',
        'single'
    );
    PRINT 'Inserted sample single experiment';
END
GO

-- Verify all tables were created
SELECT 
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN (
    'experiments', 
    'responses', 
    'quality_metrics',
    'batch_experiments', 
    'batch_results', 
    'parameter_insights', 
    'quality_analytics', 
    'schema_migrations'
)
ORDER BY TABLE_NAME;

-- Migration completed successfully
SELECT 'Migration 001_batch_experiments_complete - ALL TABLES CREATED successfully' as status;
PRINT 'Complete database schema migration completed successfully!';
GO
