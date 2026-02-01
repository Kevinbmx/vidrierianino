'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input, Button, Card, CardBody, CardHeader, Link } from "@heroui/react";
import { FaUser, FaLock } from 'react-icons/fa';

export default function LoginForm() {
    const router = useRouter();
    const { login } = useAuth();
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await login({ login: loginIdentifier, password });
            router.push('/admin');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md shadow-2xl bg-white/90 backdrop-blur-md">
            <CardHeader className="flex flex-col items-center pb-0 pt-6">
                <h1 className="text-3xl font-black text-primary mb-2">Bienvenido</h1>
                <p className="text-gray-500 text-sm">Ingresa a tu cuenta para continuar</p>
            </CardHeader>
            <CardBody className="p-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <Input
                        isRequired
                        type="text"
                        label="Usuario"
                        placeholder="Email o Teléfono"
                        labelPlacement="outside"
                        startContent={<FaUser className="text-default-400 pointer-events-none flex-shrink-0" />}
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        variant="bordered"
                        color="primary"
                        classNames={{
                            inputWrapper: "bg-white",
                        }}
                    />
                    <div className="flex flex-col gap-2">
                        <Input
                            isRequired
                            label="Contraseña"
                            placeholder="********"
                            labelPlacement="outside"
                            type="password"
                            startContent={<FaLock className="text-default-400 pointer-events-none flex-shrink-0" />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            variant="bordered"
                            color="primary"
                            classNames={{
                                inputWrapper: "bg-white",
                            }}
                        />
                        <div className="flex justify-end">
                            <Link href="#" size="sm" className="text-primary font-medium hover:underline">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        color="primary"
                        size="lg"
                        isLoading={isLoading}
                        className="font-bold text-white shadow-lg shadow-primary/30"
                    >
                        INICIAR SESIÓN
                    </Button>

                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600">
                        ¿No tienes una cuenta?
                        <Link href="/register" className="font-bold text-primary">
                            Regístrate aquí
                        </Link>
                    </div>
                </form>
            </CardBody>
        </Card>
    );
}
