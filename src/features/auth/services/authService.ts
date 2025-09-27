/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface Persona {
  id_persona: number;
  nombre: string;
  apellido: string;
  correo: string;
  sexo?: string;
  imagen_perfil?: string | null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    persona: Persona;
  };
}

export async function login(correo: string, contraseña: string): Promise<LoginResponse> {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/persona/login`, {
      correo,
      contraseña,
    });

    // guardar token en localStorage
    if (response.data.success && response.data.data?.token) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("persona", JSON.stringify(response.data.data.persona));
    }

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as LoginResponse;
    }
    return {
      success: false,
      message: "Error al conectar con el servidor",
    };
  }
}


export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("persona");
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getCurrentUser(): Persona | null {
  const persona = localStorage.getItem("persona");
  return persona ? (JSON.parse(persona) as Persona) : null;
}
