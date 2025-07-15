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
  Textarea,
  Divider,
  useToast,
  SimpleGrid,
  Badge,
  Checkbox,
  CheckboxGroup,
  Stack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
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
} from "@chakra-ui/react";
import {
  FiBell,
  FiSave,
  FiRefreshCw,
  FiMail,
  FiSmartphone,
  FiMessageSquare,
  FiSlack,
  FiSettings,
  FiVolume2,
  FiVolumeX,
  FiClock,
  FiUsers,
  FiShoppingCart,
  FiPackage,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiPlus,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
import { NextPageWithLayout } from "../_app";

interface NotificationRule {
  id: number;
  name: string;
  event: string;
  channels: string[];
  enabled: boolean;
  conditions: string;
}

function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [notificationRules, setNotificationRules] = useState<
    NotificationRule[]
  >([
    {
      id: 1,
      name: "คำสั่งซื้อใหม่",
      event: "new_order",
      channels: ["email", "sms"],
      enabled: true,
      conditions: "ทุกคำสั่งซื้อ",
    },
    {
      id: 2,
      name: "สินค้าใกล้หมด",
      event: "low_stock",
      channels: ["email"],
      enabled: true,
      conditions: "เมื่อสินค้าเหลือน้อยกว่า 10 ชิ้น",
    },
    {
      id: 3,
      name: "การชำระเงิน",
      event: "payment_received",
      channels: ["email", "push"],
      enabled: true,
      conditions: "เมื่อได้รับการชำระเงิน",
    },
    {
      id: 4,
      name: "การเข้าสู่ระบบผิดปกติ",
      event: "suspicious_login",
      channels: ["email", "sms", "push"],
      enabled: true,
      conditions: "เมื่อมีการเข้าสู่ระบบจากตำแหน่งใหม่",
    },
  ]);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "บันทึกการตั้งค่าการแจ้งเตือนสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }, 1000);
  };

  const notificationStats = [
    {
      label: "การแจ้งเตือนวันนี้",
      value: "24",
      change: "+12%",
      color: "blue",
      icon: FiBell,
    },
    {
      label: "อีเมลที่ส่งแล้ว",
      value: "156",
      change: "+8%",
      color: "green",
      icon: FiMail,
    },
    {
      label: "SMS ที่ส่งแล้ว",
      value: "32",
      change: "+5%",
      color: "orange",
      icon: FiSmartphone,
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box mb={8}>
        <Heading size="lg" mb={2} fontFamily="heading">
          การแจ้งเตือน
        </Heading>
        <Text color="gray.600">
          ตั้งค่าการแจ้งเตือนผ่าน Email, SMS และช่องทางอื่นๆ
        </Text>
      </Box>

      {/* Notification Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        {notificationStats.map((stat, index) => (
          <Card key={index}>
            <CardBody>
              <Stat>
                <HStack justify="space-between" mb={2}>
                  <Icon
                    as={stat.icon}
                    boxSize={6}
                    color={`${stat.color}.500`}
                  />
                  <Badge colorScheme={stat.color}>{stat.change}</Badge>
                </HStack>
                <StatLabel>{stat.label}</StatLabel>
                <StatNumber color={`${stat.color}.500`}>
                  {stat.value}
                </StatNumber>
                <StatHelpText>เทียบกับเมื่อวาน</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Channel Settings */}
      <Card mb={6}>
        <CardHeader>
          <HStack>
            <Icon as={FiSettings} boxSize={5} />
            <Heading size="md">ช่องทางการแจ้งเตือน</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Email Settings */}
            <Box>
              <HStack justify="space-between" mb={4}>
                <HStack>
                  <Icon as={FiMail} boxSize={5} color="blue.500" />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">อีเมล</Text>
                    <Text fontSize="sm" color="gray.600">
                      ส่งการแจ้งเตือนผ่านอีเมล
                    </Text>
                  </VStack>
                </HStack>
                <Switch
                  isChecked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  colorScheme="blue"
                  size="lg"
                />
              </HStack>

              {emailEnabled && (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} pl={10}>
                  <FormControl>
                    <FormLabel fontSize="sm">อีเมลหลัก</FormLabel>
                    <Input defaultValue="admin@shopflow.com" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm">อีเมลสำรอง</FormLabel>
                    <Input placeholder="backup@shopflow.com" />
                  </FormControl>
                </SimpleGrid>
              )}
            </Box>

            <Divider />

            {/* SMS Settings */}
            <Box>
              <HStack justify="space-between" mb={4}>
                <HStack>
                  <Icon as={FiSmartphone} boxSize={5} color="green.500" />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">SMS</Text>
                    <Text fontSize="sm" color="gray.600">
                      ส่งการแจ้งเตือนผ่าน SMS
                    </Text>
                  </VStack>
                </HStack>
                <Switch
                  isChecked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  colorScheme="green"
                  size="lg"
                />
              </HStack>

              {smsEnabled && (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} pl={10}>
                  <FormControl>
                    <FormLabel fontSize="sm">เบอร์โทรหลัก</FormLabel>
                    <Input defaultValue="081-234-5678" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm">เบอร์โทรสำรอง</FormLabel>
                    <Input placeholder="089-876-5432" />
                  </FormControl>
                </SimpleGrid>
              )}
            </Box>

            <Divider />

            {/* Push Notifications */}
            <Box>
              <HStack justify="space-between" mb={4}>
                <HStack>
                  <Icon as={FiVolume2} boxSize={5} color="purple.500" />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Push Notifications</Text>
                    <Text fontSize="sm" color="gray.600">
                      การแจ้งเตือนผ่านเบราว์เซอร์
                    </Text>
                  </VStack>
                </HStack>
                <Switch
                  isChecked={pushEnabled}
                  onChange={(e) => setPushEnabled(e.target.checked)}
                  colorScheme="purple"
                  size="lg"
                />
              </HStack>
            </Box>

            <Divider />

            {/* Slack Integration */}
            <Box>
              <HStack justify="space-between" mb={4}>
                <HStack>
                  <Icon as={FiSlack} boxSize={5} color="orange.500" />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Slack</Text>
                    <Text fontSize="sm" color="gray.600">
                      ส่งการแจ้งเตือนไปยัง Slack Workspace
                    </Text>
                  </VStack>
                </HStack>
                <Switch
                  isChecked={slackEnabled}
                  onChange={(e) => setSlackEnabled(e.target.checked)}
                  colorScheme="orange"
                  size="lg"
                />
              </HStack>

              {slackEnabled && (
                <VStack spacing={4} pl={10} align="stretch">
                  <FormControl>
                    <FormLabel fontSize="sm">Webhook URL</FormLabel>
                    <Input placeholder="https://hooks.slack.com/services/..." />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm">ช่อง (Channel)</FormLabel>
                    <Input placeholder="#notifications" />
                  </FormControl>
                </VStack>
              )}
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Notification Rules */}
      <Card mb={6}>
        <CardHeader>
          <HStack justify="space-between">
            <HStack>
              <Icon as={FiBell} boxSize={5} />
              <Heading size="md">กฎการแจ้งเตือน</Heading>
            </HStack>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              size="sm"
              onClick={onOpen}
            >
              เพิ่มกฎใหม่
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ชื่อกฎ</Th>
                  <Th>เหตุการณ์</Th>
                  <Th>ช่องทาง</Th>
                  <Th>เงื่อนไข</Th>
                  <Th>สถานะ</Th>
                  <Th>จัดการ</Th>
                </Tr>
              </Thead>
              <Tbody>
                {notificationRules.map((rule) => (
                  <Tr key={rule.id}>
                    <Td fontWeight="semibold">{rule.name}</Td>
                    <Td>
                      <Badge variant="outline">
                        {rule.event === "new_order" && "คำสั่งซื้อใหม่"}
                        {rule.event === "low_stock" && "สินค้าใกล้หมด"}
                        {rule.event === "payment_received" && "รับชำระเงิน"}
                        {rule.event === "suspicious_login" &&
                          "เข้าสู่ระบบผิดปกติ"}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        {rule.channels.map((channel) => (
                          <Badge
                            key={channel}
                            size="sm"
                            colorScheme={
                              channel === "email"
                                ? "blue"
                                : channel === "sms"
                                ? "green"
                                : channel === "push"
                                ? "purple"
                                : "orange"
                            }
                          >
                            {channel === "email" && "Email"}
                            {channel === "sms" && "SMS"}
                            {channel === "push" && "Push"}
                            {channel === "slack" && "Slack"}
                          </Badge>
                        ))}
                      </HStack>
                    </Td>
                    <Td fontSize="sm" color="gray.600">
                      {rule.conditions}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={rule.enabled ? "green" : "gray"}
                        variant={rule.enabled ? "solid" : "outline"}
                      >
                        {rule.enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button size="sm" variant="ghost" colorScheme="blue">
                          <Icon as={FiEdit} />
                        </Button>
                        <Button size="sm" variant="ghost" colorScheme="red">
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

      {/* Quiet Hours */}
      <Card mb={6}>
        <CardHeader>
          <HStack>
            <Icon as={FiClock} boxSize={5} />
            <Heading size="md">ช่วงเวลาเงียบ</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold">เปิดใช้งานช่วงเวลาเงียบ</Text>
                <Text fontSize="sm" color="gray.600">
                  ไม่ส่งการแจ้งเตือนในช่วงเวลาที่กำหนด
                </Text>
              </VStack>
              <Switch
                isChecked={quietHoursEnabled}
                onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                colorScheme="blue"
                size="lg"
              />
            </HStack>

            {quietHoursEnabled && (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl>
                  <FormLabel>เวลาเริ่มต้น</FormLabel>
                  <Input type="time" defaultValue="22:00" />
                </FormControl>
                <FormControl>
                  <FormLabel>เวลาสิ้นสุด</FormLabel>
                  <Input type="time" defaultValue="08:00" />
                </FormControl>
              </SimpleGrid>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Save Button */}
      <Card>
        <CardBody>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold">บันทึกการเปลี่ยนแปลง</Text>
              <Text fontSize="sm" color="gray.600">
                บันทึกการตั้งค่าการแจ้งเตือนที่ได้เปลี่ยนแปลง
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

      {/* Add Rule Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={FiPlus} />
              <Text>เพิ่มกฎการแจ้งเตือน</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>ชื่อกฎ</FormLabel>
                <Input placeholder="ใส่ชื่อกฎการแจ้งเตือน" />
              </FormControl>

              <FormControl>
                <FormLabel>เหตุการณ์</FormLabel>
                <Select placeholder="เลือกเหตุการณ์">
                  <option value="new_order">คำสั่งซื้อใหม่</option>
                  <option value="low_stock">สินค้าใกล้หมด</option>
                  <option value="payment_received">รับชำระเงิน</option>
                  <option value="suspicious_login">เข้าสู่ระบบผิดปกติ</option>
                  <option value="new_customer">ลูกค้าใหม่</option>
                  <option value="high_value_order">คำสั่งซื้อมูลค่าสูง</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>ช่องทางการแจ้งเตือน</FormLabel>
                <CheckboxGroup>
                  <Stack direction="column" spacing={2}>
                    <Checkbox value="email" colorScheme="blue">
                      อีเมล
                    </Checkbox>
                    <Checkbox value="sms" colorScheme="green">
                      SMS
                    </Checkbox>
                    <Checkbox value="push" colorScheme="purple">
                      Push Notification
                    </Checkbox>
                    <Checkbox value="slack" colorScheme="orange">
                      Slack
                    </Checkbox>
                  </Stack>
                </CheckboxGroup>
              </FormControl>

              <FormControl>
                <FormLabel>เงื่อนไข</FormLabel>
                <Textarea placeholder="อธิบายเงื่อนไขการแจ้งเตือน" rows={3} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              ยกเลิก
            </Button>
            <Button colorScheme="blue" onClick={onClose}>
              เพิ่มกฎ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

const Notifications: NextPageWithLayout = () => {
  return <NotificationsPage />;
};

Notifications.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default withAuth(Notifications);
