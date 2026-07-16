import atlasLogo from "../assets/branding/atlas-logo.svg";
import personalLogo from "../assets/branding/personal-logo.svg";

function BrandLogo({

  type = "atlas",
  size = 120,
  className = "",

}) {

  const src = type === "atlas"

    ? atlasLogo

    : personalLogo;

  return (

    <img

      src={src}

      alt={type === "atlas" ? "Atlas Finance" : "Leandro Conde"}

      width={size}
      height={size}
      className={className}
      draggable={false}

    />

  );

}

export default BrandLogo;