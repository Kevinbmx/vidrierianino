"use client";

import React, { useState } from "react";
import { Input, Button, Textarea,addToast } from "@heroui/react";
import axios from "@/lib/axios";
// import toast  from "toast";

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string[];
    email?: string[];
    message?: string[];
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await axios.post("/api/contact", { name, email, message });
      addToast({
        title: "Mensaje Enviado",
        message: "Gracias por contactarnos. Te responderemos pronto.",
        type: "success",
      });
      setName("");
      setEmail("");
      setMessage("");
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        addToast({
          title: "Error",
          message:
            "No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.",
          type: "error",
        });
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        isInvalid={!!errors.name}
        errorMessage={errors.name ? errors.name[0] : ""}
        isRequired
      />
      <Input
        label="Correo Electrónico"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        isInvalid={!!errors.email}
        errorMessage={errors.email ? errors.email[0] : ""}
        isRequired
      />
      <Textarea
        label="Mensaje"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        isInvalid={!!errors.message}
        errorMessage={errors.message ? errors.message[0] : ""}
        isRequired
      />
      <Button type="submit" color="primary" isLoading={loading} fullWidth>
        Enviar Mensaje
      </Button>
    </form>
  );
};

export default ContactForm;
