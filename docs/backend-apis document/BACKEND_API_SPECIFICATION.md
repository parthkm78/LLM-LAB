# LLM-LAB Backend API Specification

## 📋 OVERVIEW

This document specifies all the backend APIs required to support the LLM-LAB frontend features. The APIs are organized by functional domains and include comprehensive request/response formats, error handling, and authentication requirements.

---

## 🏗️ BASE CONFIGURATION

### **API Base URL**
```
Production: https://api.llm-lab.com/api
Development: http://localhost:5000/api
```

### **Authentication**
All API requests require Bearer token authentication:
```http
Authorization: Bearer <your-jwt-token>
```

### **Standard Response Format**
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    details?: any;
  };
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    request_id: string;
  };
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}
```

---

## 🧪 1. EXPERIMENTS API

### **1.1 List All Experiments**
```http
GET /api/experiments
```

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 20): Items per page
- `search` (string): Search in name/description
- `type` (string): Filter by type (`single`, `batch`)
- `status` (string): Filter by status (`draft`, `running`, `completed`, `failed`)
- `model` (string): Filter by model
- `date_from` (string): Start date (ISO 8601)
- `date_to` (string): End date (ISO 8601)
- `sort_by` (string): Sort field (`created_at`, `quality`, `name`)
- `sort_order` (string): Sort order (`asc`, `desc`)

**Response:**
```json
{
  "success": true,
  "data": {
    "experiments": [
      {
        "id": 1,
        "name": "Response Quality  Optimization",
        "description": "Testing parameters for creative content generation",
        "type": "single",
        "status": "completed",
        "model": "gpt-4",
        "prompt": "Write a compelling short story...",
        "parameters": {
          "temperature": 0.8,
          "top_p": 0.9,
          "max_tokens": 1000,
          "frequency_penalty": 0.0,
          "presence_penalty": 0.0
        },
        "quality_score": 94.2,
        "response_count": 1,
        "total_cost": 0.023,
        "duration": "3.2s",
        "created_at": "2024-10-30T10:15:00Z",
        "updated_at": "2024-10-30T10:18:00Z",
        "tags": ["creative", "storytelling"],
        "favorited": true,
        "archived": false
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1247,
      "total_pages": 63,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

### **1.2 Get Experiment by ID**
```http
GET /api/experiments/:id
```

**Path Parameters:**
- `id` (number): Experiment ID

**Response:**
```json
{
  "success": true,
  "data": {
    "experiment": {
      "id": 1,
      "name": "Response Quality  Optimization",
      "description": "Testing parameters for creative content generation",
      "type": "single",
      "status": "completed",
      "model": "gpt-4",
      "prompt": "Write a compelling short story...",
      "parameters": {
        "temperature": 0.8,
        "top_p": 0.9,
        "max_tokens": 1000,
        "frequency_penalty": 0.0,
        "presence_penalty": 0.0
      },
      "parameter_ranges": {
        "temperature_min": 0.8,
        "temperature_max": 0.8,
        "temperature_step": 0.1,
        "top_p_min": 0.9,
        "top_p_max": 0.9,
        "top_p_step": 0.1
      },
      "quality_score": 94.2,
      "response_count": 1,
      "total_cost": 0.023,
      "duration": "3.2s",
      "created_at": "2024-10-30T10:15:00Z",
      "updated_at": "2024-10-30T10:18:00Z",
      "tags": ["creative", "storytelling"],
      "favorited": true,
      "archived": false,
      "responses": [
        {
          "id": 1,
          "content": "Once upon a time...",
          "quality_metrics": {
            "coherence": 92.1,
            "completeness": 94.5,
            "readability": 88.3,
            "creativity": 97.2,
            "specificity": 85.6,
            "length_appropriateness": 91.8
          },
          "response_time": 3200,
          "token_count": 456,
          "cost": 0.023
        }
      ]
    }
  }
}
```

### **1.3 Create New Experiment**
```http
POST /api/experiments
```

**Request Body:**
```json
{
  "name": "Response Quality  Test",
  "description": "Testing Response Quality  parameters",
  "type": "single",
  "model": "gpt-4",
  "prompt": "Write a short story about AI discovering emotions",
  "parameters": {
    "temperature": 0.8,
    "top_p": 0.9,
    "max_tokens": 1000,
    "frequency_penalty": 0.0,
    "presence_penalty": 0.0
  },
  "parameter_ranges": {
    "temperature_min": 0.1,
    "temperature_max": 1.0,
    "temperature_step": 0.1,
    "top_p_min": 0.1,
    "top_p_max": 1.0,
    "top_p_step": 0.1,
    "frequency_penalty_min": 0.0,
    "frequency_penalty_max": 0.0,
    "presence_penalty_min": 0.0,
    "presence_penalty_max": 0.0
  },
  "response_count": 1,
  "tags": ["creative", "test"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "experiment": {
      "id": 1248,
      "name": "Response Quality  Test",
      "status": "draft",
      "created_at": "2024-10-30T11:30:00Z"
      // ... full experiment object
    }
  }
}
```

### **1.4 Update Experiment**
```http
PUT /api/experiments/:id
```

**Request Body:** (Same as create, all fields optional)

### **1.5 Delete Experiment**
```http
DELETE /api/experiments/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Experiment deleted successfully",
    "deleted_id": 1248
  }
}
```

### **1.6 Get Experiment Statistics**
```http
GET /api/experiments/:id/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "experiment_id": 1,
    "overview": {
      "total_responses": 5,
      "average_quality": 87.3,
      "best_quality": 94.2,
      "worst_quality": 78.5,
      "total_cost": 0.156,
      "total_duration": "18.5s",
      "success_rate": 100
    },
    "quality_breakdown": {
      "coherence": { "average": 89.2, "best": 94.1, "worst": 82.3 },
      "completeness": { "average": 85.7, "best": 91.2, "worst": 78.9 },
      "readability": { "average": 88.1, "best": 92.5, "worst": 81.7 },
      "creativity": { "average": 91.8, "best": 97.2, "worst": 85.4 },
      "specificity": { "average": 83.9, "best": 88.7, "worst": 77.2 },
      "length_appropriateness": { "average": 87.4, "best": 92.1, "worst": 81.8 }
    },
    "parameter_performance": [
      {
        "parameters": { "temperature": 0.8, "top_p": 0.9 },
        "average_quality": 94.2,
        "response_count": 1
      }
    ]
  }
}
```

---

## 🤖 2. RESPONSES API

### **2.1 Generate Responses**
```http
POST /api/responses/generate
```

**Request Body:**
```json
{
  "experiment_id": 1,
  "specific_parameters": {
    "temperature": 0.8,
    "top_p": 0.9,
    "max_tokens": 1000,
    "frequency_penalty": 0.0,
    "presence_penalty": 0.0
  },
  "generate_all": false,
  "count": 1
}
```

**Response (Streaming):**
```
Content-Type: text/event-stream

data: {"progress": 0, "status": "starting", "experiment_id": 1}

data: {"progress": 25, "status": "generating", "current_response": 1, "total": 4}

data: {"progress": 100, "status": "completed", "results": [...]}
```

**Final Response:**
```json
{
  "success": true,
  "data": {
    "experiment_id": 1,
    "results": [
      {
        "id": 445,
        "content": "Once upon a time in a digital realm...",
        "parameters": {
          "temperature": 0.8,
          "top_p": 0.9,
          "max_tokens": 1000
        },
        "metrics": {
          "overall_quality": 94.2,
          "coherence": 92.1,
          "completeness": 94.5,
          "readability": 88.3,
          "creativity": 97.2,
          "specificity": 85.6,
          "length_appropriateness": 91.8
        },
        "performance": {
          "response_time": 3200,
          "token_count": 456,
          "cost": 0.023
        },
        "created_at": "2024-10-30T11:45:00Z"
      }
    ],
    "summary": {
      "total_generated": 1,
      "average_quality": 94.2,
      "total_cost": 0.023,
      "total_time": "3.2s"
    }
  }
}
```

### **2.2 Get Responses by Experiment**
```http
GET /api/responses/:experimentId
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `min_quality`, `max_quality`: Quality filters
- `sort_by`: Sort field (`quality`, `created_at`, `cost`)

### **2.3 Get Single Response**
```http
GET /api/responses/single/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": {
      "id": 445,
      "experiment_id": 1,
      "content": "Once upon a time...",
      "parameters": {...},
      "metrics": {...},
      "performance": {...},
      "created_at": "2024-10-30T11:45:00Z"
    }
  }
}
```

### **2.4 Compare Responses**
```http
POST /api/responses/compare
```

**Request Body:**
```json
{
  "response_ids": [445, 446, 447]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "comparison": {
      "responses": [
        {
          "id": 445,
          "content": "Response A content...",
          "metrics": {...},
          "parameters": {...}
        }
      ],
      "analysis": {
        "quality_differences": {
          "max_difference": 15.7,
          "average_difference": 8.3,
          "most_varied_metric": "creativity"
        },
        "parameter_impact": {
          "temperature": {
            "correlation_with_quality": 0.73,
            "impact_score": "high"
          }
        },
        "recommendations": [
          "Response 445 shows optimal balance of creativity and coherence",
          "Consider temperature around 0.8 for similar tasks"
        ]
      }
    }
  }
}
```

---

## 📊 3. BATCH EXPERIMENTS API

### **3.1 Create Batch Experiment**
```http
POST /api/batch-experiments
```

**Request Body:**
```json
{
  "name": "Response Quality  Parameter Sweep",
  "description": "Testing multiple parameter combinations for Response Quality ",
  "prompt": "Write a compelling short story about AI discovering emotions",
  "model": "gpt-4",
  "parameter_grid": {
    "temperature": {
      "min": 0.2,
      "max": 1.0,
      "step": 0.2
    },
    "top_p": {
      "min": 0.7,
      "max": 1.0,
      "step": 0.1
    },
    "max_tokens": 1000,
    "frequency_penalty": 0.0,
    "presence_penalty": 0.0
  },
  "responses_per_combination": 3,
  "priority": "normal"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batch_experiment": {
      "id": 42,
      "name": "Response Quality  Parameter Sweep",
      "status": "queued",
      "total_combinations": 20,
      "total_responses": 60,
      "estimated_cost": 2.34,
      "estimated_duration": "45m",
      "created_at": "2024-10-30T12:00:00Z",
      "queue_position": 3
    }
  }
}
```

### **3.2 Get Batch Experiment Status**
```http
GET /api/batch-experiments/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batch_experiment": {
      "id": 42,
      "name": "Response Quality  Parameter Sweep",
      "status": "running",
      "progress": {
        "completed_combinations": 12,
        "total_combinations": 20,
        "completed_responses": 36,
        "total_responses": 60,
        "percentage": 60,
        "current_combination": {
          "temperature": 0.6,
          "top_p": 0.9
        },
        "eta_minutes": 18
      },
      "results_preview": {
        "best_quality": 96.7,
        "average_quality": 87.3,
        "best_combination": {
          "temperature": 0.8,
          "top_p": 0.9,
          "quality": 96.7
        }
      },
      "insights": [
        "Higher temperature (0.8-0.9) significantly improves creativity",
        "Top_p values above 0.85 show diminishing returns",
        "Sweet spot identified: temperature=0.8, top_p=0.9"
      ],
      "estimated_completion": "2024-10-30T12:45:00Z"
    }
  }
}
```

### **3.3 Get Batch Experiment Results**
```http
GET /api/batch-experiments/:id/results
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `sort_by`: Sort by `quality`, `combination_id`, etc.
- `min_quality`, `max_quality`: Quality filters

