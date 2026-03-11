// Main JavaScript file for student housing application

// Global variables
let notifications = [];
let pollingInterval = null;

// Initialize on document ready
document.addEventListener('DOMContentLoaded', function() {
    initializeNotifications();
    initializeFilters();
    initializeModals();
    initializeForms();
    initializeRealTimeUpdates();
});

// Notification System
function initializeNotifications() {
    const notificationBell = document.getElementById('notification-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', toggleNotificationDropdown);
        
        // Mark notifications as read when dropdown opens
        notificationBell.addEventListener('click', markNotificationsAsRead);
    }
}

function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

async function fetchNotifications() {
    try {
        const response = await fetch('/api/notifications');
        const data = await response.json();
        updateNotificationUI(data);
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
}

function updateNotificationUI(notifications) {
    const count = notifications.length;
    const badge = document.querySelector('.notification-count');
    const list = document.getElementById('notification-list');
    
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline' : 'none';
    }
    
    if (list) {
        if (notifications.length === 0) {
            list.innerHTML = '<div class="notification-item">No new notifications</div>';
        } else {
            list.innerHTML = notifications.map(n => `
                <div class="notification-item unread" data-id="${n.id}">
                    <strong>${n.title}</strong>
                    <p>${n.message}</p>
                    <small>${n.created_at}</small>
                </div>
            `).join('');
            
            // Add click handlers
            document.querySelectorAll('.notification-item').forEach(item => {
                item.addEventListener('click', () => markNotificationAsRead(item.dataset.id));
            });
        }
    }
}

async function markNotificationAsRead(notificationId) {
    try {
        await fetch(`/api/notifications/${notificationId}/read`, {
            method: 'POST'
        });
        fetchNotifications(); // Refresh notifications
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

function markNotificationsAsRead() {
    // In a real app, you might mark all as read
    // For now, we'll just refresh
    fetchNotifications();
}

// Real-time updates
function initializeRealTimeUpdates() {
    // Poll for updates every 30 seconds
    pollingInterval = setInterval(() => {
        checkForUpdates();
    }, 30000);
}

async function checkForUpdates() {
    // Check for new notifications
    await fetchNotifications();
    
    // Check for match request updates
    checkMatchRequestUpdates();
    
    // Check for application status updates
    checkApplicationUpdates();
}

async function checkMatchRequestUpdates() {
    // Implementation depends on your API
    const matchRequestsElement = document.getElementById('pending-match-requests');
    if (matchRequestsElement) {
        // Refresh the match requests section
        location.reload(); // Simple approach - can be optimized
    }
}

async function checkApplicationUpdates() {
    // Similar to match requests
}

// Filter System
function initializeFilters() {
    const filterForms = document.querySelectorAll('.filter-form');
    filterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            applyFilters(this);
        });
    });
    
    // Initialize range sliders
    initializeRangeSliders();
}

function applyFilters(form) {
    const formData = new FormData(form);
    const params = new URLSearchParams(formData).toString();
    window.location.href = window.location.pathname + '?' + params;
}

function initializeRangeSliders() {
    const minSlider = document.getElementById('min-price');
    const maxSlider = document.getElementById('max-price');
    const minValue = document.getElementById('min-price-value');
    const maxValue = document.getElementById('max-price-value');
    
    if (minSlider && maxSlider) {
        minSlider.addEventListener('input', function() {
            if (minValue) minValue.textContent = '$' + this.value;
            if (parseInt(this.value) > parseInt(maxSlider.value)) {
                maxSlider.value = this.value;
                if (maxValue) maxValue.textContent = '$' + this.value;
            }
        });
        
        maxSlider.addEventListener('input', function() {
            if (maxValue) maxValue.textContent = '$' + this.value;
            if (parseInt(this.value) < parseInt(minSlider.value)) {
                minSlider.value = this.value;
                if (minValue) minValue.textContent = '$' + this.value;
            }
        });
    }
}

// Modal System
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Form Handling
function initializeForms() {
    // Profile form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }
    
    // Preferences form
    const preferencesForm = document.getElementById('preferences-form');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', handlePreferencesSubmit);
    }
    
    // Application form
    const applicationForm = document.getElementById('application-form');
    if (applicationForm) {
        applicationForm.addEventListener('submit', handleApplicationSubmit);
    }
    
    // Add real-time validation
    addFormValidation();
}

async function handleProfileSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/student/profile', {
            method: 'POST',
            body: formData
        });
        
        if (response.redirected) {
            window.location.href = response.url;
        }
    } catch (error) {
        showAlert('Error saving profile. Please try again.', 'danger');
    }
}

async function handlePreferencesSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/student/preferences', {
            method: 'POST',
            body: formData
        });
        
        if (response.redirected) {
            window.location.href = response.url;
        }
    } catch (error) {
        showAlert('Error saving preferences. Please try again.', 'danger');
    }
}

async function handleApplicationSubmit(e) {
    e.preventDefault();
    
    const listingId = e.target.dataset.listingId;
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch(`/student/apply/${listingId}`, {
            method: 'POST',
            body: formData
        });
        
        if (response.redirected) {
            window.location.href = response.url;
        }
    } catch (error) {
        showAlert('Error submitting application. Please try again.', 'danger');
    }
}

function addFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('invalid', function(e) {
                e.preventDefault();
                this.classList.add('invalid');
            });
            
            input.addEventListener('input', function() {
                if (this.validity.valid) {
                    this.classList.remove('invalid');
                }
            });
        });
    });
}

// Alert System
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Match Request Handling
async function sendMatchRequest(receiverId) {
    try {
        const response = await fetch(`/student/send-match-request/${receiverId}`, {
            method: 'POST'
        });
        
        if (response.redirected) {
            window.location.href = response.url;
        }
    } catch (error) {
        showAlert('Error sending match request. Please try again.', 'danger');
    }
}

async function handleMatchRequest(requestId, action) {
    try {
        const response = await fetch(`/student/handle-match-request/${requestId}/${action}`, {
            method: 'POST'
        });
        
        if (response.redirected) {
            window.location.href = response.url;
        }
    } catch (error) {
        showAlert(`Error ${action}ing match request. Please try again.`, 'danger');
    }
}

// Housing Listing Interactions
async function checkAvailability(listingId) {
    try {
        const response = await fetch(`/api/housing/availability?listing_id=${listingId}`);
        const data = await response.json();
        
        const availabilityElement = document.getElementById(`availability-${listingId}`);
        if (availabilityElement) {
            if (data.is_available) {
                availabilityElement.innerHTML = '<span class="text-success">Available</span>';
            } else {
                availabilityElement.innerHTML = `<span class="text-danger">Available from ${data.available_from}</span>`;
            }
        }
    } catch (error) {
        console.error('Error checking availability:', error);
    }
}

// Search and Sort
function searchListings(query) {
    const listings = document.querySelectorAll('.listing-card');
    const searchTerm = query.toLowerCase();
    
    listings.forEach(listing => {
        const title = listing.querySelector('.listing-title')?.textContent.toLowerCase() || '';
        const description = listing.querySelector('.listing-description')?.textContent.toLowerCase() || '';
        const location = listing.querySelector('.listing-location')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm) || description.includes(searchTerm) || location.includes(searchTerm)) {
            listing.style.display = 'block';
        } else {
            listing.style.display = 'none';
        }
    });
}

function sortListings(criteria) {
    const container = document.querySelector('.listings-grid');
    if (!container) return;
    
    const listings = Array.from(container.children);
    
    listings.sort((a, b) => {
        switch(criteria) {
            case 'price-low':
                return getPrice(a) - getPrice(b);
            case 'price-high':
                return getPrice(b) - getPrice(a);
            case 'newest':
                return getDate(b) - getDate(a);
            default:
                return 0;
        }
    });
    
    // Reorder DOM
    listings.forEach(listing => container.appendChild(listing));
}

function getPrice(listing) {
    const priceElement = listing.querySelector('.listing-price');
    if (priceElement) {
        return parseFloat(priceElement.textContent.replace('$', '')) || 0;
    }
    return 0;
}

function getDate(listing) {
    const dateElement = listing.querySelector('.listing-date');
    if (dateElement) {
        return new Date(dateElement.textContent).getTime() || 0;
    }
    return 0;
}

// Progress Tracking
function updateApplicationProgress(applicationId, status) {
    const progressBar = document.getElementById(`progress-${applicationId}`);
    if (progressBar) {
        const statuses = {
            'pending': 25,
            'reviewing': 50,
            'approved': 75,
            'confirmed': 100
        };
        
        progressBar.style.width = statuses[status] + '%';
        progressBar.textContent = statuses[status] + '%';
    }
}

// Agreement Handling
async function handleAgreement(agreementId, action) {
    try {
        const response = await fetch(`/student/agreement/${agreementId}/${action}`, {
            method: 'POST'
        });
        
        if (response.redirected) {
            window.location.href = response.url;
        }
    } catch (error) {
        showAlert(`Error ${action}ing agreement. Please try again.`, 'danger');
    }
}

// Admin Functions
async function resetUserPassword(userId) {
    if (!confirm('Are you sure you want to reset this user\'s password?')) {
        return;
    }
    
    try {
        const response = await fetch(`/admin/user/${userId}/reset-password`, {
            method: 'POST'
        });
        
        if (response.redirected) {
            window.location.href = response.url;
        }
    } catch (error) {
        showAlert('Error resetting password. Please try again.', 'danger');
    }
}

async function deleteListing(listingId) {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/admin/housing/delete/${listingId}`, {
            method: 'POST'
        });
        
        if (response.redirected) {
            window.location.href = response.url;
        }
    } catch (error) {
        showAlert('Error deleting listing. Please try again.', 'danger');
    }
}

async function handleApplication(applicationId, action) {
    try {
        const response = await fetch(`/admin/application/${applicationId}/${action}`, {
            method: 'POST'
        });
        
        if (response.redirected) {
            window.location.href = response.url;
        }
    } catch (error) {
        showAlert(`Error ${action}ing application. Please try again.`, 'danger');
    }
}

// Utility Functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
});