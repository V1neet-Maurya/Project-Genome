import fs from "fs";
import path from "path";

import Project from "../models/Project.js";
import CodeAnalysis from "../models/CodeAnalysis.js";

import {
  analyzeZipProject,
} from "../services/codeAnalyzer/analyzer.js";

import {
  reviewProjectWithAI,
} from "../services/ai/codeReviewService.js";

// =====================================================
// UPLOAD AND ANALYZE PROJECT
// =====================================================

export const uploadAndAnalyzeProject = async (
  req,
  res,
  next
) => {
  let extractDirectory = null;
  let uploadedFile = null;

  try {
    console.log("====================================");
    console.log("CODE ANALYSIS REQUEST");
    console.log("BODY:", req.body);
    console.log("QUERY:", req.query);
    console.log("FILE:", req.file);
    console.log("FILES:", req.files);
    console.log("====================================");

    // ==========================================
    // GET UPLOADED ZIP
    // ==========================================

    uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "Please upload a ZIP project",
      });
    }

    // ==========================================
    // CHECK ZIP EXTENSION
    // ==========================================

    const extension = path
      .extname(uploadedFile.originalname)
      .toLowerCase();

    if (extension !== ".zip") {
      return res.status(400).json({
        success: false,
        message: "Only ZIP files are allowed",
      });
    }

    // ==========================================
    // GET PROJECT ID
    // ==========================================

    const projectId =
      req.body?.project ||
      req.query?.project ||
      req.headers["x-project-id"];

    console.log(
      "FINAL PROJECT ID:",
      projectId
    );

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    // ==========================================
    // CHECK PROJECT ACCESS
    // ==========================================

    const projectExists =
      await Project.findOne({
        _id: projectId,
        $or: [
          {
            owner: req.user._id,
          },
          {
            "members.user": req.user._id,
          },
        ],
      });

    if (!projectExists) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this project",
      });
    }

    // ==========================================
    // ANALYZE ZIP
    // ==========================================

    console.log(
      "Analyzing ZIP:",
      uploadedFile.path
    );

    const analysis =
      await analyzeZipProject(
        uploadedFile.path
      );

    extractDirectory =
      analysis.extractDirectory;

    // ==========================================
    // LANGUAGES
    // ==========================================

    const languages =
      Object.entries(
        analysis.scanResult?.languages || {}
      ).map(([name, data]) => ({
        name,
        files: data.files,
        lines: data.lines,
      }));

    // ==========================================
    // QUALITY
    // ==========================================

    const qualityScore =
      analysis.quality?.score ?? 0;

    const qualityFindings =
      analysis.quality?.findings || [];

    // ==========================================
    // SECURITY
    // ==========================================

    const securityScore =
      analysis.security?.score ?? 0;

    const securityFindings =
      analysis.security?.findings || [];

    // ==========================================
    // TESTING
    // ==========================================

    const testingScore =
      analysis.testing?.score ?? 0;

    const testingFramework =
      analysis.testing?.framework || null;

    const totalTestFiles =
      analysis.testing?.totalTestFiles ?? 0;

    const totalTestCases =
      analysis.testing?.totalTestCases ?? 0;

    const testFiles =
      analysis.testing?.testFiles || [];

    const testingFindings =
      analysis.testing?.findings || [];

    // ==========================================
    // TEST EXECUTION RESULTS
    // ==========================================

    const testExecution =
      analysis.testExecution || {};

    const executed =
      testExecution.executed ?? false;

    const testTotal =
      testExecution.total ??
      totalTestCases;

    const passedTests =
      testExecution.passed ?? 0;

    const failedTests =
      testExecution.failed ?? 0;

    const testPassRate =
      testExecution.passRate ?? 0;

    const testCoverage =
      testExecution.coverage ?? 0;

    // ==========================================
    // ARCHITECTURE
    // ==========================================

    const architectureScore =
      analysis.architecture?.score ?? 0;

    const architectureDetails =
      analysis.architecture?.details ||
      analysis.architecture?.architecture ||
      {};

    const architectureFindings =
      analysis.architecture?.findings || [];

    // ==========================================
    // MAINTAINABILITY
    // ==========================================

    const maintainabilityScore =
      analysis.maintainability?.score ?? 0;

    const maintainabilityFindings =
      analysis.maintainability?.findings ||
      [];

    // ==========================================
    // DEPENDENCIES
    // ==========================================

    const dependencyScore =
      analysis.dependencies?.score ?? 0;

    const dependencyAnalysis =
      analysis.dependencies || {};

    const totalDependencies =
      dependencyAnalysis.totalDependencies ??
      dependencyAnalysis.totalPackages ??
      0;

    const productionDependencies =
      dependencyAnalysis.productionDependencies ??
      0;

    const developmentDependencies =
      dependencyAnalysis.developmentDependencies ??
      0;

    const dependencyManifests =
      dependencyAnalysis.manifests || [];

    const outdatedDependencies =
      dependencyAnalysis.outdated || [];

    const dependencyVulnerabilities =
      dependencyAnalysis.vulnerabilities || [];

    const dependencyFindings =
      dependencyAnalysis.findings || [];

    // ==========================================
    // PERFORMANCE
    // ==========================================

    const performanceScore =
      analysis.performance?.score ?? 0;

    const performanceFindings =
      analysis.performance?.findings || [];

    // ==========================================
    // DOCUMENTATION
    // ==========================================

    const documentationScore =
      analysis.documentation?.score ?? 0;

    const documentationFindings =
      analysis.documentation?.findings || [];

    const readmeFound =
      analysis.documentation?.readmeFound ??
      false;

    const environmentDocumentation =
      analysis.documentation
        ?.environmentDocumentation ??
      false;

    const apiDocumentation =
      analysis.documentation
        ?.apiDocumentation ??
      false;

    const commentPercentage =
      analysis.documentation
        ?.commentPercentage ??
      0;

    const documentationSourceFiles =
      analysis.documentation
        ?.sourceFiles ??
      0;

    const documentationFilesWithComments =
      analysis.documentation
        ?.filesWithComments ??
      0;

    // ==========================================
    // ENGINEERING SCORE
    // ==========================================

    const engineeringScore =
      analysis.engineeringScore ?? 0;

    // ==========================================
    // PROJECT HEALTH
    // ==========================================

    const projectHealth =
      analysis.projectHealth || {
        score: engineeringScore,
        status:
          engineeringScore >= 90
            ? "excellent"
            : engineeringScore >= 75
            ? "good"
            : engineeringScore >= 60
            ? "fair"
            : engineeringScore >= 40
            ? "poor"
            : "critical",
        strongAreas: [],
        weakAreas: [],
        highestRisk: null,
        recommendedAction:
          "Continue improving the project based on the detected findings.",
      };

    // ==========================================
    // AI REVIEW
    // ==========================================

    const aiReview =
      analysis.aiReview || {
        summary: "",
        strengths: [],
        weaknesses: [],
        criticalRisks: [],
        recommendations: [],
        architectureReview: "",
        securityReview: "",
        testingReview: "",
        performanceReview: "",
        documentationReview: "",
      };

    // ==========================================
    // COMBINE FINDINGS
    // ==========================================

    const allFindings = [
      ...qualityFindings,
      ...securityFindings,
      ...testingFindings,
      ...architectureFindings,
      ...maintainabilityFindings,
      ...dependencyFindings,
      ...performanceFindings,
      ...documentationFindings,
    ];

    // ==========================================
    // SAVE ANALYSIS
    // ==========================================

    const codeAnalysis =
      await CodeAnalysis.create({
        project: projectId,

        analyzedBy:
          req.user._id,

        repositoryName:
          uploadedFile.originalname,

        repositorySize:
          uploadedFile.size,

        totalFiles:
          analysis.scanResult?.totalFiles ??
          0,

        totalLines:
          analysis.scanResult?.totalLines ??
          0,

        languages,

        frameworks:
          analysis.projectInfo?.frameworks ||
          [],

        analysisVersion:
          "1.0.0",

        // ======================================
        // SCORES
        // ======================================

        scores: {
          overall:
            engineeringScore,

          codeQuality:
            qualityScore,

          security:
            securityScore,

          testing:
            testingScore,

          architecture:
            architectureScore,

          maintainability:
            maintainabilityScore,

          documentation:
            documentationScore,

          performance:
            performanceScore,

          dependencies:
            dependencyScore,
        },

        // ======================================
        // PROJECT HEALTH
        // ======================================

        projectHealth: {
          score:
            projectHealth.score ??
            engineeringScore,

          status:
            projectHealth.status ??
            (
              engineeringScore >= 90
                ? "excellent"
                : engineeringScore >= 75
                ? "good"
                : engineeringScore >= 60
                ? "fair"
                : engineeringScore >= 40
                ? "poor"
                : "critical"
            ),

          strongAreas:
            projectHealth.strongAreas ||
            [],

          weakAreas:
            projectHealth.weakAreas ||
            [],

          highestRisk:
            projectHealth.highestRisk ||
            null,

          recommendedAction:
            projectHealth.recommendedAction ||
            "",
        },

        // ======================================
        // DEPENDENCY ANALYSIS
        // ======================================

        dependencyAnalysis: {
          totalDependencies,

          productionDependencies,

          developmentDependencies,

          manifests:
            dependencyManifests,

          outdated:
            outdatedDependencies,

          vulnerabilities:
            dependencyVulnerabilities,
        },

        // ======================================
        // DOCUMENTATION ANALYSIS
        // ======================================

        documentationAnalysis: {
          sourceFiles:
            documentationSourceFiles,

          filesWithComments:
            documentationFilesWithComments,

          commentPercentage,

          readmeFound,

          environmentDocumentation,

          apiDocumentation,
        },

        // ======================================
        // TEST RESULTS
        // ======================================

        testResults: {
          framework:
            testingFramework,

          total:
            testTotal,

          passed:
            passedTests,

          failed:
            failedTests,

          accuracy:
            testPassRate,

          coverage:
            testCoverage,

          executed,

          output:
            testExecution.output || "",

          reason:
            testExecution.reason || null,
        },

        // ======================================
        // ANALYZERS
        // ======================================

        analyzers: {
          codeQuality: true,
          security: true,
          testing: true,
          architecture: true,
          performance: true,
          documentation: true,
          dependencies: true,
        },

        // ======================================
        // FINDINGS
        // ======================================

        findings:
          allFindings,

        // ======================================
        // AI REVIEW
        // ======================================

        aiReview: {
          summary:
            aiReview.summary || "",

          strengths:
            aiReview.strengths || [],

          weaknesses:
            aiReview.weaknesses || [],

          criticalRisks:
            aiReview.criticalRisks || [],

          recommendations:
            aiReview.recommendations || [],

          architectureReview:
            aiReview.architectureReview || "",

          securityReview:
            aiReview.securityReview || "",

          testingReview:
            aiReview.testingReview || "",

          performanceReview:
            aiReview.performanceReview || "",

          documentationReview:
            aiReview.documentationReview || "",
        },

        // ======================================
        // STATUS
        // ======================================

        status: "completed",
      });

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,

      message:
        "Project analyzed successfully",

      data: {
        analysis:
          codeAnalysis,

        engineeringScore,

        projectHealth,

        aiReview,

        detectedProject:
          analysis.projectInfo,

        statistics: {
          totalFiles:
            analysis.scanResult?.totalFiles ??
            0,

          totalLines:
            analysis.scanResult?.totalLines ??
            0,

          languages,
        },

        quality: {
          score:
            qualityScore,

          findings:
            qualityFindings,
        },

        security: {
          score:
            securityScore,

          findings:
            securityFindings,
        },

        testing: {
          score:
            testingScore,

          framework:
            testingFramework,

          totalTestFiles,

          totalTestCases,

          passedTests,

          failedTests,

          passRate:
            testPassRate,

          coverage:
            testCoverage,

          testFiles,

          findings:
            testingFindings,
        },

        architecture: {
          score:
            architectureScore,

          details:
            architectureDetails,

          findings:
            architectureFindings,
        },

        maintainability: {
          score:
            maintainabilityScore,

          findings:
            maintainabilityFindings,
        },

        dependencies: {
          score:
            dependencyScore,

          totalDependencies,

          productionDependencies,

          developmentDependencies,

          manifests:
            dependencyManifests,

          outdated:
            outdatedDependencies,

          vulnerabilities:
            dependencyVulnerabilities,

          findings:
            dependencyFindings,
        },

        performance: {
          score:
            performanceScore,

          findings:
            performanceFindings,
        },

        documentation: {
          score:
            documentationScore,

          readmeFound,

          environmentDocumentation,

          apiDocumentation,

          commentPercentage,

          sourceFiles:
            documentationSourceFiles,

          filesWithComments:
            documentationFilesWithComments,

          findings:
            documentationFindings,
        },

        analyzers: {
          codeQuality: true,
          security: true,
          testing: true,
          architecture: true,
          performance: true,
          documentation: true,
          dependencies: true,
        },
      },
    });
  } catch (error) {
    console.error(
      "===================================="
    );

    console.error(
      "CODE ANALYSIS ERROR:"
    );

    console.error(error);

    console.error(
      "===================================="
    );

    next(error);
  } finally {
    // ==========================================
    // DELETE TEMPORARY ZIP
    // ==========================================

    if (
      uploadedFile?.path &&
      fs.existsSync(
        uploadedFile.path
      )
    ) {
      try {
        fs.unlinkSync(
          uploadedFile.path
        );

        console.log(
          "Temporary ZIP deleted."
        );
      } catch (error) {
        console.error(
          "ZIP cleanup error:",
          error
        );
      }
    }

    // ==========================================
    // DELETE EXTRACTED DIRECTORY
    // ==========================================

    if (
      extractDirectory &&
      fs.existsSync(
        extractDirectory
      )
    ) {
      try {
        fs.rmSync(
          extractDirectory,
          {
            recursive: true,
            force: true,
          }
        );

        console.log(
          "Temporary extracted directory deleted."
        );
      } catch (error) {
        console.error(
          "Extract directory cleanup error:",
          error
        );
      }
    }
  }
};

