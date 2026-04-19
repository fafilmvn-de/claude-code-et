export function MiuAvatar({ size = 32, className = '' }) {
  return (
    <img
      src="/miu-avatar.svg"
      width={size}
      height={size}
      alt="Miu"
      className={className}
      draggable={false}
    />
  );
}
