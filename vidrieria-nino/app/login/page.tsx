// "use client";
// import { Button, Input } from "@heroui/react";
// import Link from "next/link";
// import { useState } from "react";

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await login({ login: loginIdentifier, password });
            router.push('/admin');
        } catch (err: any) {
            setError(err.response?.data?.message || 'An error occurred during login.');
        }
    };

    return (
        <div className="flex justify-center items-center h-full">
            <Card className="w-full max-w-md">
                <CardHeader className="flex justify-center">
                    <h1 className="text-2xl font-bold">Login</h1>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            isRequired
                            label="Email or Phone"
                            placeholder="Enter your email or phone"
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                        />
                        <Input
                            isRequired
                            label="Password"
                            placeholder="Enter your password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <p className="text-danger text-sm">{error}</p>}
                        <Button type="submit" color="primary">
                            Login
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}

