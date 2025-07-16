import { useState } from "react";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
} from "@chakra-ui/react";
import { FiPlus, FiAlertTriangle } from "react-icons/fi";
import { POSLayout } from "../../components";
import { mockProducts } from "../../lib/sales";

const InventoryPage = () => {
  const [products] = useState(mockProducts);
  const lowStock = products.filter((p) => p.stock <= 5);

  return (
    <POSLayout title="สต็อก">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">สต็อกสินค้า</Heading>
          <Button colorScheme="blue" leftIcon={<Icon as={FiPlus} />}>ปรับสต็อก</Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card>
            <CardBody>
              <VStack>
                <Text>สินค้าทั้งหมด</Text>
                <Heading size="md">{products.length}</Heading>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack>
                <Text>สินค้าใกล้หมด</Text>
                <Heading size="md" color="red.500">{lowStock.length}</Heading>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card>
          <CardBody>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>สินค้า</Th>
                  <Th isNumeric>คงเหลือ</Th>
                </Tr>
              </Thead>
              <Tbody>
                {lowStock.map((p) => (
                  <Tr key={p.id}>
                    <Td>{p.name}</Td>
                    <Td isNumeric>
                      <Badge colorScheme="red">{p.stock}</Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>
    </POSLayout>
  );
};

export default InventoryPage;