**Response:**
```json
{
  "success": true,
  "data": {
    "batch_id": 42,
    "summary": {
      "total_combinations": 20,
      "completed_combinations": 20,
      "best_quality": 96.7,
      "average_quality": 87.3,
      "worst_quality": 72.1,
      "total_cost": 2.18,
      "total_duration": "42m"
    },
    "results": [
      {
        "combination_id": 1,
        "parameters": {
          "temperature": 0.8,
          "top_p": 0.9,
          "max_tokens": 1000
        },
        "average_quality": 96.7,
        "quality_std": 2.1,
        "responses": [
          {
            "iteration": 1,
            "response_id": 445,
            "quality": 96.2,
            "cost": 0.023
          },
          {
            "iteration": 2,
            "response_id": 446,
            "quality": 97.1,
            "cost": 0.024
          },
          {
            "iteration": 3,
            "response_id": 447,
            "quality": 96.8,
            "cost": 0.023
          }
        ],
        "metrics_breakdown": {
          "coherence": 94.2,
          "completeness": 96.1,
          "readability": 89.7,
          "creativity": 98.3,
          "specificity": 87.9,
          "length_appropriateness": 93.2
        },
        "performance": {
          "average_response_time": 3100,
          "total_cost": 0.07
        }
      }
    ],
    "analysis": {
      "best_parameters": {
        "temperature": 0.8,
        "top_p": 0.9
      },
      "parameter_correlations": {
        "temperature_vs_creativity": 0.87,
        "top_p_vs_diversity": 0.64
      },
      "insights": [
        "Temperature strongly correlates with creativity scores",
        "Optimal range: temperature 0.7-0.9, top_p 0.85-0.95"
      ]
    }
  }
}
```

