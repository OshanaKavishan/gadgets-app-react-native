import { Stack } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import Auth from "./auth";
import AuthProvider from "../providers/auth-provider";
import QueryProvider from "../providers/query-provider";
import { StripeProvider } from "@stripe/stripe-react-native";
import NotificationProvider from "../providers/notification-provider";



export default function RootLayout() {
    return (
        <ToastProvider>
            <AuthProvider>
                <QueryProvider>
                    <StripeProvider publishableKey="pk_test_51RGo65Gac09ymi01ZkxXA44xYRoCuGRTjv6OAtQO2PK6tCuITebB4yFcR4Aul0aI6utXyUCTMFfytvPfJM82nmu600wifotzWq">
                        <NotificationProvider>
                            <Stack>
                                <Stack.Screen
                                    name="(shop)"
                                    options={{ headerShown: false, title: "Shop" }}
                                />
                                <Stack.Screen
                                    name="categories"
                                    options={{ headerShown: false, title: "Categories" }}
                                />
                                <Stack.Screen
                                    name="product"
                                    options={{ headerShown: true, title: "Product" }}
                                />
                                <Stack.Screen
                                    name="cart"
                                    options={{
                                        presentation: "modal",
                                        title: "Shopping Cart",
                                    }}
                                />
                                <Stack.Screen name="auth" options={{ headerShown: false }} />
                            </Stack>
                        </NotificationProvider>
                    </StripeProvider>
                </QueryProvider>
            </AuthProvider>
        </ToastProvider>
    );
}