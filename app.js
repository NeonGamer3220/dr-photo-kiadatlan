// Smooth scrolling for in-page links
function setupSmoothScroll() {
  const links = document.querySelectorAll("[data-scroll]");

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      const headerOffset = 70;
      const rect = target.getBoundingClientRect();
      const offsetTop = window.scrollY + rect.top - headerOffset;

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    });
  });
}

function setupLightbox() {
  const overlay = document.getElementById("img-overlay");
  const overlayImg = document.getElementById("overlay-img");
  const closeBtn = document.getElementById("close-overlay");
  const photos = document.querySelectorAll(".gallery-photo");

  if (!overlay || !overlayImg || !closeBtn || !photos.length) return;

  const closeOverlay = () => {
    overlay.style.display = "none";
    overlayImg.src = "";
  };

  photos.forEach((photo) => {
    photo.addEventListener("click", () => {
      const bg = window.getComputedStyle(photo).backgroundImage;
      const match = bg.match(/url\(["']?(.+?)["']?\)/);
      const url = match?.[1];
      if (!url) return;

      overlayImg.src = url;
      overlay.style.display = "flex";
    });
  });

  closeBtn.addEventListener("click", closeOverlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeOverlay();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.style.display === "flex") {
      closeOverlay();
    }
  });
}

// Mobile navigation (small screens)
function setupMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");

  if (!toggle || !nav) return;

  console.log("[nav] mobile nav initialized", { toggle, nav });

  const close = () => {
    toggle.classList.remove("is-open");
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  };

  const open = () => {
    toggle.classList.add("is-open");
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
  };

  toggle.addEventListener("click", () => {
    console.log("[nav] toggle clicked");
    const isOpen = toggle.classList.contains("is-open");
    if (isOpen) {
      close();
    } else {
      open();
    }
  });

  nav.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='#']");
    if (!link) return;
    close();
  });

  document.addEventListener("click", (event) => {
    const isOpen = toggle.classList.contains("is-open");
    if (!isOpen) return;
    const target = event.target;
    if (target instanceof Element && (nav.contains(target) || toggle.contains(target))) return;
    close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 769px)").matches) {
      close();
    }
  });
}

// Gallery filters for "Munkáim"
function setupGalleryFilters() {
  const filterButtons = document.querySelectorAll(".filter-pill");
  const items = document.querySelectorAll(".gallery-item");
  const showMoreBtn = document.getElementById("showMoreBtn");

  if (!filterButtons.length || !items.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter");

      filterButtons.forEach((b) => b.classList.remove("is-active"));
      button.classList.add("is-active");

      items.forEach((item) => {
        const category = item.getAttribute("data-category");
        const show = filter === "all" || category === filter;
        
        // Only show items that match filter AND are not hidden by the show more button
        const isHidden = item.classList.contains("hidden");
        if (show && !isHidden) {
          item.style.display = "";
        } else if (show && isHidden) {
          // Item matches filter but is hidden - keep it hidden for now
          item.style.display = "none";
        } else {
          item.style.display = "none";
        }
      });

      // Show/hide the "További Képek" button based on filter
      if (showMoreBtn) {
        const hiddenItems = document.querySelectorAll(".gallery-item.hidden");
        const visibleHiddenItems = Array.from(hiddenItems).filter(item => {
          const category = item.getAttribute("data-category");
          return filter === "all" || category === filter;
        });
        showMoreBtn.style.display = visibleHiddenItems.length > 0 ? "block" : "none";
      }
    });
  });
}

function setupShowMoreButton() {
  const showMoreBtn = document.getElementById("showMoreBtn");
  if (!showMoreBtn) return;

  // Initialize button visibility based on hidden items
  const updateButtonVisibility = () => {
    const activeFilter = document.querySelector(".filter-pill.is-active");
    const currentFilter = activeFilter ? activeFilter.getAttribute("data-filter") : "all";
    
    const hiddenItems = document.querySelectorAll(".gallery-item.hidden");
    const visibleHiddenItems = Array.from(hiddenItems).filter(item => {
      const category = item.getAttribute("data-category");
      return currentFilter === "all" || category === currentFilter;
    });
    
    showMoreBtn.style.display = visibleHiddenItems.length > 0 ? "block" : "none";
  };

  // Initial check
  updateButtonVisibility();

  showMoreBtn.addEventListener("click", () => {
    // Get the currently active filter
    const activeFilter = document.querySelector(".filter-pill.is-active");
    const currentFilter = activeFilter ? activeFilter.getAttribute("data-filter") : "all";

    // Remove hidden class from all items that match the current filter
    document.querySelectorAll(".gallery-item.hidden").forEach((item) => {
      const category = item.getAttribute("data-category");
      if (currentFilter === "all" || category === currentFilter) {
        item.classList.remove("hidden");
        item.style.display = "";
      }
    });

    // Check if there are still hidden items for the current filter
    const remainingHidden = document.querySelectorAll(".gallery-item.hidden");
    const visibleHiddenItems = Array.from(remainingHidden).filter(item => {
      const category = item.getAttribute("data-category");
      return currentFilter === "all" || category === currentFilter;
    });

    if (visibleHiddenItems.length === 0) {
      showMoreBtn.style.display = "none";
    }
  });
}


// Footer year
function setYear() {
  const yearEl = document.querySelector("#year");
  if (!yearEl) return;
  yearEl.textContent = new Date().getFullYear();
}

function init() {
  setupSmoothScroll();
  setupLightbox();
  setupMobileNav();
  setupGalleryFilters();
  setupShowMoreButton();
  setYear();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
