import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

// ==========================================
// ZIP SECURITY VALIDATION
// ==========================================

const validateZipEntries = (zip) => {
  const entries = zip.getEntries();

  const MAX_FILES = 5000;
  const MAX_UNCOMPRESSED_SIZE = 200 * 1024 * 1024; // 200 MB

  // ------------------------------------------
  // MAX FILE COUNT
  // ------------------------------------------

  if (entries.length > MAX_FILES) {
    throw new Error(
      "ZIP contains too many files. Maximum allowed is 5000."
    );
  }

  let totalSize = 0;

  // ------------------------------------------
  // VALIDATE EVERY ENTRY
  // ------------------------------------------

  for (const entry of entries) {
    const entryName = String(entry.entryName || "").replace(
      /\\/g,
      "/"
    );

    // ----------------------------------------
    // EMPTY / INVALID ENTRY
    // ----------------------------------------

    if (!entryName) {
      throw new Error("ZIP contains an invalid empty entry.");
    }

    // ----------------------------------------
    // PATH TRAVERSAL PROTECTION
    // ----------------------------------------

    if (
      entryName.startsWith("/") ||
      entryName.includes("../") ||
      entryName.includes("/..") ||
      /^[A-Za-z]:/.test(entryName)
    ) {
      throw new Error(
        "Unsafe ZIP path detected."
      );
    }

    // ----------------------------------------
    // UNCOMPRESSED SIZE LIMIT
    // ----------------------------------------

    if (!entry.isDirectory) {
      const entrySize =
        Number(entry.header?.size) || 0;

      totalSize += entrySize;

      if (totalSize > MAX_UNCOMPRESSED_SIZE) {
        throw new Error(
          "ZIP expands beyond the maximum allowed size of 200 MB."
        );
      }
    }
  }

  return entries;
};

// ==========================================
// ANALYZERS
// ==========================================

import { scanProject } from "./fileScanner.js";
import { detectProject } from "./projectDetector.js";
import { analyzeCodeQuality } from "./qualityAnalyzer.js";
import { analyzeSecurity } from "./securityAnalyzer.js";
import { analyzeTesting } from "./testingAnalyzer.js";
import { analyzeArchitecture } from "./architectureAnalyzer.js";
import { analyzeDependencies } from "./dependencyAnalyzer.js";
import { analyzePerformance } from "./performanceAnalyzer.js";
import { analyzeDocumentation } from "./documentationAnalyzer.js";
import { analyzeProjectHealth } from "./healthAnalyzer.js";

// ==========================================
// SCORING ENGINE
// ==========================================

import {
  calculateQualityScore,
  calculateSecurityScore,
  calculateTestingScore,
  calculateDependencyScore,
  calculateEngineeringScore,
  calculateMaintainabilityScore,
} from "./scoringEngine.js";

// ==========================================
// TEST RUNNER
// ==========================================

import { runProjectTests } from "./testRunner.js";

// ==========================================
// GENOME AI REPOSITORY REVIEW
// ==========================================

import {
  generateRepositoryReview,
} from "../ai/assistantService.js";

// ==========================================
// ANALYZE ZIP PROJECT
// ==========================================

