import Footer from "../components/Footer";
import Nav from "../components/Nav";

const Home = () => {
  return (
    <>
    

      <section className="hero d-flex align-items-center text-white mb-5">
        <div className="container">
          <span className="text-uppercase">Veloretti Business</span>
          <h1>Bike Lease Plan For Employees.</h1>
        </div>
      </section>

      <section className="home-1 py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <img src="img/home-1.jpg" alt="Naslovna 1. slika" />
            </div>
            <div className="col-md-6">
              <div className="max-466 ms-md-auto my-4">
                <h2 className="opacity-90">Bike plans for employees.</h2>
                <p className="opacity-90 mt-3 mb-4">
                  Veloretti Electrics benefit both the environment and the
                  health of your employees. Oh, and they look good too.
                  Cost-free for the employer and outside of the WKR.
                </p>
                <a href="#">Discover More</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-2 d-flex align-items-center text-white">
        <div className="container">
          <div className="col-md-12">
            <div className="max-466 ms-md my-4">
              <h2 className="opacity-90">Service, maintenance and insurance</h2>
              <p className="opacity-90 mt-3 mb-4">
                The lease includes an all-in service package. Throughout the
                entire 36 months, you are fully insured against damage, theft
                and maintenance. In addition, you always have access to roadside
                assistance
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-3 py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <img src="img/home-3.jpg" alt="Naslovna 3. slika" />
            </div>
            <div className="col-md-6">
              <div className="max-466 ms-md-auto my-4">
                <h2 className="opacity-90">Free of charge for employers</h2>
                <p className="opacity-90 mt-3 mb-4">
                  The bike plan is totally independent of the WKR and is free
                  for you as an employer. The employee pays the lease costs and
                  you, as the employer, decide whether you want to contribute to
                  the costs.
                </p>
                <a href="#">Cost example</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-4 py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 order-md-2">
              <img src="img/home-4.jpg" alt="naslovna 4. slika" />
            </div>
            <div className="col-md-6">
              <div className="max-466 ms-md-auto my-4">
                <h2 className="opacity-90">How it works</h2>
                <ul className="opacity-90 mt-3 mb-4">
                  <li className="opacity-90">
                    <h3 className="list-item">Register your company</h3>
                    <p className="opacity-50 mt-3 mb-4">
                      Fill in our registration form with your company details.
                      After your registration, our leasing partner will do a
                      credit check. You will hear whether your application has
                      been approved within 24 hours.
                    </p>
                  </li>
                  <li className="opacity-90">
                    <h3 className="list-item">Determine the requirements</h3>
                    <p className="opacity-50 mt-3 mb-4">
                      You get acces to the digital platform. Set the
                      requirements for your employees and share the registration
                      link.
                    </p>
                  </li>
                  <li className="opacity-90">
                    <h3 className="list-item ">Ride your bike!</h3>
                    <p className="opacity-50 mt-3 mb-4">
                      Let's go! Your employees can choose their bikes and
                      they'll be delivered straight to their homes.
                    </p>
                  </li>
                  <li className="opacity-90">
                    <h3 className="list-item">Administration</h3>
                    <p className="opacity-50 mt-3 mb-4">
                      Everything in one place. The digital platform gives you an
                      easy overview of all the information for your payroll.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="faq">
        <div className="container">
          <div className="row">
            <div className="col-md-10">
              <h1>Najčćešće postavljana pitanja</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="footer-top">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-7">
              <p className="mb-0 px-md-5">
                Ready to take the Electric Ivy or Ace for a spin? Electric test
                rides are now available in Amsterdam, Amstelveen, Abcoude,
                Bussum, Den Haag, Nijmegen, Weesp, Wormerveer, Berlin, Hamburg
                and Munich. Schedule your test ride now and we'll see you there.
              </p>
            </div>
            <div className="col-md-5 text-center">
              <a href="#" className="btn">
                BOOK NOW
              </a>
            </div>
          </div>
        </div>
      </section>

      
    </>
  );
};

export default Home;
