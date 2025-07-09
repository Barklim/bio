import { Stack } from "expo-router";
import { QueryProvider, AuthProvider } from "../src/contexts";

export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="users/[id]" />
        </Stack>
      </AuthProvider>
    </QueryProvider>
  );
}
