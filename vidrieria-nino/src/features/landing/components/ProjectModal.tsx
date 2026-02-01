"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    FaTimes,
    FaQuoteLeft,
    FaWhatsapp,
    FaMapMarkerAlt,
    FaShieldAlt,
    FaLayerGroup,
    FaGripLinesVertical
} from "react-icons/fa";
import { TbGridDots } from "react-icons/tb";
import { Project } from "@/types/project";

interface ProjectModalProps {
    project: Project;
    onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
    const [selectedImage, setSelectedImage] = useState(project.images[0]);

    useEffect(() => {
        // Reset image when project changes
        setSelectedImage(project.images[0]);

        // Prevent scrolling when modal is open
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [project]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="relative bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FaTimes className="text-xl" />
                </button>

                {/* Left Side: Gallery */}
                <div className="w-full md:w-1/2 bg-gray-50 p-6 lg:p-10 flex flex-col gap-6">
                    {/* Main Image */}
                    <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden shadow-md bg-white">
                        <Image
                            src={selectedImage}
                            alt={project.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Thumbnails */}
                    {project.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {project.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${selectedImage === img
                                        ? "border-primary ring-2 ring-primary/20"
                                        : "border-transparent hover:border-gray-300"
                                        }`}
                                >
                                    <Image
                                        src={img}
                                        alt={`${project.title} view ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Content */}
                <div className="w-full md:w-1/2 p-6 lg:p-10 flex flex-col bg-white">
                    <div className="flex-grow">
                        {/* Title */}
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
                            {project.title}
                        </h2>

                        {/* Description Section */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-primary tracking-widest uppercase mb-4">
                                Sobre el Proyecto
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-base lg:text-lg">
                                {project.fullDescription}
                            </p>
                        </div>

                        {/* Specs Section */}
                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-primary tracking-widest uppercase mb-6">
                                Especificaciones Técnicas
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                                <SpecItem
                                    icon={TbGridDots}
                                    label="TIPO DE VIDRIO"
                                    value={project.specs.glass}
                                />
                                <SpecItem
                                    icon={FaGripLinesVertical} // Alternative for sliders/profile
                                    label="PERFILERÍA"
                                    value={project.specs.profile}
                                />
                                <SpecItem
                                    icon={FaMapMarkerAlt}
                                    label="UBICACIÓN"
                                    value={project.specs.location}
                                />
                                <SpecItem
                                    icon={FaShieldAlt}
                                    label="GARANTÍA"
                                    value={project.specs.warranty}
                                />
                            </div>
                        </div>

                        {/* Review Section */}
                        {project.review && (
                            <div className="bg-blue-50/50 rounded-lg p-6 mb-8 border-l-4 border-primary">
                                <div className="flex gap-1 text-yellow-400 mb-3 text-xs">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="material-symbols-outlined filled">★</span>
                                    ))}
                                </div>
                                <p className="text-gray-700 italic mb-3 text-sm font-medium">
                                    "{project.review.text}"
                                </p>
                                <div className="text-primary text-xs font-bold uppercase tracking-wide">
                                    — {project.review.author}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <Link
                            href="/cotizar"
                            className="w-full group bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5"
                        >
                            <span className="text-xl"><FaWhatsapp /></span>
                            COTIZAR PROYECTO SIMILAR
                        </Link>
                        <p className="text-center text-[10px] text-gray-400 mt-3 font-medium tracking-wide uppercase">
                            Respuesta garantizada en menos de 24h
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function SpecItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="p-2.5 bg-blue-50 text-primary rounded-lg shrink-0">
                <Icon className="text-xl" />
            </div>
            <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    {label}
                </div>
                <div className="text-sm font-bold text-gray-900 leading-tight">
                    {value}
                </div>
            </div>
        </div>
    );
}