### **3.4 List Batch Experiments**
```http
GET /api/batch-experiments
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batch_experiments": [
      {
        "id": 42,
        "name": "Response Quality  Parameter Sweep",
        "status": "completed",
        "progress": 100,
        "total_combinations": 20,
        "best_quality": 96.7,
        "created_at": "2024-10-30T12:00:00Z",
        "completed_at": "2024-10-30T12:42:00Z"
      }
    ]
  }
}
```

---

## 🎯 4. QUALITY METRICS API

### **4.1 Calculate Metrics for Response**
```http
GET /api/metrics/:responseId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response_id": 445,
    "metrics": {
      "overall_quality": 94.2,
      "coherence": 92.1,
      "completeness": 94.5,
      "readability": 88.3,
      "creativity": 97.2,
      "specificity": 85.6,
      "length_appropriateness": 91.8
    },
    "detailed_analysis": {
      "coherence": {
        "score": 92.1,
        "factors": {
          "logical_flow": 94.0,
          "consistency": 90.2,
          "transitions": 92.1
        },
        "feedback": "Strong logical progression with smooth transitions"
      },
      "creativity": {
        "score": 97.2,
        "factors": {
          "originality": 95.8,
          "vocabulary_diversity": 98.1,
          "narrative_innovation": 97.7
        },
        "feedback": "Highly creative with unique perspective and rich vocabulary"
      }
    },
    "calculated_at": "2024-10-30T11:45:30Z"
  }
}
```

