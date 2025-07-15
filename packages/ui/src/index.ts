// Original Tailwind Components
export * from "./Button";
export * from "./ProductTable";

// Chakra UI Components
export * from "./ChakraButton";
export * from "./ChakraProductTable";

// Re-export common Chakra UI components for convenience
export {
  ChakraProvider,
  Box,
  Flex,
  Grid,
  Text,
  Heading,
  Button as ChakraButton,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Alert,
  AlertIcon,
  Badge,
  Spinner,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
