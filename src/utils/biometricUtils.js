/**
 * Biometric Fingerprint Utilities
 * Handles fingerprint enrollment, storage, and verification
 * Uses simulated SDK for development - ready for real SDK integration
 */

// Fingerprint scanner SDK wrapper
// This is a simulated implementation ready for real SDK integration
class FingerprintScannerSDK {
  constructor() {
    this.enrolled = false;
    this.quality = 0;
  }

  /**
   * Initialize scanner hardware
   * @returns {Promise<boolean>} Hardware ready
   */
  async initialize() {
    // Simulates SDK initialization
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 500);
    });
  }

  /**
   * Capture fingerprint scan with quality check
   * Returns simulated biometric template and quality score
   * @param {Object} options - Scan options
   * @returns {Promise<Object>} Biometric data
   */
  async captureFingerprintScan(options = {}) {
    const { finger = 'right-index', timeout = 30000 } = options;

    return new Promise((resolve, reject) => {
      const scanTimeout = setTimeout(() => {
        reject(new Error('Fingerprint scan timeout'));
      }, timeout);

      // Simulate scan process
      setTimeout(() => {
        clearTimeout(scanTimeout);

        // Generate simulated biometric template
        // In real implementation, this would be actual fingerprint data from scanner
        const template = this._generateBiometricTemplate(finger);
        const quality = Math.floor(Math.random() * 30) + 70; // 70-100 quality score

        resolve({
          success: true,
          finger,
          template,
          quality,
          timestamp: new Date().toISOString(),
          scanMethod: 'capacitive', // Scanner type
        });
      }, 2000);
    });
  }

  /**
   * Verify fingerprint against stored template
   * Simulates biometric matching algorithm
   * @param {string} capturedTemplate - Template from current scan
   * @param {string} enrolledTemplate - Template from enrollment
   * @returns {Promise<Object>} Verification result
   */
  async verifyFingerprint(capturedTemplate, enrolledTemplate) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate matching score (0-100, where >95 is match)
        const matchScore = this._calculateMatchScore(capturedTemplate, enrolledTemplate);
        const threshold = 95;
        const matched = matchScore >= threshold;

        resolve({
          matched,
          matchScore,
          threshold,
          confidence: matched ? (matchScore / 100) * 100 : 0,
          timestamp: new Date().toISOString(),
          liveness: 'live', // Anti-spoofing result
        });
      }, 1500);
    });
  }

  /**
   * Enroll fingerprint for a specific student
   * @param {string} studentId - Student ID
   * @param {Object} options - Enrollment options
   * @returns {Promise<Object>} Enrollment result
   */
  async enrollFingerprint(studentId, options = {}) {
    const { finger = 'right-index', captures = 3 } = options;
    const templates = [];

    for (let i = 0; i < captures; i++) {
      try {
        const scan = await this.captureFingerprintScan({ finger });
        templates.push(scan.template);
      } catch (error) {
        throw new Error(`Enrollment failed on capture ${i + 1}: ${error.message}`);
      }
    }

    // Create composite template from multiple captures
    const compositeTemplate = this._createCompositeTemplate(templates);

    return {
      success: true,
      studentId,
      finger,
      enrolledTemplate: compositeTemplate,
      enrollmentDate: new Date().toISOString(),
      quality: 'high',
      captureCount: captures,
    };
  }

  /**
   * Generate simulated biometric template
   * In production, this comes from actual fingerprint scanner
   */
  _generateBiometricTemplate(finger) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let template = '';
    for (let i = 0; i < 256; i++) {
      template += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `FP_${finger}_${template}_${Date.now()}`;
  }

  /**
   * Calculate simulated match score
   * Compares two templates and returns confidence score
   */
  _calculateMatchScore(template1, template2) {
    if (!template1 || !template2) return 0;

    // Simulate fuzzy matching - if templates share certain characteristics
    const commonChars = (s1, s2) => {
      let count = 0;
      for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
        if (s1[i] === s2[i]) count++;
      }
      return count;
    };

    const matches = commonChars(template1, template2);
    const maxLength = Math.max(template1.length, template2.length);
    return Math.floor((matches / maxLength) * 100);
  }

  /**
   * Create composite template from multiple captures
   * Simulates feature extraction and template generation
   */
  _createCompositeTemplate(templates) {
    if (!templates.length) return null;

    // Simulated composite - in reality, SDK would extract and combine features
    const composite = templates
      .slice(0, -1)
      .reduce((acc, t) => {
        const len = Math.min(acc.length, t.length);
        return acc.substring(0, len) + t.substring(len);
      }, templates[templates.length - 1]);

    return `COMPOSITE_${composite.substring(0, 200)}`;
  }
}

