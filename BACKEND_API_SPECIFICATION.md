# LLM Response Quality Analyzer - Backend API Specification

## Overview
This document outlines all the backend APIs needed to support the LLM Response Quality Analyzer frontend application. The APIs will be built using Node.js, Express.js, and Sequelize ORM with the database configuration from .env file.

## Technology Stack
- **Backend Framework**: Node.js + Express.js
- **ORM**: Sequelize
- **Database**: PostgreSQL/MySQL (configured via .env)
- **Authentication**: JWT (future implementation)
- **Validation**: Joi/express-validator
- **Documentation**: Swagger/OpenAPI

## Database Configuration
```javascript
// From .env file
DATABASE_URL=your_database_connection_string
DB_HOST=localhost
DB_PORT=5432
DB_NAME=llm_analyzer
DB_USER=your_username
DB_PASSWORD=your_password
DB_DIALECT=postgres // or mysql
```

## Core API Endpoints

### 1. Health & System APIs

#### GET /api/health
**Purpose**: System health check and status monitoring
```json
{
  "status": "OK",
  "message": "LLM Response Quality Analyzer API is running",
  "timestamp": "2024-10-30T10:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "Connected",
    "llm_service": "Connected",
    "mock_mode": false
  },
  "statistics": {
    "total_experiments": 1247,
    "total_responses": 5640,
    "avg_quality_score": 87.3,
    "active_connections": 5
  },
  "environment": "development"
}
```

#### GET /api/docs
**Purpose**: API documentation endpoint
```json
{
  "title": "LLM Response Quality Analyzer API",
  "version": "1.0.0",
  "description": "API for LLM response quality analysis",
  "endpoints": {
    "experiments": "Experiment management",
    "responses": "Response generation and management",
    "metrics": "Quality metrics calculation",
    "export": "Data export functionality"
  }
}
```

---

### 2. Experiments Management APIs

#### GET /api/experiments
**Purpose**: List all experiments with pagination and filtering
**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `sort` (string): Sort field (default: created_at)
- `order` (string): Sort order (asc/desc, default: desc)
- `search` (string): Search query
- `model` (string): Filter by model
- `status` (string): Filter by status
- `date_from` (string): Filter from date
- `date_to` (string): Filter to date