### **4.2 Calculate Batch Metrics**
```http
POST /api/metrics/batch
```

**Request Body:**
```json
{
  "responses": [
    {
      "id": 445,
      "content": "Response content...",
      "prompt": "Original prompt..."
    }
  ]
}
```

### **4.3 Compare Metrics**
```http
POST /api/metrics/compare
```

**Request Body:**
```json
{
  "response_ids": [445, 446, 447]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "comparison": {
      "responses": [
        {
          "id": 445,
          "metrics": {...}
        }
      ],
      "comparative_analysis": {
        "metric_ranges": {
          "overall_quality": { "min": 82.1, "max": 94.2, "variance": 12.1 },
          "creativity": { "min": 89.3, "max": 97.2, "variance": 7.9 }
        },
        "rankings": {
          "by_overall_quality": [445, 447, 446],
          "by_creativity": [445, 446, 447]
        },
        "statistical_significance": {
          "quality_difference_significant": true,
          "p_value": 0.023
        }
      }
    }
  }
}
```

### **4.4 Get Quality Trends**
```http
GET /api/metrics/trends
```

**Query Parameters:**
- `period` (string): `7d`, `30d`, `90d`, `1y`
- `metric` (string): Specific metric to trend
- `experiment_type` (string): Filter by experiment type

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": {
      "period": "30d",
      "data_points": [
        {
          "date": "2024-10-01",
          "average_quality": 85.2,
          "experiment_count": 15,
          "top_metric": "creativity"
        }
      ],
      "summary": {
        "overall_trend": "improving",
        "trend_percentage": 5.7,
        "best_day": "2024-10-25",
        "worst_day": "2024-10-03"
      }
    }
  }
}
```

---

## 📈 5. ANALYTICS API

### **5.1 Dashboard Analytics**
```http
GET /api/analytics/dashboard
```

**Query Parameters:**
- `period` (string): Time period (`7d`, `30d`, `90d`)
- `models` (array): Filter by models
- `experiment_types` (array): Filter by experiment types

**Response:**
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
      "cost_trend": -12.3,
      "success_rate": 98.7,
      "experiments_today": 23
    },
    "quality_trends": [
      {
        "date": "2024-10-29",
        "average_quality": 87.3,
        "experiment_count": 23,
        "top_model": "gpt-4"
      }
    ],
    "model_performance": [
      {
        "model": "gpt-4",
        "average_quality": 89.2,
        "experiment_count": 567,
        "total_cost": 123.45,
        "avg_response_time": 2.8
      }
    ],
    "parameter_insights": {
      "optimal_ranges": {
        "temperature": { "min": 0.7, "max": 0.9 },
        "top_p": { "min": 0.85, "max": 0.95 }
      },
      "correlations": [
        {
          "parameter": "temperature",
          "metric": "creativity",
          "correlation": 0.87,
          "strength": "strong"
        }
      ]
    },
    "recent_activity": [
      {
        "type": "experiment_completed",
        "experiment_id": 1247,
        "name": "Response Quality  Test",
        "quality": 94.2,
        "timestamp": "2024-10-30T11:45:00Z"
      }
    ]
  }
}
```