// Initialize SDK instance
const fingerprintSDK = new FingerprintScannerSDK();

/**
 * Enroll and store fingerprint for a student
 * @param {string} studentId - Student ID
 * @param {Object} userProfile - Student profile object
 * @returns {Promise<Object>} Enrollment result
 */
export async function enrollStudentFingerprint(studentId, userProfile) {
  try {
    await fingerprintSDK.initialize();

    const enrollmentResult = await fingerprintSDK.enrollFingerprint(studentId, {
      finger: 'right-index',
      captures: 3,
    });

    return {
      success: true,
      data: {
        studentId,
        enrolledTemplate: enrollmentResult.enrolledTemplate,
        enrollmentDate: enrollmentResult.enrollmentDate,
        finger: enrollmentResult.finger,
        quality: enrollmentResult.quality,
        status: 'enrolled',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Scan and verify fingerprint for attendance
 * @param {string} enrolledTemplate - Stored fingerprint template
 * @returns {Promise<Object>} Verification result
 */
export async function scanAndVerifyFingerprint(enrolledTemplate) {
  try {
    if (!enrolledTemplate) {
      throw new Error('No enrolled fingerprint template found');
    }

    await fingerprintSDK.initialize();

    const scanResult = await fingerprintSDK.captureFingerprintScan({
      finger: 'right-index',
      timeout: 30000,
    });

    const verificationResult = await fingerprintSDK.verifyFingerprint(
      scanResult.template,
      enrolledTemplate
    );

    return {
      success: true,
      data: {
        verified: verificationResult.matched,
        matchScore: verificationResult.matchScore,
        confidence: verificationResult.confidence,
        liveness: verificationResult.liveness,
        verificationMethod: 'fingerprint-biometric',
        verificationResult: verificationResult.matched ? 'verified' : 'rejected',
        timestamp: verificationResult.timestamp,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: {
        verified: false,
        verificationResult: 'failed',
      },
    };
  }
}

/**
 * Get enrollment status
 * @param {Object} userProfile - Student profile
 * @returns {Object} Enrollment status
 */
export function getEnrollmentStatus(userProfile) {
  if (!userProfile) return { enrolled: false, status: 'no-profile' };

  const isEnrolled = userProfile.biometric?.status === 'enrolled';
  const enrollmentDate = userProfile.biometric?.enrollmentDate;

  return {
    enrolled: isEnrolled,
    status: isEnrolled ? 'enrolled' : 'not-enrolled',
    enrollmentDate,
    finger: userProfile.biometric?.finger || 'right-index',
  };
}

/**
 * Format biometric status for display
 * @param {Object} userProfile - Student profile
 * @returns {string} Status text
 */
export function getBiometricStatusBadge(userProfile) {
  if (!userProfile?.biometric?.status) {
    return 'Not registered';
  }

  if (userProfile.biometric.status === 'enrolled') {
    return 'Verified';
  }

  return 'Pending';
}

export default {
  enrollStudentFingerprint,
  scanAndVerifyFingerprint,
  getEnrollmentStatus,
  getBiometricStatusBadge,
  fingerprintSDK,
};