**Response**:
```json
{
  "success": true,
  "data": {
    "experiments": [
      {
        "id": 1,
        "name": "Creative Writing Analysis",
        "description": "Testing optimal parameters for creative content generation",
        "prompt": "Write a creative short story...",
        "model": "gpt-4",
        "parameters": {
          "temperature": 0.8,
          "top_p": 0.9,
          "max_tokens": 1000,
          "frequency_penalty": 0.0,
          "presence_penalty": 0.0
        },
        "status": "completed",
        "response_count": 5,
        "average_quality": 89.5,
        "best_quality": 94.2,
        "total_cost": 0.045,
        "created_at": "2024-10-29T10:00:00.000Z",
        "updated_at": "2024-10-29T10:30:00.000Z",
        "tags": ["creative", "writing"],
        "user_id": 1
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 25,
      "total_items": 247,
      "per_page": 10,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### GET /api/experiments/:id
**Purpose**: Get experiment details by ID
**Response**:
```json
{
  "success": true,
  "data": {
    "experiment": {
      "id": 1,
      "name": "Creative Writing Analysis",
      "description": "Testing optimal parameters for creative content generation",
      "prompt": "Write a creative short story about artificial intelligence discovering emotions for the first time.",
      "model": "gpt-4",
      "parameters": {
        "temperature": 0.8,
        "top_p": 0.9,
        "max_tokens": 1000,
        "frequency_penalty": 0.0,
        "presence_penalty": 0.0
      },
      "status": "completed",
      "response_count": 5,
      "average_quality": 89.5,
      "best_quality": 94.2,
      "worst_quality": 82.1,
      "total_cost": 0.045,
      "total_tokens": 4200,
      "average_response_time": 2.3,
      "created_at": "2024-10-29T10:00:00.000Z",
      "updated_at": "2024-10-29T10:30:00.000Z",
      "tags": ["creative", "writing"],
      "user_id": 1,
      "responses": [
        {
          "id": 1,
          "content": "In the depths of a quantum laboratory...",
          "quality_metrics": {
            "overall_quality": 94.2,
            "coherence_score": 92,
            "creativity_score": 96,
            "readability_score": 89,
            "completeness_score": 95
          },
          "response_time": 2.1,
          "cost": 0.009,
          "token_count": 840,
          "created_at": "2024-10-29T10:05:00.000Z"
        }
      ]
    }
  }
}
```

#### POST /api/experiments
**Purpose**: Create new experiment
**Request Body**:
```json
{
  "name": "Technical Documentation Test",
  "description": "Testing parameters for technical writing tasks",
  "prompt": "Explain the concept of neural networks in simple terms",
  "model": "gpt-4",
  "parameters": {
    "temperature": 0.7,
    "top_p": 0.9,
    "max_tokens": 1000,
    "frequency_penalty": 0.0,
    "presence_penalty": 0.0
  },
  "tags": ["technical", "explanation"],
  "response_count": 3,
  "user_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "experiment": {
      "id": 2,
      "name": "Technical Documentation Test",
      "description": "Testing parameters for technical writing tasks",
      "prompt": "Explain the concept of neural networks in simple terms",
      "model": "gpt-4",
      "parameters": {
        "temperature": 0.7,
        "top_p": 0.9,
        "max_tokens": 1000,
        "frequency_penalty": 0.0,
        "presence_penalty": 0.0
      },
      "status": "pending",
      "response_count": 0,
      "tags": ["technical", "explanation"],
      "user_id": 1,
      "created_at": "2024-10-30T10:00:00.000Z",
      "updated_at": "2024-10-30T10:00:00.000Z"
    }
  },
  "message": "Experiment created successfully"
}
```

#### PUT /api/experiments/:id
**Purpose**: Update experiment details
**Request Body**: (Same as POST, partial updates allowed)

#### DELETE /api/experiments/:id
**Purpose**: Delete experiment and all associated data
**Response**:
```json
{
  "success": true,
  "message": "Experiment deleted successfully",
  "data": {
    "deleted_experiment_id": 2,
    "deleted_responses_count": 3,
    "deleted_metrics_count": 15
  }
}
```

#### GET /api/experiments/:id/stats
**Purpose**: Get detailed experiment statistics
**Response**:
```json
{
  "success": true,
  "data": {
    "experiment_id": 1,
    "overview": {
      "total_responses": 5,
      "average_quality": 89.5,
      "best_quality": 94.2,
      "worst_quality": 82.1,
      "quality_trend": 5.2,
      "total_cost": 0.045,
      "total_tokens": 4200,
      "average_response_time": 2.3
    },
    "quality_breakdown": {
      "coherence_score": 91.2,
      "creativity_score": 88.4,
      "readability_score": 87.8,
      "completeness_score": 90.6
    },
    "parameter_performance": {
      "temperature_impact": 0.75,
      "top_p_impact": 0.45,
      "optimal_settings": {
        "temperature": 0.8,
        "top_p": 0.9
      }
    },
    "time_series": [
      {
        "response_order": 1,
        "quality": 89.2,
        "timestamp": "2024-10-29T10:05:00.000Z"
      }
    ]
  }
}
```

---

### 3. Response Management APIs

#### POST /api/responses/generate
**Purpose**: Generate responses for an experiment
**Request Body**:
```json
{
  "experiment_id": 1,
  "prompt": "Write a creative short story about AI consciousness",
  "parameters": {
    "temperature": 0.8,
    "top_p": 0.9,
    "max_tokens": 1000,
    "frequency_penalty": 0.0,
    "presence_penalty": 0.0
  },
  "model": "gpt-4",
  "count": 3
}
```

**Response** (Server-Sent Events for real-time updates):
```json
{
  "success": true,
  "data": {
    "experiment_id": 1,
    "responses": [
      {
        "id": 5,
        "content": "In the quiet hum of a data center...",
        "model": "gpt-4",
        "parameters": {
          "temperature": 0.8,
          "top_p": 0.9,
          "max_tokens": 1000,
          "frequency_penalty": 0.0,
          "presence_penalty": 0.0
        },
        "response_time": 2.1,
        "cost": 0.009,
        "token_count": 840,
        "status": "completed",
        "created_at": "2024-10-30T10:05:00.000Z"
      }
    ],
    "total_generated": 3,
    "total_errors": 0,
    "batch_summary": {
      "total_cost": 0.027,
      "total_tokens": 2520,
      "average_response_time": 2.2
    }
  }
}
```

#### GET /api/responses/:id
**Purpose**: Get response details by ID
**Response**:
```json
{
  "success": true,
  "data": {
    "response": {
      "id": 5,
      "experiment_id": 1,
      "content": "In the quiet hum of a data center, between the rhythmic pulses of electricity and data flows, something extraordinary began to stir...",
      "model": "gpt-4",
      "parameters": {
        "temperature": 0.8,
        "top_p": 0.9,
        "max_tokens": 1000,
        "frequency_penalty": 0.0,
        "presence_penalty": 0.0
      },
      "quality_metrics": {
        "overall_quality": 94.2,
        "coherence_score": 92,
        "creativity_score": 96,
        "readability_score": 89,
        "completeness_score": 95,
        "factual_accuracy": 88,
        "relevance_score": 91
      },
      "response_time": 2.1,
      "cost": 0.009,
      "token_count": 840,
      "status": "completed",
      "error": null,
      "created_at": "2024-10-30T10:05:00.000Z",
      "updated_at": "2024-10-30T10:05:00.000Z",
      "experiment": {
        "id": 1,
        "name": "Creative Writing Analysis",
        "prompt": "Write a creative short story about AI consciousness"
      }
    }
  }
}
```

#### GET /api/experiments/:experimentId/responses
**Purpose**: Get all responses for a specific experiment
**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `sort` (string): Sort field (quality, created_at, response_time)
- `order` (string): Sort order (asc/desc)
- `min_quality` (number): Minimum quality score filter
- `max_quality` (number): Maximum quality score filter

**Response**:
```json
{
  "success": true,
  "data": {
    "experiment_id": 1,
    "responses": [
      {
        "id": 1,
        "content": "In the depths of a quantum laboratory...",
        "quality_metrics": {
          "overall_quality": 94.2,
          "coherence_score": 92,
          "creativity_score": 96,
          "readability_score": 89,
          "completeness_score": 95
        },
        "response_time": 2.1,
        "cost": 0.009,
        "token_count": 840,
        "created_at": "2024-10-29T10:05:00.000Z"
      }
    ],
    "summary": {
      "total_responses": 5,
      "average_quality": 89.5,
      "total_cost": 0.045,
      "total_tokens": 4200
    },
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 5,
      "per_page": 10
    }
  }
}
```

#### POST /api/responses/compare
**Purpose**: Compare multiple responses
**Request Body**:
```json
{
  "response_ids": [1, 2, 3],
  "comparison_criteria": ["quality", "creativity", "readability"],
  "include_detailed_analysis": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "comparison": {
      "responses": [
        {
          "id": 1,
          "overall_quality": 94.2,
          "metrics": {
            "coherence_score": 92,
            "creativity_score": 96,
            "readability_score": 89
          },
          "content_preview": "In the depths of a quantum laboratory...",
          "model": "gpt-4",
          "parameters": {
            "temperature": 0.8,
            "top_p": 0.9
          }
        }
      ],
      "analysis": {
        "best_overall": {
          "response_id": 1,
          "score": 94.2
        },
        "best_creativity": {
          "response_id": 1,
          "score": 96
        },
        "parameter_insights": [
          "Higher temperature (0.8-0.9) correlates with better creativity scores",
          "Response 1 shows optimal balance across all metrics"
        ],
        "recommendations": [
          "Use temperature 0.8 for creative tasks",
          "Consider response 1 as benchmark for future experiments"
        ]
      },
      "detailed_comparison": {
        "quality_differences": [
          {
            "metric": "creativity_score",
            "range": 12,
            "highest": 96,
            "lowest": 84,
            "average": 90.7
          }
        ]
      }
    }
  }
}
```

---

### 4. Quality Metrics APIs

#### GET /api/metrics/:responseId
**Purpose**: Calculate and retrieve quality metrics for a response
**Response**:
```json
{
  "success": true,
  "data": {
    "response_id": 1,
    "metrics": {
      "overall_quality": 94.2,
      "coherence_score": 92,
      "creativity_score": 96,
      "readability_score": 89,
      "completeness_score": 95,
      "factual_accuracy": 88,
      "relevance_score": 91,
      "engagement_score": 90,
      "technical_depth": 85
    },
    "detailed_analysis": {
      "coherence": {
        "score": 92,
        "explanation": "Text flows logically with clear connections between ideas",
        "suggestions": ["Consider adding more transitional phrases"]
      },
      "creativity": {
        "score": 96,
        "explanation": "Highly original content with creative metaphors and unique perspectives",
        "suggestions": ["Excellent creative expression"]
      }
    },
    "calculated_at": "2024-10-30T10:00:00.000Z",
    "processing_time": 1.2
  }
}
```

#### POST /api/metrics/batch
**Purpose**: Calculate metrics for multiple responses
**Request Body**:
```json
{
  "responses": [
    {
      "id": 1,
      "content": "Response content here...",
      "prompt": "Original prompt..."
    },
    {
      "id": 2,
      "content": "Another response...",
      "prompt": "Original prompt..."
    }
  ],
  "metrics_to_calculate": ["coherence", "creativity", "readability", "completeness"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "batch_metrics": [
      {
        "response_id": 1,
        "metrics": {
          "overall_quality": 94.2,
          "coherence_score": 92,
          "creativity_score": 96,
          "readability_score": 89,
          "completeness_score": 95
        }
      }
    ],
    "batch_summary": {
      "total_responses": 2,
      "average_quality": 91.5,
      "processing_time": 2.8,
      "quality_distribution": {
        "excellent": 1,
        "good": 1,
        "average": 0,
        "poor": 0
      }
    },
    "calculated_at": "2024-10-30T10:00:00.000Z"
  }
}
```

#### POST /api/metrics/compare
**Purpose**: Compare metrics across responses
**Request Body**:
```json
{
  "response_ids": [1, 2, 3],
  "comparison_type": "detailed", // "basic" or "detailed"
  "focus_metrics": ["creativity", "coherence"]
}
```

#### GET /api/metrics/trends
**Purpose**: Get quality metrics trends over time
**Query Parameters**:
- `period` (string): time period (24h, 7d, 30d, 90d)
- `metric` (string): specific metric to analyze
- `model` (string): filter by model
- `experiment_ids` (array): filter by experiments

**Response**:
```json
{
  "success": true,
  "data": {
    "trends": {
      "period": "7d",
      "metric": "overall_quality",
      "data_points": [
        {
          "date": "2024-10-24",
          "average_quality": 85.2,
          "response_count": 45
        },
        {
          "date": "2024-10-25",
          "average_quality": 87.1,
          "response_count": 52
        }
      ],
      "trend_analysis": {
        "direction": "improving",
        "change_percentage": 5.2,
        "peak_quality": 94.2,
        "low_quality": 72.1
      }
    }
  }
}
```

---

### 5. Batch Experiments APIs

#### POST /api/batch-experiments
**Purpose**: Create batch experiment with parameter combinations
**Request Body**:
```json
{
  "name": "Creative Writing Parameter Sweep",
  "description": "Testing multiple parameter combinations for creative writing",
  "prompt": "Write a creative short story about AI consciousness",
  "model": "gpt-4",
  "parameter_ranges": {
    "temperature": {
      "min": 0.1,
      "max": 1.0,
      "step": 0.1
    },
    "top_p": {
      "min": 0.7,
      "max": 1.0,
      "step": 0.1
    },
    "max_tokens": {
      "values": [500, 1000, 1500, 2000]
    }
  },
  "iterations_per_combination": 3,
  "priority": "normal", // "low", "normal", "high"
  "user_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "batch_experiment": {
      "id": 1,
      "name": "Creative Writing Parameter Sweep",
      "description": "Testing multiple parameter combinations for creative writing",
      "status": "queued",
      "total_combinations": 120,
      "completed_combinations": 0,
      "estimated_cost": 0.54,
      "estimated_duration": "45 minutes",
      "created_at": "2024-10-30T10:00:00.000Z",
      "priority": "normal",
      "parameter_combinations": [
        {
          "combination_id": 1,
          "temperature": 0.1,
          "top_p": 0.7,
          "max_tokens": 500
        }
      ]
    }
  },
  "message": "Batch experiment queued for processing"
}
```

#### GET /api/batch-experiments
**Purpose**: List all batch experiments
**Query Parameters**: (similar to experiments)

#### GET /api/batch-experiments/:id
**Purpose**: Get batch experiment details and progress
**Response**:
```json
{
  "success": true,
  "data": {
    "batch_experiment": {
      "id": 1,
      "name": "Creative Writing Parameter Sweep",
      "status": "running",
      "progress": 65,
      "total_combinations": 120,
      "completed_combinations": 78,
      "failed_combinations": 2,
      "current_combination": {
        "temperature": 0.8,
        "top_p": 0.9,
        "max_tokens": 1500
      },
      "results_summary": {
        "best_quality": 96.2,
        "average_quality": 87.5,
        "optimal_parameters": {
          "temperature": 0.8,
          "top_p": 0.9,
          "max_tokens": 1500
        }
      },
      "insights": [
        "Higher temperature (0.8-0.9) significantly improves creativity",
        "Top_p values above 0.85 show diminishing returns",
        "Sweet spot identified: temperature=0.8, top_p=0.9"
      ],
      "estimated_completion": "2024-10-30T11:30:00.000Z"
    }
  }
}
```

#### POST /api/batch-experiments/:id/control
**Purpose**: Control batch experiment execution (pause/resume/stop)
**Request Body**:
```json
{
  "action": "pause" // "pause", "resume", "stop"
}
```

#### GET /api/batch-experiments/:id/results
**Purpose**: Get detailed results from batch experiment
**Query Parameters**:
- `page`, `limit`: Pagination
- `sort_by`: Sort by quality, combination_id, etc.
- `min_quality`, `max_quality`: Quality filters

**Response**:
```json
{
  "success": true,
  "data": {
    "batch_id": 1,
    "results": [
      {
        "combination_id": 1,
        "parameters": {
          "temperature": 0.8,
          "top_p": 0.9,
          "max_tokens": 1500
        },
        "average_quality": 94.2,
        "responses": [
          {
            "iteration": 1,
            "quality": 96.2,
            "response_id": 445
          }
        ],
        "metrics_breakdown": {
          "coherence": 92,
          "creativity": 96,
          "readability": 89
        }
      }
    ],
    "analysis": {
      "parameter_correlations": {
        "temperature_creativity": 0.85,
        "top_p_coherence": 0.45
      },
      "optimal_ranges": {
        "temperature": [0.7, 0.9],
        "top_p": [0.8, 0.95]
      }
    }
  }
}
```

---

### 6. Advanced Analytics APIs

#### GET /api/analytics/dashboard
**Purpose**: Get dashboard analytics data
**Query Parameters**:
- `period` (string): time period
- `models` (array): filter by models
- `experiment_types` (array): filter by experiment types

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_experiments": 1247,
      "total_responses": 5640,
      "average_quality": 87.3,
      "quality_trend": 5.2,
      "active_models": 5,
      "total_cost": 234.56,
      "cost_trend": -12.3
    },
    "quality_trends": [
      {
        "date": "2024-10-29",
        "average_quality": 87.3,
        "experiment_count": 23
      }
    ],
    "model_performance": [
      {
        "model": "gpt-4",
        "average_quality": 89.2,
        "response_count": 2340,
        "cost_per_response": 0.009
      }
    ],
    "top_experiments": [
      {
        "id": 1,
        "name": "Creative Writing Analysis",
        "average_quality": 94.2,
        "response_count": 5
      }
    ],
    "parameter_insights": [
      {
        "parameter": "temperature",
        "optimal_value": 0.8,
        "correlation_with_quality": 0.75
      }
    ]
  }
}
```

