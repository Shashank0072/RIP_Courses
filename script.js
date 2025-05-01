document.addEventListener('DOMContentLoaded', function () {
  let courseData = [];
  let filteredCoursesData = [];
  let currentPage = 1;
  const itemsPerPage = 9;
  let isLoadingMore = false;

  async function loadCourses() {
    try {
      const response = await fetch('courses-data.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      courseData = data.courses;
      filteredCoursesData = courseData; // Start with full dataset
      renderCourses();
    } catch (error) {
      document.querySelector('.featured-courses').innerHTML =
        '<p class="error-message">Failed to load courses. Please refresh the page or try again later.</p>';
    }
  }

  function renderCourses(append = false) {
    const coursesContainer = document.querySelector('.featured-courses');
    if (!coursesContainer) return;

    if (!append) {
      coursesContainer.innerHTML = '';
      currentPage = 1;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedCourses = filteredCoursesData.slice(start, end);

    if (!append && paginatedCourses.length === 0) {
      coursesContainer.innerHTML = '<p class="no-results">No courses match your search criteria.</p>';
      return;
    }

    paginatedCourses.forEach(course => {
      const courseCard = document.createElement('div');
      courseCard.className = 'course-card';
      courseCard.setAttribute('data-category', course.category);

      let actionButton = '';
      if (course.comming_soon) {
        actionButton = `<img src="newbadge.png" alt="New Course" width="58" height="55" style="margin-left: 25px;">`;
      } else if (course.parts?.length > 0) {
        const partsJson = JSON.stringify(course.parts).replace(/"/g, '&quot;');
        actionButton = `<a href="#" class="download-btn" data-parts='${partsJson}'>Download</a>`;
      }

      let new_badge = '';
      if (course.is_new) {
        new_badge = `<img src="new_badge.png" alt="newbadge" style="z-index: 1; position: absolute; margin-top: -7.5rem; margin-right: -18rem; width: 50px;">`;
      }

      let levelBadges = '';
      if (course.level) {
        const levels = course.level.split(' ');
        levels.forEach(level => {
          const levelLower = level.toLowerCase();
          const badgeText = levelLower === 'bestseller' ? 'Bestseller' :
            levelLower === 'premium' ? 'Premium' :
              levelLower === 'advanced' ? 'Advanced' : level;
          levelBadges += `<span class="course-level ${levelLower}">${badgeText}</span>`;
        });
      }
      courseCard.innerHTML = `
        <div class="course-image">
          <img alt="${course.title}" src="${course.image}" style="height: 13rem;" />
          ${new_badge}
        </div>
        <div class="course-content">
          <h3 class="course-title">${truncateTextByChars(course.title, 54)}</h3>
          <p class="course-description">${course.description}</p>
          <div class="course-meta">
            <div class="course-tech">
              <span style="font-weight: bold;">Created by:-</span>
              <span class="creator-name">${course.creator}</span>
            </div>
            ${levelBadges}
          </div>
          <div class="course-actions">
            ${actionButton}
            <div class="share-btns">
              <span class="course-size">Total Size: ${course.totalSize}</span>
            </div>
          </div>
        </div>
      `;
      coursesContainer.appendChild(courseCard);
    });

    attachDownloadEventListeners();
  }

  function attachDownloadEventListeners() {
    const downloadButtons = document.querySelectorAll('.download-btn');
    const modal = document.getElementById('myModal');
    const closeBtn = document.querySelector('.close');
    const downloadParts = document.getElementById('downloadParts');

    if (!modal || !downloadParts) return;

    downloadButtons.forEach(button => {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        const parts = JSON.parse(this.getAttribute('data-parts'));
        downloadParts.innerHTML = '';
        parts.forEach(part => {
          const partLink = document.createElement('a');
          partLink.href = part.link;
          partLink.className = 'part-link';
          partLink.target = '_blank';
          partLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" style="margin-right: 6px;" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v3.6a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V10.4a.5.5 0 0 1 1 0v3.6A1.5 1.5 0 0 1 14.5 15H1.5A1.5 1.5 0 0 1 0 14V10.4a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 10.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 1 0-.708-.708L8.5 9.293V1.5a.5.5 0 0 0-1 0v7.793L5.354 7.146a.5.5 0 1 0-.708.708l3 3z"/>
          </svg> ${part.name} (${part.size})`;
          downloadParts.appendChild(partLink);
        });
        modal.style.display = 'block';
      });
    });

    closeBtn?.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
  }

  function filterCourses(query) {
    if (!query.trim()) {
      filteredCoursesData = courseData;
    } else {
      filteredCoursesData = courseData.filter(course =>
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase()) ||
        course.creator.toLowerCase().includes(query.toLowerCase()) ||
        (typeof course.category === 'string' && course.category.toLowerCase().includes(query.toLowerCase()))
      );
    }
    currentPage = 1;
    renderCourses();
  }

  function filterCoursesByCategory(category) {
    filteredCoursesData = (category === 'all')
      ? courseData
      : courseData.filter(course => Array.isArray(course.category) && course.category.includes(category));
    currentPage = 1;
    renderCourses();
  }

  // Load courses
  loadCourses();

  // Search input
  const searchInput = document.getElementById('courseSearch');
  searchInput?.addEventListener('input', function () {
    filterCourses(this.value);
  });

  // Category buttons
  const categoryButtons = document.querySelectorAll('.category-btn');
  categoryButtons.forEach(button => {
    button.addEventListener('click', function () {
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      const category = this.getAttribute('data-filter');
      filterCoursesByCategory(category);
    });
  });
// Infinite Scroll Pagination
window.addEventListener('scroll', () => {
  const scrollTopBtn = document.getElementById('backToTop');
  const loader = document.getElementById('scrollLoader');

  // Show/hide back to top button
  scrollTopBtn?.classList.toggle('hidden', window.scrollY === 0);

  // Infinite scroll
  if (isLoadingMore) return;
  const scrollPos = window.innerHeight + window.scrollY;
  const threshold = document.body.offsetHeight - 200;

  if (scrollPos >= threshold) {
    const totalPages = Math.ceil(filteredCoursesData.length / itemsPerPage);
    if (currentPage < totalPages) {
      isLoadingMore = true;
      loader?.classList.remove('hidden');

      setTimeout(() => {
        currentPage++;
        renderCourses(true);
        isLoadingMore = false;
        loader?.classList.add('hidden');
      }, 500);
    }
  }
});

// Back to Top
document.getElementById('backToTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

});

// Dark mode
const themeToggle = document.getElementById('themeToggle');
themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const icon = themeToggle.querySelector('i');
  icon.classList.toggle('fa-moon');
  icon.classList.toggle('fa-sun');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Loader
window.addEventListener('load', function () {
  document.getElementById('loaderContainer')?.classList.add('hidden');
});

// Truncate
function truncateTextByChars(text, charLimit = 100) {
  return text.length <= charLimit ? text : text.slice(0, charLimit) + '...';
}


// clear form data
document.addEventListener('DOMContentLoaded', function () {
  const contactForm = document.getElementById('contact-form');

  contactForm?.addEventListener('submit', async function (e) {
    e.preventDefault(); // prevent default form submission

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        alert('Message sent successfully!');
        contactForm.reset(); // Clear form fields
      } else {
        alert('Oops! Something went wrong. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while sending your message.');
    }
  });
});

// categorey button 
const scrollContainer = document.querySelector('.course-categories');
const leftBtn = document.querySelector('.scroll-btn.left');
const rightBtn = document.querySelector('.scroll-btn.right');

leftBtn.addEventListener('click', () => {
  scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });
});

rightBtn.addEventListener('click', () => {
  scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });
});


// Hamburger menu

  const hamburger = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });

// Banner Swipe
src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"
const swiper = new Swiper('.hero-swiper', {
  loop: true,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});