export const analyzeZipProject = async (zipPath) => {
  const extractDirectory = path.join(
    process.cwd(),
    "temp",
    `analysis-${Date.now()}`
  );

  fs.mkdirSync(extractDirectory, {
    recursive: true,
  });

  try {
    // ==========================================
    // EXTRACT ZIP
    // ==========================================

    const zip = new AdmZip(zipPath);

    // SECURITY CHECK BEFORE EXTRACTION
    validateZipEntries(zip);

    zip.extractAllTo(
      extractDirectory,
      true
    );

    // ==========================================
    // FIND PROJECT DIRECTORY
    // ==========================================

    const entries = fs.readdirSync(
      extractDirectory,
      {
        withFileTypes: true,
      }
    );

    let projectDirectory =
      extractDirectory;

    if (
      entries.length === 1 &&
      entries[0].isDirectory()
    ) {
      projectDirectory = path.join(
        extractDirectory,
        entries[0].name
      );
    }

    // ==========================================
    // PROJECT DETECTION
    // ==========================================

    const projectInfo =
      detectProject(
        projectDirectory
      );

    // ==========================================
    // FILE SCAN
    // ==========================================

    const scanResult =
      scanProject(
        projectDirectory
      );

    // ==========================================
    // CODE QUALITY
    // ==========================================

    const qualityFindings =
      analyzeCodeQuality(
        projectDirectory,
        scanResult.files
      );

    const qualityScore =
      calculateQualityScore(
        qualityFindings
      );

    // ==========================================
    // SECURITY
    // ==========================================

    const securityFindings =
      analyzeSecurity(
        projectDirectory,
        scanResult.files
      );

    const securityScore =
      calculateSecurityScore(
        securityFindings
      );

    // ==========================================
    // TESTING ANALYSIS
    // ==========================================

    const testing =
      analyzeTesting(
        projectDirectory,
        scanResult.files
      );

    // ==========================================
    // EXECUTE TEST SUITE
    // ==========================================

    let testExecution = {
      executed: false,
      total: 0,
      passed: 0,
      failed: 0,
      passRate: 0,
      coverage: 0,
      output: "",
      reason: null,
    };

    if (testing?.framework) {
      try {
        testExecution =
          await runProjectTests({
            projectDirectory,
            framework:
              testing.framework,
          });
      } catch (error) {
        console.error(
          "Test execution failed:",
          error
        );

        testExecution = {
          executed: false,
          total:
            testing.totalTestCases || 0,
          passed: 0,
          failed: 0,
          passRate: 0,
          coverage: 0,
          output: "",
          reason:
            error?.message ||
            "Test execution failed",
        };
      }
    }

    // ==========================================
    // TESTING SCORE
    // ==========================================

    const testingScore =
      calculateTestingScore({
        totalFiles:
          scanResult.totalFiles,

        totalTestFiles:
          testing.totalTestFiles,

        totalTestCases:
          testing.totalTestCases,

        passedTests:
          testExecution.passed,

        failedTests:
          testExecution.failed,

        coverage:
          testExecution.coverage,
      });

    // ==========================================
    // ARCHITECTURE
    // ==========================================

    const architecture =
      analyzeArchitecture(
        projectDirectory,
        projectInfo,
        scanResult.files
      );

    const architectureScore =
      architecture?.score ?? 0;

    // ==========================================
    // DEPENDENCIES
    // ==========================================

    const dependencies =
      analyzeDependencies(
        projectDirectory,
        scanResult.files
      );

    const dependencyScore =
      calculateDependencyScore({
        totalDependencies:
          dependencies.totalDependencies ??
          0,

        outdated:
          dependencies.outdated?.length ??
          0,

        vulnerabilities:
          dependencies.vulnerabilities
            ?.length ?? 0,
      });

    // ==========================================
    // PERFORMANCE
    // ==========================================

    const performance =
      analyzePerformance(
        projectDirectory,
        scanResult.files
      );

    // ==========================================
    // DOCUMENTATION
    // ==========================================

    const documentation =
      analyzeDocumentation(
        projectDirectory,
        scanResult.files
      );

    // ==========================================
    // MAINTAINABILITY
    // ==========================================

    const maintainabilityScore =
      calculateMaintainabilityScore({
        qualityScore,

        architectureScore,

        totalFiles:
          scanResult.totalFiles,

        totalLines:
          scanResult.totalLines,

        findings:
          qualityFindings,
      });

    // ==========================================
    // COMBINE ALL FINDINGS
    // ==========================================

    const findings = [
      ...(qualityFindings || []),
      ...(securityFindings || []),
      ...(testing?.findings || []),
      ...(architecture?.findings || []),
      ...(dependencies?.findings || []),
      ...(performance?.findings || []),
      ...(documentation?.findings || []),
    ];

    // ==========================================
    // ENGINEERING SCORE
    // ==========================================

    const engineeringScore =
      calculateEngineeringScore({
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

        dependencies:
          dependencyScore,

        performance:
          performance?.score ?? 0,

        documentation:
          documentation?.score ?? 0,
      });

    // ==========================================
    // PROJECT HEALTH
    // ==========================================

    const projectHealth =
      analyzeProjectHealth({
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
            documentation?.score ?? 0,

          performance:
            performance?.score ?? 0,

          dependencies:
            dependencyScore,
        },

        findings,
      });

    // ==========================================
    // AI REPOSITORY REVIEW
    // ==========================================

    let aiReview = {
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

    try {
      const repositoryName =
        projectInfo?.repositoryName ||
        projectInfo?.name ||
        path.basename(
          projectDirectory
        );

      aiReview =
        await generateRepositoryReview({
          repositoryName,

          languages:
            scanResult?.languages ||
            projectInfo?.languages ||
            [],

          frameworks:
            scanResult?.frameworks ||
            projectInfo?.frameworks ||
            [],

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
              documentation?.score ?? 0,

            performance:
              performance?.score ?? 0,

            dependencies:
              dependencyScore,
          },

          findings,

          dependencyAnalysis:
            dependencies || {},

          testing: {
            ...testing,

            execution:
              testExecution,
          },

          architecture:
            architecture || {},

          documentation:
            documentation || {},
        });

      // ========================================
      // SAFETY NORMALIZATION
      // ========================================

      aiReview = {
        summary:
          aiReview?.summary || "",

        strengths:
          Array.isArray(
            aiReview?.strengths
          )
            ? aiReview.strengths
            : [],

        weaknesses:
          Array.isArray(
            aiReview?.weaknesses
          )
            ? aiReview.weaknesses
            : [],

        criticalRisks:
          Array.isArray(
            aiReview?.criticalRisks
          )
            ? aiReview.criticalRisks
            : [],

        recommendations:
          Array.isArray(
            aiReview?.recommendations
          )
            ? aiReview.recommendations
            : [],

        architectureReview:
          aiReview?.architectureReview ||
          "",

        securityReview:
          aiReview?.securityReview ||
          "",

        testingReview:
          aiReview?.testingReview ||
          "",

        performanceReview:
          aiReview?.performanceReview ||
          "",

        documentationReview:
          aiReview?.documentationReview ||
          "",
      };
    } catch (error) {
      // ========================================
      // IMPORTANT:
      // AI FAILURE MUST NOT FAIL CODELAB
      // ========================================

      console.error(
        "AI repository review failed:",
        error
      );

      aiReview = {
        summary:
          "AI repository review could not be generated. Static analysis completed successfully.",

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
    }

    // ==========================================
    // BUILD RESULT
    // ==========================================

    const result = {
      projectInfo,

      scanResult,

      engineeringScore,

      // ========================================
      // PROJECT HEALTH
      // ========================================

      projectHealth,

      // ========================================
      // QUALITY
      // ========================================

      quality: {
        score:
          qualityScore,

        findings:
          qualityFindings,
      },

      // ========================================
      // SECURITY
      // ========================================

      security: {
        score:
          securityScore,

        findings:
          securityFindings,
      },

      // ========================================
      // TESTING
      // ========================================

      testing: {
        score:
          testingScore,

        framework:
          testing.framework,

        totalTestFiles:
          testing.totalTestFiles,

        totalTestCases:
          testExecution.total ||
          testing.totalTestCases,

        passedTests:
          testExecution.passed,

        failedTests:
          testExecution.failed,

        coverage:
          testExecution.coverage,

        testFiles:
          testing.testFiles,

        findings:
          testing.findings || [],

        // ====================================
        // REAL TEST EXECUTION
        // ====================================

        testResults: {
          framework:
            testing.framework,

          total:
            testExecution.total ||
            testing.totalTestCases,

          passed:
            testExecution.passed,

          failed:
            testExecution.failed,

          accuracy:
            testExecution.passRate,

          coverage:
            testExecution.coverage,

          executed:
            testExecution.executed,

          output:
            testExecution.output || "",

          reason:
            testExecution.reason ||
            null,
        },
      },

      // ========================================
      // ARCHITECTURE
      // ========================================

      architecture: {
        score:
          architectureScore,

        architecture:
          architecture?.architecture ||
          {},

        findings:
          architecture?.findings ||
          [],
      },

      // ========================================
      // MAINTAINABILITY
      // ========================================

      maintainability: {
        score:
          maintainabilityScore,

        findings:
          qualityFindings,
      },

      // ========================================
      // DEPENDENCIES
      // ========================================

      dependencies: {
        score:
          dependencyScore,

        totalDependencies:
          dependencies.totalDependencies ??
          0,

        outdated:
          dependencies.outdated ||
          [],

        vulnerabilities:
          dependencies.vulnerabilities ||
          [],

        findings:
          dependencies.findings ||
          [],
      },

      // ========================================
      // PERFORMANCE
      // ========================================

      performance: {
        score:
          performance?.score ?? 0,

        findings:
          performance?.findings ||
          [],
      },

      // ========================================
      // DOCUMENTATION
      // ========================================

      documentation: {
        score:
          documentation?.score ?? 0,

        sourceFiles:
          documentation?.sourceFiles ??
          0,

        filesWithComments:
          documentation?.filesWithComments ??
          0,

        commentPercentage:
          documentation?.commentPercentage ??
          0,

        readmeFound:
          documentation?.readmeFound ??
          false,

        environmentDocumentation:
          documentation
            ?.environmentDocumentation ??
          false,

        apiDocumentation:
          documentation?.apiDocumentation ??
          false,

        findings:
          documentation?.findings ||
          [],
      },

      // ========================================
      // ALL FINDINGS
      // ========================================

      findings,

      // ========================================
      // AI REPOSITORY REVIEW
      // ========================================

      aiReview,
    };

    // ==========================================
    // DELETE TEMPORARY DIRECTORY
    // ==========================================

    fs.rmSync(
      extractDirectory,
      {
        recursive: true,
        force: true,
      }
    );

    return result;
  } catch (error) {
    console.error(
      "Project analysis error:",
      error
    );

    // ==========================================
    // CLEANUP ON ERROR
    // ==========================================

    fs.rmSync(
      extractDirectory,
      {
        recursive: true,
        force: true,
      }
    );

    throw error;
  }
};