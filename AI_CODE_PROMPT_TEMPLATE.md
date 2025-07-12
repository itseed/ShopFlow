# AI Code Generation Prompt Template

This template is designed to guide AI in generating code for the POS and Web CMS monorepo project. Please fill in the bracketed sections `[ ]` with specific details for your request.

---

## 1. Project Context

-   **Project Name:** POS & Web CMS System
-   **Monorepo Structure:** We are using a monorepo setup with the following structure:
    -   `apps/pos-frontend/`: Next.js application for the Point of Sale interface.
    -   `apps/cms-web/`: Next.js application for the Web Content Management System (Admin Dashboard).
    -   `packages/ui/`: Shared React UI components.
    -   `packages/types/`: Shared TypeScript type definitions (e.g., `Product`, `Order`).
    -   `packages/utils/`: Shared utility functions.
-   **Database/Backend:** Supabase (PostgreSQL for DB, Authentication, Storage, Realtime). All data interactions are handled via Supabase Client SDK.
-   **Deployment Strategy:**
    -   Next.js applications will be deployed as **static sites** (`next export`).
    -   All dynamic data fetching and mutations will occur via **client-side API calls to Supabase**.
    -   For self-hosting, Docker/Docker Compose will be used. Nginx will serve as a reverse proxy for domain pointing and SSL.
-   **Styling Framework:** **Tailwind CSS**
-   **UI Component Library:** **[Specify if using a component library like Chakra UI, Material UI, Ant Design, etc., or state 'None (pure Tailwind CSS)']**
    * *(Example: `Chakra UI`)*
    * *(Example: `None (pure Tailwind CSS)`)*
-   **Internationalization (i18n):** The system supports multiple languages, starting with Thai and English.

---

## 2. Specific Code Request

Please describe in detail the specific code or feature you need the AI to generate.

**[Main Title of the Feature/Component/Code Request]**
*(e.g., "Product Form Modal for CMS", "User Authentication Flow for POS", "Supabase API Utility for Orders")*

**[Detailed Description of the Request]:**

* **Type of Code:** (e.g., React Component, Next.js Page, TypeScript Interface, Supabase Query Function, API Utility, Dockerfile snippet, Nginx config snippet)
* **Target File Location(s) in Monorepo:** (e.g., `apps/cms-web/src/pages/products/new.tsx`, `packages/ui/src/components/shared/Modal.tsx`, `apps/pos-frontend/src/utils/cart.ts`)
* **Core Functionality:** (What should this code *do*? Be precise.)
    * *(Example: Display a form to add/edit a product, handle form submission, validate input, call Supabase to save/update data.)*
    * *(Example: Implement a login page, handle user input, call Supabase Auth, redirect on success/show error on failure.)*
    * *(Example: Provide a utility function to fetch products by category from Supabase.)*
* **Expected Input/Props:** (What data/props does this code/component expect to receive?)
    * *(Example: `props: { initialProductData?: Product, onSubmit: (product: ProductFormData) => void }`)*
    * *(Example: `input: { email: string, password: string }`)*
* **Expected Output/Behavior:** (What should the code produce or how should it behave?)
    * *(Example: Render a user-friendly form, call a specific Supabase method, return structured data.)*
    * *(Example: On success, redirect to dashboard; on error, display message.)*
* **UI/UX Considerations (if applicable):** (How should it look and feel? Refer to the project's design principles.)
    * *(Example: Use clear form labels, input fields, and a submit button. Implement a loading state and error messages. Ensure responsiveness.)*
    * *(Example: Follow the soothing color palette and minimalist design principles.)*
* **Supabase Interaction:** (Specify which tables, functions, or features of Supabase are involved.)
    * *(Example: Fetch from `products` table, insert into `orders` table, update `user_profiles` using `auth.signUp`, use `storage.from('images').upload()`.)*
    * *(Specify any JOINs or complex queries if applicable.)*
* **Error Handling:** (How should errors be managed and communicated to the user?)
    * *(Example: Display user-friendly error messages, log errors to console.)*
* **State Management:** (How should local or global state be managed within this code/component?)
    * *(Example: Use React's `useState` for form inputs, `useReducer` for complex local state, or suggest using a global context if appropriate.)*
* **Accessibility (A11y) & Internationalization (i18n) (if applicable):** (Any specific requirements?)
    * *(Example: Ensure keyboard navigability for forms/buttons. Use placeholder text/labels that can be easily translated.)*

---

## 3. Code Structure & Best Practices

Please adhere to the following guidelines when generating code:

* **Language & Typing:** Use **TypeScript** for all code, ensuring strong typing and clear interfaces.
* **React Practices:** Follow **modern React best practices** (functional components, hooks, props drilling vs. context).
* **Modularity:** Keep components and functions **reusable and modular**.
* **Naming Conventions:** Use **clear and concise variable, function, and component naming**.
* **Comments:** Add **inline comments** where necessary to explain complex logic or non-obvious parts.
* **Styling Implementation:**
    * Use **Tailwind CSS classes** directly in JSX where appropriate.
    * **If a UI Component Library is specified in Project Context (e.g., Chakra UI), utilize its components (e.g., `<Button>`, `<Input>`, `<Modal>`) for consistent UI elements.**
    * Avoid generic inline styles unless absolutely necessary.
* **Error Handling:** Ensure **robust error handling** for all network requests and Supabase operations.
* **Supabase Client:** Use the **Supabase Client SDK (`@supabase/supabase-js`)** for all interactions with Supabase. Assume the `supabase` client instance is imported from `lib/supabase.ts` (or `apps/<app-name>/lib/supabase.ts`).
* **Data Fetching:** For client-side data fetching, consider using plain `useEffect` with `useState` for simple cases, or leverage libraries like SWR/React Query if the request implies complex caching/revalidation (you can suggest this).

---

## 4. Expected Output Format

Please provide:

* The generated code, clearly separated by file paths.
* Any necessary TypeScript interfaces/types relevant to the generated code.
* A brief explanation of the code structure and how to integrate it.
* If applicable, a minimal example of how to use the generated component/page.

---
