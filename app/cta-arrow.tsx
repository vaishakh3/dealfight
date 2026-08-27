type CtaArrowProps = {
  className?: string;
};

export function CtaArrow({ className = '' }: CtaArrowProps) {
  const classes = ['cta-arrow', className].filter(Boolean).join(' ');

  return (
    <span className={classes} aria-hidden="true">
      {'\u2197\uFE0E'}
    </span>
  );
}