// ==========================================
// GET ALL CODE ANALYSES
// ==========================================

export const getCodeAnalyses = async (
  req,
  res,
  next
) => {
  try {
    const analyses =
      await CodeAnalysis.find({
        analyzedBy:
          req.user._id,
      })
        .populate(
          "project",
          "name description"
        )
        .populate(
          "analyzedBy",
          "firstName lastName email"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET SINGLE CODE ANALYSIS
// ==========================================

export const getCodeAnalysisById =
  async (
    req,
    res,
    next
  ) => {
    try {
      const analysis =
        await CodeAnalysis.findOne({
          _id:
            req.params.id,

          analyzedBy:
            req.user._id,
        })
          .populate(
            "project",
            "name description"
          )
          .populate(
            "analyzedBy",
            "firstName lastName email"
          );

      if (!analysis) {
        return res.status(404).json({
          success: false,
          message:
            "Code analysis not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  };

// ==========================================
// GET PROJECT ANALYSIS HISTORY
// ==========================================

export const getProjectCodeAnalyses =
  async (
    req,
    res,
    next
  ) => {
    try {
      const project =
        await Project.findOne({
          _id:
            req.params.projectId,

          $or: [
            {
              owner:
                req.user._id,
            },
            {
              "members.user":
                req.user._id,
            },
          ],
        });

      if (!project) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this project",
        });
      }

      const analyses =
        await CodeAnalysis.find({
          project:
            req.params.projectId,
        })
          .populate(
            "analyzedBy",
            "firstName lastName email"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        count: analyses.length,
        data: analyses,
      });
    } catch (error) {
      next(error);
    }
  };

// ==========================================
// DELETE CODE ANALYSIS
// ==========================================

export const deleteCodeAnalysis =
  async (
    req,
    res,
    next
  ) => {
    try {
      const analysis =
        await CodeAnalysis.findOne({
          _id:
            req.params.id,

          analyzedBy:
            req.user._id,
        });

      if (!analysis) {
        return res.status(404).json({
          success: false,
          message:
            "Code analysis not found",
        });
      }

      await CodeAnalysis.findByIdAndDelete(
        analysis._id
      );

      return res.status(200).json({
        success: true,
        message:
          "Code analysis deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

// ==========================================
// GENERATE AI CODE REVIEW
// ==========================================

export const generateAIReview =
  async (
    req,
    res,
    next
  ) => {
    try {
      const analysis =
        await CodeAnalysis.findOne({
          _id:
            req.params.id,

          analyzedBy:
            req.user._id,
        }).populate(
          "project",
          "name description technologies"
        );

      if (!analysis) {
        return res.status(404).json({
          success: false,
          message:
            "Code analysis not found",
        });
      }

      const projectInfo = {
        name:
          analysis.project?.name ||
          analysis.repositoryName,

        description:
          analysis.project?.description ||
          "",

        technologies:
          analysis.project?.technologies ||
          [],

        repositoryName:
          analysis.repositoryName,

        totalFiles:
          analysis.totalFiles,

        totalLines:
          analysis.totalLines,

        languages:
          analysis.languages || [],

        frameworks:
          analysis.frameworks || [],
      };

      const aiReview =
        await reviewProjectWithAI({
          projectInfo,

          scores:
            analysis.scores,

          findings:
            analysis.findings || [],

          testResults:
            analysis.testResults || {},
        });

      analysis.aiReview =
        aiReview;

      await analysis.save();

      return res.status(200).json({
        success: true,

        message:
          "AI review generated successfully",

        data: {
          analysisId:
            analysis._id,

          aiReview:
            analysis.aiReview,
        },
      });
    } catch (error) {
      console.error(
        "AI REVIEW ERROR:",
        error
      );

      next(error);
    }
  };

// ==========================================
// COMPARE CODE ANALYSES
// ==========================================

export const compareAnalyses = async (
  req,
  res,
  next
) => {
  try {
    const {
      previousId,
      currentId,
    } = req.body || {};

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!previousId || !currentId) {
      return res.status(400).json({
        success: false,
        message:
          "previousId and currentId are required",
      });
    }

    if (previousId === currentId) {
      return res.status(400).json({
        success: false,
        message:
          "Previous and current analysis must be different",
      });
    }

    // ==========================================
    // GET PREVIOUS ANALYSIS
    // ==========================================

    const previous =
      await CodeAnalysis.findOne({
        _id: previousId,
        analyzedBy:
          req.user._id,
      }).lean();

    if (!previous) {
      return res.status(404).json({
        success: false,
        message:
          "Previous code analysis not found",
      });
    }

    // ==========================================
    // GET CURRENT ANALYSIS
    // ==========================================

    const current =
      await CodeAnalysis.findOne({
        _id: currentId,
        analyzedBy:
          req.user._id,
      }).lean();

    if (!current) {
      return res.status(404).json({
        success: false,
        message:
          "Current code analysis not found",
      });
    }

    // ==========================================
    // CHECK SAME PROJECT
    // ==========================================

    if (
      previous.project?.toString() !==
      current.project?.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Analyses must belong to the same project",
      });
    }

    // ==========================================
    // CHECK PROJECT ACCESS
    // ==========================================

    const project =
      await Project.findOne({
        _id: previous.project,

        $or: [
          {
            owner:
              req.user._id,
          },
          {
            "members.user":
              req.user._id,
          },
        ],
      }).lean();

    if (!project) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this project",
      });
    }

    // ==========================================
    // SCORE CATEGORIES
    // ==========================================

    const categories = [
      "overall",
      "codeQuality",
      "security",
      "testing",
      "architecture",
      "maintainability",
      "documentation",
      "performance",
      "dependencies",
    ];

    // ==========================================
    // BUILD COMPARISON
    // ==========================================

    const comparison =
      categories.map(
        (category) => {
          const oldScore =
            previous.scores?.[
              category
            ] ?? 0;

          const newScore =
            current.scores?.[
              category
            ] ?? 0;

          return {
            category,

            previous:
              oldScore,

            current:
              newScore,

            change:
              newScore -
              oldScore,
          };
        }
      );

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      data: {
        previous: {
          id:
            previous._id,

          repositoryName:
            previous.repositoryName,

          createdAt:
            previous.createdAt,

          overallScore:
            previous.scores?.overall ??
            0,
        },

        current: {
          id:
            current._id,

          repositoryName:
            current.repositoryName,

          createdAt:
            current.createdAt,

          overallScore:
            current.scores?.overall ??
            0,
        },

        comparison,
      },
    });
  } catch (error) {
    console.error(
      "COMPARE CODE ANALYSES ERROR:",
      error
    );

    next(error);
  }
};

