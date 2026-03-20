export function generateLiquidCode(componentType: string, description?: string): string {
  switch (componentType) {
    case "featured-products":
      return `{% comment %}
  Featured Products Section
  ${description || "Displays a curated grid of featured products"}
{% endcomment %}

<section class="featured-products" data-section-id="{{ section.id }}">
  <div class="page-width">
    <h2 class="section-heading">{{ section.settings.heading }}</h2>
    {% if section.settings.subheading != blank %}
      <p class="section-subheading">{{ section.settings.subheading }}</p>
    {% endif %}

    <div class="product-grid" style="
      display: grid;
      grid-template-columns: repeat({{ section.settings.columns }}, 1fr);
      gap: 24px;
    ">
      {% for product in collections[section.settings.collection].products limit: section.settings.product_count %}
        <div class="product-card">
          <a href="{{ product.url }}">
            <div class="product-card__image">
              {% if product.featured_image %}
                {{ product.featured_image | image_url: width: 600 | image_tag:
                  loading: 'lazy',
                  class: 'product-card__img'
                }}
              {% else %}
                {{ 'product-1' | placeholder_svg_tag: 'placeholder-svg' }}
              {% endif %}
            </div>
            <div class="product-card__info">
              <p class="product-card__vendor">{{ product.vendor }}</p>
              <h3 class="product-card__title">{{ product.title }}</h3>
              <p class="product-card__price">{{ product.price | money }}</p>
            </div>
          </a>
          <button class="product-card__atc btn btn--primary"
            type="button"
            data-product-id="{{ product.id }}">
            Add to Cart
          </button>
        </div>
      {% endfor %}
    </div>
  </div>
</section>

{% style %}
  .featured-products { padding: 60px 0; }
  .section-heading { font-size: 2rem; text-align: center; margin-bottom: 8px; }
  .section-subheading { text-align: center; color: #666; margin-bottom: 40px; }
  .product-card { border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s; }
  .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
  .product-card__img { width: 100%; aspect-ratio: 1; object-fit: cover; }
  .product-card__info { padding: 16px; }
  .product-card__vendor { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #888; }
  .product-card__title { font-size: 1rem; font-weight: 600; margin: 4px 0; }
  .product-card__price { font-size: 1rem; font-weight: 700; color: #111; }
  .product-card__atc { display: block; width: calc(100% - 32px); margin: 0 16px 16px; padding: 10px; border: none; border-radius: 8px; background: #111; color: #fff; font-weight: 600; cursor: pointer; transition: background 0.2s; }
  .product-card__atc:hover { background: #333; }
{% endstyle %}

{% schema %}
{
  "name": "Featured Products",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "Featured Products" },
    { "type": "text", "id": "subheading", "label": "Subheading", "default": "Our most popular picks" },
    { "type": "collection", "id": "collection", "label": "Collection" },
    { "type": "range", "id": "product_count", "min": 2, "max": 12, "step": 1, "default": 4, "label": "Products to show" },
    { "type": "range", "id": "columns", "min": 2, "max": 4, "step": 1, "default": 4, "label": "Columns" }
  ],
  "presets": [{ "name": "Featured Products" }]
}
{% endschema %}`;

    case "hero-banner":
      return `{% comment %}
  Hero Banner Section
  ${description || "Full-width hero with heading, subtext, and CTA"}
{% endcomment %}

<section class="hero-banner" data-section-id="{{ section.id }}"
  style="background-image: url('{{ section.settings.background_image | image_url: width: 1920 }}');">
  <div class="hero-banner__overlay" style="background: rgba(0,0,0,{{ section.settings.overlay_opacity | divided_by: 100.0 }});">
    <div class="page-width hero-banner__content">
      {% if section.settings.heading != blank %}
        <h1 class="hero-banner__heading">{{ section.settings.heading }}</h1>
      {% endif %}
      {% if section.settings.subheading != blank %}
        <p class="hero-banner__subheading">{{ section.settings.subheading }}</p>
      {% endif %}
      {% if section.settings.button_text != blank %}
        <a href="{{ section.settings.button_link }}" class="hero-banner__cta btn btn--primary">
          {{ section.settings.button_text }}
        </a>
      {% endif %}
    </div>
  </div>
</section>

{% style %}
  .hero-banner { min-height: 70vh; background-size: cover; background-position: center; display: flex; }
  .hero-banner__overlay { flex: 1; display: flex; align-items: center; justify-content: center; }
  .hero-banner__content { text-align: center; max-width: 700px; padding: 40px 20px; }
  .hero-banner__heading { font-size: 3.5rem; font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 16px; }
  .hero-banner__subheading { font-size: 1.25rem; color: rgba(255,255,255,0.85); margin-bottom: 32px; line-height: 1.6; }
  .hero-banner__cta { display: inline-block; padding: 14px 36px; background: #fff; color: #111; font-weight: 700; text-decoration: none; border-radius: 8px; font-size: 1rem; transition: transform 0.2s, box-shadow 0.2s; }
  .hero-banner__cta:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
  @media (max-width: 768px) { .hero-banner__heading { font-size: 2rem; } .hero-banner { min-height: 50vh; } }
{% endstyle %}

{% schema %}
{
  "name": "Hero Banner",
  "settings": [
    { "type": "image_picker", "id": "background_image", "label": "Background Image" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "Your Skin Deserves the Best" },
    { "type": "textarea", "id": "subheading", "label": "Subheading", "default": "Discover our clean, science-backed skincare formulas" },
    { "type": "text", "id": "button_text", "label": "Button Text", "default": "Shop Now" },
    { "type": "url", "id": "button_link", "label": "Button Link" },
    { "type": "range", "id": "overlay_opacity", "min": 0, "max": 90, "step": 5, "default": 40, "label": "Overlay Opacity %" }
  ],
  "presets": [{ "name": "Hero Banner" }]
}
{% endschema %}`;

    case "product-grid":
      return `{% comment %}
  Product Grid Section
  ${description || "Responsive product grid with filtering"}
{% endcomment %}

<section class="product-grid-section" data-section-id="{{ section.id }}">
  <div class="page-width">
    <h2 class="section-heading">{{ section.settings.heading }}</h2>

    <div class="product-grid" style="
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
    ">
      {% for product in collections[section.settings.collection].products limit: section.settings.limit %}
        <article class="grid-product">
          <a href="{{ product.url }}" class="grid-product__link">
            <div class="grid-product__image-wrapper">
              {% if product.featured_image %}
                {{ product.featured_image | image_url: width: 500 | image_tag:
                  loading: 'lazy',
                  class: 'grid-product__image'
                }}
              {% endif %}
              {% if product.compare_at_price > product.price %}
                <span class="grid-product__badge">Sale</span>
              {% endif %}
            </div>
            <div class="grid-product__meta">
              <span class="grid-product__vendor">{{ product.vendor }}</span>
              <h3 class="grid-product__title">{{ product.title }}</h3>
              <div class="grid-product__price">
                <span>{{ product.price | money }}</span>
                {% if product.compare_at_price > product.price %}
                  <s class="grid-product__compare">{{ product.compare_at_price | money }}</s>
                {% endif %}
              </div>
            </div>
          </a>
        </article>
      {% endfor %}
    </div>
  </div>
</section>

{% style %}
  .product-grid-section { padding: 60px 0; }
  .section-heading { font-size: 1.75rem; font-weight: 700; margin-bottom: 32px; }
  .grid-product { border-radius: 12px; overflow: hidden; background: #fff; border: 1px solid #eee; transition: all 0.2s; }
  .grid-product:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-color: #ddd; }
  .grid-product__link { text-decoration: none; color: inherit; }
  .grid-product__image-wrapper { position: relative; }
  .grid-product__image { width: 100%; aspect-ratio: 1; object-fit: cover; }
  .grid-product__badge { position: absolute; top: 12px; left: 12px; background: #ef4444; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
  .grid-product__meta { padding: 16px; }
  .grid-product__vendor { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: #999; }
  .grid-product__title { font-size: 0.95rem; font-weight: 600; margin: 4px 0 8px; }
  .grid-product__price { font-weight: 700; }
  .grid-product__compare { color: #999; font-weight: 400; margin-left: 8px; }
{% endstyle %}

{% schema %}
{
  "name": "Product Grid",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "All Products" },
    { "type": "collection", "id": "collection", "label": "Collection" },
    { "type": "range", "id": "limit", "min": 4, "max": 24, "step": 4, "default": 12, "label": "Products to show" }
  ],
  "presets": [{ "name": "Product Grid" }]
}
{% endschema %}`;

    case "newsletter":
      return `{% comment %}
  Newsletter Signup Section
  ${description || "Email signup with gradient background"}
{% endcomment %}

<section class="newsletter-section" data-section-id="{{ section.id }}">
  <div class="page-width newsletter-content">
    <h2 class="newsletter-heading">{{ section.settings.heading }}</h2>
    <p class="newsletter-subheading">{{ section.settings.subheading }}</p>
    {% form 'customer', class: 'newsletter-form' %}
      <input type="hidden" name="contact[tags]" value="newsletter">
      <div class="newsletter-input-group">
        <input type="email" name="contact[email]" placeholder="{{ section.settings.placeholder }}"
          class="newsletter-input" required aria-label="Email">
        <button type="submit" class="newsletter-btn">{{ section.settings.button_text }}</button>
      </div>
    {% endform %}
  </div>
</section>

{% style %}
  .newsletter-section { padding: 80px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  .newsletter-content { max-width: 560px; margin: 0 auto; text-align: center; }
  .newsletter-heading { font-size: 2rem; font-weight: 800; color: #fff; margin-bottom: 12px; }
  .newsletter-subheading { color: rgba(255,255,255,0.8); font-size: 1.1rem; margin-bottom: 32px; }
  .newsletter-input-group { display: flex; gap: 8px; }
  .newsletter-input { flex: 1; padding: 14px 18px; border: 2px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.15); border-radius: 10px; color: #fff; font-size: 1rem; backdrop-filter: blur(10px); }
  .newsletter-input::placeholder { color: rgba(255,255,255,0.6); }
  .newsletter-input:focus { outline: none; border-color: #fff; background: rgba(255,255,255,0.2); }
  .newsletter-btn { padding: 14px 28px; background: #fff; color: #764ba2; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; font-size: 1rem; white-space: nowrap; transition: transform 0.2s; }
  .newsletter-btn:hover { transform: scale(1.02); }
  @media (max-width: 640px) { .newsletter-input-group { flex-direction: column; } }
{% endstyle %}

{% schema %}
{
  "name": "Newsletter",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "Join the Glow Club" },
    { "type": "text", "id": "subheading", "label": "Subheading", "default": "Get 15% off your first order plus skincare tips" },
    { "type": "text", "id": "placeholder", "label": "Input Placeholder", "default": "Enter your email" },
    { "type": "text", "id": "button_text", "label": "Button Text", "default": "Subscribe" }
  ],
  "presets": [{ "name": "Newsletter" }]
}
{% endschema %}`;

    case "testimonials":
      return `{% comment %}
  Testimonials Section
  ${description || "Customer testimonials carousel"}
{% endcomment %}

<section class="testimonials-section" data-section-id="{{ section.id }}">
  <div class="page-width">
    <h2 class="testimonials-heading">{{ section.settings.heading }}</h2>
    <div class="testimonials-grid">
      {% for block in section.blocks %}
        <div class="testimonial-card" {{ block.shopify_attributes }}>
          <div class="testimonial-stars">
            {% for i in (1..block.settings.rating) %}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            {% endfor %}
          </div>
          <p class="testimonial-text">"{{ block.settings.text }}"</p>
          <div class="testimonial-author">
            <strong>{{ block.settings.author }}</strong>
            {% if block.settings.verified %}
              <span class="testimonial-verified">Verified Buyer</span>
            {% endif %}
          </div>
        </div>
      {% endfor %}
    </div>
  </div>
</section>

{% style %}
  .testimonials-section { padding: 60px 0; }
  .testimonials-heading { font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 40px; }
  .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
  .testimonial-card { background: #fafafa; border-radius: 16px; padding: 28px; border: 1px solid #eee; }
  .testimonial-stars { display: flex; gap: 2px; margin-bottom: 16px; }
  .testimonial-text { font-size: 1rem; line-height: 1.7; color: #333; margin-bottom: 16px; }
  .testimonial-author strong { font-size: 0.9rem; }
  .testimonial-verified { font-size: 0.75rem; color: #16a34a; margin-left: 8px; background: #f0fdf4; padding: 2px 8px; border-radius: 4px; }
{% endstyle %}

{% schema %}
{
  "name": "Testimonials",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "What Our Customers Say" }
  ],
  "blocks": [
    {
      "type": "testimonial",
      "name": "Testimonial",
      "settings": [
        { "type": "textarea", "id": "text", "label": "Review Text" },
        { "type": "text", "id": "author", "label": "Author Name" },
        { "type": "range", "id": "rating", "min": 1, "max": 5, "default": 5, "label": "Star Rating" },
        { "type": "checkbox", "id": "verified", "label": "Verified Buyer", "default": true }
      ]
    }
  ],
  "presets": [{
    "name": "Testimonials",
    "blocks": [
      { "type": "testimonial", "settings": { "text": "This serum transformed my skin in just two weeks!", "author": "Sarah M.", "rating": 5, "verified": true } },
      { "type": "testimonial", "settings": { "text": "Best moisturizer I've ever used. My skin feels amazing.", "author": "Jessica L.", "rating": 5, "verified": true } },
      { "type": "testimonial", "settings": { "text": "Clean ingredients and it actually works. Will repurchase!", "author": "Emily R.", "rating": 4, "verified": true } }
    ]
  }]
}
{% endschema %}`;

    default:
      return `{% comment %}
  Custom Section
  ${description || "Custom Shopify section"}
{% endcomment %}

<section class="custom-section" data-section-id="{{ section.id }}">
  <div class="page-width">
    <h2>{{ section.settings.heading }}</h2>
    <div class="custom-content">
      {{ section.settings.content }}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Custom Section",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "Custom Section" },
    { "type": "richtext", "id": "content", "label": "Content" }
  ],
  "presets": [{ "name": "Custom Section" }]
}
{% endschema %}`;
  }
}
