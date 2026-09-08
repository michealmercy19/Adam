import React, { useContext, useState, useRef } from 'react';
import { Card, Button, Badge } from './UI.jsx';
import { AppContext } from '../../context/AppContext.jsx';
import { enrollStudentFingerprint, getEnrollmentStatus } from '../../utils/biometricUtils.js';

/**
 * FingerprintEnrollment Component
 * Allows students to register their fingerprint for biometric attendance
 */
export default function FingerprintEnrollment() {
  const { userProfile, setUserProfile, biometricEnrollments, setBiometricEnrollments } = useContext(AppContext);
  
  const [enrollmentStep, setEnrollmentStep] = useState(0); // 0: initial, 1: enrolling, 2: success, 3: error
  const [enrollmentMessage, setEnrollmentMessage] = useState('');
  const [enrollmentError, setEnrollmentError] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const scannerSimulationRef = useRef(null);

  const studentId = userProfile?.id || 'FUNAAB/IT/24/001';
  const enrollmentStatus = getEnrollmentStatus(userProfile);

  const startEnrollment = async () => {
    if (!userProfile) {
      setEnrollmentError('User profile not available');
      setEnrollmentStep(3);
      return;
    }

    setIsEnrolling(true);
    setEnrollmentStep(1);
    setEnrollmentMessage('Initializing fingerprint scanner...');
    setEnrollmentError('');

    try {
      // Simulate scanner detection
      await new Promise((resolve) => setTimeout(resolve, 800));
      setEnrollmentMessage('Scanner ready. Position your right index finger on the scanner.');

      // Simulate capturing multiple fingerprint scans
      const captureSteps = [
        'Capturing first scan...',
        'First scan captured. Please lift your finger and rescan.',
        'Capturing second scan...',
        'Second scan captured. One more scan needed.',
        'Capturing final scan...',
        'Creating composite fingerprint template...',
      ];

      for (let i = 0; i < captureSteps.length; i++) {
        setEnrollmentMessage(captureSteps[i]);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      // Call the biometric enrollment function
      const enrollmentResult = await enrollStudentFingerprint(studentId, userProfile);

      if (!enrollmentResult.success) {
        throw new Error(enrollmentResult.error || 'Enrollment failed');
      }

      // Store enrollment data
      const enrolledData = {
        ...enrollmentResult.data,
        studentName: userProfile.name,
      };

      setBiometricEnrollments((current) => ({
        ...current,
        [studentId]: enrolledData,
      }));

      // Update user profile with biometric status
      setUserProfile((current) => ({
        ...current,
        biometric: {
          status: 'enrolled',
          enrollmentDate: enrolledData.enrollmentDate,
          finger: enrolledData.finger,
          template: enrolledData.enrolledTemplate,
        },
      }));

      setEnrollmentStep(2);
      setEnrollmentMessage('✓ Fingerprint enrolled successfully!');
    } catch (error) {
      setEnrollmentStep(3);
      setEnrollmentError(`Enrollment failed: ${error.message}`);
    } finally {
      setIsEnrolling(false);
    }
  };

  const resetEnrollment = () => {
    setEnrollmentStep(0);
    setEnrollmentMessage('');
    setEnrollmentError('');
  };

  if (enrollmentStatus.enrolled) {
    return (
      <Card className="fingerprint-enrollment-card fingerprint-enrolled">
        <div className="enrollment-header">
          <div className="enrollment-icon">🔐</div>
          <div>
            <h3>Fingerprint Biometric</h3>
            <p className="muted">Right index finger enrolled</p>
          </div>
        </div>

        <div className="enrollment-details">
          <div className="detail-row">
            <span className="label">Status</span>
            <Badge text="Verified" type="good" />
          </div>
          <div className="detail-row">
            <span className="label">Enrolled</span>
            <span className="value">{new Date(enrollmentStatus.enrollmentDate).toLocaleDateString()}</span>
          </div>
          <div className="detail-row">
            <span className="label">Finger</span>
            <span className="value">{enrollmentStatus.finger.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
          </div>
        </div>

        <p className="enrollment-description">
          Your fingerprint is securely stored and linked to your Student ID. You can use this for biometric attendance verification.
        </p>

        <div className="enrollment-actions">
          <Button
            onClick={resetEnrollment}
            className="re-enroll-button"
          >
            Re-enroll Fingerprint
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="fingerprint-enrollment-card">
      <div className="enrollment-header">
        <div className="enrollment-icon">👆</div>
        <div>
          <h3>Register Fingerprint</h3>
          <p className="muted">Enroll for biometric attendance</p>
        </div>
      </div>

      {enrollmentStep === 0 && (
        <>
          <p className="enrollment-description">
            Add a fingerprint to your profile for secure biometric-based attendance verification. Your fingerprint data is encrypted and stored securely.
          </p>

          <div className="enrollment-features">
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <span>Secure encryption</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📱</span>
              <span>Device-independent</span>
            </div>
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <span>Fast verification</span>
            </div>
          </div>

          <div className="enrollment-actions">
            <Button
              onClick={startEnrollment}
              disabled={isEnrolling}
              type="primary"
            >
              {isEnrolling ? 'Starting...' : 'Begin Enrollment'}
            </Button>
          </div>
        </>
      )}

      {enrollmentStep === 1 && (
        <div className="enrollment-progress">
          <div className="progress-spinner">
            <div className="spinner" />
          </div>
          <p className="enrollment-status">{enrollmentMessage}</p>
          <p className="enrollment-hint">
            This process typically takes 15-20 seconds. Keep your finger steady on the scanner.
          </p>
        </div>
      )}

      {enrollmentStep === 2 && (
        <div className="enrollment-success">
          <div className="success-icon">✓</div>
          <p className="success-message">{enrollmentMessage}</p>
          <p className="enrollment-description">
            Your fingerprint is now linked to your Student ID. You can use it for attendance verification starting immediately.
          </p>
          <div className="enrollment-actions">
            <Button
              onClick={resetEnrollment}
              type="primary"
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {enrollmentStep === 3 && (
        <div className="enrollment-error">
          <div className="error-icon">⚠</div>
          <p className="error-message">{enrollmentError}</p>
          <p className="enrollment-hint">
            Please check that your fingerprint scanner is properly connected and try again.
          </p>
          <div className="enrollment-actions">
            <Button
              onClick={resetEnrollment}
              type="primary"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
