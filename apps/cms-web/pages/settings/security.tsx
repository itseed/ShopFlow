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
  Divider,
  useToast,
  SimpleGrid,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  InputGroup,
  InputRightElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  PinInput,
  PinInputField,
  Center,
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
} from "@chakra-ui/react";
import {
  FiShield,
  FiSave,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiSmartphone,
  FiKey,
  FiLock,
  FiUser,
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiMapPin,
} from "react-icons/fi";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
import { NextPageWithLayout } from "../_app";

function SecurityPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
  const [passwordExpiryEnabled, setPasswordExpiryEnabled] = useState(true);
  const toast = useToast();
  const {
    isOpen: is2FAOpen,
    onOpen: on2FAOpen,
    onClose: on2FAClose,
  } = useDisclosure();
  const {
    isOpen: isPasswordOpen,
    onOpen: onPasswordOpen,
    onClose: onPasswordClose,
  } = useDisclosure();

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "บันทึกการตั้งค่าความปลอดภัยสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }, 1000);
  };

  const enable2FA = () => {
    setTwoFactorEnabled(true);
    on2FAClose();
    toast({
      title: "เปิดใช้งาน 2FA สำเร็จ",
      description:
        "บัญชีของคุณได้รับการป้องกันด้วย Two-Factor Authentication แล้ว",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  const loginHistory = [
    {
      id: 1,
      datetime: "15/07/2025 09:30:25",
      ip: "203.154.123.45",
      location: "กรุงเทพฯ, ประเทศไทย",
      device: "Chrome on Windows",
      status: "สำเร็จ",
    },
    {
      id: 2,
      datetime: "14/07/2025 18:45:12",
      ip: "203.154.123.45",
      location: "กรุงเทพฯ, ประเทศไทย",
      device: "Chrome on Windows",
      status: "สำเร็จ",
    },
    {
      id: 3,
      datetime: "14/07/2025 08:15:30",
      ip: "203.154.123.45",
      location: "กรุงเทพฯ, ประเทศไทย",
      device: "Chrome on Windows",
      status: "สำเร็จ",
    },
    {
      id: 4,
      datetime: "13/07/2025 22:10:05",
      ip: "180.123.45.67",
      location: "เชียงใหม่, ประเทศไทย",
      device: "Safari on iPhone",
      status: "ล้มเหลว",
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box mb={8}>
        <Heading size="lg" mb={2} fontFamily="heading">
          ความปลอดภัย
        </Heading>
        <Text color="gray.600">
          จัดการการตั้งค่าความปลอดภัยและการรับรองตัวตน
        </Text>
      </Box>

      {/* Security Status */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <HStack justify="space-between" mb={2}>
                <Icon as={FiShield} boxSize={6} color="green.500" />
                <Badge colorScheme="green">ปลอดภัย</Badge>
              </HStack>
              <StatLabel>ระดับความปลอดภัย</StatLabel>
              <StatNumber color="green.500">85%</StatNumber>
              <StatHelpText>ดีมาก - ปรับปรุงได้อีก</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <HStack justify="space-between" mb={2}>
                <Icon as={FiActivity} boxSize={6} color="blue.500" />
                <Badge colorScheme="blue">ใช้งาน</Badge>
              </HStack>
              <StatLabel>เซสชั่นที่เปิดอยู่</StatLabel>
              <StatNumber color="blue.500">3</StatNumber>
              <StatHelpText>อุปกรณ์ที่เข้าถึงอยู่</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <HStack justify="space-between" mb={2}>
                <Icon as={FiClock} boxSize={6} color="orange.500" />
                <Badge colorScheme="orange">30 วัน</Badge>
              </HStack>
              <StatLabel>รหัสผ่านหมดอายุใน</StatLabel>
              <StatNumber color="orange.500">30</StatNumber>
              <StatHelpText>วัน - ควรเปลี่ยนเร็วๆ นี้</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Password Security */}
      <Card mb={6}>
        <CardHeader>
          <HStack>
            <Icon as={FiLock} boxSize={5} />
            <Heading size="md">การจัดการรหัสผ่าน</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold">เปลี่ยนรหัสผ่าน</Text>
                <Text fontSize="sm" color="gray.600">
                  เปลี่ยนรหัสผ่านของคุณเป็นประจำเพื่อความปลอดภัย
                </Text>
              </VStack>
              <Button colorScheme="blue" onClick={onPasswordOpen}>
                เปลี่ยนรหัสผ่าน
              </Button>
            </HStack>

            <Divider />

            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold">รหัสผ่านหมดอายุอัตโนมัติ</Text>
                <Text fontSize="sm" color="gray.600">
                  บังคับให้เปลี่ยนรหัสผ่านทุก 90 วัน
                </Text>
              </VStack>
              <Switch
                isChecked={passwordExpiryEnabled}
                onChange={(e) => setPasswordExpiryEnabled(e.target.checked)}
                colorScheme="blue"
              />
            </HStack>

            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold">แจ้งเตือนการเข้าสู่ระบบ</Text>
                <Text fontSize="sm" color="gray.600">
                  ส่งการแจ้งเตือนเมื่อมีการเข้าสู่ระบบจากอุปกรณ์ใหม่
                </Text>
              </VStack>
              <Switch
                isChecked={loginAlertsEnabled}
                onChange={(e) => setLoginAlertsEnabled(e.target.checked)}
                colorScheme="green"
              />
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Two-Factor Authentication */}
      <Card mb={6}>
        <CardHeader>
          <HStack>
            <Icon as={FiSmartphone} boxSize={5} />
            <Heading size="md">Two-Factor Authentication (2FA)</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {!twoFactorEnabled ? (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>2FA ยังไม่ได้เปิดใช้งาน!</AlertTitle>
                  <AlertDescription>
                    เพิ่มความปลอดภัยให้กับบัญชีของคุณด้วยการยืนยันตัวตนแบบ 2
                    ชั้น
                  </AlertDescription>
                </Box>
              </Alert>
            ) : (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>2FA เปิดใช้งานแล้ว</AlertTitle>
                  <AlertDescription>
                    บัญชีของคุณได้รับการป้องกันด้วย Two-Factor Authentication
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold">
                  {twoFactorEnabled ? "จัดการ 2FA" : "เปิดใช้งาน 2FA"}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {twoFactorEnabled
                    ? "ปิดใช้งานหรือตั้งค่า 2FA ใหม่"
                    : "เพิ่มชั้นความปลอดภัยให้กับบัญชีของคุณ"}
                </Text>
              </VStack>
              <Button
                colorScheme={twoFactorEnabled ? "red" : "green"}
                variant={twoFactorEnabled ? "outline" : "solid"}
                onClick={on2FAOpen}
              >
                {twoFactorEnabled ? "จัดการ 2FA" : "เปิดใช้งาน"}
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Login History */}
      <Card mb={6}>
        <CardHeader>
          <HStack>
            <Icon as={FiActivity} boxSize={5} />
            <Heading size="md">ประวัติการเข้าสู่ระบบ</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>วันที่และเวลา</Th>
                  <Th>IP Address</Th>
                  <Th>ตำแหน่ง</Th>
                  <Th>อุปกรณ์</Th>
                  <Th>สถานะ</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loginHistory.map((login) => (
                  <Tr key={login.id}>
                    <Td>{login.datetime}</Td>
                    <Td fontFamily="mono" fontSize="sm">
                      {login.ip}
                    </Td>
                    <Td>
                      <HStack>
                        <Icon as={FiMapPin} boxSize={4} />
                        <Text>{login.location}</Text>
                      </HStack>
                    </Td>
                    <Td>{login.device}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          login.status === "สำเร็จ" ? "green" : "red"
                        }
                      >
                        {login.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Save Button */}
      <Card>
        <CardBody>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold">บันทึกการเปลี่ยนแปลง</Text>
              <Text fontSize="sm" color="gray.600">
                บันทึกการตั้งค่าความปลอดภัยที่ได้เปลี่ยนแปลง
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

      {/* 2FA Setup Modal */}
      <Modal isOpen={is2FAOpen} onClose={on2FAClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={FiSmartphone} />
              <Text>ตั้งค่า Two-Factor Authentication</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <Text textAlign="center" color="gray.600">
                สแกน QR Code ด้านล่างด้วยแอป Google Authenticator หรือ Authy
              </Text>

              <Box
                w="200px"
                h="200px"
                bg="gray.100"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="sm" color="gray.500">
                  QR Code สำหรับ 2FA
                </Text>
              </Box>

              <VStack spacing={3}>
                <Text fontWeight="semibold">ใส่รหัสยืนยัน 6 หลัก</Text>
                <Center>
                  <HStack>
                    <PinInput placeholder="○">
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                    </PinInput>
                  </HStack>
                </Center>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={on2FAClose}>
              ยกเลิก
            </Button>
            <Button colorScheme="green" onClick={enable2FA}>
              เปิดใช้งาน 2FA
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordOpen} onClose={onPasswordClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Icon as={FiLock} />
              <Text>เปลี่ยนรหัสผ่าน</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>รหัสผ่านปัจจุบัน</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="ใส่รหัสผ่านปัจจุบัน"
                  />
                  <InputRightElement>
                    <Button
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Icon as={showPassword ? FiEyeOff : FiEye} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>รหัสผ่านใหม่</FormLabel>
                <Input type="password" placeholder="ใส่รหัสผ่านใหม่" />
              </FormControl>

              <FormControl>
                <FormLabel>ยืนยันรหัสผ่านใหม่</FormLabel>
                <Input type="password" placeholder="ใส่รหัสผ่านใหม่อีกครั้ง" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPasswordClose}>
              ยกเลิก
            </Button>
            <Button colorScheme="blue" onClick={onPasswordClose}>
              เปลี่ยนรหัสผ่าน
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

const Security: NextPageWithLayout = () => {
  return <SecurityPage />;
};

Security.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default withAuth(Security);
