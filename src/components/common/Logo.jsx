import "../../styles/logo.css";

function Logo({

    variant = "atlas",
    size = 90,

}){

    let src = "/src/assets/logos/placeholder.svg";

    if(variant==="atlas"){

        src="/src/assets/logos/atlas-logo.svg";

    }

    if(variant==="personal"){

        src="/src/assets/logos/personal-logo.svg";

    }

    return(

        <img

            src={src}

            className="logo"

            style={{

                width:size,

                height:"auto",

            }}

            alt="Logo"

        />

    );

}

export default Logo;