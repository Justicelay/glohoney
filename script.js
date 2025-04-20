document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu toggle functionality
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener("click", function () {
      navMenu.classList.toggle("active");

      // Change icon based on menu state
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
});

// Cart Management System
const initializeCart = () => {
  const cartIcon = document.querySelector(".cart-icon");
  const cartModal = document.querySelector(".cart-modal");
  const closeCart = document.querySelector(".close-cart");
  const cartItems = document.querySelector(".cart-items");
  const totalAmount = document.querySelector(".total-amount");
  const checkoutBtn = document.querySelector(".checkout-btn");

  // Load cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Initialize cart display
  updateCart();

  // Cart visibility handlers
  function showCart() {
    cartModal.style.display = "block";
    setTimeout(() => cartModal.classList.add("active"), 10);
  }

  function hideCart() {
    cartModal.classList.remove("active");
    setTimeout(() => (cartModal.style.display = "none"), 300);
  }

  // Cart event listeners
  cartIcon.addEventListener("click", showCart);
  closeCart.addEventListener("click", hideCart);

  // Update cart display
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
            <div class="cart-item-price">GH₵ ${item.price.toFixed(2)} × ${
        item.quantity
      }</div>
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

  // Cart item controls
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

  // Product quantity selectors
  const quantitySelectors = document.querySelectorAll(".quantity-selector");
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = parseInt(button.dataset.productId);
      const quantitySelector = document.getElementById(
        `quantity-selector-${productId}`
      );

      document
        .querySelectorAll(".quantity-selector.active")
        .forEach((selector) => {
          if (selector !== quantitySelector) {
            selector.classList.remove("active");
          }
        });

      quantitySelector.classList.toggle("active");
    });
  });

  quantitySelectors.forEach((selector) => {
    const minusBtn = selector.querySelector(".minus-btn");
    const plusBtn = selector.querySelector(".plus-btn");
    const input = selector.querySelector(".quantity-input");
    const confirmBtn = selector.querySelector(".confirm-btn");
    const productId = parseInt(selector.id.split("-").pop());

    minusBtn.addEventListener("click", () => {
      const value = parseInt(input.value);
      if (value > 1) input.value = value - 1;
    });

    plusBtn.addEventListener("click", () => {
      const value = parseInt(input.value);
      if (value < 99) input.value = value + 1;
    });

    confirmBtn.addEventListener("click", () => {
      const quantity = parseInt(input.value);
      const productCard = selector.closest(".product-card");

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
    });
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
  }

  // Checkout handler
  checkoutBtn.addEventListener("click", () => {
    const message = formatOrderMessage(cart);
    sendToWhatsApp(message);
    cart = [];
    updateCart();
    hideCart();
  });

  function formatOrderMessage(cart) {
    let message = "🛒 New Order:\n\n";
    let total = 0;

    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      message += `• ${item.name} (${item.volume})\n`;
      message += `  Quantity: ${item.quantity}\n`;
      message += `  Price: GH₵ ${itemTotal.toFixed(2)}\n\n`;
    });

    message += `\n📋 Order Summary:\n`;
    message += `Total Amount: GH₵ ${total.toFixed(2)}\n`;
    message += `\n🚚 *Delivery fee not included*`;

    return message;
  }

  function sendToWhatsApp(message) {
    const whatsappNumber = "233545096853";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  }
};

// Initialize cart system
document.addEventListener("DOMContentLoaded", initializeCart);

// Honey Benefits Section
document.addEventListener("DOMContentLoaded", function () {
  const benefitCards = document.querySelectorAll(".benefit-card");
  const shopButton = document.querySelector(".benefits-footer .btn-primary");

  // Intersection Observer for fade-in animation
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("fade-in");
          }, index * 150); // Staggered delay
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  // Observe each benefit card
  benefitCards.forEach((card) => {
    card.classList.add("benefit-card-hidden");
    observer.observe(card);
  });

  // Smooth scroll for shop button
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
});

// Learn More Button Functionality
document.addEventListener("DOMContentLoaded", function () {
  const learnMoreBtn = document.getElementById("learn-more-btn");
  const hiddenText = document.querySelector(".hidden-text");

  if (learnMoreBtn && hiddenText) {
    learnMoreBtn.addEventListener("click", function () {
      hiddenText.classList.toggle("show");

      // Update button text
      this.textContent = hiddenText.classList.contains("show")
        ? "Show Less"
        : "Learn More";

      // Add button click animation
      this.classList.add("button-clicked");
      setTimeout(() => this.classList.remove("button-clicked"), 300);

      // Scroll into view if expanding
      if (hiddenText.classList.contains("show")) {
        setTimeout(() => {
          hiddenText.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 300);
      }
    });
  }
});

// Testimonials Section
document.addEventListener("DOMContentLoaded", function () {
  const carousel = document.getElementById("testimonialCarousel");

  if (carousel) {
    // Clone the initial testimonials for infinite scroll
    const originalCards = Array.from(carousel.children);
    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      carousel.appendChild(clone);
    });

    // Handle touch devices
    carousel.addEventListener("touchstart", () => {
      carousel.style.animationPlayState = "paused";
    });

    carousel.addEventListener("touchend", () => {
      carousel.style.animationPlayState = "running";
    });

    // Reset animation when it completes
    carousel.addEventListener("animationend", () => {
      carousel.style.animation = "none";
      carousel.offsetHeight; // Trigger reflow
      carousel.style.animation = null;
    });
  }
});

