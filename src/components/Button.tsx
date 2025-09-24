import styles from "./Button.module.scss";

type ButtonProps = {
  label: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
};

export const Button = ({ label, variant = "primary", onClick }: ButtonProps) => {
  return (
    <button className={`${styles.btn} ${styles[variant]}`} onClick={onClick}>
      {label}
    </button>
  );
};