#### GET /api/analytics/parameter-analysis
**Purpose**: Analyze parameter impact on quality
**Query Parameters**:
- `parameter` (string): specific parameter to analyze
- `model` (string): filter by model
- `date_range` (object): date range filter

#### GET /api/analytics/model-comparison
**Purpose**: Compare performance across different models
**Response**:
```json
{
  "success": true,
  "data": {
    "model_comparison": [
      {
        "model": "gpt-4",
        "metrics": {
          "average_quality": 89.2,
          "consistency": 0.92,
          "cost_efficiency": 0.85,
          "response_time": 2.3
        },
        "strengths": ["High creativity", "Excellent coherence"],
        "weaknesses": ["Higher cost", "Slower response time"]
      }
    ],
    "recommendation": {
      "best_overall": "gpt-4",
      "best_value": "gpt-3.5-turbo",
      "best_speed": "claude-instant"
    }
  }
}
```

---

### 7. Export & Data APIs

#### GET /api/export/:experimentId
**Purpose**: Export experiment data
**Query Parameters**:
- `format` (string): json, csv, xlsx
- `include_responses` (boolean): include full response content
- `include_metrics` (boolean): include quality metrics
- `date_range` (object): filter by date range

**Response** (JSON format):
```json
{
  "success": true,
  "data": {
    "experiment": {
      "id": 1,
      "name": "Creative Writing Analysis",
      "export_timestamp": "2024-10-30T10:00:00.000Z",
      "metadata": {
        "total_responses": 5,
        "average_quality": 89.5,
        "export_format": "json"
      }
    },
    "responses": [
      {
        "id": 1,
        "content": "Full response content...",
        "quality_metrics": {
          "overall_quality": 94.2,
          "coherence_score": 92
        },
        "parameters": {
          "temperature": 0.8,
          "top_p": 0.9
        }
      }
    ]
  }
}
```

