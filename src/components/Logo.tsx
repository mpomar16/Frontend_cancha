import React from "react";
import logo from "../assets/logo.png";

type LogoProps = {
  showLogo?: boolean; // mostrar imagen
  showText?: boolean; // mostrar texto
  size?: "sm" | "md" | "lg"; // tamaños predefinidos
  text?: string; // texto de la empresa
  color?: string; // clase de color tailwind para el texto
};

const sizeClasses = {
  sm: { img: "h-6 w-6", text: "text-base" },
  md: { img: "h-10 w-10", text: "text-xl" },
  lg: { img: "h-14 w-14", text: "text-2xl" },
};

export const Logo: React.FC<LogoProps> = ({
  showLogo = true,
  showText = true,
  size = "md",
  text = "PlayPass",
  color = "text-azul1", // 👈 color por defecto
}) => {
  const classes = sizeClasses[size];

  return (
    <div className="flex items-center gap-2">
      {showLogo && (
        <img
          src={logo}
          alt="Logo"
          className={`${classes.img} object-contain`}
        />
      )}
      {showText && (
        <span className={`${classes.text} font-medium ${color}`}>
          {text}
        </span>
      )}
    </div>
  );
};
