import { Card, CardBody } from "@heroui/react";

export default function SimuladorSection() {
    return (
        <section
            id="simulador"
            className="py-20 bg-gradient-to-b from-primary to-secondary"
        >
            <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                {/* Left column */}
                <div className="flex flex-col gap-6">
                    <span className="text-primary font-bold uppercase tracking-wider text-sm">
                        HERRAMIENTA INTERACTIVA
                    </span>
                    <h2 className="text-4xl font-black text-white">
                        Simulador de Presupuesto
                    </h2>
                    <p className="text-white/80 text-lg">
                        Obtenga un estimado inmediato de su inversión. Esta herramienta
                        utiliza precios base de mercado en Montero para brindarle una
                        referencia inicial.
                    </p>
                    <ul className="flex flex-col gap-4">
                        <li className="flex items-center gap-2 text-white">
                            <span className="material-symbols-outlined text-whatsapp">
                                check_circle
                            </span>
                            Precios actualizados al 2024
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <span className="material-symbols-outlined text-whatsapp">
                                check_circle
                            </span>
                            Basado en medidas estándar bolivianas
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <span className="material-symbols-outlined text-whatsapp">
                                check_circle
                            </span>
                            Incluye instalación profesional
                        </li>
                    </ul>
                </div>

                {/* Right column – placeholder card */}
                <Card className="bg-white dark:bg-background-dark rounded-2xl p-8 shadow-xl">
                    <CardBody>
                        <p className="text-center text-gray-600">
                            [Simulador interactivo próximamente]
                        </p>
                    </CardBody>
                </Card>
            </div>
        </section>
    );
}