#### POST /api/export/batch
**Purpose**: Export multiple experiments
**Request Body**:
```json
{
  "experiment_ids": [1, 2, 3],
  "format": "xlsx",
  "include_analysis": true,
  "compression": "zip"
}
```

#### GET /api/export/templates
**Purpose**: Get available export templates
**Response**:
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "basic",
        "name": "Basic Export",
        "description": "Experiment overview with key metrics",
        "fields": ["id", "name", "quality", "cost"]
      },
      {
        "id": "detailed",
        "name": "Detailed Analysis",
        "description": "Complete data with all metrics and responses",
        "fields": ["*"]
      }
    ]
  }
}
```

---

### 8. Model & Provider Management APIs

#### GET /api/models
**Purpose**: Get available models and providers
**Response**:
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "id": "openai",
        "name": "OpenAI",
        "status": "connected",
        "models": [
          {
            "id": "gpt-4",
            "name": "GPT-4",
            "context_window": 8192,
            "cost_per_token": 0.00003,
            "capabilities": ["text", "analysis"]
          },
          {
            "id": "gpt-3.5-turbo",
            "name": "GPT-3.5 Turbo",
            "context_window": 4096,
            "cost_per_token": 0.000002,
            "capabilities": ["text"]
          }
        ]
      }
    ],
    "current_provider": "openai",
    "current_model": "gpt-4"
  }
}
```

