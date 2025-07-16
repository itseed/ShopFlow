import React, { useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Divider,
  useToast,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { FaPrint, FaEnvelope, FaDownload } from "react-icons/fa";
import { Receipt } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt;
  onPrint?: () => void;
  onEmailSend?: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
  onPrint,
  onEmailSend,
}) => {
  const toast = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const grayBg = useColorModeValue("gray.50", "gray.700");

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open("", "_blank");

      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - ${receipt.receiptNumber}</title>
              <style>
                body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 20px; }
                .receipt-container { max-width: 300px; margin: 0 auto; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .border-t { border-top: 1px solid #000; }
                .border-b { border-bottom: 1px solid #000; }
                .py-2 { padding: 8px 0; }
                .mb-2 { margin-bottom: 8px; }
                .mb-4 { margin-bottom: 16px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 4px; text-align: left; }
                .item-row { border-bottom: 1px dashed #ccc; }
                @media print {
                  body { margin: 0; padding: 10px; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                ${printContent}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }

    if (onPrint) {
      onPrint();
    }

    toast({
      title: "พิมพ์ใบเสร็จ",
      description: "ส่งใบเสร็จไปยังเครื่องพิมพ์แล้ว",
      status: "success",
      duration: 3000,
    });
  };

  const handleEmailSend = () => {
    if (onEmailSend) {
      onEmailSend();
    }

    toast({
      title: "ส่งอีเมล",
      description: "ส่งใบเสร็จทางอีเมลแล้ว",
      status: "success",
      duration: 3000,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "cash":
        return "เงินสด";
      case "card":
        return "บัตรเครดิต/เดบิต";
      case "qr":
        return "QR Code";
      case "wallet":
        return "กระเป๋าเงินอิเล็กทรอนิกส์";
      default:
        return method;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent maxW="500px">
        <ModalHeader>
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="bold">
              ใบเสร็จ
            </Text>
            <Text fontSize="sm" color="gray.600">
              {receipt.receiptNumber}
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Box ref={printRef}>
            <VStack spacing={4} align="stretch">
              {/* Header */}
              <Box
                textAlign="center"
                pb={4}
                borderBottom="2px"
                borderColor={borderColor}
              >
                <Text fontSize="xl" fontWeight="bold">
                  {receipt.branch.name}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {receipt.branch.address}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  โทร: {receipt.branch.phone}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  เลขที่ผู้เสียภาษี: {receipt.branch.taxId}
                </Text>
              </Box>

              {/* Transaction Info */}
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm">เลขที่ใบเสร็จ:</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {receipt.receiptNumber}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm">วันที่:</Text>
                  <Text fontSize="sm">{formatDate(receipt.timestamp)}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm">พนักงาน:</Text>
                  <Text fontSize="sm">{receipt.cashier.name}</Text>
                </HStack>
                {receipt.customer && (
                  <HStack justify="space-between">
                    <Text fontSize="sm">ลูกค้า:</Text>
                    <Text fontSize="sm">{receipt.customer.name}</Text>
                  </HStack>
                )}
              </VStack>

              <Divider />

              {/* Items */}
              <Box>
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th fontSize="xs" px={0}>
                        รายการ
                      </Th>
                      <Th fontSize="xs" px={0} textAlign="center">
                        จำนวน
                      </Th>
                      <Th fontSize="xs" px={0} textAlign="right">
                        ราคา
                      </Th>
                      <Th fontSize="xs" px={0} textAlign="right">
                        รวม
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {receipt.items.map((item, index) => (
                      <Tr key={index}>
                        <Td fontSize="xs" px={0} py={1}>
                          <Text fontWeight="medium">{item.product.name}</Text>
                          {item.discountAmount > 0 && (
                            <Text fontSize="xs" color="red.500">
                              ส่วนลด: -{formatCurrency(item.discountAmount)}
                            </Text>
                          )}
                        </Td>
                        <Td fontSize="xs" px={0} py={1} textAlign="center">
                          {item.quantity}
                        </Td>
                        <Td fontSize="xs" px={0} py={1} textAlign="right">
                          {formatCurrency(item.unitPrice)}
                        </Td>
                        <Td fontSize="xs" px={0} py={1} textAlign="right">
                          {formatCurrency(item.total)}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              <Divider />

              {/* Summary */}
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm">ยอดรวม:</Text>
                  <Text fontSize="sm">{formatCurrency(receipt.subtotal)}</Text>
                </HStack>
                {receipt.discountAmount > 0 && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="red.500">
                      ส่วนลด:
                    </Text>
                    <Text fontSize="sm" color="red.500">
                      -{formatCurrency(receipt.discountAmount)}
                    </Text>
                  </HStack>
                )}
                <HStack justify="space-between">
                  <Text fontSize="sm">ภาษี:</Text>
                  <Text fontSize="sm">{formatCurrency(receipt.taxAmount)}</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontSize="md" fontWeight="bold">
                    ยอดสุทธิ:
                  </Text>
                  <Text fontSize="md" fontWeight="bold">
                    {formatCurrency(receipt.total)}
                  </Text>
                </HStack>
              </VStack>

              <Divider />

              {/* Payment Info */}
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm">วิธีชำระเงิน:</Text>
                  <Text fontSize="sm">
                    {getPaymentMethodName(receipt.paymentMethod)}
                  </Text>
                </HStack>

                {receipt.paymentDetails.method === "cash" && (
                  <>
                    <HStack justify="space-between">
                      <Text fontSize="sm">เงินที่รับ:</Text>
                      <Text fontSize="sm">
                        {formatCurrency(
                          receipt.paymentDetails.receivedAmount || 0
                        )}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">เงินทอน:</Text>
                      <Text fontSize="sm">
                        {formatCurrency(receipt.paymentDetails.change || 0)}
                      </Text>
                    </HStack>
                  </>
                )}

                {receipt.paymentDetails.method === "card" && (
                  <>
                    <HStack justify="space-between">
                      <Text fontSize="sm">บัตรเลขที่:</Text>
                      <Text fontSize="sm">
                        ****{receipt.paymentDetails.cardNumber}
                      </Text>
                    </HStack>
                    {receipt.paymentDetails.approvalCode && (
                      <HStack justify="space-between">
                        <Text fontSize="sm">เลขอนุมัติ:</Text>
                        <Text fontSize="sm">
                          {receipt.paymentDetails.approvalCode}
                        </Text>
                      </HStack>
                    )}
                  </>
                )}

                <HStack justify="space-between">
                  <Text fontSize="sm">รหัสธุรกรรม:</Text>
                  <Text fontSize="xs" fontFamily="mono">
                    {receipt.paymentDetails.transactionId}
                  </Text>
                </HStack>
              </VStack>

              {/* Footer */}
              {receipt.footer && (
                <>
                  <Divider />
                  <Box textAlign="center" pt={2}>
                    <Text fontSize="xs" color="gray.600">
                      {receipt.footer}
                    </Text>
                  </Box>
                </>
              )}
            </VStack>
          </Box>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              leftIcon={<FaPrint />}
              colorScheme="blue"
              variant="outline"
              onClick={handlePrint}
              size="sm"
            >
              พิมพ์
            </Button>
            {receipt.customer?.email && (
              <Button
                leftIcon={<FaEnvelope />}
                colorScheme="green"
                variant="outline"
                onClick={handleEmailSend}
                size="sm"
              >
                ส่งอีเมล
              </Button>
            )}
            <Button onClick={onClose} size="sm">
              ปิด
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReceiptModal;
