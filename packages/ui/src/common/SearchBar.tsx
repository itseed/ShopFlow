/**
 * SearchBar Component - Universal Search Input
 * Phase 1: Component Simplification
 */

import React from "react";
import {
  InputGroup,
  InputLeftElement,
  Input,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  size?: "sm" | "md" | "lg";
  width?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  size = "md",
  width = "100%",
  autoFocus = false,
}: SearchBarProps) {
  return (
    <InputGroup size={size} width={width}>
      <InputLeftElement pointerEvents="none">
        <SearchIcon color="gray.400" />
      </InputLeftElement>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {value && onClear && (
        <InputRightElement>
          <IconButton
            aria-label="Clear search"
            icon={<CloseIcon />}
            size="sm"
            variant="ghost"
            onClick={onClear}
          />
        </InputRightElement>
      )}
    </InputGroup>
  );
}

export default SearchBar;