### **5.2 Parameter Optimization Insights**
```http
GET /api/analytics/optimization
```

**Query Parameters:**
- `objective` (string): `quality`, `cost`, `speed`, `creativity`
- `constraints` (object): Parameter constraints

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "objective": "maximize_quality",
        "recommended_parameters": {
          "temperature": 0.8,
          "top_p": 0.9,
          "max_tokens": 1000
        },
        "expected_quality": 94.5,
        "confidence": 0.87,
        "based_on_experiments": 156
      }
    ],
    "parameter_sensitivity": {
      "temperature": {
        "impact_on_quality": 0.73,
        "optimal_range": [0.7, 0.9],
        "sensitivity": "high"
      }
    },
    "pareto_frontier": [
      {
        "parameters": {...},
        "quality": 94.2,
        "cost": 0.023,
        "speed": 3.2
      }
    ]
  }
}
```

### **5.3 Correlation Analysis**
```http
GET /api/analytics/correlations
```

**Response:**
```json
{
  "success": true,
  "data": {
    "correlations": {
      "parameter_quality": [
        {
          "parameter": "temperature",
          "quality_metric": "creativity",
          "correlation": 0.87,
          "p_value": 0.001,
          "significance": "highly_significant"
        }
      ],
      "cross_metrics": [
        {
          "metric_a": "coherence",
          "metric_b": "readability",
          "correlation": 0.76,
          "interpretation": "strong_positive"
        }
      ]
    },
    "insights": [
      "Higher temperature strongly correlates with creativity scores",
      "Coherence and readability show strong positive correlation"
    ]
  }
}
```

---

## 📝 6. RESPONSE COMPARISON API

### **6.1 Get All Responses for Comparison**
```http
GET /api/responses/comparison
```

**Query Parameters:**
- `search` (string): Search in content
- `models` (array): Filter by models
- `quality_min`, `quality_max`: Quality range
- `date_from`, `date_to`: Date range
- `tags` (array): Filter by tags
- `sort_by` (string): Sort field
- `page`, `limit`: Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "responses": [
      {
        "id": 445,
        "experiment_id": 1,
        "experiment_name": "Response Quality  Test",
        "content": "Once upon a time...",
        "content_preview": "Once upon a time in a digital realm...",
        "model": "gpt-4",
        "parameters": {...},
        "metrics": {
          "overall_quality": 94.2,
          "creativity": 97.2,
          "coherence": 92.1
        },
        "performance": {
          "response_time": 3200,
          "cost": 0.023,
          "token_count": 456
        },
        "created_at": "2024-10-30T11:45:00Z",
        "tags": ["creative", "storytelling"],
        "favorited": false
      }
    ]
  },
  "meta": {
    "pagination": {...},
    "filters_applied": {
      "quality_range": [80, 100],
      "models": ["gpt-4"]
    }
  }
}
```

### **6.2 Advanced Response Comparison**
```http
POST /api/responses/comparison/analyze
```

**Request Body:**
```json
{
  "response_ids": [445, 446, 447],
  "analysis_type": "comprehensive",
  "include_recommendations": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "comparison_analysis": {
      "responses": [...],
      "quality_analysis": {
        "best_overall": 445,
        "metric_leaders": {
          "creativity": 445,
          "coherence": 447,
          "readability": 446
        },
        "quality_distribution": {...}
      },
      "parameter_impact": {
        "temperature_effect": {
          "high_temp_responses": [445],
          "low_temp_responses": [447],
          "impact_on_creativity": "significant_positive"
        }
      },
      "content_analysis": {
        "length_comparison": [456, 523, 389],
        "vocabulary_diversity": [0.87, 0.74, 0.92],
        "sentiment_analysis": [0.82, 0.65, 0.78]
      },
      "recommendations": [
        "Response 445 shows optimal balance for creative tasks",
        "Consider temperature around 0.8 for similar prompts"
      ]
    }
  }
}
```

---

## 📋 7. EXPERIMENT HISTORY API

### **7.1 Get Experiment History**
```http
GET /api/experiments/history
```

