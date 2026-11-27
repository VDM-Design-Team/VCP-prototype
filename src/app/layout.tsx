import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@vdm-design-team/vcp-design-system";
import { ShellStateProvider } from "@/components/shell-state";
import { RoleSwitch } from "@/components/role-switch";
import { AVStoreProvider } from "@/components/av-store";
import { HolidayStoreProvider } from "@/components/holiday-store";
import { NotificationStoreProvider } from "@/components/notification-store";
import { BudgetStoreProvider } from "@/components/budget-store";
import { SettingsStoreProvider } from "@/components/settings-store";
import { ScenarioBar, ScenarioProvider, ScenarioScreen } from "@/components/scenario";
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
            <AVStoreProvider>
              <HolidayStoreProvider>
                <NotificationStoreProvider>
                  <BudgetStoreProvider>
                  <SettingsStoreProvider>
                    {/* Above a dialog's overlay: Modal and the toasts' viewport are both z-50 and the dialog comes later
                        in the page, so it covered them (Planning 02). A design system fix to raise. */}
                    <ToastProvider viewportClassName="z-60">
                      <ScenarioProvider>
                        <ScenarioScreen>{children}</ScenarioScreen>
                        <RoleSwitch />
                        <ScenarioBar />
                      </ScenarioProvider>
                    </ToastProvider>
                  </SettingsStoreProvider>
                  </BudgetStoreProvider>
                </NotificationStoreProvider>
              </HolidayStoreProvider>
            </AVStoreProvider>
          </ShellStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
