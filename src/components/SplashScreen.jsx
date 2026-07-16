import BrandLogo from "./BrandLogo";

function SplashScreen(){

  return(

    <div className="splash-screen">

      <BrandLogo
        type="atlas"
        size={140}
        className="splash-logo"
      />

      <h2>Atlas Finance</h2>

    </div>

  );

}

export default SplashScreen;