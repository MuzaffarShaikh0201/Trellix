import { Suspense, type ReactNode } from "react";
import { BrowserRouter } from "react-router";
import { AlertHost } from "@/app/AlertHost";
import { AuthProvider } from "@/contexts/auth";
import { ThemeProvider } from "@/contexts/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CustomLoader } from "@/components/ui/CustomLoader";

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<AuthProvider>
					<ThemeProvider>
						<Suspense fallback={<CustomLoader />}>{children}</Suspense>
						<AlertHost />
					</ThemeProvider>
				</AuthProvider>
			</BrowserRouter>
		</QueryClientProvider>
	);
}
