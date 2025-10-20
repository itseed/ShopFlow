/**
 * DataTable Component - Simplified Table with Pagination
 * Phase 1: Component Simplification
 */

import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Text,
  Button,
  HStack,
  Select,
  Skeleton,
} from "@chakra-ui/react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = "No data available",
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <Box>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height="40px" mb={2} />
        ))}
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="gray.500">{emptyMessage}</Text>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th key={column.key} width={column.width}>
                {column.label}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((item) => (
            <Tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              cursor={onRowClick ? "pointer" : "default"}
              _hover={onRowClick ? { bg: "gray.50" } : {}}
            >
              {columns.map((column) => (
                <Td key={column.key}>
                  {column.render
                    ? column.render(item)
                    : String((item as any)[column.key] || "-")}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  return (
    <HStack spacing={4} justify="space-between" mt={4}>
      <Text fontSize="sm" color="gray.600">
        Showing {(currentPage - 1) * pageSize + 1}-
        {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
      </Text>

      <HStack spacing={2}>
        <Button
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
        >
          Previous
        </Button>

        <Text fontSize="sm">
          Page {currentPage} of {totalPages}
        </Text>

        <Button
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
        >
          Next
        </Button>
      </HStack>

      {onPageSizeChange && (
        <HStack spacing={2}>
          <Text fontSize="sm">Rows per page:</Text>
          <Select
            size="sm"
            width="80px"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
        </HStack>
      )}
    </HStack>
  );
}

export default DataTable;

