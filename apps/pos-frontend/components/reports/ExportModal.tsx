import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Radio,
  RadioGroup,
  Stack,
  Input,
  FormControl,
  FormLabel,
  Switch,
  Divider,
  Badge,
  Icon,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import {
  IoDownload,
  IoPrint,
  IoDocument,
  IoGrid,
  IoCode,
  IoCalendar,
} from "react-icons/io5";
import { useReports } from "../../hooks/useReports";
import { ReportData, ExportOptions } from "../../lib/reports";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportData | null;
  reportType?: "sales" | "inventory" | "financial" | "customer";
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  reportData,
  reportType = "sales",
}) => {
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | "json">("csv");
  const [filename, setFilename] = useState("");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(false);
  
  const { exportReport, printReport, isExporting } = useReports();
  const toast = useToast();

  const formatOptions = [
    {
      value: "csv",
      label: "CSV (Excel)",
      icon: IoGrid,
      description: "เหมาะสำหรับการวิเคราะห์ข้อมูลเพิ่มเติม",
      badge: "แนะนำ",
    },
    {
      value: "pdf",
      label: "PDF",
      icon: IoDocument,
      description: "เหมาะสำหรับการพิมพ์และเก็บเอกสาร",
      badge: null,
    },
    {
      value: "json",
      label: "JSON",
      icon: IoCode,
      description: "เหมาะสำหรับการใช้งานกับระบบอื่น",
      badge: null,
    },
  ];

  const handleExport = async () => {
    if (!reportData) {
      toast({
        title: "ไม่สามารถส่งออกได้",
        description: "ไม่มีข้อมูลรายงานสำหรับส่งออก",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const options: ExportOptions = {
      format: exportFormat,
      filename: filename || undefined,
      includeHeaders,
      includeCharts,
    };

    try {
      await exportReport(reportData, options);
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handlePrint = async () => {
    if (!reportData) {
      toast({
        title: "ไม่สามารถพิมพ์ได้",
        description: "ไม่มีข้อมูลรายงานสำหรับพิมพ์",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await printReport(reportData);
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const generateDefaultFilename = () => {
    if (!reportData) return "";
    
    const reportTitle = reportData.title.replace(/\s+/g, "_");
    const period = reportData.period.replace(/\s+/g, "_");
    const date = new Date().toISOString().split('T')[0];
    
    return `${reportTitle}_${period}_${date}`;
  };

  React.useEffect(() => {
    if (isOpen && !filename) {
      setFilename(generateDefaultFilename());
    }
  }, [isOpen, reportData, filename]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={IoDownload} color="blue.500" />
            <Text>ส่งออกและพิมพ์รายงาน</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {!reportData && (
              <Alert status="warning">
                <AlertIcon />
                <AlertDescription>
                  ไม่มีข้อมูลรายงานสำหรับส่งออก กรุณาสร้างรายงานก่อน
                </AlertDescription>
              </Alert>
            )}

            {reportData && (
              <>
                {/* Report Info */}
                <VStack spacing={2} align="start" p={4} bg="blue.50" borderRadius="md">
                  <Text fontWeight="bold">{reportData.title}</Text>
                  <HStack spacing={4}>
                    <HStack spacing={1}>
                      <Icon as={IoCalendar} color="gray.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.600">{reportData.period}</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      รายการ: {reportData.data?.length || 0}
                    </Text>
                  </HStack>
                </VStack>

                {/* Export Format Selection */}
                <FormControl>
                  <FormLabel fontWeight="bold">เลือกรูปแบบการส่งออก</FormLabel>
                  <RadioGroup value={exportFormat} onChange={(value) => setExportFormat(value as any)}>
                    <VStack align="stretch" spacing={3}>
                      {formatOptions.map((option) => (
                        <HStack 
                          key={option.value}
                          p={3} 
                          border="1px" 
                          borderColor={exportFormat === option.value ? "blue.300" : "gray.200"}
                          borderRadius="md"
                          bg={exportFormat === option.value ? "blue.50" : "white"}
                          cursor="pointer"
                          onClick={() => setExportFormat(option.value as any)}
                        >
                          <Radio value={option.value} colorScheme="blue" />
                          <Icon as={option.icon} color="gray.500" />
                          <VStack align="start" spacing={0} flex={1}>
                            <HStack>
                              <Text fontWeight="medium">{option.label}</Text>
                              {option.badge && (
                                <Badge colorScheme="green" size="sm">
                                  {option.badge}
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="sm" color="gray.500">
                              {option.description}
                            </Text>
                          </VStack>
                        </HStack>
                      ))}
                    </VStack>
                  </RadioGroup>
                </FormControl>

                <Divider />

                {/* Export Options */}
                <VStack spacing={4} align="stretch">
                  <Text fontWeight="bold">ตัวเลือกการส่งออก</Text>
                  
                  <FormControl>
                    <FormLabel>ชื่อไฟล์</FormLabel>
                    <Input
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      placeholder="ระบุชื่อไฟล์"
                    />
                  </FormControl>

                  <HStack justify="space-between">
                    <Text>รวมส่วนหัวรายงาน</Text>
                    <Switch
                      isChecked={includeHeaders}
                      onChange={(e) => setIncludeHeaders(e.target.checked)}
                      colorScheme="blue"
                    />
                  </HStack>

                  {exportFormat === "pdf" && (
                    <HStack justify="space-between">
                      <Text>รวมแผนภูมิ (PDF เท่านั้น)</Text>
                      <Switch
                        isChecked={includeCharts}
                        onChange={(e) => setIncludeCharts(e.target.checked)}
                        colorScheme="blue"
                      />
                    </HStack>
                  )}
                </VStack>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button
              leftIcon={<Icon as={IoPrint} />}
              variant="outline"
              onClick={handlePrint}
              isDisabled={!reportData}
            >
              พิมพ์
            </Button>
            <Button
              leftIcon={<Icon as={IoDownload} />}
              colorScheme="blue"
              onClick={handleExport}
              isLoading={isExporting}
              loadingText="กำลังส่งออก..."
              isDisabled={!reportData}
            >
              ส่งออก
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExportModal;