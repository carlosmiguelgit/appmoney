# AI Rules and Project Guidelines

This document outlines the technical stack and specific rules for developing and modifying the SafePag application.

## 1. Tech Stack Overview

The project is built using a modern, mobile-first stack:

*   **Framework:** React (TypeScript)
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (Mobile-first and responsive design is mandatory)
*   **UI Library:** shadcn/ui (Built on Radix UI primitives)
*   **Routing:** React Router DOM
*   **Icons:** Lucide React
*   **State Management:** React Context for application state (`BankContext`)
*   **Data Fetching:** TanStack Query (React Query) infrastructure is set up
*   **Forms & Validation:** React Hook Form integrated with Zod
*   **Notifications:** Sonner (for toasts/notifications)

## 2. Library Usage Rules

To maintain consistency and quality, adhere to the following library usage guidelines:

| Feature | Preferred Library/Tool | Notes |
| :--- | :--- | :--- |
| **UI Components** | `shadcn/ui` | Use existing components from `src/components/ui/`. If customization is needed, create a new component in `src/components/`. |
| **Styling** | Tailwind CSS | Use utility classes exclusively. Ensure all designs are responsive. |
| **Icons** | `lucide-react` | Use icons from this package only. |
| **Routing** | `react-router-dom` | Define main routes in `src/App.tsx`. |
| **Forms** | `react-hook-form` + `zod` | Mandatory for complex form handling and validation. |
| **Notifications** | `sonner` | Use the `<Sonner />` component for displaying toasts/messages. |
| **Context/State** | React Context | Use `src/contexts/BankContext.tsx` for bank-related global state. |
| **Utilities** | `src/lib/utils.ts` | Use `cn` for merging Tailwind classes. |