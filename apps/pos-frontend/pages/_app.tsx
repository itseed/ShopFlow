import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import posTheme from "../lib/pos-theme";
import { AuthProvider } from "../contexts/AuthContext";
import { SalesProvider } from "../contexts/SalesContext";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={posTheme}>
      <AuthProvider>
        <SalesProvider>
          <Component {...pageProps} />
        </SalesProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}
