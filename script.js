document.addEventListener("DOMContentLoaded", function () {
  // ==================== MOBILE MENU FUNCTIONALITY ====================
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      navMenu.classList.toggle("active");
      const icon = this.querySelector("i");
      if (navMenu.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
        document.body.style.overflow = "hidden";
      } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
        document.body.style.overflow = "auto";
      }
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        mobileMenuToggle.querySelector("i").classList.remove("fa-times");
        mobileMenuToggle.querySelector("i").classList.add("fa-bars");
        document.body.style.overflow = "auto";
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        navMenu.classList.remove("active");
        mobileMenuToggle.querySelector("i").classList.remove("fa-times");
        mobileMenuToggle.querySelector("i").classList.add("fa-bars");
        document.body.style.overflow = "auto";
      }
    });
  }

  // ==================== NOTIFICATION FUNCTION ====================
  function showNotification(message, type = "success") {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach((n) => n.remove());

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === "error" ? "exclamation-circle" : "check-circle"}"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateY(0)";
    }, 50);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateY(10px)";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // ==================== CART MANAGEMENT SYSTEM ====================
  const cartIcon = document.querySelector(".cart-icon");
  const cartModal = document.querySelector(".cart-modal");
  const closeCart = document.querySelector(".close-cart");
  const cartItemsContainer = document.querySelector(".cart-items");
  const totalAmount = document.querySelector(".total-amount");
  const checkoutBtn = document.querySelector(".checkout-btn");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  function updateCart() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-basket"></i>
          <p>Your cart is empty</p>
          <p>Add some delicious honey!</p>
        </div>
      `;
    } else {
      cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        cartItemsContainer.innerHTML += `
          <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name} (${item.volume})</div>
              <div class="cart-item-price">GH₵ ${item.price.toFixed(2)} × ${item.quantity} = GH₵ ${itemTotal.toFixed(2)}</div>
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
    }

    if (totalAmount) {
      totalAmount.textContent = `GH₵ ${total.toFixed(2)}`;
    }

    const cartCount = document.querySelector(".cart-count");
    if (cartCount) {
      cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    if (checkoutBtn) {
      checkoutBtn.disabled = cart.length === 0;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function showCart() {
    if (cartModal) {
      cartModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  function hideCart() {
    if (cartModal) {
      cartModal.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  }

  // Cart icon click handler
  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      showCart();
    });
  }

  // Close cart button handler
  if (closeCart) {
    closeCart.addEventListener("click", (e) => {
      e.stopPropagation();
      hideCart();
    });
  }

  // Close cart when clicking outside
  document.addEventListener("click", (e) => {
    if (cartModal && cartModal.classList.contains("active")) {
      if (!cartModal.contains(e.target) && !cartIcon.contains(e.target)) {
        hideCart();
      }
    }
  });

  // Prevent closing when clicking inside cart modal
  if (cartModal) {
    cartModal.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // Cart item controls (plus, minus, delete)
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (e) => {
      const cartItem = e.target.closest(".cart-item");
      if (!cartItem) return;

      const id = parseInt(cartItem.dataset.id);
      const itemIndex = cart.findIndex((item) => item.id === id);

      if (itemIndex === -1) return;

      if (e.target.classList.contains("minus")) {
        if (cart[itemIndex].quantity > 1) {
          cart[itemIndex].quantity--;
          updateCart();
        }
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

  // ==================== PRODUCT QUANTITY SELECTORS ====================
  const quantitySelectors = document.querySelectorAll(".quantity-selector");
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = parseInt(button.dataset.productId);
      const quantitySelector = document.getElementById(`quantity-selector-${productId}`);

      if (quantitySelector) {
        // Close all other quantity selectors
        document.querySelectorAll(".quantity-selector.active").forEach((selector) => {
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
          selector.classList.remove("active");
          input.value = 1;
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
    showNotification(`Added ${productData.quantity}x ${productData.name} (${productData.volume}) to cart!`);

    // Show the action popup (Checkout or Continue Shopping)
    setTimeout(() => {
      showCartActionPopup(productData);
    }, 500);
  }

  // ==================== CART ACTION POPUP (Checkout/Continue Shopping) ====================
  function showCartActionPopup(productData) {
    // Remove any existing modal first
    const existingModal = document.querySelector(".cart-action-modal");
    if (existingModal) existingModal.remove();

    // Calculate cart total for display
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const modal = document.createElement("div");
    modal.className = "cart-action-modal";
    modal.innerHTML = `
      <div class="cart-action-content">
        <div class="action-header">
          <i class="fas fa-check-circle"></i>
          <h3>Item Added Successfully!</h3>
        </div>
        <p class="action-message">
          <strong>${productData.quantity}x ${productData.name} (${productData.volume})</strong> has been added to your cart.
        </p>
        <div class="cart-summary-popup">
          <div class="summary-line">
            <span><i class="fas fa-shopping-cart"></i> Cart Items:</span>
            <span>${cartItemCount} item(s)</span>
          </div>
          <div class="summary-line total-line">
            <span>Cart Total:</span>
            <span>GH₵ ${cartTotal.toFixed(2)}</span>
          </div>
        </div>
        <div class="action-buttons">
          <button class="btn continue-shopping">
            <i class="fas fa-arrow-left"></i> Continue Shopping
          </button>
          <button class="btn proceed-checkout">
            <i class="fas fa-shopping-cart"></i> View Cart & Checkout
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    const continueBtn = modal.querySelector(".continue-shopping");
    const checkoutBtnPopup = modal.querySelector(".proceed-checkout");

    // Continue Shopping - close popup
    continueBtn.addEventListener("click", () => {
      modal.remove();
      document.body.style.overflow = "auto";
    });

    // View Cart & Checkout - open cart modal
    checkoutBtnPopup.addEventListener("click", () => {
      modal.remove();
      document.body.style.overflow = "auto";
      // Small delay to ensure smooth transition
      setTimeout(() => {
        showCart();
      }, 100);
    });

    // Close modal when clicking outside the content
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
        document.body.style.overflow = "auto";
      }
    });

    // Close on Escape key
    const escHandler = (e) => {
      if (e.key === "Escape") {
        modal.remove();
        document.body.style.overflow = "auto";
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);
  }

  // Initialize cart display
  updateCart();

  // ==================== CHECKOUT HANDLER ====================
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (cart.length === 0) {
        showNotification("Your cart is empty!", "error");
        return;
      }
      
      // Store cart items before hiding
      const cartItemsCopy = [...cart];
      
      // Hide cart first
      hideCart();
      
      // Small delay to ensure cart is closed before showing delivery form
      setTimeout(() => {
        showDeliveryForm(cartItemsCopy);
      }, 250);
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
            <input type="text" id="delivery-name" name="name" placeholder="Enter your full name" required />
          </div>

          <div class="form-group">
            <label for="delivery-phone">Phone Number *</label>
            <input type="tel" id="delivery-phone" name="phone" placeholder="Enter your phone number" required />
          </div>

          <div class="form-group">
            <label for="delivery-address">Delivery Address *</label>
            <textarea id="delivery-address" name="address" rows="3" placeholder="Enter your full delivery address" required></textarea>
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
            <button type="button" class="btn cancel-delivery">Cancel</button>
            <button type="submit" class="btn btn-primary">
              <i class="fab fa-whatsapp"></i> Send to WhatsApp
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    // Set minimum date to today
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("delivery-date").setAttribute("min", today);

    // Update order summary when location changes
    const locationSelect = document.getElementById("delivery-location");
    locationSelect.addEventListener("change", () => {
      updateOrderSummary(cartItems);
    });

    // Close handlers
    const closeBtn = modal.querySelector(".close-delivery-modal");
    const cancelBtn = modal.querySelector(".cancel-delivery");

    closeBtn.addEventListener("click", () => {
      modal.remove();
      document.body.style.overflow = "auto";
    });

    cancelBtn.addEventListener("click", () => {
      modal.remove();
      document.body.style.overflow = "auto";
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
        document.body.style.overflow = "auto";
      }
    });

    // Form submission
    const deliveryForm = document.getElementById("deliveryForm");
    deliveryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitDeliveryForm(cartItems, modal);
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
          <span>${item.quantity}x ${item.name} (${item.volume})</span>
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

  function submitDeliveryForm(cartItems, modal) {
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

    const message = formatCheckoutMessage(cartItems, subtotal, grandTotal, deliveryFee, {
      name,
      phone,
      address,
      date,
      location,
    });

    sendToWhatsApp(message);

    // Clear cart
    cart = [];
    updateCart();

    // Close modal
    modal.remove();
    document.body.style.overflow = "auto";

    showNotification("Order sent to WhatsApp successfully!");
  }

  function formatCheckoutMessage(cartItems, subtotal, grandTotal, deliveryFee, deliveryInfo) {
    // Format location for display
    const locationNames = {
      "accra-tema": "Accra & Tema",
      "greater-accra": "Greater Accra Region",
      "regional-capitals": "Regional Capitals",
      "other-locations": "Other Locations"
    };
    const locationDisplay = locationNames[deliveryInfo.location] || deliveryInfo.location;

    let message = "🍯 *NEW ORDER FROM GLO HONEY WEBSITE*\n";
    message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    message += "📦 *ORDER DETAILS:*\n\n";

    cartItems.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      message += `• ${item.quantity}x ${item.name} (${item.volume})\n`;
      message += `  Price: GH₵${item.price.toFixed(2)} each\n`;
      message += `  Subtotal: *GH₵${itemTotal.toFixed(2)}*\n\n`;
    });

    message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    message += `💰 Products Subtotal: GH₵${subtotal.toFixed(2)}\n`;
    message += `🚚 Delivery Fee (${locationDisplay}): GH₵${deliveryFee.toFixed(2)}\n`;
    message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    message += `🏷️ *GRAND TOTAL: GH₵${grandTotal.toFixed(2)}*\n\n`;

    message += "📍 *DELIVERY INFORMATION:*\n";
    message += `👤 Name: ${deliveryInfo.name}\n`;
    message += `📱 Phone: ${deliveryInfo.phone}\n`;
    message += `🏠 Address: ${deliveryInfo.address}\n`;
    message += `📍 Delivery Zone: ${locationDisplay}\n`;
    message += `📅 Preferred Date: ${deliveryInfo.date}\n\n`;

    message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    message += "✅ Please confirm this order.\n";
    message += "Thank you for choosing Glo Honey! 🙏🍯";

    return message;
  }

  function sendToWhatsApp(message) {
    const whatsappNumber = "233261612674";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }

  // ==================== HONEY BENEFITS SECTION ANIMATION ====================
  const benefitCards = document.querySelectorAll(".benefit-card");
  const shopButton = document.querySelector(".benefits-footer .btn-primary");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("fade-in");
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
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

  // ==================== LEARN MORE BUTTON (About Section) ====================
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

  // ==================== TESTIMONIALS CAROUSEL ====================
  const carousel = document.getElementById("testimonialCarousel");

  if (carousel) {
    // Clone cards for infinite scroll
    const originalCards = Array.from(carousel.children);
    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      carousel.appendChild(clone);
    });

    // Pause on touch/hover
    carousel.addEventListener("mouseenter", () => {
      carousel.style.animationPlayState = "paused";
    });

    carousel.addEventListener("mouseleave", () => {
      carousel.style.animationPlayState = "running";
    });

    carousel.addEventListener("touchstart", () => {
      carousel.style.animationPlayState = "paused";
    });

    carousel.addEventListener("touchend", () => {
      carousel.style.animationPlayState = "running";
    });
  }

  // Smooth scroll for Share Experience button
  const shareButton = document.querySelector(".testimonial-footer .btn-secondary");

  if (shareButton) {
    shareButton.addEventListener("click", function (e) {
      e.preventDefault();
      const formElement = document.getElementById("whatsappForm");
      if (formElement) {
        formElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        const firstInput = formElement.querySelector('input[type="text"]');
        if (firstInput) {
          setTimeout(() => firstInput.focus(), 500);
        }
      }
    });
  }

  // ==================== CONTACT FORM (WhatsApp) ====================
  const whatsappForm = document.getElementById("whatsappForm");

  if (whatsappForm) {
    whatsappForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const message = document.getElementById("message").value.trim();
      const consent = document.getElementById("consent").checked;

      if (!name || !email || !phone || !message) {
        showNotification("Please fill in all required fields", "error");
        return;
      }

      if (!consent) {
        showNotification("Please agree to be contacted via WhatsApp", "error");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification("Please enter a valid email address", "error");
        return;
      }

      const whatsappMessage = `🍯 *NEW MESSAGE FROM GLO HONEY WEBSITE*
━━━━━━━━━━━━━━━━━━━━━━

👤 *Name:* ${name}
📧 *Email:* ${email}
📱 *Phone:* ${phone}

💬 *Message:*
${message}

━━━━━━━━━━━━━━━━━━━━━━`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappNumber = "233261612674";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      window.open(whatsappUrl, "_blank");

      whatsappForm.reset();
      showNotification("Message prepared! Redirecting to WhatsApp...");
    });
  }

  // ==================== NEWSLETTER SUBSCRIPTION ====================
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

      // Simulate API call
      setTimeout(() => {
        showSubscriptionMessage(
          "Thank you for subscribing! Check your email for confirmation.",
          "success"
        );
        newsletterForm.reset();
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

  // ==================== SMOOTH SCROLL FOR FOOTER LINKS ====================
  const footerLinks = document.querySelectorAll(".footer-column a");

  footerLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const targetElement = document.querySelector(href);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });

  // ==================== CLOSE QUANTITY SELECTORS ON OUTSIDE CLICK ====================
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".product-card")) {
      document.querySelectorAll(".quantity-selector.active").forEach((selector) => {
        selector.classList.remove("active");
      });
    }
  });
});
