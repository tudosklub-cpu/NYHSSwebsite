// Admin Panel JavaScript
const ADMIN_PASSWORD = 'tudosok';
const STORAGE_KEY = 'nyhss_events';
const SESSION_KEY = 'nyhss_admin_session';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    setupEventListeners();
    loadEvents();
});

// Check if user is logged in
function checkSession() {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === 'authenticated') {
        showDashboard();
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // Event form
    document.getElementById('event-form').addEventListener('submit', handleEventSubmit);
    document.getElementById('cancel-edit').addEventListener('click', cancelEdit);
    
    // Cover image preview
    document.getElementById('event-cover').addEventListener('change', handleCoverPreview);
    
    // Status filter
    document.querySelectorAll('.status-filter').forEach(btn => {
        btn.addEventListener('click', () => filterEvents(btn.dataset.status));
    });
    
    // Export/Import
    document.getElementById('export-events').addEventListener('click', exportEvents);
    document.getElementById('generate-html').addEventListener('click', generateEventsHTML);
    document.getElementById('copy-html').addEventListener('click', () => copyToClipboard('generated-html'));
    
    // Photos form
    document.getElementById('photos-form').addEventListener('submit', handlePhotosSubmit);
    document.getElementById('photo-files').addEventListener('change', handlePhotosPreview);
    
    // Photos HTML form
    document.getElementById('photos-html-form').addEventListener('submit', generatePhotosHTML);
    document.getElementById('copy-photos-html').addEventListener('click', () => copyToClipboard('generated-photos-html'));
}

// Login handling
function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, 'authenticated');
        showDashboard();
    } else {
        document.getElementById('login-error').style.display = 'block';
        document.getElementById('password').value = '';
    }
}

function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
}

function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    populateEventSelect();
}

// Tab switching
function switchTab(tabId) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// Events Management
function getEvents() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function loadEvents() {
    const events = getEvents();
    renderEventsList(events);
}

