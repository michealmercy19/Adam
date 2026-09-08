import React, { useContext, useEffect, useRef, useState } from 'react';
import { Pill, Card, Button } from '../common/UI.jsx';
import FingerprintScan from '../common/FingerprintScan.jsx';
import { AppContext } from '../../context/AppContext.jsx';
import { buildAttendanceRecord } from '../../utils/attendanceLogic.js';
import { getEnrollmentStatus } from '../../utils/biometricUtils.js';

const studentId = 'FUNAAB/IT/24/001';
const studentName = 'Adebayo Daniel';

export default function StudentAttendance() {
  const { activeClass, courseOfferings, setCurrentPage, attendanceRecords, setAttendanceRecords, userProfile } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [faceMsg, setFaceMsg] = useState('Waiting for scan…');
  const [cameraStatus, setCameraStatus] = useState('starting');
  const [faceDetected, setFaceDetected] = useState(false);
  const [bioMsg, setBioMsg] = useState('Required before submission.');
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [seatConfirmed, setSeatConfirmed] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [fingerprintVerified, setFingerprintVerified] = useState(false);
  const [fingerprintData, setFingerprintData] = useState(null);
  const [showFingerprintScan, setShowFingerprintScan] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectionFrameRef = useRef(null);
  const captureTimerRef = useRef(null);

  const activeCourse = activeClass?.courseId ? courseOfferings.find((course) => course.id === activeClass.courseId) : null;
  const isPhysicalClass = activeClass?.mode === 'physical' || activeClass?.mode === 'walk-in' || activeClass?.mode === 'scheduled';
  const alreadyRecorded = activeClass
    ? attendanceRecords.some((record) => record.studentId === studentId && record.sessionId === activeClass.sessionId)
    : false;

  useEffect(() => {
    if (!activeClass) {
      setStep(0);
      return;
    }

    setStep(1);
  }, [activeClass]);

  useEffect(() => {
    let active = true;

    const stopCamera = () => {
      if (detectionFrameRef.current) {
        cancelAnimationFrame(detectionFrameRef.current);
      }
      if (captureTimerRef.current) {
        clearTimeout(captureTimerRef.current);
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    const detectFace = async (detector) => {
      if (!active || !videoRef.current || videoRef.current.readyState < 2) {
        return;
      }

      try {
        const faces = await detector.detect(videoRef.current);
        if (!active) return;

        const detected = faces.length > 0;
        setFaceDetected(detected);
        setFaceMsg(detected ? 'Face detected. Hold still…' : 'Center your face in the frame.');

        if (detected && !captureTimerRef.current) {
          captureTimerRef.current = setTimeout(() => {
            if (!active) return;
            setFaceMsg('✓ Face captured successfully.');
            setSeatConfirmed(true);
            setStep(2);
            stopCamera();
          }, 1200);
        }

        if (!detected && captureTimerRef.current) {
          clearTimeout(captureTimerRef.current);
          captureTimerRef.current = null;
        }
      } catch {
        setFaceMsg('Keep your face centered in the frame.');
      }

      if (active) {
        detectionFrameRef.current = requestAnimationFrame(() => detectFace(detector));
      }
    };

    if (activeClass && step === 1) {
      const startCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
          setCameraStatus('unsupported');
          setFaceMsg('Live camera scanning is not supported in this browser.');
          return;
        }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
          if (!active) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          streamRef.current = stream;
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraStatus('live');

          if ('FaceDetector' in window) {
            detectFace(new window.FaceDetector({ maxDetectedFaces: 1, fastMode: true }));
          } else {
            setFaceMsg('Camera is live. Position your face, then capture when ready.');
          }
        } catch {
          setCameraStatus('denied');
          setFaceMsg('Camera access was unavailable. Use partial scan to continue.');
        }
      };

      startCamera();
    }

    return () => {
      active = false;
      stopCamera();
    };
  }, [activeClass, step]);

  const handleFaceScan = () => {
    setFaceMsg('✓ Face captured successfully.');
    setSeatConfirmed(true);
    setStep(2);
  };

  const handleFallback = () => {
    setFaceMsg('✓ Continuing with partial scan…');
    setSeatConfirmed(true);
    setStep(2);
  };

  const handleBioStep = () => {
    // Get enrollment status to check if fingerprint is enrolled
    const enrollmentStatus = getEnrollmentStatus(userProfile);
    
    if (enrollmentStatus.enrolled) {
      // Show fingerprint scan component
      setShowFingerprintScan(true);
      setBioMsg('Prepare to scan your fingerprint...');
    } else {
      // Skip fingerprint verification if not enrolled
      setBioMsg('✓ Biometric verification skipped.\nFingerprint not enrolled.');
      setShowSubmit(true);
    }
  };

  const handleFingerprintVerified = (data) => {
    setFingerprintVerified(true);
    setFingerprintData(data);
    setBioMsg(`✓ Fingerprint verified successfully.\nMatch: ${data.matchScore}%`);
    setShowSubmit(true);
    setShowFingerprintScan(false);
  };

  const handleFingerprintSkip = () => {
    setShowFingerprintScan(false);
    setBioMsg('✓ Fingerprint verification skipped.');
    setShowSubmit(true);
  };

  const handleBio = () => {
    setBioMsg('✓ Biometrics verified successfully.');
    setShowSubmit(true);
  };

  const handleSubmit = () => {
    if (!activeClass) return;

    const enrollmentStatus = getEnrollmentStatus(userProfile);
    const now = new Date();
    
    // Determine verification method based on what was actually used
    let verificationMethod = 'clock-in';
    let verificationResult = 'verified';
    
    if (enrollmentStatus.enrolled && fingerprintVerified) {
      verificationMethod = 'clock-in + fingerprint';
    } else if (activeClass.requiresBiometric) {
      verificationMethod = 'clock-in + face verification';
    } else {
      verificationMethod = 'clock-in + proximity';
    }

    const record = buildAttendanceRecord({
      studentId,
      studentName,
      courseId: activeClass.courseId,
      courseCode: activeClass.courseCode,
      courseTitle: activeClass.courseTitle,
      lecturerId: 'lecturer-001',
      lecturerName: 'Dr. Adewale James',
      sessionId: activeClass.sessionId || `session-${Date.now()}`,
      date: now.toISOString().slice(0, 10),
      startTime: activeClass.time || '09:00',
      clockInTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Present',
      classMode: isPhysicalClass ? 'physical' : 'virtual',
      verificationMethod,
      verificationResult,
      studentDepartment: userProfile?.department || 'Department pending',
      attendanceResponsibleDepartment: userProfile?.department || 'Department pending',
      fingerprintData: fingerprintData ? {
        matchScore: fingerprintData.matchScore,
        confidence: fingerprintData.confidence,
        liveness: fingerprintData.liveness,
      } : null,
    });

    setAttendanceRecords((current) => [record, ...current]);
    setSubmitted(true);
    setVerificationStatus('✓ Attendance recorded');
    setBioMsg(`✓ Attendance Recorded\nClocked in at ${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`);
  };

  if (!activeClass || activeClass.completedAt || alreadyRecorded) {
    return (
      <Card>
        <h3>{alreadyRecorded ? 'Attendance already marked' : activeClass?.completedAt ? 'Attendance completed' : 'Active class required'}</h3>
        <p className="muted">{alreadyRecorded || activeClass?.completedAt ? 'Your attendance is complete for this session. A new session will appear when your lecturer or HOC opens one.' : 'There is no active attendance session. Ask your lecturer or HOC to open the class first.'}</p>
        <Button type="primary" onClick={() => setCurrentPage('s-home')}>Back to dashboard</Button>
      </Card>
    );
  }

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>ACTIVE CLASS</h1>
          <p>{activeClass.courseCode} · {activeClass.courseTitle}</p>
        </div>
        <Pill text={activeClass.mode === 'physical' || activeClass.mode === 'walk-in' || activeClass.mode === 'scheduled' ? 'Physical class' : 'Virtual class'} />
      </div>

      <Card>
        {step === 1 && (
          <div>
            <h3>1. Clock in</h3>
            <p className="muted">
              {activeClass.time || '09:00 AM'} — {activeClass.venue || 'Classroom'}
            </p>
            <div className="scanbox">
              {(cameraStatus === 'starting' || cameraStatus === 'live') && (
                <video ref={videoRef} className="camera-video" playsInline muted aria-label="Live face scan camera" />
              )}
              {cameraStatus !== 'live' && <div className="face-placeholder">{cameraStatus === 'starting' ? 'Starting camera…' : 'Camera unavailable'}</div>}
              <div className={`scan-target ${faceDetected ? 'detected' : ''}`}></div>
              <div className="scanline"></div>
            </div>
            <div className="actions">
              <Button type="primary" onClick={handleFaceScan} disabled={cameraStatus === 'starting' || (cameraStatus === 'live' && !faceDetected && 'FaceDetector' in window)}>
                {cameraStatus === 'starting' ? 'Starting Camera…' : 'CLOCK IN'}
              </Button>
              <Button type="ghost" onClick={handleFallback}>
                Continue without face scan
              </Button>
            </div>
            <p id="faceMsg" className="muted">{faceMsg}</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3>2. Verified details</h3>
            <div className="formgrid">
              <div className="field">
                <label>Name</label>
                <input value={studentName} readOnly />
              </div>
              <div className="field">
                <label>Matric</label>
                <input value={studentId} readOnly />
              </div>
              <div className="field">
                <label>Course</label>
                <input value={activeClass.courseCode || (activeCourse ? activeCourse.code : 'Course')} readOnly />
              </div>
              <div className="field">
                <label>Location</label>
                <input value={isPhysicalClass ? (activeClass.venue || 'Classroom verified') : 'Virtual session verified'} readOnly />
              </div>
            </div>
            <div className="actions">
              <Button type="primary" onClick={handleBioStep}>Continue to verification</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3>3. Verification</h3>
            
            {!showFingerprintScan ? (
              <>
                <div className="scanbox">
                  <div style={{ fontSize: '70px' }}>✓</div>
                  <div className="scanline"></div>
                </div>
                <div className="actions">
                  <Button type="primary" onClick={handleBioStep}>
                    {getEnrollmentStatus(userProfile).enrolled ? 'Verify Fingerprint' : 'Verify Presence'}
                  </Button>
                </div>
              </>
            ) : (
              <FingerprintScan
                enrolledTemplate={userProfile?.biometric?.template}
                onVerified={handleFingerprintVerified}
                onSkip={handleFingerprintSkip}
              />
            )}

            <p id="bioMsg" className="muted" style={{ whiteSpace: 'pre-line' }}>{verificationStatus || bioMsg}</p>
            {showSubmit && (
              <Button
                type="primary"
                onClick={handleSubmit}
                disabled={submitted}
              >
                {submitted ? 'Attendance Recorded ✓' : 'Submit Clock In'}
              </Button>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
