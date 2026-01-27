'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input, Button, Card, CardBody, CardHeader } from '@heroui/react';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState<any>({});
    const [status, setStatus] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setStatus(null);

        try {
            await register({ name, email, phone, password, password_confirmation: passwordConfirmation });
            setStatus('Registration successful! Please login.');
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: 'An error occurred during registration.' });
            }
        }
    };

    return (
        <div className="flex justify-center items-center h-full">
            <Card className="w-full max-w-md">
                <CardHeader className="flex justify-center">
                    <h1 className="text-2xl font-bold">Register</h1>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label="Name"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            isInvalid={!!errors.name}
                            errorMessage={errors.name?.[0]}
                        />
                        <Input
                            label="Email"
                            placeholder="Enter your email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            isInvalid={!!errors.email}
                            errorMessage={errors.email?.[0]}
                        />
                        <Input
                            label="Phone"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            isInvalid={!!errors.phone}
                            errorMessage={errors.phone?.[0]}
                        />
                        <Input
                            isRequired
                            label="Password"
                            placeholder="Enter your password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            isInvalid={!!errors.password}
                            errorMessage={errors.password?.[0]}
                        />
                        <Input
                            isRequired
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                        />
                        {errors.general && <p className="text-danger text-sm">{errors.general}</p>}
                        {status && <p className="text-success text-sm">{status}</p>}
                        <Button type="submit" color="primary">
                            Register
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}

