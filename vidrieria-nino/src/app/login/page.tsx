import LoginForm from "@/features/auth/components/LoginForm";
import Image from "next/image";

export default function LoginPage() {
    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            {/* Left Side - Image/Branding */}
            <div className="hidden md:flex relative flex-col justify-between p-12 bg-primary-900 overflow-hidden">
                <div className="absolute inset-0 opacity-40">
                    <Image
                        src="/images/works/trabajo-vidrieria-nino-2.jpg"
                        alt="Background"
                        fill
                        className="object-cover mix-blend-overlay"
                        priority
                    />
                </div>

                <div className="relative z-10">
                    <div className="text-white font-serif text-3xl font-black mb-2">VIDRIERÍA NIÑO</div>
                    <div className="text-white/80 text-sm font-medium tracking-wide">CALIDAD & EXCELENCIA</div>
                </div>

                <div className="relative z-10 text-white max-w-md">
                    <h2 className="text-4xl font-bold leading-tight mb-4">
                        Transformamos espacios con la elegancia del vidrio.
                    </h2>
                    <p className="text-white/80 leading-relaxed">
                        Accede a tu panel para gestionar cotizaciones, ver el estado de tus proyectos y comunicarte con nuestro equipo.
                    </p>
                </div>

                <div className="relative z-10 text-white/50 text-xs">
                    © 2024 Vidriería Niño. Todos los derechos reservados.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
                <LoginForm />
            </div>
        </div>
    );
}
