export default function Button({
  children,
  variant = "red",
  shape = "square",
  className = "",
  as: Component = "button",
  ...props
}) {
  const variants = {
    red: "bauhaus-btn-red",
    blue: "bauhaus-btn-blue",
    yellow: "bauhaus-btn-yellow",
    outline: "bauhaus-btn-outline",
    ghost: "border-none shadow-none font-bold uppercase tracking-wider hover:bg-muted active:shadow-none active:translate-x-0 active:translate-y-0",
  };

  const shapes = {
    square: "rounded-none px-6 py-3",
    pill: "rounded-full px-8 py-3",
  };

  return (
    <Component
      className={`${variants[variant] || variants.red} ${shapes[shape] || shapes.square} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
