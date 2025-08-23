import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  IconButton,
  useColorModeValue,
  Card,
  CardBody,
  Badge,
  Divider,
  List,
  ListItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Circle,
  Spinner,
  useDisclosure,
  Tooltip,
  Code,
} from "@chakra-ui/react";
import {
  IoScan,
  IoClose,
  IoKeypad,
  IoCheckmarkCircle,
  IoWarning,
  IoCamera,
  IoFlashlight,
  IoRefresh,
  IoTrash,
  IoTime,
  IoCopy,
} from "react-icons/io5";
import { useBarcodeScanner } from "../../hooks/useBarcodeScanner";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
  description?: string;
  showHistory?: boolean;
  allowManualInput?: boolean;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  isOpen,
  onClose,
  onScan,
  title = "สแกนบาร์โค้ด",
  description = "วางบาร์โค้ดไว้หน้ากล้องหรือใช้เครื่องสแกนบาร์โค้ด",
  showHistory = true,
  allowManualInput = true,
}) => {
  const [manualInput, setManualInput] = useState("");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const {
    isScanning,
    lastScannedCode,
    startScanning,
    stopScanning,
    scanFromKeyboard,
    clearLastScanned,
    scanHistory,
    isSupported,
  } = useBarcodeScanner({
    onScan: (barcode: string) => {
      onScan(barcode);
      // Don't close automatically, let user decide
    },
    onError: (error: string) => {
      // Error is handled by the hook's toast notifications
    },
    enableKeyboardInput: true,
    enableSound: true,
    enableVibration: true,
  });

  // Focus manual input when modal opens
  useEffect(() => {
    if (isOpen && allowManualInput && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, allowManualInput]);

  // Handle manual input submit
  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      scanFromKeyboard(manualInput);
      onScan(manualInput.trim());
      setManualInput("");
    }
  };

  // Handle manual input key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleManualSubmit();
    }
  };

  // Copy barcode to clipboard
  const copyToClipboard = (barcode: string) => {
    navigator.clipboard.writeText(barcode);
  };

  // Clear all history
  const clearHistory = () => {
    clearLastScanned();
  };

  // Format scan time
  const formatScanTime = (barcode: string) => {
    // In a real app, you'd store timestamps with each scan
    return new Date().toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" closeOnOverlayClick={false}>
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={2}>
            <IoScan />
            <Text>{title}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Scanner Status */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4}>
                  {/* Camera Preview Area */}
                  <Box
                    width="100%"
                    height="200px"
                    bg="gray.100"
                    borderRadius="lg"
                    position="relative"
                    overflow="hidden"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {isScanning ? (
                      <VStack spacing={3}>
                        <Spinner size="xl" color="blue.500" thickness="4px" />
                        <Text fontSize="sm" color="gray.600">
                          กำลังสแกน...
                        </Text>
                        {process.env.NODE_ENV === "development" && (
                          <Text fontSize="xs" color="gray.500">
                            (โหมด Dev: จะสแกนอัตโนมัติใน 2 วินาที)
                          </Text>
                        )}
                      </VStack>
                    ) : (
                      <VStack spacing={3} color="gray.500">
                        <Circle size="60px" bg="gray.200">
                          <IoCamera size={30} />
                        </Circle>
                        <Text fontSize="sm" textAlign="center">
                          {description}
                        </Text>
                      </VStack>
                    )}

                    {/* Scanning overlay */}
                    {isScanning && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        width="80%"
                        height="60px"
                        border="2px solid"
                        borderColor="red.500"
                        borderRadius="md"
                        _after={{
                          content: '""',
                          position: "absolute",
                          top: "50%",
                          left: 0,
                          right: 0,
                          height: "2px",
                          bg: "red.500",
                          animation: "scanner-line 2s linear infinite",
                        }}
                        sx={{
                          "@keyframes scanner-line": {
                            "0%": { transform: "translateY(-30px)" },
                            "100%": { transform: "translateY(30px)" },
                          },
                        }}
                      />
                    )}
                  </Box>

                  {/* Scanner Controls */}
                  <HStack spacing={3}>
                    {isSupported ? (
                      <Button
                        colorScheme={isScanning ? "red" : "blue"}
                        leftIcon={isScanning ? <IoClose /> : <IoCamera />}
                        onClick={isScanning ? stopScanning : startScanning}
                        size="lg"
                      >
                        {isScanning ? "หยุดสแกน" : "เริ่มสแกน"}
                      </Button>
                    ) : (
                      <Tooltip label="อุปกรณ์ไม่รองรับกล้อง">
                        <Button isDisabled leftIcon={<IoCamera />} size="lg">
                          ไม่รองรับกล้อง
                        </Button>
                      </Tooltip>
                    )}

                    {isScanning && (
                      <>
                        <IconButton
                          aria-label="Toggle flash"
                          icon={<IoFlashlight />}
                          variant={flashEnabled ? "solid" : "outline"}
                          onClick={() => setFlashEnabled(!flashEnabled)}
                        />
                        <IconButton
                          aria-label="Refresh"
                          icon={<IoRefresh />}
                          variant="outline"
                          onClick={() => {
                            stopScanning();
                            setTimeout(startScanning, 500);
                          }}
                        />
                      </>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Manual Input */}
            {allowManualInput && (
              <Card bg={cardBg} borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4}>
                    <HStack spacing={2} w="full">
                      <IoKeypad />
                      <Text fontWeight="medium">ใส่รหัสด้วยตนเอง</Text>
                    </HStack>
                    <HStack spacing={2} w="full">
                      <Input
                        ref={inputRef}
                        placeholder="ใส่รหัสบาร์โค้ด..."
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        size="lg"
                      />
                      <Button
                        colorScheme="green"
                        onClick={handleManualSubmit}
                        isDisabled={!manualInput.trim()}
                        size="lg"
                      >
                        ตกลง
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Last Scanned */}
            {lastScannedCode && (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle fontSize="sm">สแกนล่าสุด:</AlertTitle>
                  <AlertDescription>
                    <HStack spacing={2}>
                      <Code colorScheme="green">{lastScannedCode}</Code>
                      <IconButton
                        aria-label="Copy barcode"
                        icon={<IoCopy />}
                        size="xs"
                        variant="ghost"
                        onClick={() => copyToClipboard(lastScannedCode)}
                      />
                    </HStack>
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {/* Scan History */}
            {showHistory && scanHistory.length > 0 && (
              <Card bg={cardBg} borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <IoTime />
                        <Text fontWeight="medium">ประวัติการสแกน</Text>
                        <Badge colorScheme="blue">{scanHistory.length}</Badge>
                      </HStack>
                      <IconButton
                        aria-label="Clear history"
                        icon={<IoTrash />}
                        size="sm"
                        variant="ghost"
                        onClick={clearHistory}
                      />
                    </HStack>

                    <Divider />

                    <List spacing={2} maxH="150px" overflowY="auto">
                      {scanHistory.slice(0, 10).map((barcode, index) => (
                        <ListItem key={`${barcode}-${index}`}>
                          <HStack justify="space-between" p={2} bg="gray.50" borderRadius="md">
                            <HStack spacing={2}>
                              <Circle size="6px" bg="green.500" />
                              <Code fontSize="sm">{barcode}</Code>
                            </HStack>
                            <HStack spacing={1}>
                              <Text fontSize="xs" color="gray.500">
                                {formatScanTime(barcode)}
                              </Text>
                              <IconButton
                                aria-label="Copy barcode"
                                icon={<IoCopy />}
                                size="xs"
                                variant="ghost"
                                onClick={() => copyToClipboard(barcode)}
                              />
                              <IconButton
                                aria-label="Use barcode"
                                icon={<IoCheckmarkCircle />}
                                size="xs"
                                variant="ghost"
                                colorScheme="green"
                                onClick={() => onScan(barcode)}
                              />
                            </HStack>
                          </HStack>
                        </ListItem>
                      ))}
                    </List>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Not Supported Warning */}
            {!isSupported && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>ไม่รองรับการสแกนด้วยกล้อง</AlertTitle>
                  <AlertDescription fontSize="sm">
                    อุปกรณ์ของคุณไม่รองรับการเข้าถึงกล้อง กรุณาใช้การป้อนรหัสด้วยตนเองหรือเครื่องสแกนบาร์โค้ดแทน
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {/* Instructions */}
            <Card bg="blue.50" borderColor="blue.200">
              <CardBody>
                <VStack spacing={2} align="start" fontSize="sm">
                  <Text fontWeight="medium" color="blue.700">
                    วิธีใช้งาน:
                  </Text>
                  <Text color="blue.600">
                    • คลิก "เริ่มสแกน" เพื่อเปิดกล้อง
                  </Text>
                  <Text color="blue.600">
                    • วางบาร์โค้ดไว้ในกรอบสีแดง
                  </Text>
                  <Text color="blue.600">
                    • หรือใช้เครื่องสแกนบาร์โค้ดที่เชื่อมต่อกับคอมพิวเตอร์
                  </Text>
                  <Text color="blue.600">
                    • สามารถป้อนรหัสด้วยตนเองได้ในช่องด้านล่าง
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            ปิด
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Compact Barcode Scanner Button Component
interface BarcodeScannerButtonProps {
  onScan: (barcode: string) => void;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "ghost";
  colorScheme?: string;
  disabled?: boolean;
  tooltip?: string;
}

export const BarcodeScannerButton: React.FC<BarcodeScannerButtonProps> = ({
  onScan,
  size = "md",
  variant = "outline",
  colorScheme = "blue",
  disabled = false,
  tooltip = "สแกนบาร์โค้ด",
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Tooltip label={tooltip} placement="top">
        <IconButton
          aria-label="Scan barcode"
          icon={<IoScan />}
          size={size}
          variant={variant}
          colorScheme={colorScheme}
          onClick={onOpen}
          isDisabled={disabled}
        />
      </Tooltip>

      <BarcodeScanner
        isOpen={isOpen}
        onClose={onClose}
        onScan={(barcode) => {
          onScan(barcode);
          onClose();
        }}
      />
    </>
  );
};