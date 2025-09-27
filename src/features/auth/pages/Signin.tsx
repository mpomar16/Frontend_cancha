import React, { useState } from "react";
import { Eye, EyeClosed } from 'lucide-react';
import { login } from "../services/authService";
import { Logo } from "../../../components/Logo";

export default function Signin() {
    const [correo, setCorreo] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const res = await login(correo, contraseña);
        if (!res.success) {
            setError(res.message);
            return;
        }

        // Si login es correcto
        console.log("Usuario logueado:", res.data?.persona);
        window.location.href = "/espacios";
    };

    return (
        <div className="font-poppins relative min-h-screen bg-azul-950">
            {/* Fondo dividido */}
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                <div className="bg-azul-950"></div>
                <div className="bg-blanco-50"></div>
            </div>

            {/* Formulario flotante */}
            <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-gris-300 text-sm">Welcome to</p>
                                <Logo
                                    showLogo={false}
                                    showText={true}
                                    size="sm"
                                    color="text-verde-600"
                                />
                            </div>
                            <h1 className="mt-5 text-3xl font-semibold text-azul-950">Sign In</h1>
                        </div>
                        <p className="text-sm text-gris-300">
                            No tienes una cuenta?{" "}
                            <a href="/signup" className="text-verde-600 font-medium hover:underline">
                                Sign Up
                            </a>
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Usuario */}
                        <div>
                            <label className="block text-sm font-medium text-azul-950 mb-1">
                                Correo
                            </label>
                            <input
                                type="email"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                placeholder="usuario@correo.com"
                                className="w-full rounded-lg border border-gris-300 focus:ring-1 focus:ring-verde-600 focus:outline-none px-4 py-3 text-sm"
                            />
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label className="block text-sm font-medium text-azul-950 mb-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={contraseña}
                                    onChange={(e) => setContraseña(e.target.value)}
                                    placeholder="Contraseña"
                                    className="w-full rounded-lg border border-gris-300 focus:ring-1 focus:ring-verde-600 focus:outline-none px-4 py-3 text-sm pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-3 flex items-center text-gris-300"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="mt-2 text-right">
                                <a href="#" className="text-sm text-verde-600 hover:underline">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                        </div>

                        {/* Error */}
                        {error && <p className="text-red-700 text-sm">{error}</p>}

                        {/* Botón */}
                        <button
                            type="submit"
                            className="w-full bg-verde-600 text-blanco-50 font-semibold rounded-lg py-3 shadow-md hover:bg-verde-600/90 transition"
                        >
                            Sign in
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );


}
