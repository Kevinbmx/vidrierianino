'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input, Button, Card, CardBody, CardHeader, Link } from "@heroui/react";
import { FaUser, FaLock, FaEnvelope, FaPhone } from 'react-icons/fa';

export default function RegisterForm() {
    const router = useRouter();
    const { register } = useAuth();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: ''
    });

    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear specific error when typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setErrors({});
        setIsLoading(true);

        // Basic frontend validation logic could go here, but we rely on backend mainly.

        try {
            await register(formData);
            // On success, redirect to login or dashboard
            router.push('/login?registered=true');
        } catch (err: any) {
            if (err.response?.status === 422) {
                // Validation errors
                setErrors(err.response.data.errors);
            } else {
                setError(err.response?.data?.message || 'Ocurrió un error al registrarse.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-lg shadow-2xl bg-white/90 backdrop-blur-md">
            <CardHeader className="flex flex-col items-center pb-0 pt-6">
                <h1 className="text-3xl font-black text-primary mb-2">Crear Cuenta</h1>
                <p className="text-gray-500 text-sm">Únete para gestionar tus proyectos</p>
            </CardHeader>
            <CardBody className="p-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    <Input
                        isRequired
                        name="name"
                        label="Nombre Completo"
                        placeholder="Juan Pérez"
                        labelPlacement="outside"
                        startContent={<FaUser className="text-default-400 pointer-events-none flex-shrink-0" />}
                        value={formData.name}
                        onChange={handleChange}
                        variant="bordered"
                        color={errors.name ? "danger" : "primary"}
                        errorMessage={errors.name?.[0]}
                        isInvalid={!!errors.name}
                        classNames={{ inputWrapper: "bg-white" }}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            name="email"
                            label="Correo Electrónico"
                            placeholder="juan@ejemplo.com"
                            labelPlacement="outside"
                            startContent={<FaEnvelope className="text-default-400 pointer-events-none flex-shrink-0" />}
                            value={formData.email}
                            onChange={handleChange}
                            variant="bordered"
                            color={errors.email ? "danger" : "primary"}
                            errorMessage={errors.email?.[0]}
                            isInvalid={!!errors.email}
                            classNames={{ inputWrapper: "bg-white" }}
                        />
                        <Input
                            name="phone"
                            label="Teléfono / Celular"
                            placeholder="+591 70000000"
                            labelPlacement="outside"
                            startContent={<FaPhone className="text-default-400 pointer-events-none flex-shrink-0" />}
                            value={formData.phone}
                            onChange={handleChange}
                            variant="bordered"
                            color={errors.phone ? "danger" : "primary"}
                            errorMessage={errors.phone?.[0]}
                            isInvalid={!!errors.phone}
                            classNames={{ inputWrapper: "bg-white" }}
                        />
                    </div>

                    <Input
                        isRequired
                        name="password"
                        label="Contraseña"
                        placeholder="Mínimo 8 caracteres"
                        type="password"
                        labelPlacement="outside"
                        startContent={<FaLock className="text-default-400 pointer-events-none flex-shrink-0" />}
                        value={formData.password}
                        onChange={handleChange}
                        variant="bordered"
                        color={errors.password ? "danger" : "primary"}
                        errorMessage={errors.password?.[0]}
                        isInvalid={!!errors.password}
                        classNames={{ inputWrapper: "bg-white" }}
                    />

                    <Input
                        isRequired
                        name="password_confirmation"
                        label="Confirmar Contraseña"
                        placeholder="Repite tu contraseña"
                        type="password"
                        labelPlacement="outside"
                        startContent={<FaLock className="text-default-400 pointer-events-none flex-shrink-0" />}
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        variant="bordered"
                        color="primary"
                        classNames={{ inputWrapper: "bg-white" }}
                    />

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
                        className="font-bold text-white shadow-lg shadow-primary/30 mt-2"
                    >
                        REGISTRARME
                    </Button>

                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600">
                        ¿Ya tienes una cuenta?
                        <Link href="/login" className="font-bold text-primary">
                            Inicia Sesión
                        </Link>
                    </div>
                </form>
            </CardBody>
        </Card>
    );
}
