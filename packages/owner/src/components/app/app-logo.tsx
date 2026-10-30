
/**
 * @ignore - internal component.
 */
function AppLogo({ size = 30 }: { size?: number }) {
  return (
    <img
      //width={size}
      height={30}
      src="assets/images/logo.png"
      alt="Logo"
    />
  );
}

export { AppLogo };
