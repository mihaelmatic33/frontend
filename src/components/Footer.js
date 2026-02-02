import ScrollToTop from "./ScrollToTop"

// test
const Footer = () => {
  return (
     <footer>
        <div className="container">
          <div className="row">
            <div className="col-md-8">
              <div className="row">
                <div className="col-md-3">
                  <h4>Explorer</h4>
                  <ul>
                    <li>
                      <a href="#">Electric bikes</a>
                    </li>
                    <li>
                      <a href="#">City bikes</a>
                    </li>
                    <li>
                      <a href="#">Kid's bikes</a>
                    </li>
                    <li>
                      <a href="#">Accessories</a>
                    </li>
                    <li>
                      <a href="#">Outlet</a>
                    </li>
                    <li>
                      <a href="#">Business</a>
                    </li>
                    <li>
                      <a href="#">Insurance Electric</a>
                    </li>
                    <li>
                      <a href="#">Size Guide</a>
                    </li>
                  </ul>
                </div>
                <div className="col-md-3">
                  <h4>About</h4>
                  <ul>
                    <li>
                      <a href="#">About us</a>
                    </li>
                    <li>
                      <a href="#">Journal</a>
                    </li>
                    <li>
                      <a href="#">Reviews</a>
                    </li>
                    <li>
                      <a href="#">Press</a>
                    </li>
                    <li>
                      <a href="#">Jobs</a>
                    </li>
                  </ul>
                </div>
                <div className="col-md-3">
                  <h4>Help</h4>
                  <ul>
                    <li>
                      <a href="#">Contact</a>
                    </li>
                    <li>
                      <a href="#">FAQ</a>
                    </li>
                    <li>
                      <a href="#">Delivery</a>
                    </li>
                    <li>
                      <a href="#">Assembly & manuals</a>
                    </li>
                    <li>
                      <a href="#">Payment options</a>
                    </li>
                    <li>
                      <a href="#">Privacy policy</a>
                    </li>
                    <li>
                      <a href="#">Terms & conditions</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <h4>Join the ride.</h4>
              <p>Sign up for our newsletter.</p>
            </div>
          </div>
          <button className="btn btn-danger" onClick={ScrollToTop}>TOP</button>
        </div>
      </footer>
  )
}

export default Footer