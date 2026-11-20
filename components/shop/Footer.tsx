
import Link from "next/link";
import {
  FiArrowUpRight,
  FiInstagram,
  FiMail,
} from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="luma-footer">
      <div className="container-fluid px-3 px-md-4 px-xl-5 py-5">

        <div className="row g-5 py-4 py-lg-5">

          <div className="col-lg-5">
            <Link
              href="/"
              className="text-decoration-none text-white"
            >
              <div className="fs-4 fw-semibold">
                LUMA & CO.
              </div>
            </Link>

            <p className="text-white-50 mt-4 mb-0 lh-lg">
              Everyday style, thoughtfully chosen.
            </p>

            <p className="text-white-50 small lh-lg mt-3 mb-0">
              Clothing, shoes and bags selected for modern
              everyday living.
            </p>

            <Link
              href="/shop/products"
              className="btn btn-outline-light rounded-0 mt-4 px-4 py-2"
            >
              Shop collection
              <FiArrowUpRight className="ms-2" />
            </Link>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <p className="text-white-50 small fw-semibold mb-3">
              SHOP
            </p>

            <nav className="d-flex flex-column gap-2">
              <Link
                href="/shop/products"
                className="text-white text-decoration-none small"
              >
                All products
              </Link>

              <Link
                href="/shop/products"
                className="text-white text-decoration-none small"
              >
                Clothing
              </Link>

              <Link
                href="/shop/products"
                className="text-white text-decoration-none small"
              >
                Shoes
              </Link>

              <Link
                href="/shop/products"
                className="text-white text-decoration-none small"
              >
                Bags
              </Link>
            </nav>
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <p className="text-white-50 small fw-semibold mb-3">
              COMPANY
            </p>

            <nav className="d-flex flex-column gap-2">
              <Link
                href="/"
                className="text-white text-decoration-none small"
              >
                About
              </Link>

              <Link
                href="/"
                className="text-white text-decoration-none small"
              >
                Contact
              </Link>

              <Link
                href="/"
                className="text-white text-decoration-none small"
              >
                Shipping
              </Link>

              <Link
                href="/"
                className="text-white text-decoration-none small"
              >
                Returns
              </Link>
            </nav>
          </div>

          <div className="col-md-4 col-lg-3">
            <p className="text-white-50 small fw-semibold mb-3">
              FOLLOW
            </p>

            <div className="d-flex gap-3">
              <a
                href="#"
                className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center p-0"
                style={{ width: "40px", height: "40px" }}
                aria-label="Instagram"
              >
                <FiInstagram size={17} />
              </a>

              <a
                href="#"
                className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center p-0"
                style={{ width: "40px", height: "40px" }}
                aria-label="Email"
              >
                <FiMail size={17} />
              </a>
            </div>

            <p className="text-white-50 small lh-lg mt-4 mb-0">
              Follow along for new arrivals, styling ideas and
              curated collections.
            </p>
          </div>
        </div>

        <div className="border-top border-secondary pt-4 mt-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
            <small className="text-white-50">
              © 2026 Luma & Co. All rights reserved.
            </small>

            <small className="text-white-50">
              Everyday style, thoughtfully chosen.
            </small>
          </div>
        </div>
      </div>
    </footer>
  );
}