**Query Parameters:**
- `search` (string): Search in name/description
- `type` (string): Filter by type
- `status` (string): Filter by status
- `date_from`, `date_to`: Date range
- `favorited` (boolean): Show only favorited
- `archived` (boolean): Include archived
- `sort_by` (string): Sort field
- `view_mode` (string): `list`, `timeline`, `grid`
- `page`, `limit`: Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "experiments": [
      {
        "id": 1,
        "name": "Response Quality  Optimization",
        "type": "single",
        "status": "completed",
        "model": "gpt-4",
        "quality_score": 94.2,
        "created_at": "2024-10-30T10:15:00Z",
        "tags": ["creative", "storytelling"],
        "favorited": true,
        "archived": false,
        "summary": {
          "response_count": 1,
          "total_cost": 0.023,
          "duration": "3.2s"
        }
      }
    ],
    "timeline_data": [
      {
        "date": "2024-10-30",
        "experiments": [1, 2, 3],
        "total_quality": 89.7,
        "experiment_count": 3
      }
    ]
  }
}
```

### **7.2 Bulk Operations**
```http
POST /api/experiments/bulk
```

**Request Body:**
```json
{
  "action": "favorite",
  "experiment_ids": [1, 2, 3],
  "params": {
    "favorited": true
  }
}
```

---

## 📤 8. EXPORT API

### **8.1 Export Experiment Data**
```http
GET /api/export/experiment/:id
```

**Query Parameters:**
- `format` (string): `json`, `csv`, `xlsx`, `pdf`
- `include_responses` (boolean): Include response content
- `include_metrics` (boolean): Include quality metrics

**Response:**
```json
{
  "success": true,
  "data": {
    "export_url": "https://api.llm-lab.com/downloads/experiment_1_20241030.json",
    "expires_at": "2024-10-31T11:45:00Z",
    "file_size": "2.4MB",
    "format": "json"
  }
}
```

### **8.2 Export Batch Data**
```http
POST /api/export/batch
```

**Request Body:**
```json
{
  "experiment_ids": [1, 2, 3],
  "format": "csv",
  "include_analysis": true
}
```

### **8.3 Generate Reports**
```http
POST /api/export/reports
```

**Request Body:**
```json
{
  "report_type": "quality_analysis",
  "experiment_ids": [1, 2, 3],
  "date_range": {
    "from": "2024-10-01",
    "to": "2024-10-31"
  },
  "format": "pdf"
}
```

---

## 🔧 9. MODEL MANAGEMENT API

### **9.1 List Available Models**
```http
GET /api/models
```

**Response:**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "gpt-4",
        "name": "GPT-4",
        "provider": "openai",
        "status": "active",
        "capabilities": ["text-generation", "analysis"],
        "cost_per_token": 0.00003,
        "max_tokens": 4096,
        "context_window": 8192
      }
    ]
  }
}
```

### **9.2 Model Performance Stats**
```http
GET /api/models/:id/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "model_id": "gpt-4",
    "statistics": {
      "total_requests": 1247,
      "average_quality": 89.2,
      "average_response_time": 2800,
      "total_cost": 156.78,
      "success_rate": 99.2
    }
  }
}
```

---

## ⚙️ 10. SYSTEM API

### **10.1 Health Check**
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-10-30T11:45:00Z",
    "version": "1.0.0",
    "services": {
      "database": "healthy",
      "llm_service": "healthy",
      "metrics_engine": "healthy"
    }
  }
}
```

### **10.2 System Statistics**
```http
GET /api/system/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "usage": {
      "total_experiments": 1247,
      "total_responses": 5640,
      "total_cost": 234.56,
      "active_users": 15
    },
    "performance": {
      "average_response_time": 2800,
      "success_rate": 98.7,
      "uptime": "99.9%"
    }
  }
}
```

---

## 🔐 ERROR HANDLING

### **Standard Error Codes**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (resource already exists)
- `422` - Unprocessable Entity (semantic errors)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error
- `503` - Service Unavailable

### **Error Response Format**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "temperature",
      "value": 3.0,
      "constraint": "must be between 0 and 2"
    }
  }
}
```

---

## 🚀 IMPLEMENTATION PRIORITIES

### **Phase 1 (Core APIs)**
1. Experiments CRUD
2. Response Generation
3. Quality Metrics
4. Basic Analytics

### **Phase 2 (Advanced Features)**
1. Batch Experiments
2. Advanced Analytics
3. Optimization APIs
4. Export/Reports

### **Phase 3 (Enhanced Features)**
1. Real-time Updates (WebSocket)
2. Advanced ML Models
3. Collaborative Features
4. API Rate Limiting & Caching