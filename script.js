
// Toggle mobile menu
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');

    // Change hamburger icon to X when menu is open
    const icon = mobileMenuBtn.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
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

// Check for saved theme preference
const savedDarkMode = localStorage.getItem('darkMode');
if (savedDarkMode === 'true') {
    document.body.classList.add('dark-mode');
    const icon = themeToggle.querySelector('i');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
}

// Filter courses by category
const categoryBtns = document.querySelectorAll('.category-btn');
const courseCards = document.querySelectorAll('.course-card');

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        courseCards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
            } else {
                const categories = card.getAttribute('data-category').split(' ');
                if (categories.includes(filter)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    });
});

// Search functionality
const searchInput = document.getElementById('courseSearch');

searchInput.addEventListener('keyup', () => {
    const searchTerm = searchInput.value.toLowerCase();

    courseCards.forEach(card => {
        const title = card.querySelector('.course-title').textContent.toLowerCase();
        const description = card.querySelector('.course-description').textContent.toLowerCase();

        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// Modal for download parts
const modal = document.getElementById("myModal");
const downloadBtns = document.querySelectorAll('.download-btn');
const downloadPartsDiv = document.getElementById("downloadParts");
const closeModal = document.getElementsByClassName("close")[0];

downloadBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const parts = JSON.parse(btn.getAttribute('data-parts'));
        downloadPartsDiv.innerHTML = ''; // Clear previous content

        parts.forEach(part => {
            const partDiv = document.createElement('div');
            partDiv.innerHTML = `<a href="${part.link}">${part.name} (${part.size})</a>`;
            downloadPartsDiv.appendChild(partDiv);
        });

        modal.style.display = "block";
    });
});

closeModal.onclick = function () {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });

        // Close mobile menu if open
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
});

//// 

// Get the modal
const modal_1 = document.getElementById("modal");
const downloadParts = document.getElementById("downloadParts");
const closeBtn = document.getElementsByClassName("close")[0];

// Get all download buttons with data-parts attribute
const downloadbtn = document.querySelectorAll('.download-btn[data-parts]');

// Add click event to all download buttons with parts
downloadbtn.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get parts data from the data-parts attribute
        const partsData = JSON.parse(this.getAttribute('data-parts'));
        if (partsData && partsData.length > 0) {
            
            // Clear previous content
            downloadParts.innerHTML = '';
            
            // Create links for each part
            partsData.forEach(part => {
                const partLink = document.createElement('a');
                partLink.href = part.link;
                partLink.target = "_blank"; // This makes the link open in a new tab
                partLink.className = 'part-link';
                
                // Create text span for the part name and size
                const textSpan = document.createElement('span');
                textSpan.textContent = `${part.name}`;
                if (part.size) {
                    textSpan.textContent += ` (${part.size})`;
                }
                
                // Create download icon
                const downloadIcon = document.createElement('i');
                downloadIcon.className = 'fas fa-download download-icon';
                
                // Add text and icon to the link
                partLink.appendChild(textSpan);
                partLink.appendChild(downloadIcon);
                
                downloadParts.appendChild(partLink);
            });
            
            // Show the modal
            modal_1.style.display = "block";
        }
    });
});

// Close the modal when clicking on the close button
closeBtn.addEventListener('click', function() {
    modal_1.style.display = "none";
});

// Close the modal when clicking outside of it
window.addEventListener('click', function(event) {
    if (event.target == modal_1) {
        modal_1.style.display = "none";
    }
});