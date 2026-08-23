import React, { useContext, useEffect, useRef, useState } from 'react';
import { Badge, Pill, Card, Button, Grid } from '../common/UI.jsx';
import { AppContext } from '../../context/AppContext.jsx';

export default function StudentAttendance() {
  const { setCurrentPage } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [faceMsg, setFaceMsg] = useState('Waiting for scan…');
  const [cameraStatus, setCameraStatus] = useState('starting');
  const [faceDetected, setFaceDetected] = useState(false);
  const [bioMsg, setBioMsg] = useState('Required before submission.');
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectionFrameRef = useRef(null);
  const captureTimerRef = useRef(null);

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

    return () => {
      active = false;
      stopCamera();
    };
  }, []);

  const handleFaceScan = () => {
    setFaceMsg('✓ Face captured successfully.');
    setStep(2);
  };

  const handleFallback = () => {
    setFaceMsg('✓ Continuing with partial scan…');
    setStep(2);
  };

  const handleBioStep = () => {
    setStep(3);
  };

  const handleBio = () => {
    setBioMsg('✓ Biometrics verified successfully.');
    setShowSubmit(true);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <>
      <div className="top">
        <div className="title">
          <h1>Mark Attendance</h1>
          <p>Face scan → details → biometrics → submit</p>
        </div>
        <Pill text="Student" />
      </div>

      <Card>
        {step === 1 && (
          <div>
            <h3>1. Facial Recognition</h3>
            <p className="muted">
              A full facial match is not compulsory if the network is poor. ADAM only needs enough of the scan to continue.
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
                {cameraStatus === 'starting' ? 'Starting Camera…' : 'Capture Face'}
              </Button>
              <Button type="ghost" onClick={handleFallback}>
                Continue with Partial Scan
              </Button>
            </div>
            <p id="faceMsg" className="muted">{faceMsg}</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3>2. Confirm Details</h3>
            <div className="formgrid">
              <div className="field">
                <label>Name</label>
                <input value="Adebayo Daniel" readOnly />
              </div>
              <div className="field">
                <label>Matric</label>
                <input value="FUNAAB/IT/24/001" readOnly />
              </div>
              <div className="field">
                <label>Course</label>
                <input value="ICT 201" readOnly />
              </div>
              <div className="field">
                <label>Location</label>
                <input value="Verified classroom" readOnly />
              </div>
            </div>
            <Button type="primary" onClick={handleBioStep}>
              Continue to Biometrics
            </Button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3>3. Final Biometric Verification</h3>
            <div className="scanbox">
              <div style={{ fontSize: '70px' }}>☝️</div>
              <div className="scanline"></div>
            </div>
            <div className="actions">
              <Button type="primary" onClick={handleBio}>
                Verify Biometrics
              </Button>
            </div>
            <p id="bioMsg" className="muted">{bioMsg}</p>
            {showSubmit && (
              <Button
                type="primary"
                onClick={handleSubmit}
                disabled={submitted}
              >
                {submitted ? 'Attendance Submitted ✓' : 'Submit Attendance'}
              </Button>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
