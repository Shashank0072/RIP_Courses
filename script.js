// Wait for DOM to load before running script
document.addEventListener('DOMContentLoaded', function() {
  // Define the course data container
  let courseData = [];
  
  // Fetch courses from JSON file
  async function loadCourses() {
    try {
      console.log('Loading courses...');
      const response = await fetch('courses-data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Courses loaded:', data);
      courseData = data.courses;
      renderCourses();
      return true;
    } catch (error) {
      console.error('Error loading courses:', error);
      document.querySelector('.featured-courses').innerHTML = 
        '<p class="error-message">Failed to load courses. Please refresh the page or try again later.</p>';
      return false;
    }
  }
  
  // Render courses to the DOM
  function renderCourses(coursesToRender = courseData) {
    console.log('Rendering courses:', coursesToRender);
    const coursesContainer = document.querySelector('.featured-courses');
    
    // Check if container exists
    if (!coursesContainer) {
      console.error('Could not find .featured-courses container in the DOM');
      return;
    }
    
    // Clear existing courses
    coursesContainer.innerHTML = '';
    
    if (coursesToRender.length === 0) {
      coursesContainer.innerHTML = '<p class="no-results">No courses match your search criteria.</p>';
      return;
    }
    
    // Add each course
    coursesToRender.forEach(course => {
      // Create course card element
      const courseCard = document.createElement('div');
      courseCard.className = 'course-card';
      courseCard.setAttribute('data-category', course.category);
      
      // Generate download button
      let actionButton = '';
      if (course.comming_soon) {
        actionButton = `<img src="newbadge.png" alt="New Course" width="58" height="55" style="margin-left: 25px;">`;
      } else if (course.parts && course.parts.length > 0) {
        const partsJson = JSON.stringify(course.parts).replace(/"/g, '&quot;');
        actionButton = `<a href="#" class="download-btn" data-parts='${partsJson}'>Download</a>`;
      }


      // Generate the new Badge
        
      let new_badge = '';
      if (course.is_new){
        new_badge = `<img src="new_badge.png" alt="newbadge" style="z-index: 1; position: absolute; margin-top: -7.5rem; margin-right: -18rem; width: 50px;">`;
      }
      console.log("Is course new?", course.is_new, typeof course.is_new);


      // Handle levels (can have multiple)
      let levelBadges = '';
      if (course.level) {
        const levels = course.level.split(' ');
        levels.forEach(level => {
          if (level) {
            const levelLower = level.toLowerCase();
            let badgeText;
            
            // Determine the display text for each badge type
            if (levelLower === 'bestseller') {
              badgeText = 'Bestseller';
            } else if (levelLower === 'premium') {
              badgeText = 'Premium';
            } else if (levelLower === 'advanced') {
              badgeText = 'Advanced';
            } else {
              badgeText = level; // Use original text for any other level
            }
            
            levelBadges += `<span class="course-level ${levelLower}">${badgeText}</span>`;
          }
        });
      }
      
      // Create course HTML structure
      courseCard.innerHTML = `
        <div class="course-image">
          <img alt="${course.title}" src="${course.image}" style="height: 13rem;" />
          ${new_badge}
        </div>
        <div class="course-content">
          <h3 class="course-title">${course.title}</h3>
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
      
      // Add the course card to the container
      coursesContainer.appendChild(courseCard);
    });
    
    // Attach event listeners for download buttons
    attachDownloadEventListeners();
  }
  
  // Attach event listeners to download buttons
  function attachDownloadEventListeners() {
    const downloadButtons = document.querySelectorAll('.download-btn');
    const modal = document.getElementById('myModal');
    const closeBtn = document.querySelector('.close');
    const downloadParts = document.getElementById('downloadParts');
    
    if (!modal || !downloadParts) {
      console.error('Modal elements not found in the DOM');
      return;
    }
    
    downloadButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const parts = JSON.parse(this.getAttribute('data-parts'));
        
        // Clear previous content
        downloadParts.innerHTML = '';
        
        // Add each part
        parts.forEach(part => {
          const partLink = document.createElement('a');
          partLink.href = part.link;
          partLink.className = 'part-link';
          partLink.target = '_blank';
          partLink.innerHTML = `${part.name} (${part.size})`;
          downloadParts.appendChild(partLink);
        });
        
        // Show modal
        modal.style.display = 'block';
      });
    });
    
    // Close modal on X click
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
      });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
  
  // Filter courses by search query
  function filterCourses(query) {
    if (!query) {
      renderCourses();
      return;
    }
    
    const filteredCourses = courseData.filter(course => {
      return (
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase()) ||
        course.creator.toLowerCase().includes(query.toLowerCase()) ||
        course.category.toLowerCase().includes(query.toLowerCase())
      );
    });
    
    renderCourses(filteredCourses);
  }
  
  // Filter courses by category
  function filterCoursesByCategory(category) {
    if (category === 'all') {
      renderCourses();
      return;
    }
    
    const filteredCourses = courseData.filter(course => course.category === category);
    renderCourses(filteredCourses);
  }
  
  // Initialize everything
  
  // Load courses from JSON file
  loadCourses();
  
  // Setup search functionality
  const searchInput = document.getElementById('courseSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      filterCourses(this.value);
    });
  } else {
    console.error('Could not find #courseSearch element in the DOM');
  }
  
  // Setup category filter buttons
  const categoryButtons = document.querySelectorAll('.category-btn');
  categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Filter courses
      const category = this.getAttribute('data-filter');
      filterCoursesByCategory(category);
    });
  });
});

// Dark mode toggle
const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }

    // Save preference to localStorage
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
});


// Loader 

window.addEventListener('load', function() {
    // When page is fully loaded, hide the loader
    document.getElementById('loaderContainer').classList.add('hidden');
  });
