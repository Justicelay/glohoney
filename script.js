document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu toggle functionality
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener("click", function () {
      navMenu.classList.toggle("active");
      const icon = this.querySelector("i");
      if (navMenu.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
      } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });
  }

  // Notification function - available globally within DOMContentLoaded
  function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === "error" ? "exclamation-circle" : "check-circle"}"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);

    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
      z-index: 10000;
    `;

    setTimeout(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateY(0)";
    }, 100);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateY(10px)";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Cart Management System
  const cartIcon = document.querySelector(".cart-icon");
  const cartModal = document.querySelector(".cart-modal");
  const closeCart = document.querySelector(".close-cart");
  const cartItems = document.querySelector(".cart-items");
  const totalAmount = document.querySelector(".total-amount");
  const checkoutBtn = document.querySelector(".checkout-btn");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  function updateCart() {
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      cartItems.innerHTML += `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name} (${item.volume})</div>
            <div class="cart-item-price">GH₵ ${item.price.toFixed(2)} × ${item.quantity}</div>
          </div>
          <div class="cart-item-controls">
            <div class="cart-item-quantity">
              <button class="quantity-btn minus">−</button>
              <span>${item.quantity}</span>
              <button class="quantity-btn plus">+</button>
            </div>
            <i class="fas fa-trash delete-item"></i>
          </div>
        </div>
      `;
    });

    totalAmount.textContent = `GH₵ ${total.toFixed(2)}`;
    document.querySelector(".cart-count").textContent = cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    checkoutBtn.disabled = cart.length === 0;
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function showCart() {
    cartModal.style.display = "block";
    setTimeout(() => cartModal.classList.add("active"), 10);
  }

  function hideCart() {
    cartModal.classList.remove("active");
    setTimeout(() => (cartModal.style.display = "none"), 300);
  }

  // Cart event listeners
  if (cartIcon) cartIcon.addEventListener("click", showCart);
  if (closeCart) closeCart.addEventListener("click", hideCart);

  // Cart item controls
  if (cartItems) {
    cartItems.addEventListener("click", (e) => {
      const cartItem = e.target.closest(".cart-item");
      if (!cartItem) return;

      const id = parseInt(cartItem.dataset.id);
      const itemIndex = cart.findIndex((item) => item.id === id);

      if (e.target.classList.contains("minus") && cart[itemIndex].quantity > 1) {
        cart[itemIndex].quantity--;
        updateCart();
      }

      if (e.target.classList.contains("plus")) {
        cart[itemIndex].quantity++;
        updateCart();
      }

      if (e.target.classList.contains("delete-item")) {
        cartItem.style.animation = "slideOut 0.3s ease forwards";
        setTimeout(() => {
          cart = cart.filter((item) => item.id !== id);
          updateCart();
        }, 300);
      }
    });
  }

  // Product quantity selectors and add to cart
  const quantitySelectors = document.querySelectorAll(".quantity-selector");
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = parseInt(button.dataset.productId);
      const quantitySelector = document.getElementById(
        `quantity-selector-${productId}`
      );

      if (quantitySelector) {
        document
          .querySelectorAll(".quantity-selector.active")
          .forEach((selector) => {
            if (selector !== quantitySelector) {
              selector.classList.remove("active");
            }
          });

        quantitySelector.classList.toggle("active");
      }
    });
  });

  quantitySelectors.forEach((selector) => {
    const minusBtn = selector.querySelector(".minus-btn");
    const plusBtn = selector.querySelector(".plus-btn");
    const input = selector.querySelector(".quantity-input");
    const confirmBtn = selector.querySelector(".confirm-btn");
    const productId = parseInt(selector.id.split("-").pop());

    if (minusBtn) {
      minusBtn.addEventListener("click", () => {
        const value = parseInt(input.value);
        if (value > 1) input.value = value - 1;
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener("click", () => {
        const value = parseInt(input.value);
        if (value < 99) input.value = value + 1;
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        const quantity = parseInt(input.value);
        const productCard = selector.closest(".product-card");

        if (productCard) {
          const productData = {
            id: productId,
            name: productCard.querySelector(".product-name").textContent,
            price: parseFloat(
              productCard
                .querySelector(".current-price")
                .textContent.replace("GH₵", "")
                .trim()
            ),
            volume: productCard.querySelector(".product-volume span").textContent,
            quantity: quantity,
          };

          addToCart(productData);
        }
      });
    }
  });

  function addToCart(productData) {
    const existingItem = cart.find((item) => item.id === productData.id);

    if (existingItem) {
      existingItem.quantity += productData.quantity;
    } else {
      cart.push(productData);
    }

    updateCart();
    showCart();
    showNotification(
      `Added ${productData.quantity}x ${productData.name} (${productData.volume}) to cart!`
    );
    
    // Auto-close cart after 1.5 seconds and show action popup
    setTimeout(() => {
      hideCart();
      showCartActionPopup(productData);
    }, 1500);
    
    selector.classList.remove("active");
    input.value = 1;
  }

  function showCartActionPopup(productData) {
    const modal = document.createElement("div");
    modal.className = "cart-action-modal";
    modal.innerHTML = `
      <div class="cart-action-content">
        <div class="action-header">
          <i class="fas fa-check-circle"></i>
          <h3>Item Added Successfully!</h3>
        </div>
        <p class="action-message">
          ${productData.quantity}x ${productData.name} (${productData.volume}) has been added to your cart.
        </p>
        <div class="action-buttons">
          <button class="btn btn-secondary continue-shopping">
            <i class="fas fa-shopping-bags"></i> Continue Shopping
          </button>
          <button class="btn btn-primary proceed-checkout">
            <i class="fas fa-shopping-cart"></i> Review Cart & Checkout
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const continueBtn = modal.querySelector(".continue-shopping");
    const checkoutBtn = modal.querySelector(".proceed-checkout");

    continueBtn.addEventListener("click", () => {
      modal.remove();
    });

    checkoutBtn.addEventListener("click", () => {
      modal.remove();
      showCart();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // Initialize cart display
  updateCart();

  // Checkout handler
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) {
        showNotification("Your cart is empty!", "error");
        return;
      }
      showDeliveryForm(cart);
    });
  }

  function showDeliveryForm(cartItems) {
    const modal = document.createElement("div");
    modal.className = "delivery-modal";
    modal.innerHTML = `
      <div class="delivery-modal-content">
        <div class="delivery-header">
          <h3>Delivery Information</h3>
          <button class="close-delivery-modal">&times;</button>
        </div>
        <form id="deliveryForm">
          <div class="form-group">
            <label for="delivery-name">Full Name *</label>
            <input type="text" id="delivery-name" name="name" required />
          </div>

          <div class="form-group">
            <label for="delivery-phone">Phone Number *</label>
            <input type="tel" id="delivery-phone" name="phone" required />
          </div>

          <div class="form-group">
            <label for="delivery-address">Delivery Address *</label>
            <textarea id="delivery-address" name="address" rows="3" required></textarea>
          </div>

          <div class="form-group">
            <label for="delivery-location">Delivery Location *</label>
            <select id="delivery-location" name="location" required>
              <option value="">Select your location</option>
              <option value="accra-tema">Accra & Tema (Same Day) - GH₵ 45.00</option>
              <option value="greater-accra">Greater Accra Region (24-48 hrs) - GH₵ 60.00</option>
              <option value="regional-capitals">Regional Capitals (2-4 days) - GH₵ 60.00</option>
              <option value="other-locations">Other Locations (3-5 days) - GH₵ 80.00</option>
            </select>
          </div>

          <div class="form-group">
            <label for="delivery-date">Preferred Delivery Date *</label>
            <input type="date" id="delivery-date" name="date" required />
          </div>

          <div class="delivery-summary">
            <h4>Order Summary</h4>
            <div id="order-items-summary"></div>
            <div class="summary-row">
              <span>Subtotal:</span>
              <span id="subtotal">GH₵ 0.00</span>
            </div>
            <div class="summary-row">
              <span>Delivery Fee:</span>
              <span id="delivery-fee">GH₵ 0.00</span>
            </div>
            <div class="summary-row total">
              <span>TOTAL AMOUNT:</span>
              <span id="grand-total">GH₵ 0.00</span>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary cancel-delivery">Cancel</button>
            <button type="submit" class="btn btn-primary">Proceed to WhatsApp</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const today = new Date().toISOString().split("T")[0];
    document.getElementById("delivery-date").setAttribute("min", today);

    const locationSelect = document.getElementById("delivery-location");
    locationSelect.addEventListener("change", () => {
      updateOrderSummary(cartItems);
    });

    const closeBtn = modal.querySelector(".close-delivery-modal");
    const cancelBtn = modal.querySelector(".cancel-delivery");

    closeBtn.addEventListener("click", () => modal.remove());
    cancelBtn.addEventListener("click", () => modal.remove());

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });

    const deliveryForm = document.getElementById("deliveryForm");
    deliveryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitDeliveryForm(cartItems);
    });

    updateOrderSummary(cartItems);
  }

  function updateOrderSummary(cartItems) {
    const subtotalEl = document.getElementById("subtotal");
    const deliveryFeeEl = document.getElementById("delivery-fee");
    const grandTotalEl = document.getElementById("grand-total");
    const itemsSummaryEl = document.getElementById("order-items-summary");

    let subtotal = 0;
    let itemsHTML = "";

    cartItems.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      itemsHTML += `
        <div class="summary-item">
          <span>${item.quantity}x ${item.name} (${item.volume}) @ GH₵${item.price.toFixed(2)}</span>
          <span>GH₵ ${itemTotal.toFixed(2)}</span>
        </div>
      `;
    });

    itemsSummaryEl.innerHTML = itemsHTML;
    subtotalEl.textContent = `GH₵ ${subtotal.toFixed(2)}`;

    const locationSelect = document.getElementById("delivery-location");
    const selectedLocation = locationSelect.value;
    let deliveryFee = 0;

    switch (selectedLocation) {
      case "accra-tema":
        deliveryFee = 45;
        break;
      case "greater-accra":
        deliveryFee = 60;
        break;
      case "regional-capitals":
        deliveryFee = 60;
        break;
      case "other-locations":
        deliveryFee = 80;
        break;
    }

    const grandTotal = subtotal + deliveryFee;

    deliveryFeeEl.textContent = `GH₵ ${deliveryFee.toFixed(2)}`;
    grandTotalEl.textContent = `GH₵ ${grandTotal.toFixed(2)}`;
  }

  function submitDeliveryForm(cartItems) {
    const name = document.getElementById("delivery-name").value.trim();
    const phone = document.getElementById("delivery-phone").value.trim();
    const address = document.getElementById("delivery-address").value.trim();
    const location = document.getElementById("delivery-location").value;
    const date = document.getElementById("delivery-date").value;

    if (!name || !phone || !address || !location || !date) {
      showNotification("Please fill in all delivery details", "error");
      return;
    }

    let subtotal = 0;
    let deliveryFee = 0;

    cartItems.forEach((item) => {
      subtotal += item.price * item.quantity;
    });

    switch (location) {
      case "accra-tema":
        deliveryFee = 45;
        break;
      case "greater-accra":
        deliveryFee = 60;
        break;
      case "regional-capitals":
        deliveryFee = 60;
        break;
      case "other-locations":
        deliveryFee = 80;
        break;
    }

    const grandTotal = subtotal + deliveryFee;

    const message = formatCheckoutMessage(cartItems, grandTotal, deliveryFee, {
      name,
      phone,
      address,
      date,
    });

    sendToWhatsApp(message);

    cart = [];
    updateCart();
    hideCart();

    const modal = document.querySelector(".delivery-modal");
    if (modal) modal.remove();

    showNotification("Order sent to WhatsApp successfully!");
  }

  function formatCheckoutMessage(cartItems, grandTotal, deliveryFee, deliveryInfo) {
    let subtotal = 0;
    let message = "Hello! I'd like to order from Glo Honey:\n\n";
    message += "ORDER DETAILS:\n\n";

    cartItems.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      message += `${item.quantity}x ${item.name} (${item.volume}) @ GH₵${item.price.toFixed(
        2
      )} each = GH₵${itemTotal.toFixed(2)}\n`;
    });

    message += `\nSubtotal: GH₵${subtotal.toFixed(2)}\n`;
    message += `Delivery Fee: GH₵${deliveryFee.toFixed(2)}\n`;
    message += `\nTOTAL: GH₵${grandTotal.toFixed(2)}\n\n`;
    message += `Please add your delivery information:\n`;
    message += `Name: ${deliveryInfo.name}\n`;
    message += `Phone: ${deliveryInfo.phone}\n`;
    message += `Delivery Address: ${deliveryInfo.address}\n`;
    message += `Preferred Delivery Date: ${deliveryInfo.date}\n\n`;
    message += `Thank you!`;

    return message;
  }

  function sendToWhatsApp(message) {
    const whatsappNumber = "233261612674";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  }

  // Honey Benefits Section
  const benefitCards = document.querySelectorAll(".benefit-card");
  const shopButton = document.querySelector(".benefits-footer .btn-primary");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("fade-in");
          }, index * 150);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  benefitCards.forEach((card) => {
    card.classList.add("benefit-card-hidden");
    observer.observe(card);
  });

  if (shopButton) {
    shopButton.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  }

  // Learn More Button Functionality
  const learnMoreBtn = document.getElementById("learn-more-btn");
  const hiddenText = document.querySelector(".hidden-text");

  if (learnMoreBtn && hiddenText) {
    learnMoreBtn.addEventListener("click", function () {
      hiddenText.classList.toggle("show");

      this.textContent = hiddenText.classList.contains("show")
        ? "Show Less"
        : "Learn More";

      this.classList.add("button-clicked");
      setTimeout(() => this.classList.remove("button-clicked"), 300);

      if (hiddenText.classList.contains("show")) {
        setTimeout(() => {
          hiddenText.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 300);
      }
    });
  }

  // Testimonials Section
  const carousel = document.getElementById("testimonialCarousel");

  if (carousel) {
    const originalCards = Array.from(carousel.children);
    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      carousel.appendChild(clone);
    });

    carousel.addEventListener("touchstart", () => {
      carousel.style.animationPlayState = "paused";
    });

    carousel.addEventListener("touchend", () => {
      carousel.style.animationPlayState = "running";
    });

    carousel.addEventListener("animationend", () => {
      carousel.style.animation = "none";
      carousel.offsetHeight;
      carousel.style.animation = null;
    });
  }

  // Smooth scroll for Share Experience button
  const shareButton = document.querySelector(
    ".testimonial-footer .btn-secondary"
  );

  if (shareButton) {
    shareButton.addEventListener("click", function (e) {
      e.preventDefault();
      const formElement = document.getElementById("whatsappForm");
      if (formElement) {
        formElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        formElement.querySelector('input[type="text"]').focus();
      }
    });
  }

  // Contact Section JavaScript
  const whatsappForm = document.getElementById("whatsappForm");

  if (whatsappForm) {
    whatsappForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const message = document.getElementById("message").value.trim();

      if (!name || !email || !phone || !message) {
        showNotification("Please fill in all required fields", "error");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification("Please enter a valid email address", "error");
        return;
      }

      const whatsappMessage = `Hello Glo Honey, my name is ${name}. 
Email: ${email}
Phone: ${phone}

Message: ${message}`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappNumber = "233261612674";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      window.open(whatsappUrl, "_blank");

      whatsappForm.reset();
      showNotification("Message sent successfully!");
    });
  }

  // Footer functionality for newsletter subscription
  const newsletterForm = document.getElementById("newsletter-form");
  const subscriptionMessage = document.querySelector(".subscription-message");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showSubscriptionMessage("Please enter a valid email address", "error");
        return;
      }

      showSubscriptionMessage("Processing...", "pending");

      setTimeout(() => {
        const isSuccess = Math.random() < 0.9;

        if (isSuccess) {
          showSubscriptionMessage("Thank you for subscribing to our newsletter!", "success");
          newsletterForm.reset();
        } else {
          showSubscriptionMessage("Something went wrong. Please try again later.", "error");
        }
      }, 1500);
    });
  }

  function showSubscriptionMessage(text, type) {
    if (!subscriptionMessage) return;

    subscriptionMessage.textContent = text;
    subscriptionMessage.className = "subscription-message";

    if (type) {
      subscriptionMessage.classList.add(`message-${type}`);
    }

    if (type === "success") {
      setTimeout(() => {
        subscriptionMessage.textContent = "";
        subscriptionMessage.className = "subscription-message";
      }, 5000);
    }
  }

  // Add smooth scroll to footer links
  const footerLinks = document.querySelectorAll(".footer-column a");

  footerLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      if (this.getAttribute("href").startsWith("#")) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: "smooth",
          });
        }
      }
    });
  });
});