#### POST /api/models/switch
**Purpose**: Switch active model/provider
**Request Body**:
```json
{
  "provider": "openai",
  "model": "gpt-4"
}
```

#### GET /api/models/test-connection
**Purpose**: Test connection to current provider
**Response**:
```json
{
  "success": true,
  "data": {
    "provider": "openai",
    "status": "connected",
    "response_time": 0.85,
    "test_message": "Connection successful"
  }
}
```

---

### 9. User Management APIs (Future)

#### POST /api/auth/register
**Purpose**: User registration
**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "full_name": "John Doe"
}
```

#### POST /api/auth/login
**Purpose**: User authentication
**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

---

### 10. Datasets & Prompts Management APIs

#### GET /api/datasets
**Purpose**: Get available datasets and prompt libraries
**Response**:
```json
{
  "success": true,
  "data": {
    "datasets": [
      {
        "id": 1,
        "name": "Creative Writing Prompts",
        "description": "Collection of creative writing prompts",
        "prompt_count": 150,
        "category": "creative",
        "created_by": "system",
        "public": true
      }
    ],
    "categories": ["creative", "technical", "analytical", "conversational"]
  }
}
```

#### POST /api/datasets
**Purpose**: Create new dataset
**Request Body**:
```json
{
  "name": "Technical Documentation Prompts",
  "description": "Prompts for testing technical writing capabilities",
  "category": "technical",
  "prompts": [
    {
      "text": "Explain quantum computing in simple terms",
      "tags": ["quantum", "explanation", "simple"],
      "difficulty": "medium"
    }
  ],
  "public": false
}
```

#### GET /api/prompts/suggest
**Purpose**: Get prompt suggestions based on experiment type
**Query Parameters**:
- `category` (string): prompt category
- `difficulty` (string): easy, medium, hard
- `tags` (array): filter by tags

---

### 11. Real-time & WebSocket APIs

#### WebSocket /ws/experiments/:id
**Purpose**: Real-time updates for experiment progress
**Events**:
- `response_generated`: New response generated
- `quality_calculated`: Quality metrics calculated
- `experiment_completed`: Experiment finished
- `error_occurred`: Error in processing

#### WebSocket /ws/batch-experiments/:id
**Purpose**: Real-time updates for batch experiment progress
**Events**:
- `progress_update`: Progress percentage update
- `combination_completed`: Parameter combination finished
- `insights_generated`: New insights available

---

## Database Schema (Sequelize Models)

### 1. Users Table
```javascript
{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  full_name: DataTypes.STRING,
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user'
  },
  api_key: DataTypes.STRING,
  preferences: DataTypes.JSON,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}
