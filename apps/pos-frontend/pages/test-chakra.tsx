import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Card,
  CardBody,
  Badge,
} from "@chakra-ui/react";

export default function POSChakraTestPage() {
  return (
    <Box p={8} maxW="1000px" mx="auto">
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" color="brand.600" mb={4}>
            🛒 POS Chakra UI Test
          </Heading>
          <Text fontSize="lg" color="gray.600">
            ทดสอบ POS interface ด้วย Chakra UI
          </Text>
        </Box>

        {/* POS Style Buttons */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              POS Buttons
            </Heading>
            <Grid
              templateColumns="repeat(auto-fit, minmax(150px, 1fr))"
              gap={4}
            >
              <Button size="lg" h={20} colorScheme="brand">
                <VStack spacing={1}>
                  <Text fontSize="2xl">☕</Text>
                  <Text>กาแฟ</Text>
                </VStack>
              </Button>
              <Button size="lg" h={20} colorScheme="green">
                <VStack spacing={1}>
                  <Text fontSize="2xl">🥪</Text>
                  <Text>ขนมปัง</Text>
                </VStack>
              </Button>
              <Button size="lg" h={20} colorScheme="orange">
                <VStack spacing={1}>
                  <Text fontSize="2xl">🍰</Text>
                  <Text>เค้ก</Text>
                </VStack>
              </Button>
              <Button size="lg" h={20} colorScheme="purple">
                <VStack spacing={1}>
                  <Text fontSize="2xl">🧋</Text>
                  <Text>ชาไข่มุก</Text>
                </VStack>
              </Button>
            </Grid>
          </CardBody>
        </Card>

        {/* Order Summary Style */}
        <Grid templateColumns="2fr 1fr" gap={6}>
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                เมนูสินค้า
              </Heading>
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                {Array.from({ length: 6 }, (_, i) => (
                  <Button
                    key={i}
                    h={24}
                    variant="outline"
                    colorScheme="brand"
                    flexDirection="column"
                  >
                    <Text fontSize="xl" mb={2}>
                      🍕
                    </Text>
                    <Text fontSize="sm">สินค้า {i + 1}</Text>
                    <Badge colorScheme="green" mt={1}>
                      ฿99
                    </Badge>
                  </Button>
                ))}
              </Grid>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                ตะกร้าสินค้า
              </Heading>
              <VStack spacing={3} align="stretch">
                <Box p={3} bg="gray.50" borderRadius="md">
                  <HStack justify="space-between">
                    <Text>กาแฟลาเต้</Text>
                    <Text fontWeight="bold">฿65</Text>
                  </HStack>
                </Box>
                <Box p={3} bg="gray.50" borderRadius="md">
                  <HStack justify="space-between">
                    <Text>ขนมปัง</Text>
                    <Text fontWeight="bold">฿45</Text>
                  </HStack>
                </Box>
                <Box borderTopWidth={1} pt={3}>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold">
                      รวม
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="brand.600">
                      ฿110
                    </Text>
                  </HStack>
                </Box>
                <Button colorScheme="green" size="lg" mt={4}>
                  ชำระเงิน
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        <Box textAlign="center" py={6}>
          <Text fontSize="xl" fontWeight="bold" color="green.600">
            ✅ POS Interface พร้อมใช้งาน!
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
