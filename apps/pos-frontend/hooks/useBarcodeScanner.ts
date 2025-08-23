import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@chakra-ui/react";

interface BarcodeScannerOptions {
  onScan?: (barcode: string) => void;
  onError?: (error: string) => void;
  enableKeyboardInput?: boolean;
  scanDelay?: number;
  minLength?: number;
  maxLength?: number;
  enableSound?: boolean;
  enableVibration?: boolean;
}

interface BarcodeScannerReturn {
  isScanning: boolean;
  lastScannedCode: string | null;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  scanFromKeyboard: (input: string) => void;
  clearLastScanned: () => void;
  scanHistory: string[];
  isSupported: boolean;
}

// Mock barcode patterns for development
const MOCK_BARCODES = [
  "1234567890123", // น้ำดื่ม
  "1234567890124", // มาม่า
  "1234567890125", // กาแฟ
  "1234567890126", // โค้ก
  "1234567890127", // นม
  "1234567890128", // ลูกอม
];

export const useBarcodeScanner = (
  options: BarcodeScannerOptions = {}
): BarcodeScannerReturn => {
  const {
    onScan,
    onError,
    enableKeyboardInput = true,
    scanDelay = 100,
    minLength = 8,
    maxLength = 20,
    enableSound = true,
    enableVibration = true,
  } = options;

  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const [keyboardBuffer, setKeyboardBuffer] = useState("");
  const [isSupported, setIsSupported] = useState(false);

  const scanTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);
  const toast = useToast();

  // Check for barcode scanner support
  useEffect(() => {
    const checkSupport = async () => {
      try {
        // Check for camera access
        const hasCamera = !!(
          navigator.mediaDevices && navigator.mediaDevices.getUserMedia
        );

        // Check for BarcodeDetector API (experimental)
        const hasBarcodeDetector = "BarcodeDetector" in window;

        // For now, we'll consider it supported if we have camera access
        setIsSupported(hasCamera);
      } catch (error) {
        setIsSupported(false);
      }
    };

    checkSupport();
  }, []);

  // Keyboard input handler for barcode scanners
  useEffect(() => {
    if (!enableKeyboardInput) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Handle Enter key (end of barcode scan)
      if (event.key === "Enter" && keyboardBuffer.length >= minLength) {
        event.preventDefault();
        processScan(keyboardBuffer);
        setKeyboardBuffer("");
        return;
      }

      // Handle alphanumeric characters
      if (/^[a-zA-Z0-9]$/.test(event.key)) {
        event.preventDefault();
        setKeyboardBuffer((prev) => {
          const newBuffer = prev + event.key;

          // Clear timeout if exists
          if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
          }

          // Set timeout to clear buffer if no input for a while
          scanTimeoutRef.current = setTimeout(() => {
            setKeyboardBuffer("");
          }, 1000);

          return newBuffer;
        });
      }
    };

    document.addEventListener("keypress", handleKeyPress);
    return () => {
      document.removeEventListener("keypress", handleKeyPress);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [enableKeyboardInput, keyboardBuffer, minLength]);

  // Play scan sound
  const playBeepcriptSound = useCallback(() => {
    if (!enableSound) return;

    try {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn("Could not play scan sound:", error);
    }
  }, [enableSound]);

  // Vibrate on scan
  const vibrateOnScan = useCallback(() => {
    if (!enableVibration || !navigator.vibrate) return;

    try {
      navigator.vibrate(100); // 100ms vibration
    } catch (error) {
      console.warn("Could not vibrate:", error);
    }
  }, [enableVibration]);

  // Process scanned barcode
  const processScan = useCallback(
    (barcode: string) => {
      // Validate barcode length
      if (barcode.length < minLength || barcode.length > maxLength) {
        const error = `Invalid barcode length: ${barcode.length}. Expected between ${minLength} and ${maxLength}.`;
        onError?.(error);
        toast({
          title: "รหัสไม่ถูกต้อง",
          description: error,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Check for duplicate scans (within 2 seconds)
      if (lastScannedCode === barcode) {
        const now = Date.now();
        const lastScanTime =
          scanHistory.length > 0 ? new Date(scanHistory[0]).getTime() : 0;
        if (now - lastScanTime < 2000) {
          return; // Ignore duplicate scan
        }
      }

      // Update state
      setLastScannedCode(barcode);
      setScanHistory((prev) => [barcode, ...prev.slice(0, 9)]); // Keep last 10 scans

      // Feedback
      playBeepcriptSound();
      vibrateOnScan();

      // Callback
      onScan?.(barcode);

      toast({
        title: "สแกนสำเร็จ",
        description: `รหัส: ${barcode}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
    [
      minLength,
      maxLength,
      lastScannedCode,
      scanHistory,
      onScan,
      onError,
      playBeepcriptSound,
      vibrateOnScan,
      toast,
    ]
  );

  // Start scanning with camera
  const startScanning = useCallback(async () => {
    if (!isSupported) {
      const error = "ไม่รองรับการสแกนบาร์โค้ดในอุปกรณ์นี้";
      onError?.(error);
      toast({
        title: "ไม่รองรับ",
        description: error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsScanning(true);

      // For development, simulate camera scanning with mock data
      if (process.env.NODE_ENV === "development") {
        // Simulate scanning delay
        setTimeout(() => {
          const randomBarcode =
            MOCK_BARCODES[Math.floor(Math.random() * MOCK_BARCODES.length)];
          processScan(randomBarcode);
          setIsScanning(false);
        }, 2000);
        return;
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;

      // Check if BarcodeDetector is supported
      if ("BarcodeDetector" in window) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: [
              "code_128",
              "code_39",
              "code_93",
              "codabar",
              "ean_13",
              "ean_8",
              "itf",
              "upc_a",
              "upc_e",
              "pdf417",
              "qr_code",
              "data_matrix",
            ],
          });

          // Create video element for processing
          const video = document.createElement("video");
          video.srcObject = stream;
          video.play();

          // Create canvas for image capture
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          // Start detection loop
          const detectLoop = async () => {
            if (!isScanning || !video.videoWidth || !video.videoHeight) {
              return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context?.drawImage(video, 0, 0);

            try {
              const barcodes = await barcodeDetector.detect(canvas);

              if (barcodes.length > 0) {
                const barcode = barcodes[0];
                processScan(barcode.rawValue);
                stopScanning();
                return;
              }
            } catch (detectError) {
              console.warn("Barcode detection error:", detectError);
            }

            // Continue detection
            if (isScanning) {
              requestAnimationFrame(detectLoop);
            }
          };

          // Wait for video to be ready
          video.addEventListener("loadedmetadata", () => {
            detectLoop();
          });

          toast({
            title: "เริ่มสแกนแล้ว",
            description: "นำกล้องไปที่บาร์โค้ดเพื่อสแกน",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
        } catch (barcodeError) {
          console.warn("BarcodeDetector initialization failed:", barcodeError);
          // Fallback to keyboard/manual input
          toast({
            title: "เริ่มสแกนแล้ว",
            description: "ใช้คีย์บอร์ดหรือสแกนเนอร์บาร์โค้ดเพื่อสแกน",
            status: "info",
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        // BarcodeDetector not supported, fallback to manual input
        toast({
          title: "เริ่มสแกนแล้ว",
          description: "ใช้คีย์บอร์ดหรือสแกนเนอร์บาร์โค้ดเพื่อสแกน",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      setIsScanning(false);
      const errorMessage = "ไม่สามารถเข้าถึงกล้องได้";
      onError?.(errorMessage);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [isSupported, isScanning, onError, processScan, toast]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    setIsScanning(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
  }, []);

  // Manual barcode input
  const scanFromKeyboard = useCallback(
    (input: string) => {
      if (input.trim()) {
        processScan(input.trim());
      }
    },
    [processScan]
  );

  // Clear last scanned code
  const clearLastScanned = useCallback(() => {
    setLastScannedCode(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return {
    isScanning,
    lastScannedCode,
    startScanning,
    stopScanning,
    scanFromKeyboard,
    clearLastScanned,
    scanHistory,
    isSupported,
  };
};
