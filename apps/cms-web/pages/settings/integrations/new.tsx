import React, { useState } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../../_app";
import Layout from "../../../components/Layout";
import { withAuth } from "../../../lib/auth";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  useToast,
  SimpleGrid,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  Flex,
  Icon,
  Input,
  Select,
  Textarea,
  Switch,
  Divider,
  Code,
  Image,
  Progress,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiInfo,
  FiExternalLink,
  FiKey,
  FiSettings,
  FiShoppingCart,
  FiCreditCard,
  FiTruck,
  FiMail,
  FiMessageCircle,
  FiBarChart,
  FiCloud,
  FiDatabase,
  FiZap,
} from "react-icons/fi";
import Link from "next/link";

interface IntegrationService {
  id: string;
  name: string;
  description: string;
  category:
    | "payment"
    | "shipping"
    | "marketing"
    | "analytics"
    | "communication"
    | "storage";
  logo: string;
  popular: boolean;
  features: string[];
  pricing: string;
  documentation_url: string;
  setup_complexity: "easy" | "medium" | "advanced";
  requirements: string[];
}

interface IntegrationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const integrationServices: IntegrationService[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "ระบบชำระเงินออนไลน์ที่ปลอดภัยและเชื่อถือได้",
    category: "payment",
    logo: "/api/placeholder/60/60",
    popular: true,
    features: [
      "รับชำระเงินบัตรเครดิต/เดบิต",
      "QR Payment",
      "ผ่อนชำระ",
      "การคืนเงิน",
    ],
    pricing: "2.9% + ฿10 ต่อการทำรายการ",
    documentation_url: "https://stripe.com/docs",
    setup_complexity: "easy",
    requirements: ["API Key", "Webhook URL"],
  },
  {
    id: "omise",
    name: "Omise",
    description: "ระบบชำระเงินของไทยที่รองรับการชำระเงินหลากหลายรูปแบบ",
    category: "payment",
    logo: "/api/placeholder/60/60",
    popular: true,
    features: [
      "Internet Banking",
      "True Money Wallet",
      "Rabbit LINE Pay",
      "Alipay",
    ],
    pricing: "3.65% ต่อการทำรายการ",
    documentation_url: "https://docs.opn.ooo",
    setup_complexity: "medium",
    requirements: ["Public Key", "Secret Key", "Webhook Endpoint"],
  },
  {
    id: "thailand-post",
    name: "ไปรษณีย์ไทย",
    description: "บริการจัดส่งพัสดุทั่วประเทศไทย",
    category: "shipping",
    logo: "/api/placeholder/60/60",
    popular: true,
    features: ["EMS", "พัสดุธรรมดา", "ลงทะเบียน", "ติดตามพัสดุ"],
    pricing: "ตามระยะทางและน้ำหนัก",
    documentation_url: "https://trackapi.thailandpost.co.th",
    setup_complexity: "medium",
    requirements: ["API Token", "ที่อยู่ผู้ส่ง"],
  },
  {
    id: "kerry",
    name: "Kerry Express",
    description: "บริการขนส่งด่วนทั่วประเทศ",
    category: "shipping",
    logo: "/api/placeholder/60/60",
    popular: true,
    features: [
      "จัดส่งวันถัดไป",
      "จัดส่งแบบเร่งด่วน",
      "COD",
      "ติดตามพัสดุแบบเรียลไทม์",
    ],
    pricing: "เริ่มต้น ฿35",
    documentation_url: "https://api.kerryexpress.com",
    setup_complexity: "advanced",
    requirements: ["API Key", "Account ID", "ข้อมูลผู้ส่ง"],
  },
  {
    id: "line-notify",
    name: "LINE Notify",
    description: "ส่งการแจ้งเตือนผ่าน LINE",
    category: "communication",
    logo: "/api/placeholder/60/60",
    popular: false,
    features: ["ส่งข้อความ", "ส่งรูปภาพ", "การแจ้งเตือนแบบเรียลไทม์"],
    pricing: "ฟรี",
    documentation_url: "https://notify-bot.line.me/doc",
    setup_complexity: "easy",
    requirements: ["LINE Notify Token"],
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "วิเคราะห์ข้อมูลเว็บไซต์และพฤติกรรมผู้ใช้",
    category: "analytics",
    logo: "/api/placeholder/60/60",
    popular: true,
    features: [
      "ติดตามผู้เข้าชม",
      "วิเคราะห์การซื้อ",
      "รายงานแบบเรียลไทม์",
      "กรวยการขาย",
    ],
    pricing: "ฟรี",
    documentation_url: "https://developers.google.com/analytics",
    setup_complexity: "medium",
    requirements: ["Tracking ID", "API Key"],
  },
];

