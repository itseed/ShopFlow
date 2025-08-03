import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
  Icon,
  Badge,
  Select,
  FormControl,
  FormLabel,
  Switch,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import {
  IoTime,
  IoAdd,
  IoTrash,
  IoPlay,
  IoPause,
  IoCalendar,
  IoStatsChart,
  IoNotifications,
} from "react-icons/io5";
import { useReports } from "../../hooks/useReports";

interface ScheduledReport {
  id: string;
  reportType: string;
  frequency: "daily" | "weekly" | "monthly";
  active: boolean;
  createdAt: string;
  nextRun?: string;
  lastRun?: string;
}

export const ReportScheduler: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduledReport[]>([]);
  const [newReportType, setNewReportType] = useState("sales");
  const [newFrequency, setNewFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [autoNotify, setAutoNotify] = useState(true);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { scheduleReport, cancelScheduledReport } = useReports();
  const toast = useToast();
  
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const reportTypes = [
    { value: "sales", label: "รายงานยอดขาย", icon: IoStatsChart },
    { value: "inventory", label: "รายงานสินค้าคงคลัง", icon: IoStatsChart },
    { value: "financial", label: "รายงานการเงิน", icon: IoStatsChart },
    { value: "customer", label: "รายงานลูกค้า", icon: IoStatsChart },
  ];

  const frequencyOptions = [
    { value: "daily", label: "รายวัน" },
    { value: "weekly", label: "รายสัปดาห์" },
    { value: "monthly", label: "รายเดือน" },
  ];

  useEffect(() => {
    // Load existing schedules from localStorage
    const loadSchedules = () => {
      try {
        const savedSchedules = JSON.parse(localStorage.getItem("reportSchedules") || "[]");
        setSchedules(savedSchedules);
      } catch (error) {
        console.error("Error loading schedules:", error);
      }
    };

    loadSchedules();
  }, []);

  const handleCreateSchedule = () => {
    try {
      const mockCallback = () => {
        console.log(`Generating ${newReportType} report (${newFrequency})`);
        // In a real implementation, this would trigger the actual report generation
      };

      const scheduleId = scheduleReport(newReportType, newFrequency, mockCallback);
      
      // Reload schedules from localStorage
      const updatedSchedules = JSON.parse(localStorage.getItem("reportSchedules") || "[]");
      setSchedules(updatedSchedules);
      
      onClose();
      setNewReportType("sales");
      setNewFrequency("weekly");
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    try {
      cancelScheduledReport(scheduleId);
      
      // Reload schedules from localStorage
      const updatedSchedules = JSON.parse(localStorage.getItem("reportSchedules") || "[]");
      setSchedules(updatedSchedules);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleToggleSchedule = (scheduleId: string, currentStatus: boolean) => {
    // Update the active status
    const updatedSchedules = schedules.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, active: !currentStatus }
        : schedule
    );
    
    setSchedules(updatedSchedules);
    localStorage.setItem("reportSchedules", JSON.stringify(updatedSchedules));
    
    toast({
      title: currentStatus ? "หยุดการทำงานแล้ว" : "เริ่มการทำงานแล้ว",
      description: `ตารางรายงาน${currentStatus ? "หยุด" : "เริ่ม"}ทำงานแล้ว`,
      status: "success",
      duration: 2000,
    });
  };

  const getReportTypeLabel = (type: string) => {
    const reportType = reportTypes.find(rt => rt.value === type);
    return reportType ? reportType.label : type;
  };

  const getFrequencyLabel = (frequency: string) => {
    const freq = frequencyOptions.find(f => f.value === frequency);
    return freq ? freq.label : frequency;
  };

  const getStatusColor = (active: boolean) => {
    return active ? "green" : "gray";
  };

  const getStatusLabel = (active: boolean) => {
    return active ? "เปิดใช้งาน" : "หยุดการทำงาน";
  };

  const calculateNextRun = (frequency: string) => {
    const now = new Date();
    let nextRun = new Date();
    
    switch (frequency) {
      case "daily":
        nextRun.setDate(now.getDate() + 1);
        break;
      case "weekly":
        nextRun.setDate(now.getDate() + 7);
        break;
      case "monthly":
        nextRun.setMonth(now.getMonth() + 1);
        break;
    }
    
    return nextRun.toLocaleDateString("th-TH");
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack justify="space-between">
            <HStack spacing={3}>
              <Icon as={IoTime} color="blue.500" boxSize={6} />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold">ตารางรายงานอัตโนมัติ</Text>
                <Text fontSize="sm" color="gray.500">
                  กำหนดเวลาสร้างรายงานแบบอัตโนมัติ
                </Text>
              </VStack>
            </HStack>
            <Button
              leftIcon={<Icon as={IoAdd} />}
              colorScheme="blue"
              onClick={onOpen}
            >
              เพิ่มตารางใหม่
            </Button>
          </HStack>
        </CardHeader>
      </Card>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          <AlertDescription>
            ยังไม่มีตารางรายงานอัตโนมัติ คลิกปุ่ม "เพิ่มตารางใหม่" เพื่อสร้างตารางรายงาน
          </AlertDescription>
        </Alert>
      ) : (
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Text fontSize="md" fontWeight="bold">ตารางรายงานทั้งหมด</Text>
              <Badge colorScheme="blue" variant="subtle">
                {schedules.filter(s => s.active).length} / {schedules.length} เปิดใช้งาน
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>ประเภทรายงาน</Th>
                    <Th>ความถี่</Th>
                    <Th>สถานะ</Th>
                    <Th>สร้างเมื่อ</Th>
                    <Th>รันครั้งถัดไป</Th>
                    <Th>จัดการ</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {schedules.map((schedule) => (
                    <Tr key={schedule.id}>
                      <Td>
                        <HStack spacing={2}>
                          <Icon as={IoStatsChart} color="gray.500" />
                          <Text>{getReportTypeLabel(schedule.reportType)}</Text>
                        </HStack>
                      </Td>
                      <Td>{getFrequencyLabel(schedule.frequency)}</Td>
                      <Td>
                        <Badge 
                          colorScheme={getStatusColor(schedule.active)} 
                          variant="solid"
                        >
                          {getStatusLabel(schedule.active)}
                        </Badge>
                      </Td>
                      <Td>
                        {new Date(schedule.createdAt).toLocaleDateString("th-TH")}
                      </Td>
                      <Td>
                        {schedule.active ? calculateNextRun(schedule.frequency) : "-"}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label={schedule.active ? "หยุดการทำงาน" : "เริ่มการทำงาน"}
                            icon={<Icon as={schedule.active ? IoPause : IoPlay} />}
                            size="sm"
                            colorScheme={schedule.active ? "orange" : "green"}
                            variant="ghost"
                            onClick={() => handleToggleSchedule(schedule.id, schedule.active)}
                          />
                          <IconButton
                            aria-label="ลบตารางรายงาน"
                            icon={<Icon as={IoTrash} />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      )}

      {/* Add Schedule Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={IoAdd} color="blue.500" />
              <Text>เพิ่มตารางรายงานใหม่</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>ประเภทรายงาน</FormLabel>
                <Select
                  value={newReportType}
                  onChange={(e) => setNewReportType(e.target.value)}
                >
                  {reportTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>ความถี่ในการสร้างรายงาน</FormLabel>
                <Select
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value as any)}
                >
                  {frequencyOptions.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <HStack justify="space-between">
                <Text>ส่งการแจ้งเตือนเมื่อรายงานเสร็จ</Text>
                <Switch
                  isChecked={autoNotify}
                  onChange={(e) => setAutoNotify(e.target.checked)}
                  colorScheme="blue"
                />
              </HStack>

              <Alert status="info" size="sm">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  รายงานจะถูกสร้างและส่งออกในรูปแบบ PDF โดยอัตโนมัติตามเวลาที่กำหนด
                </AlertDescription>
              </Alert>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                ยกเลิก
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleCreateSchedule}
                leftIcon={<Icon as={IoCalendar} />}
              >
                สร้างตารางรายงาน
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ReportScheduler;