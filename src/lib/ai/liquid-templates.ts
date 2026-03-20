export function generateLiquidCode(componentType: string, description?: string): string {
  switch (componentType) {
    case "featured-products":
      return `{% comment %}
  Featured Products Section
  ${description || "Curated product grid — luxury clean beauty aesthetic"}
{% endcomment %}

<section class="featured-products" data-section-id="{{ section.id }}">
  <div class="featured-products__inner">
    {% if section.settings.label != blank %}
      <span class="featured-products__label">{{ section.settings.label }}</span>
    {% endif %}
    <h2 class="featured-products__heading">{{ section.settings.heading }}</h2>
    {% if section.settings.subheading != blank %}
      <p class="featured-products__subheading">{{ section.settings.subheading }}</p>
    {% endif %}

    <div class="featured-products__grid">
      {% for product in collections[section.settings.collection].products limit: section.settings.product_count %}
        <article class="fp-card">
          <a href="{{ product.url }}" class="fp-card__link">
            <div class="fp-card__image-wrap">
              {% if product.featured_image %}
                {{ product.featured_image | image_url: width: 640 | image_tag:
                  loading: 'lazy',
                  class: 'fp-card__img'
                }}
              {% else %}
                {{ 'product-1' | placeholder_svg_tag: 'fp-card__placeholder' }}
              {% endif %}
            </div>
            <div class="fp-card__meta">
              <span class="fp-card__vendor">{{ product.vendor }}</span>
              <h3 class="fp-card__title">{{ product.title }}</h3>
              <span class="fp-card__price">{{ product.price | money }}</span>
            </div>
          </a>
          <button class="fp-card__atc" type="button" data-product-id="{{ product.id }}">
            Add to Bag
          </button>
        </article>
      {% endfor %}
    </div>
  </div>
</section>

{% style %}
  .featured-products {
    --fp-accent: #D33167;
    --fp-text: #000;
    --fp-muted: rgba(0,0,0,0.55);
    --fp-light: rgba(0,0,0,0.25);
    padding: 96px 0;
    background: #fff;
  }
  .featured-products__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .featured-products__label {
    display: block;
    font-size: 0.7rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--fp-accent);
    margin-bottom: 12px;
    text-align: center;
  }
  .featured-products__heading {
    font-family: 'Founders Grotesk', 'Roboto Condensed', sans-serif;
    font-size: 2.75rem;
    font-weight: 700;
    line-height: 1.05;
    text-align: center;
    margin: 0 0 12px;
    color: var(--fp-text);
    letter-spacing: -0.01em;
  }
  .featured-products__subheading {
    text-align: center;
    color: var(--fp-muted);
    font-size: 1rem;
    margin: 0 0 56px;
    font-weight: 400;
  }
  .featured-products__grid {
    display: grid;
    grid-template-columns: repeat({{ section.settings.columns }}, 1fr);
    gap: 28px;
  }
  .fp-card { position: relative; }
  .fp-card__link { text-decoration: none; color: inherit; display: block; }
  .fp-card__image-wrap { overflow: hidden; background: #f5f5f0; margin-bottom: 16px; }
  .fp-card__img {
    width: 100%;
    aspect-ratio: 3/4;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }
  .fp-card__link:hover .fp-card__img { transform: scale(1.04); }
  .fp-card__vendor {
    display: block;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--fp-muted);
    margin-bottom: 4px;
    font-weight: 500;
  }
  .fp-card__title {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 6px;
    color: var(--fp-text);
    line-height: 1.3;
  }
  .fp-card__price {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--fp-text);
  }
  .fp-card__atc {
    display: inline-block;
    margin-top: 12px;
    padding: 0;
    border: none;
    background: none;
    color: var(--fp-text);
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
    border-bottom: 1px solid var(--fp-text);
    padding-bottom: 2px;
    transition: color 0.3s ease, border-color 0.3s ease;
  }
  .fp-card__atc:hover {
    color: var(--fp-accent);
    border-color: var(--fp-accent);
  }
  @media (max-width: 768px) {
    .featured-products { padding: 64px 0; }
    .featured-products__heading { font-size: 2rem; }
    .featured-products__grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  }
{% endstyle %}

{% schema %}
{
  "name": "Featured Products",
  "settings": [
    { "type": "text", "id": "label", "label": "Top Label", "default": "Curated for You" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "Bestsellers" },
    { "type": "text", "id": "subheading", "label": "Subheading", "default": "The essentials your routine has been missing" },
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
  ${description || "Full-bleed editorial hero — luxury clean beauty aesthetic"}
{% endcomment %}

<section class="hero-banner" data-section-id="{{ section.id }}">
  <div class="hero-banner__media">
    {% if section.settings.background_image %}
      {{ section.settings.background_image | image_url: width: 1920 | image_tag:
        loading: 'eager',
        class: 'hero-banner__img',
        fetchpriority: 'high'
      }}
    {% endif %}
    <div class="hero-banner__overlay"></div>
  </div>
  <div class="hero-banner__content">
    {% if section.settings.label != blank %}
      <span class="hero-banner__label">{{ section.settings.label }}</span>
    {% endif %}
    <h1 class="hero-banner__heading">{{ section.settings.heading }}</h1>
    {% if section.settings.subheading != blank %}
      <p class="hero-banner__subheading">{{ section.settings.subheading }}</p>
    {% endif %}
    {% if section.settings.button_text != blank %}
      <a href="{{ section.settings.button_link }}" class="hero-banner__cta">
        {{ section.settings.button_text }}
      </a>
    {% endif %}
  </div>
</section>

{% style %}
  .hero-banner {
    --hero-accent: #D33167;
    position: relative;
    min-height: 85vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #000;
  }
  .hero-banner__media {
    position: absolute;
    inset: 0;
  }
  .hero-banner__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .hero-banner__overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,{{ section.settings.overlay_opacity | divided_by: 100.0 }});
  }
  .hero-banner__content {
    position: relative;
    z-index: 2;
    text-align: center;
    max-width: 680px;
    padding: 40px 24px;
  }
  .hero-banner__label {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--hero-accent);
    margin-bottom: 20px;
  }
  .hero-banner__heading {
    font-family: 'Founders Grotesk', 'Roboto Condensed', sans-serif;
    font-size: 4.5rem;
    font-weight: 700;
    color: #fff;
    line-height: 0.95;
    margin: 0 0 20px;
    letter-spacing: -0.02em;
  }
  .hero-banner__subheading {
    font-size: 1.1rem;
    color: rgba(255,255,255,0.75);
    margin: 0 0 40px;
    line-height: 1.6;
    font-weight: 300;
  }
  .hero-banner__cta {
    display: inline-block;
    padding: 14px 44px;
    background: #fff;
    color: #000;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    text-decoration: none;
    border: none;
    transition: background 0.3s ease, color 0.3s ease;
  }
  .hero-banner__cta:hover {
    background: var(--hero-accent);
    color: #fff;
  }
  @media (max-width: 768px) {
    .hero-banner { min-height: 65vh; }
    .hero-banner__heading { font-size: 2.5rem; }
    .hero-banner__subheading { font-size: 1rem; }
  }
{% endstyle %}

{% schema %}
{
  "name": "Hero Banner",
  "settings": [
    { "type": "image_picker", "id": "background_image", "label": "Background Image" },
    { "type": "text", "id": "label", "label": "Top Label", "default": "New Arrival" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "Makeup for\\nSkincare Freaks" },
    { "type": "textarea", "id": "subheading", "label": "Subheading", "default": "Clean, clinically-proven formulas that do more for your skin" },
    { "type": "text", "id": "button_text", "label": "Button Text", "default": "Shop Now" },
    { "type": "url", "id": "button_link", "label": "Button Link" },
    { "type": "range", "id": "overlay_opacity", "min": 0, "max": 70, "step": 5, "default": 30, "label": "Overlay Opacity %" }
  ],
  "presets": [{ "name": "Hero Banner" }]
}
{% endschema %}`;

    case "product-grid":
      return `{% comment %}
  Product Grid Section
  ${description || "Responsive product grid — luxury clean beauty aesthetic"}
{% endcomment %}

<section class="pg-section" data-section-id="{{ section.id }}">
  <div class="pg-section__inner">
    <h2 class="pg-section__heading">{{ section.settings.heading }}</h2>

    <div class="pg-grid">
      {% for product in collections[section.settings.collection].products limit: section.settings.limit %}
        <article class="pg-card">
          <a href="{{ product.url }}" class="pg-card__link">
            <div class="pg-card__image-wrap">
              {% if product.featured_image %}
                {{ product.featured_image | image_url: width: 560 | image_tag:
                  loading: 'lazy',
                  class: 'pg-card__image'
                }}
              {% endif %}
              {% if product.compare_at_price > product.price %}
                <span class="pg-card__badge">Sale</span>
              {% endif %}
            </div>
            <div class="pg-card__details">
              <span class="pg-card__vendor">{{ product.vendor }}</span>
              <h3 class="pg-card__title">{{ product.title }}</h3>
              <div class="pg-card__pricing">
                <span class="pg-card__price">{{ product.price | money }}</span>
                {% if product.compare_at_price > product.price %}
                  <s class="pg-card__compare">{{ product.compare_at_price | money }}</s>
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
  .pg-section {
    --pg-accent: #D33167;
    --pg-text: #000;
    --pg-muted: rgba(0,0,0,0.55);
    padding: 88px 0;
    background: #fff;
  }
  .pg-section__inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .pg-section__heading {
    font-family: 'Founders Grotesk', 'Roboto Condensed', sans-serif;
    font-size: 2.25rem;
    font-weight: 700;
    margin: 0 0 48px;
    color: var(--pg-text);
    letter-spacing: -0.01em;
  }
  .pg-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 28px;
  }
  .pg-card__link { text-decoration: none; color: inherit; display: block; }
  .pg-card__image-wrap { position: relative; overflow: hidden; background: #f5f5f0; margin-bottom: 14px; }
  .pg-card__image {
    width: 100%;
    aspect-ratio: 3/4;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }
  .pg-card__link:hover .pg-card__image { transform: scale(1.04); }
  .pg-card__badge {
    position: absolute;
    top: 14px;
    left: 14px;
    background: var(--pg-accent);
    color: #fff;
    padding: 4px 12px;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .pg-card__vendor {
    display: block;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--pg-muted);
    margin-bottom: 4px;
    font-weight: 500;
  }
  .pg-card__title { font-size: 0.95rem; font-weight: 500; margin: 0 0 6px; line-height: 1.3; }
  .pg-card__pricing { display: flex; align-items: center; gap: 8px; }
  .pg-card__price { font-size: 0.9rem; font-weight: 600; }
  .pg-card__compare { font-size: 0.85rem; color: var(--pg-muted); font-weight: 400; }
{% endstyle %}

{% schema %}
{
  "name": "Product Grid",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "Shop All" },
    { "type": "collection", "id": "collection", "label": "Collection" },
    { "type": "range", "id": "limit", "min": 4, "max": 24, "step": 4, "default": 12, "label": "Products to show" }
  ],
  "presets": [{ "name": "Product Grid" }]
}
{% endschema %}`;

    case "newsletter":
      return `{% comment %}
  Newsletter Signup Section
  ${description || "Email capture — luxury clean beauty aesthetic"}
{% endcomment %}

<section class="nl-section" data-section-id="{{ section.id }}">
  <div class="nl-section__inner">
    {% if section.settings.label != blank %}
      <span class="nl-section__label">{{ section.settings.label }}</span>
    {% endif %}
    <h2 class="nl-section__heading">{{ section.settings.heading }}</h2>
    <p class="nl-section__body">{{ section.settings.subheading }}</p>
    {% form 'customer', class: 'nl-form' %}
      <input type="hidden" name="contact[tags]" value="newsletter">
      <div class="nl-form__row">
        <input type="email" name="contact[email]" placeholder="{{ section.settings.placeholder }}"
          class="nl-form__input" required aria-label="Email address">
        <button type="submit" class="nl-form__btn">{{ section.settings.button_text }}</button>
      </div>
    {% endform %}
  </div>
</section>

{% style %}
  .nl-section {
    --nl-accent: #D33167;
    padding: 100px 0;
    background: #000;
    color: #fff;
  }
  .nl-section__inner {
    max-width: 520px;
    margin: 0 auto;
    padding: 0 24px;
    text-align: center;
  }
  .nl-section__label {
    display: inline-block;
    font-size: 0.65rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--nl-accent);
    margin-bottom: 16px;
  }
  .nl-section__heading {
    font-family: 'Founders Grotesk', 'Roboto Condensed', sans-serif;
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.05;
    margin: 0 0 16px;
    letter-spacing: -0.01em;
  }
  .nl-section__body {
    font-size: 1rem;
    color: rgba(255,255,255,0.6);
    margin: 0 0 40px;
    line-height: 1.6;
    font-weight: 300;
  }
  .nl-form__row { display: flex; gap: 0; }
  .nl-form__input {
    flex: 1;
    padding: 14px 18px;
    border: 1px solid rgba(255,255,255,0.25);
    background: transparent;
    color: #fff;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.3s ease;
  }
  .nl-form__input::placeholder { color: rgba(255,255,255,0.35); }
  .nl-form__input:focus { border-color: var(--nl-accent); }
  .nl-form__btn {
    padding: 14px 32px;
    background: #fff;
    color: #000;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.3s ease, color 0.3s ease;
  }
  .nl-form__btn:hover {
    background: var(--nl-accent);
    color: #fff;
  }
  @media (max-width: 640px) {
    .nl-section { padding: 72px 0; }
    .nl-section__heading { font-size: 1.75rem; }
    .nl-form__row { flex-direction: column; gap: 12px; }
  }
{% endstyle %}

{% schema %}
{
  "name": "Newsletter",
  "settings": [
    { "type": "text", "id": "label", "label": "Top Label", "default": "Stay in the Know" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "Join the Inner Circle" },
    { "type": "text", "id": "subheading", "label": "Subheading", "default": "First access to new drops, exclusive offers, and clean beauty intel" },
    { "type": "text", "id": "placeholder", "label": "Input Placeholder", "default": "Enter your email" },
    { "type": "text", "id": "button_text", "label": "Button Text", "default": "Subscribe" }
  ],
  "presets": [{ "name": "Newsletter" }]
}
{% endschema %}`;

    case "testimonials":
      return `{% comment %}
  Testimonials Section
  ${description || "Customer reviews — luxury clean beauty aesthetic"}
{% endcomment %}

<section class="tst-section" data-section-id="{{ section.id }}">
  <div class="tst-section__inner">
    {% if section.settings.label != blank %}
      <span class="tst-section__label">{{ section.settings.label }}</span>
    {% endif %}
    <h2 class="tst-section__heading">{{ section.settings.heading }}</h2>

    <div class="tst-grid">
      {% for block in section.blocks %}
        <blockquote class="tst-card" {{ block.shopify_attributes }}>
          <div class="tst-card__stars">
            {% for i in (1..block.settings.rating) %}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#D33167"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            {% endfor %}
          </div>
          <p class="tst-card__quote">{{ block.settings.text }}</p>
          <footer class="tst-card__footer">
            <cite class="tst-card__author">{{ block.settings.author }}</cite>
            {% if block.settings.verified %}
              <span class="tst-card__verified">Verified</span>
            {% endif %}
          </footer>
        </blockquote>
      {% endfor %}
    </div>
  </div>
</section>

{% style %}
  .tst-section {
    --tst-accent: #D33167;
    --tst-text: #000;
    --tst-muted: rgba(0,0,0,0.55);
    padding: 96px 0;
    background: #FAFAF7;
  }
  .tst-section__inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .tst-section__label {
    display: block;
    font-size: 0.65rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--tst-accent);
    margin-bottom: 12px;
    text-align: center;
  }
  .tst-section__heading {
    font-family: 'Founders Grotesk', 'Roboto Condensed', sans-serif;
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin: 0 0 56px;
    color: var(--tst-text);
    letter-spacing: -0.01em;
  }
  .tst-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
  }
  .tst-card {
    margin: 0;
    padding: 36px;
    background: #fff;
    border: 1px solid rgba(0,0,0,0.06);
    position: relative;
  }
  .tst-card__stars { display: flex; gap: 3px; margin-bottom: 20px; }
  .tst-card__quote {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--tst-text);
    margin: 0 0 24px;
    font-weight: 400;
    font-style: italic;
  }
  .tst-card__footer { display: flex; align-items: center; gap: 10px; }
  .tst-card__author {
    font-size: 0.8rem;
    font-weight: 600;
    font-style: normal;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--tst-text);
  }
  .tst-card__verified {
    font-size: 0.65rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--tst-accent);
  }
{% endstyle %}

{% schema %}
{
  "name": "Testimonials",
  "settings": [
    { "type": "text", "id": "label", "label": "Top Label", "default": "Reviews" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "In Their Words" }
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
      { "type": "testimonial", "settings": { "text": "This serum transformed my skin in just two weeks. The glow is unreal.", "author": "Sarah M.", "rating": 5, "verified": true } },
      { "type": "testimonial", "settings": { "text": "Finally a foundation that actually improves my skin over time. Obsessed.", "author": "Jessica L.", "rating": 5, "verified": true } },
      { "type": "testimonial", "settings": { "text": "Clean ingredients that deliver. My skin has never felt this good.", "author": "Emily R.", "rating": 5, "verified": true } }
    ]
  }]
}
{% endschema %}`;

    default:
      return `{% comment %}
  Custom Section
  ${description || "Custom Shopify section — luxury clean beauty aesthetic"}
{% endcomment %}

<section class="custom-section" data-section-id="{{ section.id }}">
  <div class="custom-section__inner">
    <h2 class="custom-section__heading">{{ section.settings.heading }}</h2>
    <div class="custom-section__content rte">
      {{ section.settings.content }}
    </div>
  </div>
</section>

{% style %}
  .custom-section {
    padding: 88px 0;
    background: #fff;
  }
  .custom-section__inner {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .custom-section__heading {
    font-family: 'Founders Grotesk', 'Roboto Condensed', sans-serif;
    font-size: 2.25rem;
    font-weight: 700;
    margin: 0 0 32px;
    color: #000;
    letter-spacing: -0.01em;
  }
  .custom-section__content {
    font-size: 1rem;
    line-height: 1.7;
    color: rgba(0,0,0,0.7);
  }
{% endstyle %}

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