function renderEventsList(events, filter = 'all') {
    const container = document.getElementById('events-list');
    
    let filteredEvents = events;
    if (filter !== 'all') {
        filteredEvents = events.filter(e => e.status === filter);
    }
    
    if (filteredEvents.length === 0) {
        container.innerHTML = '<p class="no-events">No events found. Create one above!</p>';
        return;
    }
    
    // Sort by date descending
    filteredEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = filteredEvents.map(event => `
        <div class="admin-event-card ${event.status}" data-id="${event.id}">
            <div class="admin-event-image">
                ${event.coverImage ? `<img src="${event.coverImage}" alt="${event.title}">` : '<div class="no-image">No Image</div>'}
            </div>
            <div class="admin-event-info">
                <span class="event-status-badge ${event.status}">${event.status}</span>
                ${event.series ? `<span class="event-series-tag-small">${event.series}</span>` : ''}
                <h3>${event.title}</h3>
                <p class="event-meta">${formatDate(event.date)} • ${event.time}</p>
                <p class="event-meta">${event.location}</p>
            </div>
            <div class="admin-event-actions">
                ${event.status === 'upcoming' ? 
                    `<button class="btn btn-sm btn-outline" onclick="markAsPast('${event.id}')">Mark as Past</button>` :
                    `<button class="btn btn-sm btn-outline" onclick="markAsUpcoming('${event.id}')">Mark as Upcoming</button>`
                }
                <button class="btn btn-sm btn-primary" onclick="editEvent('${event.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteEvent('${event.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function handleEventSubmit(e) {
    e.preventDefault();
    
    const eventId = document.getElementById('event-form').dataset.editId;
    const isEditing = !!eventId;
    
    const event = {
        id: eventId || Date.now().toString(),
        title: document.getElementById('event-title').value,
        series: document.getElementById('event-series').value,
        date: document.getElementById('event-date').value,
        time: document.getElementById('event-time').value,
        location: document.getElementById('event-location').value,
        description: document.getElementById('event-description').value,
        timeline: document.getElementById('event-timeline').value,
        category: document.getElementById('event-category').value,
        registrationUrl: document.getElementById('event-registration-url').value,
        coverImage: document.getElementById('cover-preview').dataset.image || '',
        status: isEditing ? getEvents().find(e => e.id === eventId)?.status || 'upcoming' : 'upcoming',
        createdAt: isEditing ? getEvents().find(e => e.id === eventId)?.createdAt : new Date().toISOString()
    };
    
    const events = getEvents();
    
    if (isEditing) {
        const index = events.findIndex(e => e.id === eventId);
        if (index !== -1) {
            events[index] = event;
        }
    } else {
        events.push(event);
    }
    
    saveEvents(events);
    loadEvents();
    resetForm();
    populateEventSelect();
    
    alert(isEditing ? 'Event updated successfully!' : 'Event created successfully!');
}

function editEvent(id) {
    const events = getEvents();
    const event = events.find(e => e.id === id);
    if (!event) return;
    
    document.getElementById('event-form').dataset.editId = id;
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-series').value = event.series || '';
    document.getElementById('event-date').value = event.date;
    document.getElementById('event-time').value = event.time;
    document.getElementById('event-location').value = event.location;
    document.getElementById('event-description').value = event.description;
    document.getElementById('event-timeline').value = event.timeline || '';
    document.getElementById('event-category').value = event.category;
    document.getElementById('event-registration-url').value = event.registrationUrl;
    
    if (event.coverImage) {
        document.getElementById('cover-preview').innerHTML = `<img src="${event.coverImage}" alt="Cover">`;
        document.getElementById('cover-preview').dataset.image = event.coverImage;
    }
    
    document.getElementById('cancel-edit').style.display = 'inline-block';
    document.querySelector('#event-form button[type="submit"]').textContent = 'Update Event';
    
    // Scroll to form
    document.getElementById('event-form').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
    resetForm();
}

function resetForm() {
    document.getElementById('event-form').reset();
    document.getElementById('event-form').dataset.editId = '';
    document.getElementById('cover-preview').innerHTML = '';
    document.getElementById('cover-preview').dataset.image = '';
    document.getElementById('cancel-edit').style.display = 'none';
    document.querySelector('#event-form button[type="submit"]').textContent = 'Create Event';
}

function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    const events = getEvents().filter(e => e.id !== id);
    saveEvents(events);
    loadEvents();
    populateEventSelect();
}

function markAsPast(id) {
    const events = getEvents();
    const event = events.find(e => e.id === id);
    if (event) {
        event.status = 'past';
        saveEvents(events);
        loadEvents();
    }
}

function markAsUpcoming(id) {
    const events = getEvents();
    const event = events.find(e => e.id === id);
    if (event) {
        event.status = 'upcoming';
        saveEvents(events);
        loadEvents();
    }
}

function filterEvents(status) {
    document.querySelectorAll('.status-filter').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-status="${status}"]`).classList.add('active');
    renderEventsList(getEvents(), status);
}

// Cover image handling
function handleCoverPreview(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    optimizeImage(file, 800, 0.8).then(dataUrl => {
        document.getElementById('cover-preview').innerHTML = `<img src="${dataUrl}" alt="Cover preview">`;
        document.getElementById('cover-preview').dataset.image = dataUrl;
    });
}

