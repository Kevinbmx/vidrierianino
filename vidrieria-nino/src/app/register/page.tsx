import RegisterForm from "@/features/auth/components/RegisterForm";
import Image from "next/image";

export default function RegisterPage() {
    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 order-2 md:order-1">
                <RegisterForm />
            </div>

            {/* Right Side - Image/Branding */}
            <div className="hidden md:flex relative flex-col justify-end p-12 bg-primary-900 overflow-hidden order-1 md:order-2">
                <div className="absolute inset-0 opacity-40">
                    <Image
                        src="/images/works/trabajo-vidrieria-nino-1.jpg"
                        alt="Background"
                        fill
                        className="object-cover mix-blend-overlay"
                        priority
                    />
                </div>

                <div className="relative z-10 text-right">
                    <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                        Únete a nuestra comunidad.
                    </h2>
                    <p className="text-white/80 text-lg max-w-md ml-auto">
                        Crea tu cuenta para recibir asesoramiento personalizado y seguimiento detallado de tus obras.
                    </p>
                </div>
            </div>
        </div>
    );
}
