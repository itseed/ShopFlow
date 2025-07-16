import {
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  SimpleGrid,
} from "@chakra-ui/react";
import { POSLayout } from "../../components";

const ReportsPage = () => {
  const stats = [
    { label: "ยอดขายวันนี้", value: 2543.75, color: "green" },
    { label: "จำนวนคำสั่งซื้อ", value: 47, color: "blue" },
    { label: "กำไรประมาณ", value: 650.5, color: "purple" },
  ];

  return (
    <POSLayout title="รายงาน">
      <VStack spacing={6} align="stretch">
        <Heading size="lg">รายงานยอดขาย</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {stats.map((s) => (
            <Card key={s.label}>
              <CardBody>
                <VStack>
                  <Text>{s.label}</Text>
                  <Heading size="md" color={`${s.color}.500`}>
                    {s.value.toLocaleString()}
                  </Heading>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </VStack>
    </POSLayout>
  );
};

export default ReportsPage;
