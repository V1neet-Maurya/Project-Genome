import mongoose from "mongoose";

const codeAnalysisSchema = new mongoose.Schema(
  {
    // ==========================================
    // PROJECT
    // ==========================================

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    analyzedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    repositoryName: {
      type: String,
      required: true,
      trim: true,
    },

    repositorySize: {
      type: Number,
      default: 0,
    },

    totalFiles: {
      type: Number,
      default: 0,
    },

    totalLines: {
      type: Number,
      default: 0,
    },

    languages: [
      {
        name: String,
        files: Number,
        lines: Number,
      },
    ],

    frameworks: [
      {
        type: String,
      },
    ],

    // ==========================================
    // ANALYSIS METADATA
    // ==========================================

    analysisVersion: {
      type: String,
      default: "1.0.0",
    },

    analyzers: {
      codeQuality: {
        type: Boolean,
        default: false,
      },

      security: {
        type: Boolean,
        default: false,
      },

      testing: {
        type: Boolean,
        default: false,
      },

      architecture: {
        type: Boolean,
        default: false,
      },

      performance: {
        type: Boolean,
        default: false,
      },

      documentation: {
        type: Boolean,
        default: false,
      },

      dependencies: {
        type: Boolean,
        default: false,
      },
    },

    // ==========================================
    // SCORES
    // ==========================================

    scores: {
      overall: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      codeQuality: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      security: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      testing: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      architecture: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      maintainability: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      documentation: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      performance: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      dependencies: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },

    // ==========================================
    // PROJECT HEALTH
    // ==========================================

    projectHealth: {
      score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      status: {
        type: String,
        enum: [
          "excellent",
          "good",
          "fair",
          "poor",
          "critical",
        ],
        default: "critical",
      },

      strongAreas: [
        {
          category: {
            type: String,
            default: "",
          },

          score: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
          },
        },
      ],

      weakAreas: [
        {
          category: {
            type: String,
            default: "",
          },

          score: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
          },
        },
      ],

      highestRisk: {
        severity: {
          type: String,
          default: null,
        },

        count: {
          type: Number,
          default: 0,
        },

        title: {
          type: String,
          default: null,
        },
      },

      recommendedAction: {
        type: String,
        default: "",
      },
    },

    // ==========================================
    // DEPENDENCY ANALYSIS
    // ==========================================

    dependencyAnalysis: {
      totalDependencies: {
        type: Number,
        default: 0,
      },

      productionDependencies: {
        type: Number,
        default: 0,
      },

      developmentDependencies: {
        type: Number,
        default: 0,
      },

      manifests: [
        {
          ecosystem: {
            type: String,
          },

          manifest: {
            type: String,
          },

          packageName: {
            type: String,
            default: null,
          },

          dependencyCount: {
            type: Number,
            default: 0,
          },

          productionCount: {
            type: Number,
            default: 0,
          },

          developmentCount: {
            type: Number,
            default: 0,
          },

          dependencies: [
            {
              name: {
                type: String,
              },

              version: {
                type: String,
              },

              type: {
                type: String,
                enum: [
                  "production",
                  "development",
                ],
              },
            },
          ],
        },
      ],

      outdated: [
        {
          name: String,
          currentVersion: String,
          latestVersion: String,
        },
      ],

      vulnerabilities: [
        {
          name: String,
          severity: String,
          description: String,
        },
      ],
    },

    // ==========================================
    // DOCUMENTATION ANALYSIS
    // ==========================================

    documentationAnalysis: {
      sourceFiles: {
        type: Number,
        default: 0,
      },

      filesWithComments: {
        type: Number,
        default: 0,
      },

      commentPercentage: {
        type: Number,
        default: 0,
      },

      readmeFound: {
        type: Boolean,
        default: false,
      },

      environmentDocumentation: {
        type: Boolean,
        default: false,
      },

      apiDocumentation: {
        type: Boolean,
        default: false,
      },
    },

    // ==========================================
    // FINDINGS
    // ==========================================

    findings: [
      {
        category: {
          type: String,
          enum: [
            "quality",
            "security",
            "testing",
            "architecture",
            "performance",
            "documentation",
            "dependency",
          ],
        },

        severity: {
          type: String,
          enum: [
            "critical",
            "high",
            "medium",
            "low",
            "info",
          ],
        },

        title: String,

        description: String,

        file: String,

        line: Number,

        suggestion: String,
      },
    ],

    // ==========================================
    // TEST RESULTS
    // ==========================================

    testResults: {
      framework: {
        type: String,
        default: null,
      },

      total: {
        type: Number,
        default: 0,
      },

      passed: {
        type: Number,
        default: 0,
      },

      failed: {
        type: Number,
        default: 0,
      },

      accuracy: {
        type: Number,
        default: 0,
      },

      coverage: {
        type: Number,
        default: 0,
      },

      // ========================================
      // REAL TEST EXECUTION
      // ========================================

      executed: {
        type: Boolean,
        default: false,
      },

      output: {
        type: String,
        default: "",
        maxlength: 10000,
      },

      reason: {
        type: String,
        default: null,
      },
    },

    // ==========================================
    // AI REVIEW
    // ==========================================

    aiReview: {
      summary: {
        type: String,
        default: "",
      },

      strengths: {
        type: [String],
        default: [],
      },

      weaknesses: {
        type: [String],
        default: [],
      },

      criticalRisks: {
        type: [
          {
            title: {
              type: String,
              default: "",
            },

            severity: {
              type: String,
              default: "",
            },

            reason: {
              type: String,
              default: "",
            },
          },
        ],
        default: [],
      },

      recommendations: {
        type: [
          {
            title: {
              type: String,
              default: "",
            },

            priority: {
              type: String,
              default: "",
            },

            reason: {
              type: String,
              default: "",
            },

            action: {
              type: String,
              default: "",
            },
          },
        ],
        default: [],
      },

      architectureReview: {
        type: String,
        default: "",
      },

      securityReview: {
        type: String,
        default: "",
      },

      testingReview: {
        type: String,
        default: "",
      },

      performanceReview: {
        type: String,
        default: "",
      },

      documentationReview: {
        type: String,
        default: "",
      },
    },

    // ==========================================
    // STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "uploaded",
        "analyzing",
        "completed",
        "failed",
      ],
      default: "uploaded",
    },
  },
  {
    timestamps: true,
  }
);

const CodeAnalysis = mongoose.model(
  "CodeAnalysis",
  codeAnalysisSchema
);

export default CodeAnalysis;