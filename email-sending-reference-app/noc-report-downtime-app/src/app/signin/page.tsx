"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { User, Lock, Loader2, ShieldCheck, Activity } from "lucide-react";

export default function SignInPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid username or password");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <Card className="w-full max-w-md mx-4 relative z-10 glass border-white/20 dark:border-white/10 shadow-2xl overflow-hidden">
                {/* Decorative top bar */}
                <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-primary animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />

                <CardHeader className="text-center space-y-4 pt-8">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 duration-300">
                        <Activity className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-bold tracking-tight text-gradient-orange">
                            NOC Report
                        </CardTitle>
                        <CardDescription className="text-muted-foreground mt-2">
                            Enter your credentials to access the system
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="pb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-medium ml-1">
                                Username
                            </Label>
                            <div className="relative group">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    className="pl-10 h-11 bg-background/50 border-input transition-all duration-300 focus:ring-primary/50 focus:border-primary"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium ml-1">
                                Password
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-11 bg-background/50 border-input transition-all duration-300 focus:ring-primary/50 focus:border-primary"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                                <p className="text-sm text-destructive font-medium text-center flex items-center justify-center gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    {error}
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 text-lg btn-primary-gradient transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Authenticating...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="bg-muted/30 py-4 flex justify-center border-t border-border">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Protected System • Authorized Personnel Only
                    </p>
                </CardFooter>
            </Card>

            {/* Version Badge */}
            <div className="absolute bottom-4 right-4 text-xs font-mono text-muted-foreground/50">
                v1.0.0
            </div>
        </div>
    );
}
