"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FiHeart,
  FiMenu,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";

import ThemeToggle from "@/components/shared/ThemeToggle";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar luma-navbar border-bottom sticky-top">
      <div className="container-fluid px-3 px-md-4 px-xl-5 py-3">

        {/* BRAND */}
        <Link
          href="/"
          className="navbar-brand text-body fw-semibold mb-0"
          onClick={() => setMenuOpen(false)}
        >
          LUMA & CO.
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="d-none d-lg-flex align-items-center flex-grow-1">
          <ul className="navbar-nav flex-row mx-auto gap-4">
            <li className="nav-item">
              <Link href="/" className="nav-link luma-nav-link">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link href="/shop/products" className="nav-link luma-nav-link">
                Shop
              </Link>
            </li>

            <li className="nav-item">
              <Link href="/shop/products" className="nav-link luma-nav-link">
                Clothing
              </Link>
            </li>

            <li className="nav-item">
              <Link href="/shop/products" className="nav-link luma-nav-link">
                Shoes
              </Link>
            </li>

            <li className="nav-item">
              <Link href="/shop/products" className="nav-link luma-nav-link">
                Bags
              </Link>
            </li>
          </ul>

          {/* DESKTOP ACTIONS */}
          <div className="d-flex align-items-center gap-1">

            <Link
              href="/shop/products"
              className="btn btn-link text-body p-2 luma-icon-button"
              aria-label="Search"
              title="Search"
            >
              <FiSearch size={19} />
            </Link>

            <Link
              href="/"
              className="btn btn-link text-body p-2 luma-icon-button"
              aria-label="Account"
              title="Account"
            >
              <FiUser size={19} />
            </Link>

            <Link
              href="/"
              className="btn btn-link text-body p-2 luma-icon-button"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <FiHeart size={19} />
            </Link>

            <Link
              href="/"
              className="btn btn-link text-body p-2 luma-icon-button"
              aria-label="Shopping bag"
              title="Shopping bag"
            >
              <FiShoppingBag size={19} />
            </Link>

            <ThemeToggle />

            {/* SIGN IN */}
            <Link
              href="/"
              className="btn luma-sign-in-btn ms-2"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* MOBILE ACTIONS */}
        <div className="d-flex d-lg-none align-items-center gap-1">

          <Link
            href="/shop/products"
            className="btn btn-link text-body p-2 luma-icon-button"
            aria-label="Search"
            title="Search"
          >
            <FiSearch size={19} />
          </Link>

          <Link
            href="/"
            className="btn btn-link text-body p-2 luma-icon-button"
            aria-label="Shopping bag"
            title="Shopping bag"
          >
            <FiShoppingBag size={19} />
          </Link>

          <ThemeToggle />

          <button
            type="button"
            className="btn btn-link text-body p-2 luma-icon-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            title="Menu"
          >
            {menuOpen ? <FiX size={21} /> : <FiMenu size={21} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="d-lg-none w-100 border-top luma-mobile-menu">
          <div className="container-fluid px-3 px-md-4 py-3">
            <nav className="d-flex flex-column">

              <Link
                href="/"
                className="luma-mobile-nav-link py-3 border-bottom"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>

              <Link
                href="/shop/products"
                className="luma-mobile-nav-link py-3 border-bottom"
                onClick={() => setMenuOpen(false)}
              >
                Shop
              </Link>

              <Link
                href="/shop/products"
                className="luma-mobile-nav-link py-3 border-bottom"
                onClick={() => setMenuOpen(false)}
              >
                Clothing
              </Link>

              <Link
                href="/shop/products"
                className="luma-mobile-nav-link py-3 border-bottom"
                onClick={() => setMenuOpen(false)}
              >
                Shoes
              </Link>

              <Link
                href="/shop/products"
                className="luma-mobile-nav-link py-3"
                onClick={() => setMenuOpen(false)}
              >
                Bags
              </Link>

              <Link
                href="/"
                className="btn luma-sign-in-btn mt-3"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>

            </nav>
          </div>
        </div>
      )}
    </nav>
  );
}