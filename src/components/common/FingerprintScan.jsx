import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Badge } from './UI.jsx';
import { scanAndVerifyFingerprint } from '../../utils/biometricUtils.js';

/**
 * FingerprintScan Component
 * Used during attendance verification to scan and verify student fingerprint
 */
export default function FingerprintScan({ enrolledTemplate, onVerified, onSkip, disabled = false }) {
  const [scanStep, setScanStep] = useState(0); // 0: ready, 1: scanning, 2: verifying, 3: success, 4: failed
  const [scanMessage, setScanMessage] = useState('');
  const [scanError, setScanError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const scannerSimulationRef = useRef(null);
  const scanTimeoutRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  const startFingerprintScan = async () => {
    if (!enrolledTemplate) {
      setScanError('No enrolled fingerprint found. Please register your fingerprint first.');
      setScanStep(4);
      return;
    }

    if (isScanning) return;

    setIsScanning(true);
    setScanStep(1);
    setScanMessage('Initializing scanner...');
    setScanError('');

    try {
      // Brief initialization delay
      await new Promise((resolve) => setTimeout(resolve, 600));
      setScanMessage('Scanner ready. Place your finger on the scanner.');

      // Simulate scanner waiting
      await new Promise((resolve) => {
        scanTimeoutRef.current = setTimeout(resolve, 1500);
      });

      setScanStep(2);
      setScanMessage('Processing fingerprint...');

      // Call the actual fingerprint verification
      const result = await scanAndVerifyFingerprint(enrolledTemplate);

      if (!result.success) {
        throw new Error(result.error || 'Fingerprint scan failed');
      }

      setVerificationData(result.data);

      if (result.data.verified) {
        setScanStep(3);
        setScanMessage('✓ Fingerprint verified successfully!');
        
        // Call the callback after a brief delay
        scanTimeoutRef.current = setTimeout(() => {
          onVerified(result.data);
        }, 1200);
      } else {
        setScanStep(4);
        setScanError(`Verification failed. Match score: ${result.data.matchScore}%`);
      }
    } catch (error) {
      setScanStep(4);
      setScanError(`Scan error: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRetry = () => {
    setScanStep(0);
    setScanMessage('');
    setScanError('');
    setVerificationData(null);
  };

  if (scanStep === 0) {
    return (
      <Card className="fingerprint-scan-card">
        <div className="scan-header">
          <div className="scan-icon">👆</div>
          <div>
            <h3>Fingerprint Verification</h3>
            <p className="muted">Biometric attendance confirmation</p>
          </div>
        </div>

        <p className="scan-description">
          Place your registered finger on the scanner to verify your attendance. This provides secure proof of your presence.
        </p>

        <div className="scan-info">
          <div className="info-item">
            <span className="info-label">Method</span>
            <Badge text="Fingerprint" type="info" />
          </div>
          <div className="info-item">
            <span className="info-label">Status</span>
            <Badge text="Ready" type="good" />
          </div>
        </div>

        <div className="scan-actions">
          <Button
            onClick={startFingerprintScan}
            disabled={disabled || isScanning}
            type="primary"
          >
            {isScanning ? 'Starting...' : 'Start Scan'}
          </Button>
          {onSkip && (
            <Button
              onClick={onSkip}
              disabled={disabled || isScanning}
              type="ghost"
            >
              Skip for Now
            </Button>
          )}
        </div>
      </Card>
    );
  }

  if (scanStep === 1) {
    return (
      <Card className="fingerprint-scan-card fingerprint-scanning">
        <div className="scan-progress">
          <div className="scanner-animation">
            <div className="scanner-frame">
              <div className="scanner-pulse" />
            </div>
          </div>
          <p className="scan-status">{scanMessage}</p>
        </div>
      </Card>
    );
  }

  if (scanStep === 2) {
    return (
      <Card className="fingerprint-scan-card fingerprint-verifying">
        <div className="scan-progress">
          <div className="verification-spinner">
            <div className="spinner" />
          </div>
          <p className="scan-status">{scanMessage}</p>
          <p className="scan-hint">Please wait while we verify your fingerprint...</p>
        </div>
      </Card>
    );
  }

  if (scanStep === 3) {
    return (
      <Card className="fingerprint-scan-card fingerprint-success">
        <div className="scan-result">
          <div className="result-icon">✓</div>
          <p className="result-message">{scanMessage}</p>
        </div>

        {verificationData && (
          <div className="verification-details">
            <div className="detail-row">
              <span className="label">Match Score</span>
              <span className="value">{verificationData.matchScore}%</span>
            </div>
            <div className="detail-row">
              <span className="label">Confidence</span>
              <span className="value">{verificationData.confidence.toFixed(1)}%</span>
            </div>
            <div className="detail-row">
              <span className="label">Liveness</span>
              <Badge text={verificationData.liveness} type="good" />
            </div>
          </div>
        )}

        <p className="scan-description">
          Your fingerprint has been verified and your attendance is being recorded.
        </p>
      </Card>
    );
  }

  if (scanStep === 4) {
    return (
      <Card className="fingerprint-scan-card fingerprint-failed">
        <div className="scan-error">
          <div className="error-icon">✗</div>
          <p className="error-message">{scanError}</p>
        </div>

        <p className="scan-hint">
          Please ensure your finger is clean and properly positioned on the scanner. Try again.
        </p>

        <div className="scan-actions">
          <Button
            onClick={handleRetry}
            type="primary"
          >
            Try Again
          </Button>
          {onSkip && (
            <Button
              onClick={onSkip}
              type="ghost"
            >
              Skip Verification
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return null;
}
