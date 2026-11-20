
import Link from "next/link";

const categories = [
  {
    number: "01",
    name: "Clothing",
    description:
      "Everyday pieces designed to fit effortlessly into your wardrobe.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: "02",
    name: "Shoes",
    description:
      "Timeless footwear made for everyday movement and modern style.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85",
  },
  {
    number: "03",
    name: "Bags",
    description:
      "Practical silhouettes designed to complement your everyday look.",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
  },
];

const featuredProducts = [
  {
    name: "Essential Oversized Shirt",
    category: "Clothing",
    price: "KES 4,500",
    image:
      "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Everyday Leather Loafers",
    category: "Shoes",
    price: "KES 7,800",
    image:
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Structured Everyday Bag",
    category: "Bags",
    price: "KES 6,500",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Relaxed Cotton Trousers",
    category: "Clothing",
    price: "KES 5,200",
    image:
      "https://images.unsplash.com/photo-1506629905607-d9c297d3d3e4?auto=format&fit=crop&w=900&q=85",
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="luma-hero px-10">
        <div className="container-fluid px-4 px-lg-5 py-5">
          <div className="row align-items-center min-vh-75 py-5">
            <div className="col-lg-6 py-5">
              <p className="luma-eyebrow">
                THE NEW EVERYDAY
              </p>

              <h1 className="luma-hero-title">
                Style that
                <br />
                feels like you.
              </h1>

              <p className="luma-hero-text">
                Thoughtfully selected clothing, shoes and bags
                designed for everyday living.
              </p>

              <div className="d-flex flex-wrap gap-3 mt-4">
                <Link
                  href="/shop/products"
                  className="btn luma-primary-btn"
                >
                  Shop collection
                </Link>

                <Link
                  href="/shop/products"
                  className="btn luma-secondary-btn"
                >
                  Explore
                </Link>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="luma-hero-visual">
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=85"
                  alt="Luma & Co. fashion collection"
                />

                <div className="luma-hero-overlay" />

                <div className="luma-hero-visual-text">
                  <span>NEW</span>
                  <strong>COLLECTION</strong>
                  <span>2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="luma-introduction border-top">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-8 text-center py-5">
              <p className="luma-eyebrow">
                LUMA & CO.
              </p>

              <h2 className="luma-section-title">
                Everyday pieces.
                <br />
                Considered carefully.
              </h2>

              <p className="luma-section-text mx-auto mt-4">
                We believe great style does not need to be
                complicated. Luma brings together timeless pieces
                that are easy to wear, easy to pair and made for
                everyday life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="luma-categories border-top">
        <div className="container py-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-5">
            <div>
              <p className="luma-eyebrow mb-2">
                EXPLORE
              </p>

              <h2 className="luma-section-heading mb-0">
                Shop by category
              </h2>
            </div>

            <Link
              href="/shop/products"
              className="luma-text-link"
            >
              View all products →
            </Link>
          </div>

          <div className="row g-4">
            {categories.map((category) => (
              <div
                className="col-md-4"
                key={category.name}
              >
                <Link
                  href="/shop/products"
                  className="text-decoration-none text-body"
                >
                  <article className="luma-category-card">
                    <div className="luma-category-image">
                      <img
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                      />
                    </div>

                    <div className="pt-4">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className="luma-card-number">
                            {category.number}
                          </span>

                          <h3 className="luma-card-title">
                            {category.name}
                          </h3>
                        </div>

                        <span className="luma-arrow">
                          ↗
                        </span>
                      </div>

                      <p className="luma-card-text">
                        {category.description}
                      </p>
                    </div>
                  </article>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="luma-products border-top">
        <div className="container py-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-5">
            <div>
              <p className="luma-eyebrow mb-2">
                CURATED FOR YOU
              </p>

              <h2 className="luma-section-heading mb-0">
                Featured pieces
              </h2>
            </div>

            <Link
              href="/shop/products"
              className="luma-text-link"
            >
              Shop everything →
            </Link>
          </div>

          <div className="row g-4">
            {featuredProducts.map((product) => (
              <div
                className="col-6 col-lg-3"
                key={product.name}
              >
                <Link
                  href="/shop/products"
                  className="text-decoration-none text-body"
                >
                  <article className="luma-product-card">
                    <div className="luma-product-image">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                      />
                    </div>

                    <div className="pt-3">
                      <p className="luma-product-category mb-1">
                        {product.category}
                      </p>

                      <h3 className="luma-product-name">
                        {product.name}
                      </h3>

                      <p className="luma-product-price mb-0">
                        {product.price}
                      </p>
                    </div>
                  </article>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL */}
      <section className="luma-editorial border-top">
        <div className="container-fluid px-4 px-lg-5 py-5">
          <div className="row align-items-center py-5">
            <div className="col-lg-6">
              <div className="luma-editorial-image">
                <img
                  src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85"
                  alt="Luma & Co. everyday style"
                  loading="lazy"
                />

                <div className="luma-editorial-overlay" />

                <span>
                  LUMA / EVERYDAY
                </span>
              </div>
            </div>

            <div className="col-lg-5 offset-lg-1 mt-5 mt-lg-0">
              <p className="luma-eyebrow">
                OUR PHILOSOPHY
              </p>

              <h2 className="luma-section-title">
                Less,
                <br />
                but better.
              </h2>

              <p className="luma-section-text mt-4">
                We focus on pieces that earn their place in your
                wardrobe. Simple silhouettes, thoughtful details
                and styles that stay relevant beyond a single
                season.
              </p>

              <Link
                href="/shop/products"
                className="luma-text-link d-inline-block mt-3"
              >
                Discover Luma →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="luma-newsletter border-top">
        <div className="container py-5">
          <div className="row justify-content-center text-center py-5">
            <div className="col-lg-7">
              <p className="luma-eyebrow">
                STAY IN THE LOOP
              </p>

              <h2 className="luma-section-title">
                A little inspiration,
                <br />
                delivered occasionally.
              </h2>

              <p className="luma-section-text mx-auto mt-4">
                Sign up for new arrivals, curated collections
                and occasional notes from Luma & Co.
              </p>

              <div className="row justify-content-center mt-4">
                <div className="col-md-8">
                  <div className="input-group luma-newsletter-form">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Your email address"
                      aria-label="Email address"
                    />

                    <button
                      type="button"
                      className="btn luma-primary-btn"
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

