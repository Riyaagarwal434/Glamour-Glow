// Set this to your deployed Render backend URL (e.g. "https://salon-backend.onrender.com")
// Keep it empty ("") when running or testing locally.
const API_BASE = "https://glamour-glow-backend.onrender.com/";

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const bookingModal = document.getElementById("booking-modal");
  const openModalBtns = document.querySelectorAll(".open-booking-btn");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const bookingForm = document.getElementById("booking-form");
  const bookingDateInput = document.getElementById("booking-date");
  const bookingServiceInput = document.getElementById("booking-service");
  const timeSlotsContainer = document.getElementById("booking-time-container");
  const selectedTimeInput = document.getElementById("selected-time");
  const slotsInstruction = document.getElementById("slots-instruction");
  const toast = document.getElementById("notification-toast");
  const toastIcon = document.getElementById("toast-icon");
  const toastMessage = document.getElementById("toast-message");
  const submitBtn = document.getElementById("submit-booking-btn");

  // Niche Modal Elements
  const nicheModal = document.getElementById("niche-modal");
  const closeNicheBtn = document.getElementById("close-niche-btn");
  const nicheTitle = document.getElementById("niche-title");
  const nicheSubtitle = document.getElementById("niche-subtitle");
  const nicheOptionsList = document.getElementById("niche-options-list");
  const serviceCards = document.querySelectorAll(".service-card");

  // Form Subservice Elements
  const subserviceGroup = document.getElementById("subservice-group");
  const bookingSubserviceInput = document.getElementById("booking-subservice");

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  bookingDateInput.min = today;

  // Open Modal
  openModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      bookingModal.classList.add("active");
      document.body.style.overflow = "hidden"; // Disable background scrolling
    });
  });

  // Close Modal Function
  const closeModal = () => {
    bookingModal.classList.remove("active");
    document.body.style.overflow = ""; // Re-enable background scrolling
    resetForm();
  };

  closeModalBtn.addEventListener("click", closeModal);

  // Close Modal on outer click
  bookingModal.addEventListener("click", (e) => {
    if (e.target === bookingModal) {
      closeModal();
    }
  });

  // Reset form helper
  const resetForm = () => {
    bookingForm.reset();
    selectedTimeInput.value = "";
    timeSlotsContainer.innerHTML = "";
    slotsInstruction.style.display = "block";
    slotsInstruction.textContent = "Please select a date to view available slots.";
    
    // Hide and clear subservice dropdown
    subserviceGroup.style.display = "none";
    bookingSubserviceInput.innerHTML = '<option value="" disabled selected>Select a Treatment</option>';
    bookingSubserviceInput.required = false;
    
    // Clear all validation errors
    document.querySelectorAll(".form-group").forEach((group) => {
      group.classList.remove("has-error");
    });
  };

  // Fetch available slots when date changes
  bookingDateInput.addEventListener("change", async () => {
    const selectedDate = bookingDateInput.value;
    if (!selectedDate) return;

    // Reset selected time
    selectedTimeInput.value = "";
    timeSlotsContainer.innerHTML = "";
    
    slotsInstruction.style.display = "block";
    slotsInstruction.textContent = "Loading available time slots...";

    try {
      const response = await fetch(`${API_BASE}/api/available-slots/${selectedDate}`);
      if (!response.ok) {
        throw new Error("Failed to load time slots");
      }
      
      const availableSlots = await response.json();
      timeSlotsContainer.innerHTML = "";

      if (availableSlots.length === 0) {
        slotsInstruction.textContent = "No slots available for this date. ❌";
        return;
      }

      slotsInstruction.style.display = "none";

      availableSlots.forEach((slot) => {
        const slotBtn = document.createElement("button");
        slotBtn.type = "button";
        slotBtn.className = "time-slot-btn";
        slotBtn.textContent = slot;
        slotBtn.dataset.time = slot;
        
        slotBtn.addEventListener("click", () => {
          // Deselect previous slot
          document.querySelectorAll(".time-slot-btn").forEach((btn) => {
            btn.classList.remove("selected");
          });
          
          // Select current slot
          slotBtn.classList.add("selected");
          selectedTimeInput.value = slot;
          
          // Clear time error
          document.getElementById("time-error").parentElement.classList.remove("has-error");
        });

        timeSlotsContainer.appendChild(slotBtn);
      });
    } catch (error) {
      console.error(error);
      slotsInstruction.textContent = "Error loading slots. Please try again.";
    }
  });

  // Show Toast Helper
  const showToast = (message, isError = false) => {
    toastMessage.textContent = message;
    toastIcon.textContent = isError ? "❌" : "✅";
    if (isError) {
      toast.classList.add("error");
    } else {
      toast.classList.remove("error");
    }
    
    toast.classList.add("active");

    setTimeout(() => {
      toast.classList.remove("active");
    }, 4000);
  };

  // Validate form inputs
  const validateForm = () => {
    let isValid = true;

    // Name Validate
    const nameInput = document.getElementById("booking-name");
    const nameGroup = nameInput.parentElement;
    if (!nameInput.value.trim()) {
      nameGroup.classList.add("has-error");
      isValid = false;
    } else {
      nameGroup.classList.remove("has-error");
    }

    // Email Validate
    const emailInput = document.getElementById("booking-email");
    const emailGroup = emailInput.parentElement;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value)) {
      emailGroup.classList.add("has-error");
      isValid = false;
    } else {
      emailGroup.classList.remove("has-error");
    }

    // Service Validate
    const serviceGroup = bookingServiceInput.parentElement;
    if (!bookingServiceInput.value) {
      serviceGroup.classList.add("has-error");
      isValid = false;
    } else {
      serviceGroup.classList.remove("has-error");
    }

    // Date Validate
    const dateGroup = bookingDateInput.parentElement;
    if (!bookingDateInput.value) {
      dateGroup.classList.add("has-error");
      isValid = false;
    } else {
      dateGroup.classList.remove("has-error");
    }

    // Time Slot Validate
    const timeGroup = selectedTimeInput.parentElement;
    if (!selectedTimeInput.value) {
      timeGroup.classList.add("has-error");
      isValid = false;
    } else {
      timeGroup.classList.remove("has-error");
    }

    // Sub-Service Validate
    const subserviceGroupEl = bookingSubserviceInput.parentElement;
    if (subserviceGroup.style.display !== "none" && !bookingSubserviceInput.value) {
      subserviceGroupEl.classList.add("has-error");
      isValid = false;
    } else {
      subserviceGroupEl.classList.remove("has-error");
    }

    return isValid;
  };

  // Handle Form Submission
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Submit state loading
    submitBtn.disabled = true;
    submitBtn.textContent = "Booking appointment...";

    const subserviceValue = bookingSubserviceInput.value;
    const serviceName = subserviceValue 
      ? `${bookingServiceInput.value} (${subserviceValue})`
      : bookingServiceInput.value;

    const payload = {
      name: document.getElementById("booking-name").value.trim(),
      email: document.getElementById("booking-email").value.trim(),
      service: serviceName,
      date: bookingDateInput.value,
      time: selectedTimeInput.value
    };

    try {
      const response = await fetch(`${API_BASE}/api/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete the booking.");
      }

      // Success
      closeModal();
      showToast("Booking created successfully! ✅");
    } catch (error) {
      console.error(error);
      showToast(error.message || "An error occurred. Please try again.", true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Confirm Appointment";
    }
  });

  // Highlight active link based on scroll position
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop - 180) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href").substring(1) === current) {
        link.classList.add("active");
      }
    });
  });

  // Niche Sub-Services Data
  const nicheServices = {
    "Hair Styling": [
      { name: "Classic Haircut & Style", price: "₹800", duration: "45 mins" },
      { name: "Balayage & Hair Coloring", price: "₹3,500", duration: "120 mins" },
      { name: "Keratin Therapy", price: "₹4,500", duration: "90 mins" },
      { name: "Blow Dry & Styling", price: "₹1,200", duration: "30 mins" }
    ],
    "Spa & Wellness": [
      { name: "Swedish Massage", price: "₹2,200", duration: "60 mins" },
      { name: "Deep Tissue Therapy", price: "₹2,500", duration: "60 mins" },
      { name: "Hot Stone Massage", price: "₹3,000", duration: "90 mins" },
      { name: "Aromatherapy Spa", price: "₹2,800", duration: "75 mins" }
    ],
    "Beauty Treatments": [
      { name: "Luxury Hydrafacial", price: "₹3,000", duration: "60 mins" },
      { name: "Signature Manicure & Pedicure", price: "₹1,500", duration: "75 mins" },
      { name: "Charcoal Peel & Detox", price: "₹1,800", duration: "45 mins" },
      { name: "Eyebrow Shaping & Tinting", price: "₹600", duration: "30 mins" }
    ]
  };

  // Close Niche Modal
  const closeNicheModal = () => {
    nicheModal.classList.remove("active");
    document.body.style.overflow = "";
  };

  closeNicheBtn.addEventListener("click", closeNicheModal);
  nicheModal.addEventListener("click", (e) => {
    if (e.target === nicheModal) {
      closeNicheModal();
    }
  });

  // Update sub-services dropdown when main service changes
  bookingServiceInput.addEventListener("change", () => {
    const selectedService = bookingServiceInput.value;
    updateSubserviceDropdown(selectedService);
  });

  // Clear subservice error when selected
  bookingSubserviceInput.addEventListener("change", () => {
    if (bookingSubserviceInput.value) {
      bookingSubserviceInput.parentElement.classList.remove("has-error");
    }
  });

  const updateSubserviceDropdown = (service, selectedSubserviceVal = "") => {
    const options = nicheServices[service];
    
    // Clear existing options
    bookingSubserviceInput.innerHTML = '<option value="" disabled selected>Select a Treatment</option>';

    if (!options) {
      subserviceGroup.style.display = "none";
      bookingSubserviceInput.required = false;
      return;
    }

    // Populate sub-services
    options.forEach((opt) => {
      const optionEl = document.createElement("option");
      optionEl.value = opt.name;
      optionEl.textContent = `${opt.name} (${opt.price} - ${opt.duration})`;
      bookingSubserviceInput.appendChild(optionEl);
    });

    subserviceGroup.style.display = "block";
    bookingSubserviceInput.required = true;

    if (selectedSubserviceVal) {
      bookingSubserviceInput.value = selectedSubserviceVal;
    }
  };

  // Open booking modal and pre-fill details
  const openBookingFlow = (service, subservice) => {
    bookingModal.classList.add("active");
    document.body.style.overflow = "hidden";
    bookingServiceInput.value = service;
    updateSubserviceDropdown(service, subservice);
  };

  // Open Niche Modal on Service Card Click
  serviceCards.forEach((card) => {
    card.addEventListener("click", () => {
      const serviceTitle = card.querySelector(".service-card-title").textContent.trim();
      const options = nicheServices[serviceTitle];
      
      if (!options) return;

      nicheTitle.textContent = serviceTitle;
      nicheSubtitle.textContent = `Choose from our premium ${serviceTitle.toLowerCase()} treatments`;
      nicheOptionsList.innerHTML = "";

      options.forEach((opt) => {
        const item = document.createElement("div");
        item.className = "niche-option-item";

        item.innerHTML = `
          <div class="niche-info-left">
            <h4 class="niche-opt-name">${opt.name}</h4>
            <div class="niche-opt-meta">
              <span class="niche-badge-time">⏱️ ${opt.duration}</span>
              <span class="niche-price">${opt.price}</span>
            </div>
          </div>
          <button class="btn-niche-book" data-service="${serviceTitle}" data-subservice="${opt.name}">Book Now</button>
        `;

        item.querySelector(".btn-niche-book").addEventListener("click", (e) => {
          const service = e.target.dataset.service;
          const subservice = e.target.dataset.subservice;
          closeNicheModal();
          openBookingFlow(service, subservice);
        });

        nicheOptionsList.appendChild(item);
      });

      nicheModal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });
});