// Smooth scroll for Share Experience button
document.addEventListener("DOMContentLoaded", function () {
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
        // Focus on the first form input
        formElement.querySelector('input[type="text"]').focus();
      }
    });
  }
});

// Contact Section JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Form validation and WhatsApp integration
  const whatsappForm = document.getElementById("whatsappForm");

  if (whatsappForm) {
    whatsappForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form values
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const message = document.getElementById("message").value.trim();

      // Basic validation
      if (!name || !email || !phone || !message) {
        showFormError("Please fill in all required fields");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showFormError("Please enter a valid email address");
        return;
      }

      // Construct WhatsApp message
      const whatsappMessage = `Hello Glo Honey, my name is ${name}. 
Email: ${email}
Phone: ${phone}

Message: ${message}`;

      // Encode the message for WhatsApp URL
      const encodedMessage = encodeURIComponent(whatsappMessage);

      // WhatsApp Business number (without the + symbol)
      const whatsappNumber = "233545096853";

      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      // Open WhatsApp in a new tab
      window.open(whatsappUrl, "_blank");

      // Reset form after successful submission
      whatsappForm.reset();
      showFormSuccess("Message sent successfully!");
    });
  }

  // Helper function to show form error
  function showFormError(message) {
    // Create error message element if it doesn't exist
    let errorElement = document.querySelector(".form-error");

    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "form-error";
      errorElement.style.color = "#e74c3c";
      errorElement.style.marginTop = "15px";
      errorElement.style.padding = "10px";
      errorElement.style.borderRadius = "5px";
      errorElement.style.backgroundColor = "rgba(231, 76, 60, 0.1)";
      errorElement.style.fontSize = "0.9rem";

      const submitButton = document.querySelector(".btn-primary");
      submitButton.parentNode.insertBefore(
        errorElement,
        submitButton.nextSibling
      );
    }

    errorElement.textContent = message;

    // Remove error message after 5 seconds
    setTimeout(() => {
      errorElement.textContent = "";
      errorElement.style.display = "none";
    }, 5000);

    errorElement.style.display = "block";
  }

  // Helper function to show form success
  function showFormSuccess(message) {
    // Create success message element if it doesn't exist
    let successElement = document.querySelector(".form-success");

    if (!successElement) {
      successElement = document.createElement("div");
      successElement.className = "form-success";
      successElement.style.color = "#2ecc71";
      successElement.style.marginTop = "15px";
      successElement.style.padding = "10px";
      successElement.style.borderRadius = "5px";
      successElement.style.backgroundColor = "rgba(46, 204, 113, 0.1)";
      successElement.style.fontSize = "0.9rem";

      const submitButton = document.querySelector(".btn-primary");
      submitButton.parentNode.insertBefore(
        successElement,
        submitButton.nextSibling
      );
    }

    successElement.textContent = message;

    // Remove success message after 5 seconds
    setTimeout(() => {
      successElement.textContent = "";
      successElement.style.display = "none";
    }, 5000);

    successElement.style.display = "block";
  }

  // Add floating animation to contact info icons
  const infoIcons = document.querySelectorAll(".info-icon");

  infoIcons.forEach((icon) => {
    // Add subtle floating animation
    icon.style.transition = "transform 2s ease-in-out";

    let isUp = true;

    // Create animation loop
    setInterval(() => {
      if (isUp) {
        icon.style.transform = "translateY(-5px)";
      } else {
        icon.style.transform = "translateY(0px)";
      }
      isUp = !isUp;
    }, 2000);
  });

  // Add input animation
  const formInputs = document.querySelectorAll("input, textarea");

  formInputs.forEach((input) => {
    // Create floating label effect
    input.addEventListener("focus", () => {
      const label = input.previousElementSibling;
      if (label && label.tagName === "LABEL") {
        label.style.color = "#f5a623";
        label.style.transition = "color 0.3s ease";
      }
    });

    input.addEventListener("blur", () => {
      const label = input.previousElementSibling;
      if (label && label.tagName === "LABEL") {
        label.style.color = "#555";
      }
    });
  });
});

// Footer functionality for newsletter subscription
document.addEventListener("DOMContentLoaded", function () {
  const newsletterForm = document.getElementById("newsletter-form");
  const subscriptionMessage = document.querySelector(".subscription-message");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value.trim();

      // Simple email validation
      if (!isValidEmail(email)) {
        showMessage("Please enter a valid email address", "error");
        return;
      }

      // Simulate subscription process (in a real site, this would be an API call)
      simulateSubscription(email);
    });
  }

  // Validate email format
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Simulate subscription API call
  function simulateSubscription(email) {
    showMessage("Processing...", "pending");

    // Simulate network delay
    setTimeout(() => {
      // 90% chance of success (in real implementation, this would be an actual API call)
      const isSuccess = Math.random() < 0.9;

      if (isSuccess) {
        showMessage("Thank you for subscribing to our newsletter!", "success");
        newsletterForm.reset();
      } else {
        showMessage("Something went wrong. Please try again later.", "error");
      }
    }, 1500);
  }

  // Show message with appropriate styling
  function showMessage(text, type) {
    if (!subscriptionMessage) return;

    subscriptionMessage.textContent = text;
    subscriptionMessage.className = "subscription-message";

    // Add class based on message type
    if (type) {
      subscriptionMessage.classList.add(`message-${type}`);
    }

    // Auto-hide success messages after 5 seconds
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
      // Only apply smooth scroll to same-page links
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

// Add this to your main JS file for the Footer's social media icons
// Make sure Font Awesome is included in your main HTML file with:
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