// Image optimization
function optimizeImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Export/Import
function exportEvents() {
    const events = getEvents();
    const dataStr = JSON.stringify(events, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyhss_events_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function generateEventsHTML() {
    const events = getEvents();
    if (events.length === 0) {
        alert('No events to generate HTML for!');
        return;
    }
    
    // Sort by date descending, upcoming first
    const upcomingEvents = events.filter(e => e.status === 'upcoming').sort((a, b) => new Date(a.date) - new Date(b.date));
    const pastEvents = events.filter(e => e.status === 'past').sort((a, b) => new Date(b.date) - new Date(a.date));
    const sortedEvents = [...upcomingEvents, ...pastEvents];
    
    const html = sortedEvents.map(event => {
        const date = new Date(event.date);
        const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const day = date.getDate();
        const year = date.getFullYear();
        
        let timelineHtml = '';
        if (event.timeline) {
            const lines = event.timeline.split('\n').filter(l => l.trim());
            timelineHtml = `
                            <div class="event-timeline">
${lines.map(line => {
                const parts = line.split('|');
                if (parts.length === 2) {
                    return `                                <p><strong>${parts[0].trim()}</strong> ${parts[1].trim()}</p>`;
                }
                return `                                <p>${line}</p>`;
            }).join('\n')}
                            </div>`;
        }
        
        const imageHtml = event.coverImage ? `
                        <div class="event-image-container">
                            <img src="${event.coverImage}" alt="${event.title}" class="event-cover-image">
                        </div>` : '';
        
        const seriesHtml = event.series ? `
                            <span class="event-series-tag">${event.series}</span>` : '';
        
        const buttonHtml = event.status === 'upcoming' 
            ? `<a href="${event.registrationUrl}" target="_blank" class="event-link btn btn-primary">Register Now</a>`
            : `<a href="lectures.html" class="event-link btn btn-outline">View Details</a>`;
        
        const registrationText = event.status === 'upcoming' ? 'RSVP Required • Limited Capacity' : 'Completed';
        
        return `                    <div class="event-item ${event.status}" data-category="${event.status}">
${imageHtml}
                        <div class="event-date">
                            <span class="month">${month}</span>
                            <span class="day">${day}</span>
                            <span class="year">${year}</span>
                        </div>
                        <div class="event-content">${seriesHtml}
                            <h3>${event.title}</h3>
                            <p class="event-time">${event.time}</p>
                            <p class="event-location">📍 ${event.location}</p>
${timelineHtml}
                            <p class="event-description">${event.description}</p>
                            <div class="event-details">
                                <span class="event-category">${event.category}</span>
                                <span class="event-registration">${registrationText}</span>
                            </div>
                            ${buttonHtml}
                        </div>
                    </div>`;
    }).join('\n\n');
    
    document.getElementById('generated-html').value = html;
    document.getElementById('html-output').style.display = 'block';
}

// Photos handling
function handlePhotosPreview(e) {
    const files = e.target.files;
    const container = document.getElementById('photos-preview');
    container.innerHTML = '';
    
    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const div = document.createElement('div');
            div.className = 'photo-preview-item';
            div.innerHTML = `<img src="${event.target.result}" alt="Photo ${index + 1}"><span>${file.name}</span>`;
            container.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

async function handlePhotosSubmit(e) {
    e.preventDefault();
    
    const files = document.getElementById('photo-files').files;
    if (files.length === 0) {
        alert('Please select photos to upload');
        return;
    }
    
    const optimize = document.getElementById('optimize-photos').checked;
    const folderName = document.getElementById('photo-event-name').value || 'event-photos';
    
    // Check if JSZip is available, if not load it
    if (typeof JSZip === 'undefined') {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
    }
    
    const zip = new JSZip();
    const folder = zip.folder(folderName);
    
    const processedImages = await Promise.all(
        Array.from(files).map(async (file, index) => {
            let dataUrl;
            if (optimize) {
                dataUrl = await optimizeImage(file, 1200, 0.85);
            } else {
                dataUrl = await readFileAsDataURL(file);
            }
            return {
                name: `photo-${(index + 1).toString().padStart(2, '0')}.jpg`,
                data: dataUrl.split(',')[1]
            };
        })
    );
    
    processedImages.forEach(img => {
        folder.file(img.name, img.data, { base64: true });
    });
    
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folderName.replace(/[^a-z0-9]/gi, '-')}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert(`${processedImages.length} photos processed and downloaded as ZIP. Upload them to eventimages/${folderName}/ on your server.`);
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function readFileAsDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

function generatePhotosHTML(e) {
    e.preventDefault();
    
    const folder = document.getElementById('photos-folder').value;
    const count = parseInt(document.getElementById('photos-count').value);
    const namesText = document.getElementById('photos-names').value;
    
    let names = [];
    if (namesText.trim()) {
        names = namesText.split('\n').filter(n => n.trim());
    } else {
        for (let i = 1; i <= count; i++) {
            names.push(`photo-${i.toString().padStart(2, '0')}.jpg`);
        }
    }
    
    const html = names.map(name => 
        `                                <div class="gallery-item">
                                    <img src="${folder}/${name}" alt="Event Photo" loading="lazy">
                                </div>`
    ).join('\n');
    
    document.getElementById('generated-photos-html').value = html;
    document.getElementById('photos-html-output').style.display = 'block';
}

function populateEventSelect() {
    const events = getEvents();
    const select = document.getElementById('photo-event-select');
    
    select.innerHTML = '<option value="">-- Select an event --</option>';
    events.forEach(event => {
        const date = formatDate(event.date);
        select.innerHTML += `<option value="${event.id}">${date} - ${event.title}</option>`;
    });
}

// Utility functions
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function copyToClipboard(elementId) {
    const textarea = document.getElementById(elementId);
    textarea.select();
    document.execCommand('copy');
    alert('Copied to clipboard!');
}