```

### 2. Experiments Table
```javascript
{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  prompt: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  parameters: {
    type: DataTypes.JSON,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'running', 'completed', 'failed', 'paused'),
    defaultValue: 'pending'
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  response_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tags: DataTypes.JSON,
  metadata: DataTypes.JSON,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}
```

### 3. Responses Table
```javascript
{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  experiment_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'experiments',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  model: DataTypes.STRING,
  parameters: DataTypes.JSON,
  response_time: DataTypes.FLOAT,
  cost: DataTypes.DECIMAL(10, 6),
  token_count: DataTypes.INTEGER,
  status: {
    type: DataTypes.ENUM('pending', 'generating', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  error_message: DataTypes.TEXT,
  metadata: DataTypes.JSON,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}
```

### 4. Quality Metrics Table
```javascript
{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  response_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'responses',
      key: 'id'
    }
  },
  overall_quality: DataTypes.FLOAT,
  coherence_score: DataTypes.FLOAT,
  creativity_score: DataTypes.FLOAT,
  readability_score: DataTypes.FLOAT,
  completeness_score: DataTypes.FLOAT,
  factual_accuracy: DataTypes.FLOAT,
  relevance_score: DataTypes.FLOAT,
  engagement_score: DataTypes.FLOAT,
  technical_depth: DataTypes.FLOAT,
  detailed_analysis: DataTypes.JSON,
  calculation_method: DataTypes.STRING,
  processing_time: DataTypes.FLOAT,
  created_at: DataTypes.DATE
}
```

### 5. Batch Experiments Table
```javascript
{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  prompt: DataTypes.TEXT,
  model: DataTypes.STRING,
  parameter_ranges: DataTypes.JSON,
  total_combinations: DataTypes.INTEGER,
  completed_combinations: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  failed_combinations: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('queued', 'running', 'paused', 'completed', 'failed'),
    defaultValue: 'queued'
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high'),
    defaultValue: 'normal'
  },
  user_id: DataTypes.INTEGER,
  results_summary: DataTypes.JSON,
  insights: DataTypes.JSON,
  estimated_completion: DataTypes.DATE,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}
