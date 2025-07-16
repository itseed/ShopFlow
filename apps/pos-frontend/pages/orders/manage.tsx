import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
  Icon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  IoList,
  IoAnalytics,
  IoSearch,
  IoAdd,
  IoHome,
  IoReceipt,
  IoArrowUndo,
  IoEye,
  IoRefresh,
  IoFilter,
  IoDownload,
  IoPrint,
} from "react-icons/io5";
import { useRouter } from "next/router";
import { SalesTransaction } from "@shopflow/types";
import OrderSearch from "../../components/orders/OrderSearch";
import OrderDetail from "../../components/orders/OrderDetail";
import OrderStats from "../../components/orders/OrderStats";

const OrderManagement: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<SalesTransaction | null>(
    null
  );
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleOrderSelect = (order: SalesTransaction) => {
    setSelectedOrder(order);
    onOpen();
  };

  const handleRefund = async (refundData: {
    transactionId: string;
    amount: number;
    reason: string;
    items: Array<{
      id: string;
      quantity: number;
      reason: string;
    }>;
  }) => {
    try {
      // Simulate refund processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "คำขอคืนเงินสำเร็จ",
        description: `คำขอคืนเงินจำนวน ${refundData.amount} บาท ได้รับการส่งเพื่อขออนุมัติ`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Refresh data
      setRefreshKey((prev) => prev + 1);

      // Navigate to returns page
      router.push("/orders/returns");
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดำเนินการคืนเงินได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleExportData = async () => {
    try {
      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "ส่งออกข้อมูลสำเร็จ",
        description: "ข้อมูลคำสั่งซื้อได้รับการส่งออกเป็นไฟล์ Excel",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งออกข้อมูลได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePrintReport = async () => {
    try {
      // Simulate print
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "พิมพ์รายงานสำเร็จ",
        description: "รายงานคำสั่งซื้อได้รับการส่งไปยังเครื่องพิมพ์",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถพิมพ์รายงานได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRefreshData = () => {
    setRefreshKey((prev) => prev + 1);
    toast({
      title: "รีเฟรชข้อมูลสำเร็จ",
      description: "ข้อมูลได้รับการอัพเดตแล้ว",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <Icon as={IoHome} mr={2} />
                หน้าหลัก
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>
                <Icon as={IoReceipt} mr={2} />
                จัดการคำสั่งซื้อ
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <HStack justify="space-between" align="center" mt={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold">
                จัดการคำสั่งซื้อ
              </Text>
              <Text fontSize="md" color="gray.500">
                ติดตามและจัดการคำสั่งซื้อทั้งหมด
              </Text>
            </VStack>

            <HStack spacing={3}>
              <Button
                leftIcon={<IoRefresh />}
                onClick={handleRefreshData}
                variant="outline"
                size="sm"
              >
                รีเฟรช
              </Button>
              <Button
                leftIcon={<IoPrint />}
                onClick={handlePrintReport}
                variant="outline"
                size="sm"
              >
                พิมพ์รายงาน
              </Button>
              <Button
                leftIcon={<IoDownload />}
                onClick={handleExportData}
                variant="outline"
                size="sm"
              >
                ส่งออกข้อมูล
              </Button>
              <Button
                leftIcon={<IoArrowUndo />}
                onClick={() => router.push("/orders/returns")}
                colorScheme="orange"
                size="sm"
              >
                จัดการคืนเงิน
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Quick Stats */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <HStack spacing={8} justify="space-around">
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  156
                </Text>
                <Text fontSize="sm" color="gray.500">
                  คำสั่งซื้อวันนี้
                </Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  ฿45,600
                </Text>
                <Text fontSize="sm" color="gray.500">
                  ยอดขายวันนี้
                </Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  5
                </Text>
                <Text fontSize="sm" color="gray.500">
                  รอดำเนินการ
                </Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  1
                </Text>
                <Text fontSize="sm" color="gray.500">
                  รอคืนเงิน
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Main Content */}
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>
              <Icon as={IoSearch} mr={2} />
              ค้นหาคำสั่งซื้อ
            </Tab>
            <Tab>
              <Icon as={IoList} mr={2} />
              รายการคำสั่งซื้อ
            </Tab>
            <Tab>
              <Icon as={IoAnalytics} mr={2} />
              สถิติและรายงาน
            </Tab>
          </TabList>

          <TabPanels>
            {/* Search Orders */}
            <TabPanel>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <Text fontSize="lg" fontWeight="medium">
                    ค้นหาคำสั่งซื้อ
                  </Text>
                </CardHeader>
                <CardBody>
                  <OrderSearch
                    onOrderSelect={handleOrderSelect}
                    showSelectButton={true}
                    title="ค้นหาคำสั่งซื้อด้วยเลขที่คำสั่ง ใบเสร็จ หรือข้อมูลลูกค้า"
                  />
                </CardBody>
              </Card>
            </TabPanel>

            {/* Order History */}
            <TabPanel>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="medium">
                      ประวัติคำสั่งซื้อ
                    </Text>
                    <HStack spacing={2}>
                      <Button
                        leftIcon={<IoFilter />}
                        size="sm"
                        variant="outline"
                      >
                        ตัวกรอง
                      </Button>
                      <Button
                        leftIcon={<IoEye />}
                        size="sm"
                        colorScheme="blue"
                        onClick={() => router.push("/orders")}
                      >
                        ดูทั้งหมด
                      </Button>
                    </HStack>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Alert status="info">
                    <AlertIcon />
                    <AlertTitle>ข้อมูลคำสั่งซื้อ</AlertTitle>
                    <AlertDescription>
                      คลิกปุ่ม "ดูทั้งหมด" เพื่อเปิดหน้าประวัติคำสั่งซื้อแบบเต็ม
                      หรือใช้การค้นหาในแท็บ "ค้นหาคำสั่งซื้อ"
                    </AlertDescription>
                  </Alert>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Statistics */}
            <TabPanel>
              <OrderStats key={refreshKey} />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Quick Actions */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="medium">
              การดำเนินการด่วน
            </Text>
          </CardHeader>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <Button
                leftIcon={<IoAdd />}
                colorScheme="blue"
                onClick={() => router.push("/sales")}
              >
                สร้างคำสั่งซื้อใหม่
              </Button>
              <Button
                leftIcon={<IoList />}
                variant="outline"
                onClick={() => router.push("/orders")}
              >
                ดูคำสั่งซื้อทั้งหมด
              </Button>
              <Button
                leftIcon={<IoArrowUndo />}
                variant="outline"
                colorScheme="orange"
                onClick={() => router.push("/orders/returns")}
              >
                จัดการคืนเงิน
              </Button>
              <Button
                leftIcon={<IoAnalytics />}
                variant="outline"
                colorScheme="purple"
                onClick={() => setActiveTab(2)}
              >
                ดูรายงาน
              </Button>
            </HStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack justify="space-between">
                <Text>รายละเอียดคำสั่งซื้อ</Text>
                <Badge colorScheme="blue">
                  {selectedOrder.transactionNumber}
                </Badge>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <OrderDetail
                order={selectedOrder}
                onRefund={handleRefund}
                showActions={true}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default OrderManagement;
