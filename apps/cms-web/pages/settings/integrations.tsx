import { ReactElement, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Button,
  Icon,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Select,
  Divider,
  useToast,
  SimpleGrid,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Code,
  Textarea,
  InputGroup,
  InputRightElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  FiDatabase,
  FiSave,
  FiRefreshCw,
  FiKey,
  FiGlobe,
  FiCreditCard,
  FiMail,
  FiMessageSquare,
  FiCloud,
  FiSettings,
  FiLink,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiRotateCcw,
} from "react-icons/fi";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
import { NextPageWithLayout } from "../_app";

interface Integration {
  id: number;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "error";
  apiKey: string;
  lastSync: string;
  description: string;
}

function IntegrationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState<{ [key: number]: boolean }>(
    {}
  );
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 1,
      name: "Stripe Payment",
      type: "payment",
      status: "connected",
      apiKey: "sk_test_51XXXXXXXXXXXXXXXXXX",
      lastSync: "5 นาทีที่แล้ว",
      description: "ระบบรับชำระเงินออนไลน์",
    },
    {
      id: 2,
      name: "SendGrid Email",
      type: "email",
      status: "connected",
      apiKey: "SG.XXXXXXXXXXXXXXXXXXXXXXXX",
      lastSync: "10 นาทีที่แล้ว",
      description: "ระบบส่งอีเมลอัตโนมัติ",
    },
    {
      id: 3,
      name: "Google Analytics",
      type: "analytics",
      status: "disconnected",
      apiKey: "",
      lastSync: "ไม่เคยซิงค์",
      description: "วิเคราะห์ข้อมูลการใช้งานเว็บไซต์",
    },
    {
      id: 4,
      name: "Telegram Bot",
      type: "notification",
      status: "connected",
      apiKey: "1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lastSync: "2 นาทีที่แล้ว",
      description: "ส่งการแจ้งเตือนผ่าน Telegram Bot",
    },
    {
      id: 5,
      name: "Facebook Pixel",
      type: "marketing",
      status: "error",
      apiKey: "XXXXXXXXXXXXXXX",
      lastSync: "1 ชั่วโมงที่แล้ว",
      description: "ติดตามการใช้งานสำหรับโฆษณา",
    },
  ]);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "บันทึกการตั้งค่าการเชื่อมต่อสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }, 1000);
  };

  const toggleApiKeyVisibility = (id: number) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "คัดลอก API Key แล้ว",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const integrationStats = [
    {
      label: "การเชื่อมต่อทั้งหมด",
      value: "5",
      color: "blue",
      icon: FiLink,
    },
    {
      label: "เชื่อมต่อสำเร็จ",
      value: "3",
      color: "green",
      icon: FiCheckCircle,
    },
    {
      label: "มีปัญหา",
      value: "1",
      color: "red",
      icon: FiAlertCircle,
    },
  ];

  const availableIntegrations = [
    {
      name: "PayPal",
      type: "payment",
      description: "รับชำระเงินผ่าน PayPal",
      icon: FiCreditCard,
      popular: true,
    },
    {
      name: "Telegram Bot",
      type: "notification",
      description: "ส่งการแจ้งเตือนผ่าน Telegram Bot",
      icon: FiMessageSquare,
      popular: true,
    },
    {
      name: "AWS S3",
      type: "storage",
      description: "จัดเก็บไฟล์บน Amazon S3",
      icon: FiCloud,
      popular: false,
    },
    {
      name: "Mailchimp",
      type: "marketing",
      description: "ระบบ Email Marketing",
      icon: FiMail,
      popular: false,
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box mb={8}>
        <Heading size="lg" mb={2} fontFamily="heading">
          การเชื่อมต่อ
        </Heading>
        <Text color="gray.600">
          จัดการ API Keys และการเชื่อมต่อกับระบบภายนอก
        </Text>
      </Box>

      {/* Integration Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        {integrationStats.map((stat, index) => (
          <Card key={index}>
            <CardBody>
              <Stat>
                <HStack justify="space-between" mb={2}>
                  <Icon
                    as={stat.icon}
                    boxSize={6}
                    color={`${stat.color}.500`}
                  />
                  <Badge colorScheme={stat.color}>Live</Badge>
                </HStack>
                <StatLabel>{stat.label}</StatLabel>
                <StatNumber color={`${stat.color}.500`}>
                  {stat.value}
                </StatNumber>
                <StatHelpText>บริการที่เชื่อมต่อ</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>การเชื่อมต่อปัจจุบัน</Tab>
          <Tab>เพิ่มการเชื่อมต่อ</Tab>
          <Tab>API Management</Tab>
        </TabList>

        <TabPanels>
          {/* Current Integrations */}
          <TabPanel px={0}>
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FiLink} boxSize={5} />
                  <Heading size="md">การเชื่อมต่อที่มีอยู่</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>บริการ</Th>
                        <Th>ประเภท</Th>
                        <Th>สถานะ</Th>
                        <Th>API Key</Th>
                        <Th>ซิงค์ล่าสุด</Th>
                        <Th>จัดการ</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {integrations.map((integration) => (
                        <Tr key={integration.id}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="semibold">
                                {integration.name}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {integration.description}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge
                              variant="outline"
                              colorScheme={
                                integration.type === "payment"
                                  ? "green"
                                  : integration.type === "email"
                                  ? "blue"
                                  : integration.type === "analytics"
                                  ? "purple"
                                  : "orange"
                              }
                            >
                              {integration.type === "payment" && "Payment"}
                              {integration.type === "email" && "Email"}
                              {integration.type === "analytics" && "Analytics"}
                              {integration.type === "marketing" && "Marketing"}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack>
                              <Icon
                                as={
                                  integration.status === "connected"
                                    ? FiCheckCircle
                                    : integration.status === "error"
                                    ? FiAlertCircle
                                    : FiAlertCircle
                                }
                                color={
                                  integration.status === "connected"
                                    ? "green.500"
                                    : integration.status === "error"
                                    ? "red.500"
                                    : "gray.500"
                                }
                              />
                              <Badge
                                colorScheme={
                                  integration.status === "connected"
                                    ? "green"
                                    : integration.status === "error"
                                    ? "red"
                                    : "gray"
                                }
                              >
                                {integration.status === "connected" &&
                                  "เชื่อมต่อแล้ว"}
                                {integration.status === "disconnected" &&
                                  "ยังไม่เชื่อมต่อ"}
                                {integration.status === "error" && "มีปัญหา"}
                              </Badge>
                            </HStack>
                          </Td>
                          <Td>
                            {integration.apiKey ? (
                              <HStack spacing={2}>
                                <Code fontSize="xs" maxW="100px">
                                  {showApiKeys[integration.id]
                                    ? integration.apiKey
                                    : "•".repeat(integration.apiKey.length)}
                                </Code>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  onClick={() =>
                                    toggleApiKeyVisibility(integration.id)
                                  }
                                >
                                  <Icon
                                    as={
                                      showApiKeys[integration.id]
                                        ? FiEyeOff
                                        : FiEye
                                    }
                                  />
                                </Button>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => copyApiKey(integration.apiKey)}
                                >
                                  <Icon as={FiCopy} />
                                </Button>
                              </HStack>
                            ) : (
                              <Text fontSize="sm" color="gray.500">
                                ไม่มี
                              </Text>
                            )}
                          </Td>
                          <Td fontSize="sm">{integration.lastSync}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                              >
                                <Icon as={FiEdit} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                              >
                                <Icon as={FiRotateCcw} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                              >
                                <Icon as={FiTrash2} />
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Add New Integration */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {availableIntegrations.map((integration, index) => (
                <Card key={index} position="relative">
                  {integration.popular && (
                    <Badge
                      position="absolute"
                      top={2}
                      right={2}
                      colorScheme="orange"
                      variant="solid"
                      fontSize="xs"
                    >
                      ยอดนิยม
                    </Badge>
                  )}
                  <CardBody>
                    <VStack spacing={4} align="start">
                      <HStack>
                        <Icon
                          as={integration.icon}
                          boxSize={8}
                          color="blue.500"
                        />
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="semibold" fontSize="lg">
                            {integration.name}
                          </Text>
                          <Badge variant="outline">{integration.type}</Badge>
                        </VStack>
                      </HStack>

                      <Text fontSize="sm" color="gray.600">
                        {integration.description}
                      </Text>

                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="blue"
                        size="sm"
                        w="full"
                        onClick={onOpen}
                      >
                        เชื่อมต่อ
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </TabPanel>

          {/* API Management */}
          <TabPanel px={0}>
            <VStack spacing={6} align="stretch">
              {/* API Security Settings */}
              <Card>
                <CardHeader>
                  <HStack>
                    <Icon as={FiKey} boxSize={5} />
                    <Heading size="md">การจัดการ API Key</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl>
                        <FormLabel>API Key หลัก</FormLabel>
                        <InputGroup>
                          <Input
                            type="password"
                            defaultValue="sk_live_XXXXXXXXXXXXXXXXXX"
                            isReadOnly
                          />
                          <InputRightElement>
                            <Button variant="ghost" size="sm">
                              <Icon as={FiEye} />
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Webhook Secret</FormLabel>
                        <InputGroup>
                          <Input
                            type="password"
                            defaultValue="whsec_XXXXXXXXXXXXXXXXXX"
                            isReadOnly
                          />
                          <InputRightElement>
                            <Button variant="ghost" size="sm">
                              <Icon as={FiEye} />
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                    </SimpleGrid>

                    <Divider />

                    <VStack spacing={4} align="stretch">
                      <Text fontWeight="semibold">การตั้งค่าความปลอดภัย</Text>

                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text>IP Whitelist</Text>
                          <Text fontSize="sm" color="gray.600">
                            จำกัดการเข้าถึง API จาก IP ที่กำหนด
                          </Text>
                        </VStack>
                        <Switch colorScheme="green" />
                      </HStack>

                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text>Rate Limiting</Text>
                          <Text fontSize="sm" color="gray.600">
                            จำกัดจำนวนการเรียก API ต่อนาที
                          </Text>
                        </VStack>
                        <Switch defaultChecked colorScheme="blue" />
                      </HStack>

                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text>API Logging</Text>
                          <Text fontSize="sm" color="gray.600">
                            บันทึกการใช้งาน API ทั้งหมด
                          </Text>
                        </VStack>
                        <Switch defaultChecked colorScheme="purple" />
                      </HStack>
                    </VStack>

                    <Divider />

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl>
                        <FormLabel>Rate Limit (ต่อนาที)</FormLabel>
                        <Input type="number" defaultValue="1000" />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Webhook Timeout (วินาที)</FormLabel>
                        <Input type="number" defaultValue="30" />
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </CardBody>
              </Card>

              {/* Webhook Settings */}
              <Card>
                <CardHeader>
                  <HStack>
                    <Icon as={FiGlobe} boxSize={5} />
                    <Heading size="md">Webhook Endpoints</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Order Webhook URL</FormLabel>
                      <Input defaultValue="https://your-domain.com/webhooks/orders" />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Payment Webhook URL</FormLabel>
                      <Input defaultValue="https://your-domain.com/webhooks/payments" />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Customer Webhook URL</FormLabel>
                      <Input defaultValue="https://your-domain.com/webhooks/customers" />
                    </FormControl>

                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle fontSize="sm">คำแนะนำ</AlertTitle>
                        <AlertDescription fontSize="sm">
                          URL เหล่านี้จะใช้สำหรับรับการแจ้งเตือนจากระบบภายนอก
                        </AlertDescription>
                      </Box>
                    </Alert>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Save Button */}
      <Card mt={6}>
        <CardBody>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold">บันทึกการเปลี่ยนแปลง</Text>
              <Text fontSize="sm" color="gray.600">
                บันทึกการตั้งค่าการเชื่อมต่อที่ได้เปลี่ยนแปลง
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Button leftIcon={<FiRefreshCw />} variant="outline">
                รีเซ็ต
              </Button>
              <Button
                leftIcon={<FiSave />}
                colorScheme="blue"
                isLoading={isLoading}
                onClick={handleSave}
              >
                บันทึกการตั้งค่า
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      {/* Add Integration Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={FiPlus} />
              <Text>เพิ่มการเชื่อมต่อใหม่</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>ชื่อการเชื่อมต่อ</FormLabel>
                <Input placeholder="เช่น Telegram Bot Production" />
              </FormControl>

              <FormControl>
                <FormLabel>API Key / Token</FormLabel>
                <Input
                  type="password"
                  placeholder="ใส่ Bot Token (เช่น 1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ)"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Chat ID (ถ้ามี)</FormLabel>
                <Input type="text" placeholder="ใส่ Chat ID สำหรับส่งข้อความ" />
              </FormControl>

              <FormControl>
                <FormLabel>Environment</FormLabel>
                <Select>
                  <option value="production">Production</option>
                  <option value="sandbox">Sandbox/Testing</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>หมายเหตุ</FormLabel>
                <Textarea placeholder="ระบุรายละเอียดเพิ่มเติม" rows={3} />
              </FormControl>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">ข้อมูลความปลอดภัย</AlertTitle>
                  <AlertDescription fontSize="sm">
                    API Key ของคุณจะถูกเข้ารหัสและจัดเก็บอย่างปลอดภัย
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              ยกเลิก
            </Button>
            <Button colorScheme="blue" onClick={onClose}>
              เพิ่มการเชื่อมต่อ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

const Integrations: NextPageWithLayout = () => {
  return <IntegrationsPage />;
};

Integrations.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default withAuth(Integrations);