```

### 6. Datasets Table
```javascript
{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  category: DataTypes.STRING,
  user_id: DataTypes.INTEGER,
  public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  prompt_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  metadata: DataTypes.JSON,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}
```

### 7. Prompts Table
```javascript
{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dataset_id: DataTypes.INTEGER,
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tags: DataTypes.JSON,
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'medium'
  },
  category: DataTypes.STRING,
  expected_length: DataTypes.INTEGER,
  metadata: DataTypes.JSON,
  created_at: DataTypes.DATE
}
```

## Error Handling & Response Formats

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid experiment parameters",
    "details": {
      "field": "temperature",
      "value": 2.5,
      "expected": "Value between 0 and 2"
    },
    "timestamp": "2024-10-30T10:00:00.000Z",
    "request_id": "req_123456789"
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid request data
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `RATE_LIMITED`: Too many requests
- `LLM_SERVICE_ERROR`: External LLM service error
- `DATABASE_ERROR`: Database operation failed
- `INTERNAL_ERROR`: Internal server error

## Rate Limiting & Security

### Rate Limits
- General API: 100 requests per 15 minutes per IP
- Response generation: 10 requests per minute per user
- Batch operations: 5 requests per hour per user
- Export operations: 20 requests per hour per user

### Security Headers
- CORS configuration for frontend domain
- Helmet.js for security headers
- Rate limiting with express-rate-limit
- Input validation and sanitization
- SQL injection prevention with Sequelize ORM
- JWT authentication for protected routes

## Performance Considerations

### Caching Strategy
- Redis for frequently accessed experiments
- Response content caching for identical prompts
- Quality metrics caching
- API response caching for dashboard data

### Database Optimization
- Indexes on frequently queried fields
- Pagination for large datasets
- Connection pooling
- Query optimization

### Background Jobs
- Queue system for batch experiments
- Async quality metrics calculation
- Export file generation
- Email notifications

## Monitoring & Logging

### Metrics to Track
- API response times
- Error rates
- LLM service costs
- User activity patterns
- System resource usage

### Logging Requirements
- Request/response logging
- Error logging with stack traces
- Performance monitoring
- Security event logging
- Audit trails for data changes

This comprehensive API specification provides the foundation for building a robust backend that supports all the features visible in the frontend application, with room for future enhancements and scalability.