// ==========================================
// GENERATE AI FIX SUGGESTION
// ==========================================

export const generateFixSuggestion =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        category,
        severity,
        title,
        description,
        file,
        line,
        suggestion,
        code,
      } = req.body || {};

      // ==========================================
      // VALIDATION
      // ==========================================

      if (
        !title?.trim() ||
        !description?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Finding title and description are required",
        });
      }

      // ==========================================
      // BUILD FIX PROMPT
      // ==========================================

      const fixPrompt = `
You are Genome AI, an expert software
engineering assistant.

Analyze this CodeLab finding.

Category:
${category || "unknown"}

Severity:
${severity || "unknown"}

Title:
${title}

Description:
${description}

File:
${file || "unknown"}

Line:
${line || "unknown"}

Existing suggestion:
${suggestion || "none"}

Relevant code:
${code || "Code snippet not provided"}

Provide:

1. Explanation
2. Root cause
3. Recommended fix
4. Corrected code example
5. Verification steps
6. Priority

Do not invent project-specific information.

Clearly state when additional context is required.
`;

      // ==========================================
      // RESPONSE
      // ==========================================

      return res.status(200).json({
        success: true,

        message:
          "Fix suggestion prepared successfully",

        data: {
          prompt: fixPrompt,

          finding: {
            category:
              category || "unknown",

            severity:
              severity || "unknown",

            title:
              title.trim(),

            description:
              description.trim(),

            file:
              file || null,

            line:
              line || null,

            suggestion:
              suggestion || null,
          },
        },
      });
    } catch (error) {
      console.error(
        "GENERATE FIX SUGGESTION ERROR:",
        error
      );

      next(error);
    }
  };