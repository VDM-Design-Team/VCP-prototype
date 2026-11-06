import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ShellStateProvider } from "@/components/shell-state";
import { RoleSwitch } from "@/components/role-switch";
import "./globals.css";

export const metadata: Metadata = {
  title: "VCP Prototype",
  description: "The shared clickable prototype of VCP, built from the VCP Design System.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    /* next-themes sets `.dark` on <html> before React hydrates, which is what
       the VCP theme's dark tokens hang off. */
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ShellStateProvider>
            {children}
            <RoleSwitch />
          </ShellStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
