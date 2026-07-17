"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, X } from "lucide-react";

interface ConfirmationModalProps {
  message: string;
  onConfirm: (signerName: string, faceImage: string | null) => void;
  onCancel: () => void;
}

export default function ConfirmationModal({ message, onConfirm, onCancel }: ConfirmationModalProps) {
  const [name, setName] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Attempt to silently start the webcam stream when the modal mounts
    let activeStream: MediaStream | null = null;
    if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        .then(stream => {
          activeStream = stream;
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play()
                .then(() => {
                  setCameraActive(true);
                })
                .catch(e => console.error("Hidden video play failed", e));
            };
          }
        })
        .catch(err => {
          // System might not have a camera, or permissions might be blocked.
          // We fail gracefully to allow EHR database operations to still execute.
          console.warn("webcam access failed/denied for HIPAA audit:", err);
        });
    }

    return () => {
      // Release camera tracks on unmount
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleConfirm = () => {
    if (!name.trim()) return;

    let faceImageData: string | null = null;

    if (cameraActive && videoRef.current && canvasRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          faceImageData = canvas.toDataURL("image/jpeg", 0.7); // 70% quality compression
        }
      } catch (err) {
        console.error("Webcam frame capture error:", err);
      }
    }

    // Stop camera stream immediately
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    onConfirm(name.trim(), faceImageData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6 text-foreground relative animate-scale-up">
        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-secondary hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-border pb-4">
          <div className="p-2 bg-primary/15 rounded-lg text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold">HIPAA Security Verification</h3>
            <p className="text-[9px] text-secondary uppercase font-semibold tracking-wider">Consent & Signature Logging Required</p>
          </div>
        </div>

        {/* Details of pending action */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">
            Confirming database modification
          </label>
          <div className="p-3 bg-accent/20 border border-border/60 rounded-xl text-[11px] text-foreground/90 font-mono italic break-words">
            {message}
          </div>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider">
            Your Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type your name to confirm"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-accent/15 text-foreground placeholder-secondary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs transition-all"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) {
                handleConfirm();
              }
            }}
          />
          <p className="text-[9px] text-secondary leading-relaxed">
            By signing, you confirm that you are authorizing this database modification. This action will be permanently logged with your name, timestamp, and verification capture.
          </p>
        </div>

        {/* Hidden media elements */}
        <div className="hidden">
          <video ref={videoRef} width="640" height="480" muted playsInline />
          <canvas ref={canvasRef} width="640" height="480" />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-accent hover:bg-accent-hover text-foreground font-semibold rounded-xl text-xs transition-all border border-border"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!name.trim()}
            className="flex-1 py-2 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:hover:bg-primary text-white font-semibold rounded-xl text-xs transition-all shadow-md"
          >
            Sign & Save
          </button>
        </div>
      </div>
    </div>
  );
}