const setupSteps: IntegrationStep[] = [
  {
    id: "1",
    title: "เลือกบริการ",
    description: "เลือกบริการที่ต้องการเชื่อมต่อ",
    completed: false,
  },
  {
    id: "2",
    title: "กรอกข้อมูล",
    description: "กรอกข้อมูลการเชื่อมต่อและการตั้งค่า",
    completed: false,
  },
  {
    id: "3",
    title: "ทดสอบ",
    description: "ทดสอบการเชื่อมต่อและการทำงาน",
    completed: false,
  },
  {
    id: "4",
    title: "เปิดใช้งาน",
    description: "เปิดใช้งานการเชื่อมต่อ",
    completed: false,
  },
];

function NewIntegrationPage() {
  const toast = useToast();
  const [selectedService, setSelectedService] =
    useState<IntegrationService | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [connectionData, setConnectionData] = useState<{
    [key: string]: string;
  }>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<
    "success" | "failed" | null
  >(null);

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: setupSteps.length,
  });

  const {
    isOpen: isSetupModalOpen,
    onOpen: onSetupModalOpen,
    onClose: onSetupModalClose,
  } = useDisclosure();

  const categories = [
    { value: "all", label: "ทั้งหมด" },
    { value: "payment", label: "ชำระเงิน", icon: FiCreditCard },
    { value: "shipping", label: "จัดส่ง", icon: FiTruck },
    { value: "marketing", label: "การตลาด", icon: FiMail },
    { value: "analytics", label: "วิเคราะห์", icon: FiBarChart },
    { value: "communication", label: "การสื่อสาร", icon: FiMessageCircle },
    { value: "storage", label: "จัดเก็บข้อมูล", icon: FiCloud },
  ];

  const filteredServices = integrationServices.filter((service) => {
    const matchesCategory =
      selectedCategory === "all" || service.category === selectedCategory;
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectService = (service: IntegrationService) => {
    setSelectedService(service);
    setConnectionData({});
    setConnectionTestResult(null);
    setActiveStep(0);
    onSetupModalOpen();
  };

  const handleNextStep = () => {
    if (activeStep < setupSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);

    // Simulate API call
    setTimeout(() => {
      // Random success/failure for demo
      const success = Math.random() > 0.3;
      setConnectionTestResult(success ? "success" : "failed");
      setIsTestingConnection(false);

      if (success) {
        toast({
          title: "ทดสอบการเชื่อมต่อสำเร็จ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "ทดสอบการเชื่อมต่อล้มเหลว",
          description: "กรุณาตรวจสอบข้อมูลการเชื่อมต่อ",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }, 2000);
  };

  const handleCompleteSetup = () => {
    toast({
      title: "เชื่อมต่อเรียบร้อยแล้ว",
      description: `เชื่อมต่อกับ ${selectedService?.name} สำเร็จ`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    onSetupModalClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "payment":
        return FiCreditCard;
      case "shipping":
        return FiTruck;
      case "marketing":
        return FiMail;
      case "analytics":
        return FiBarChart;
      case "communication":
        return FiMessageCircle;
      case "storage":
        return FiCloud;
      default:
        return FiZap;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "easy":
        return "green";
      case "medium":
        return "yellow";
      case "advanced":
        return "red";
      default:
        return "gray";
    }
  };

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case "easy":
        return "ง่าย";
      case "medium":
        return "ปานกลาง";
      case "advanced":
        return "ซับซ้อน";
      default:
        return complexity;
    }
  };

  const renderStepContent = () => {
    if (!selectedService) return null;

    switch (activeStep) {
      case 0:
        return (
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <Image
                src={selectedService.logo}
                alt={selectedService.name}
                boxSize="60px"
                borderRadius="lg"
              />
              <VStack align="start" spacing={1}>
                <HStack spacing={2}>
                  <Heading size="md">{selectedService.name}</Heading>
                  {selectedService.popular && (
                    <Badge colorScheme="purple" variant="solid">
                      ยอดนิยม
                    </Badge>
                  )}
                </HStack>
                <Text color="gray.600">{selectedService.description}</Text>
                <HStack spacing={2}>
                  <Badge
                    colorScheme={getComplexityColor(
                      selectedService.setup_complexity
                    )}
                    variant="outline"
                  >
                    {getComplexityLabel(selectedService.setup_complexity)}
                  </Badge>
                  <Text fontSize="sm" color="gray.500">
                    {selectedService.pricing}
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            <Divider />

            <Box>
              <Text fontWeight="semibold" mb={2}>
                ฟีเจอร์
              </Text>
              <List spacing={1}>
                {selectedService.features.map((feature, index) => (
                  <ListItem key={index}>
                    <ListIcon as={FiCheck} color="green.500" />
                    {feature}
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box>
              <Text fontWeight="semibold" mb={2}>
                ข้อกำหนด
              </Text>
              <List spacing={1}>
                {selectedService.requirements.map((requirement, index) => (
                  <ListItem key={index}>
                    <ListIcon as={FiKey} color="blue.500" />
                    {requirement}
                  </ListItem>
                ))}
              </List>
            </Box>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontSize="sm">
                  หากต้องการข้อมูลเพิ่มเติม สามารถดู
                  <Button
                    as="a"
                    href={selectedService.documentation_url}
                    target="_blank"
                    variant="link"
                    colorScheme="blue"
                    size="sm"
                    ml={1}
                    rightIcon={<FiExternalLink />}
                  >
                    เอกสารประกอบ
                  </Button>
                </Text>
              </Box>
            </Alert>
          </VStack>
        );

      case 1:
        return (
          <VStack spacing={4} align="stretch">
            <Text fontWeight="semibold">กรอกข้อมูลการเชื่อมต่อ</Text>

            {selectedService.requirements.map((requirement, index) => (
              <FormControl key={index} isRequired>
                <FormLabel>{requirement}</FormLabel>
                <Input
                  placeholder={`กรอก ${requirement}`}
                  value={connectionData[requirement] || ""}
                  onChange={(e) =>
                    setConnectionData((prev) => ({
                      ...prev,
                      [requirement]: e.target.value,
                    }))
                  }
                  type={
                    requirement.toLowerCase().includes("secret")
                      ? "password"
                      : "text"
                  }
                />
              </FormControl>
            ))}

            <FormControl>
              <FormLabel>ชื่อการเชื่อมต่อ (ไม่บังคับ)</FormLabel>
              <Input
                placeholder={`การเชื่อมต่อ ${selectedService.name}`}
                value={connectionData.name || ""}
                onChange={(e) =>
                  setConnectionData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>คำอธิบาย (ไม่บังคับ)</FormLabel>
              <Textarea
                placeholder="อธิบายการใช้งานการเชื่อมต่อนี้"
                value={connectionData.description || ""}
                onChange={(e) =>
                  setConnectionData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <FormLabel mb={0}>เปิดใช้งานทันที</FormLabel>
                <Switch
                  isChecked={connectionData.enabled !== "false"}
                  onChange={(e) =>
                    setConnectionData((prev) => ({
                      ...prev,
                      enabled: e.target.checked.toString(),
                    }))
                  }
                />
              </HStack>
            </FormControl>
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={4} align="stretch">
            <Text fontWeight="semibold">ทดสอบการเชื่อมต่อ</Text>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                เราจะทดสอบการเชื่อมต่อเพื่อให้แน่ใจว่าข้อมูลถูกต้อง
              </Text>
            </Alert>

            <Box p={4} border="1px" borderColor="gray.200" borderRadius="md">
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="semibold">
                  ข้อมูลการเชื่อมต่อ
                </Text>
                {selectedService.requirements.map((requirement, index) => (
                  <HStack key={index} justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      {requirement}:
                    </Text>
                    <Code fontSize="xs">
                      {connectionData[requirement]
                        ? requirement.toLowerCase().includes("secret")
                          ? "••••••••"
                          : connectionData[requirement]
                        : "ไม่ได้กรอก"}
                    </Code>
                  </HStack>
                ))}
              </VStack>
            </Box>

            <Button
              colorScheme="blue"
              onClick={handleTestConnection}
              isLoading={isTestingConnection}
              loadingText="กำลังทดสอบ..."
            >
              ทดสอบการเชื่อมต่อ
            </Button>

            {connectionTestResult && (
              <Alert
                status={
                  connectionTestResult === "success" ? "success" : "error"
                }
                borderRadius="md"
              >
                <AlertIcon />
                <Box>
                  <Text fontWeight="medium">
                    {connectionTestResult === "success"
                      ? "การทดสอบสำเร็จ"
                      : "การทดสอบล้มเหลว"}
                  </Text>
                  <Text fontSize="sm">
                    {connectionTestResult === "success"
                      ? "การเชื่อมต่อทำงานได้ปกติ สามารถดำเนินการต่อได้"
                      : "ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบข้อมูลอีกครั้ง"}
                  </Text>
                </Box>
              </Alert>
            )}
          </VStack>
        );

      case 3:
        return (
          <VStack spacing={4} align="stretch">
            <VStack spacing={2}>
              <Icon as={FiCheck} boxSize={12} color="green.500" />
              <Text fontSize="lg" fontWeight="semibold">
                พร้อมเปิดใช้งาน!
              </Text>
              <Text color="gray.600" textAlign="center">
                การเชื่อมต่อกับ {selectedService.name} พร้อมใช้งานแล้ว
              </Text>
            </VStack>

            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="medium">การตั้งค่าเสร็จสมบูรณ์</Text>
                <Text fontSize="sm">ระบบจะเริ่มใช้งานการเชื่อมต่อนี้ทันที</Text>
              </Box>
            </Alert>

            <Accordion allowToggle>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="semibold">การตั้งค่าเพิ่มเติม</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack spacing={3} align="stretch">
                    <Text fontSize="sm" color="gray.600">
                      สามารถปรับแต่งการตั้งค่าเพิ่มเติมได้ในหน้าจัดการการเชื่อมต่อ
                    </Text>
                    <List spacing={1} fontSize="sm">
                      <ListItem>• ตั้งค่า Webhook และ Callback URL</ListItem>
                      <ListItem>• จัดการสิทธิ์การเข้าถึง</ListItem>
                      <ListItem>• ดูประวัติการใช้งาน</ListItem>
                      <ListItem>• ตั้งค่าการแจ้งเตือน</ListItem>
                    </List>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Breadcrumb */}
      <Breadcrumb mb={6} fontSize="sm">
        <BreadcrumbItem>
          <Link href="/settings">
            <BreadcrumbLink>ตั้งค่าระบบ</BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link href="/settings/integrations">
            <BreadcrumbLink>การเชื่อมต่อ</BreadcrumbLink>
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>เชื่อมต่อใหม่</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Header */}
      <HStack justify="space-between" mb={8}>
        <HStack spacing={6}>
          <Link href="/settings/integrations">
            <Button
              variant="ghost"
              leftIcon={<FiArrowLeft />}
              size="md"
              colorScheme="gray"
              _hover={{ bg: "gray.100" }}
            >
              กลับ
            </Button>
          </Link>
          <Box>
            <Heading
              size="2xl"
              fontFamily="heading"
              bgGradient="linear(to-r, gray.800, gray.600)"
              bgClip="text"
              letterSpacing="tight"
            >
              เชื่อมต่อบริการใหม่
            </Heading>
            <Text color="gray.600" fontSize="lg" mt={2}>
              เลือกบริการที่ต้องการเชื่อมต่อกับระบบ ShopFlow
            </Text>
          </Box>
        </HStack>
      </HStack>

      {/* Search and Filter */}
      <Card
        mb={8}
        borderRadius="2xl"
        border="1px"
        borderColor="gray.100"
        shadow="lg"
        bg="white"
      >
        <CardBody p={8}>
          <VStack spacing={6} align="stretch">
            <FormControl>
              <Input
                placeholder="ค้นหาบริการ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="lg"
                borderRadius="xl"
                bg="gray.50"
                border="1px"
                borderColor="gray.200"
                _focus={{
                  borderColor: "blue.400",
                  boxShadow: "0 0 0 1px #3182CE",
                  bg: "white",
                }}
                _hover={{ borderColor: "gray.300" }}
              />
            </FormControl>

            <Flex wrap="wrap" gap={3}>
              {categories.map((category) => {
                const IconComponent = category.icon || FiZap;
                return (
                  <Button
                    key={category.value}
                    size="md"
                    variant={
                      selectedCategory === category.value ? "solid" : "outline"
                    }
                    colorScheme={
                      selectedCategory === category.value ? "blue" : "gray"
                    }
                    leftIcon={<IconComponent />}
                    onClick={() => setSelectedCategory(category.value)}
                    borderRadius="xl"
                    _hover={{
                      transform: "translateY(-2px)",
                      shadow: "md",
                    }}
                    transition="all 0.2s"
                  >
                    {category.label}
                  </Button>
                );
              })}
            </Flex>
          </VStack>
        </CardBody>
      </Card>

      {/* Integration Services */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
        {filteredServices.map((service) => {
          const IconComponent = getCategoryIcon(service.category);
          return (
            <Card
              key={service.id}
              borderRadius="2xl"
              overflow="hidden"
              transition="all 0.3s"
              cursor="pointer"
              border="1px"
              borderColor="gray.100"
              bg="white"
              _hover={{
                transform: "translateY(-8px)",
                shadow: "2xl",
                borderColor: "blue.200",
              }}
              onClick={() => handleSelectService(service)}
            >
              <CardBody p={0}>
                <Box h="4px" bgGradient={`linear(to-r, blue.400, blue.600)`} />
                <Box p={6}>
                  <VStack spacing={5} align="stretch">
                    <HStack spacing={4}>
                      <Box
                        position="relative"
                        borderRadius="xl"
                        overflow="hidden"
                        bg="gray.50"
                      >
                        <Image
                          src={service.logo}
                          alt={service.name}
                          boxSize="60px"
                          borderRadius="xl"
                        />
                      </Box>
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack spacing={3} align="center">
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="gray.800"
                          >
                            {service.name}
                          </Text>
                          {service.popular && (
                            <Badge
                              colorScheme="purple"
                              variant="solid"
                              borderRadius="full"
                              px={3}
                              py={1}
                              fontSize="xs"
                            >
                              ยอดนิยม
                            </Badge>
                          )}
                        </HStack>
                        <HStack spacing={2}>
                          <Box
                            p={1.5}
                            borderRadius="lg"
                            bg="blue.50"
                            color="blue.600"
                          >
                            <Icon as={IconComponent} boxSize={4} />
                          </Box>
                          <Text
                            fontSize="sm"
                            color="gray.500"
                            fontWeight="medium"
                            textTransform="capitalize"
                          >
                            {service.category}
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>

                    <Text
                      fontSize="md"
                      color="gray.600"
                      lineHeight="tall"
                      noOfLines={2}
                    >
                      {service.description}
                    </Text>

                    <Box bg="gray.50" borderRadius="xl" p={4}>
                      <VStack spacing={3} align="stretch">
                        <Text fontSize="sm" fontWeight="bold" color="gray.700">
                          ฟีเจอร์หลัก:
                        </Text>
                        <VStack spacing={2} align="stretch">
                          {service.features
                            .slice(0, 3)
                            .map((feature, index) => (
                              <HStack key={index} spacing={3}>
                                <Box borderRadius="full" bg="green.100" p={1}>
                                  <Icon
                                    as={FiCheck}
                                    boxSize={3}
                                    color="green.600"
                                  />
                                </Box>
                                <Text
                                  fontSize="sm"
                                  color="gray.700"
                                  lineHeight="short"
                                >
                                  {feature}
                                </Text>
                              </HStack>
                            ))}
                          {service.features.length > 3 && (
                            <Text
                              fontSize="sm"
                              color="blue.600"
                              fontWeight="medium"
                            >
                              +{service.features.length - 3} ฟีเจอร์เพิ่มเติม
                            </Text>
                          )}
                        </VStack>
                      </VStack>
                    </Box>

                    <HStack justify="space-between" align="center" pt={2}>
                      <VStack align="start" spacing={1}>
                        <Text
                          fontSize="xs"
                          color="gray.500"
                          fontWeight="medium"
                        >
                          ราคา
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="gray.800">
                          {service.pricing}
                        </Text>
                      </VStack>
                      <Badge
                        colorScheme={getComplexityColor(
                          service.setup_complexity
                        )}
                        variant="subtle"
                        borderRadius="full"
                        px={3}
                        py={1}
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {getComplexityLabel(service.setup_complexity)}
                      </Badge>
                    </HStack>

                    <Button
                      colorScheme="blue"
                      size="lg"
                      borderRadius="xl"
                      fontWeight="bold"
                      _hover={{
                        transform: "translateY(-2px)",
                        shadow: "lg",
                      }}
                      transition="all 0.2s"
                    >
                      เชื่อมต่อเลย
                    </Button>
                  </VStack>
                </Box>
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>

      {filteredServices.length === 0 && (
        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          bg="white"
          shadow="lg"
        >
          <CardBody py={16}>
            <VStack spacing={6}>
              <Box p={6} borderRadius="full" bg="gray.50">
                <Icon as={FiInfo} boxSize={16} color="gray.400" />
              </Box>
              <VStack spacing={3}>
                <Text fontSize="xl" fontWeight="bold" color="gray.700">
                  ไม่พบบริการที่ตรงกับการค้นหา
                </Text>
                <Text color="gray.500" textAlign="center" maxW="md">
                  ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น
                  หรือติดต่อทีมงานเพื่อขอเพิ่มบริการที่ต้องการ
                </Text>
              </VStack>
              <HStack spacing={4}>
                <Button
                  variant="outline"
                  colorScheme="blue"
                  borderRadius="xl"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                >
                  ล้างตัวกรอง
                </Button>
                <Button
                  colorScheme="blue"
                  borderRadius="xl"
                  rightIcon={<FiMail />}
                >
                  ขอบริการใหม่
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Setup Modal */}
      <Modal isOpen={isSetupModalOpen} onClose={onSetupModalClose} size="2xl">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>
            <VStack align="start" spacing={2}>
              <Text>ตั้งค่าการเชื่อมต่อ</Text>
              {selectedService && (
                <Progress
                  value={((activeStep + 1) / setupSteps.length) * 100}
                  colorScheme="blue"
                  size="sm"
                  w="100%"
                />
              )}
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Stepper */}
              <Stepper index={activeStep} orientation="horizontal" size="sm">
                {setupSteps.map((step, index) => (
                  <Step key={index}>
                    <StepIndicator>
                      <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                      />
                    </StepIndicator>
                    <Box flexShrink="0">
                      <StepTitle>{step.title}</StepTitle>
                      <StepDescription>{step.description}</StepDescription>
                    </Box>
                    <StepSeparator />
                  </Step>
                ))}
              </Stepper>

              {/* Step Content */}
              <Box minH="300px">{renderStepContent()}</Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="ghost"
                onClick={activeStep === 0 ? onSetupModalClose : handlePrevStep}
              >
                {activeStep === 0 ? "ยกเลิก" : "ก่อนหน้า"}
              </Button>
              {activeStep < setupSteps.length - 1 ? (
                <Button
                  colorScheme="blue"
                  onClick={handleNextStep}
                  isDisabled={
                    (activeStep === 1 &&
                      selectedService?.requirements.some(
                        (req) => !connectionData[req]
                      )) ||
                    (activeStep === 2 && connectionTestResult !== "success")
                  }
                >
                  ถัดไป
                </Button>
              ) : (
                <Button colorScheme="green" onClick={handleCompleteSetup}>
                  เสร็จสิ้น
                </Button>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

NewIntegrationPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="เชื่อมต่อบริการใหม่">{page}</Layout>;
};

export default withAuth(NewIntegrationPage) as NextPageWithLayout;
