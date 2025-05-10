let date = new Date();
let currentMonth = date.getMonth();
let currentYear = date.getFullYear();

const monthElement = document.getElementById("month");
const yearElement = document.getElementById("year");
const daysElement = document.querySelector(".days");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Store events
let events = {};

// Update the event rendering in renderCalendar function
const contextMenu = document.getElementById('contextMenu');
let activeDay = null;

function renderCalendar() {
    // First day of the month
    let firstDay = new Date(currentYear, currentMonth, 1);
    // Last day of the month
    let lastDay = new Date(currentYear, currentMonth + 1, 0);
    let daysInMonth = lastDay.getDate();
    
    // Get the day of week for the first day (0-6, where 0 is Sunday)
    let startingDay = firstDay.getDay();
    // Convert Sunday from 0 to 7 to match our calendar layout
    startingDay = startingDay === 0 ? 7 : startingDay;
    
    // Clear previous days
    daysElement.innerHTML = '';
    
    // Update month and year display
    monthElement.textContent = months[currentMonth];
    yearElement.textContent = currentYear;
    
    // Add empty divs for days before the first day of month
    for (let i = 1; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        daysElement.appendChild(emptyDay);
    }
    
    // Add the actual days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        dayElement.classList.add('day-number');
        
        // Create date string for event lookup
        const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Add events if they exist (but keep them hidden)
        if (events[dateString]) {
            dayElement.classList.add('has-event');
            const eventList = document.createElement('div');
            eventList.className = 'event-list';
            
            // Sort events by time
            events[dateString].sort((a, b) => a.time.localeCompare(b.time));
            
            // Add events with edit and delete options
            events[dateString].forEach((event, index) => {
                const eventItem = document.createElement('div');
                eventItem.className = 'event-item';
                
                // Create event text
                const eventText = document.createElement('span');
                eventText.textContent = `${event.time} - ${event.title}`;
                eventItem.appendChild(eventText);
                
                // Create edit button
                const editBtn = document.createElement('button');
                editBtn.textContent = '✎';
                editBtn.className = 'edit-event';
                editBtn.onclick = (e) => {
                    e.stopPropagation();
                    // Pre-fill the form with existing event data
                    document.getElementById('eventTitle').value = event.title;
                    document.getElementById('eventTime').value = event.time;
                    // Remove the old event
                    events[dateString].splice(index, 1);
                    openModal(dateString);
                };
                eventItem.appendChild(editBtn);
                
                // Create delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '🗑';
                deleteBtn.className = 'delete-event';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    events[dateString].splice(index, 1);
                    if (events[dateString].length === 0) {
                        delete events[dateString];
                    }
                    renderCalendar();
                };
                eventItem.appendChild(deleteBtn);
                
                eventList.appendChild(eventItem);
            });
            
            // Hide the event list by default
            eventList.style.display = 'none';
            dayElement.appendChild(eventList);
        }
        
        // Add click event to open context menu
        dayElement.addEventListener('click', (e) => {
            e.preventDefault();
            showContextMenu(e, dateString, dayElement);
        });
        
        daysElement.appendChild(dayElement);
    }
}

// Modal functionality
const modal = document.getElementById('eventModal');
const closeBtn = document.querySelector('.close');
const eventForm = document.getElementById('eventForm');
let selectedDate = null;

function openModal(dateString) {
    selectedDate = dateString;
    modal.style.display = 'block';
}

closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

eventForm.onsubmit = function(e) {
    e.preventDefault();
    
    const eventTitle = document.getElementById('eventTitle').value;
    const eventTime = document.getElementById('eventTime').value;
    
    // Initialize array if no events exist for this date
    if (!events[selectedDate]) {
        events[selectedDate] = [];
    }
    
    // Add new event
    events[selectedDate].push({
        title: eventTitle,
        time: eventTime
    });
    
    // Clear form
    eventForm.reset();
    
    // Close modal
    modal.style.display = 'none';
    
    // Re-render calendar to show new event
    renderCalendar();
}

// Add event listeners for navigation
prevButton.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
});

nextButton.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
});

// Populate year dropdown
const yearDropdown = document.querySelector('.year-dropdown');
const currentYearDate = new Date().getFullYear();
for (let year = currentYearDate - 10; year <= currentYearDate + 10; year++) {
    const yearOption = document.createElement('div');
    yearOption.className = 'dropdown-item';
    yearOption.textContent = year;
    yearDropdown.appendChild(yearOption);
}

// Handle month selection
document.querySelector('.month-dropdown').addEventListener('click', function(e) {
    if (e.target.classList.contains('dropdown-item')) {
        const selectedMonth = months.indexOf(e.target.textContent);
        if (selectedMonth !== -1) {
            currentMonth = selectedMonth;
            renderCalendar();
        }
        this.classList.remove('show');
    }
});

// Handle year selection
document.querySelector('.year-dropdown').addEventListener('click', function(e) {
    if (e.target.classList.contains('dropdown-item')) {
        currentYear = parseInt(e.target.textContent);
        renderCalendar();
        this.classList.remove('show');
    }
});

// Toggle dropdowns
monthElement.addEventListener('click', function(e) {
    e.stopPropagation();
    document.querySelector('.month-dropdown').classList.toggle('show');
    document.querySelector('.year-dropdown').classList.remove('show');
});

yearElement.addEventListener('click', function(e) {
    e.stopPropagation();
    document.querySelector('.year-dropdown').classList.toggle('show');
    document.querySelector('.month-dropdown').classList.remove('show');
});

// Close dropdowns when clicking outside
window.addEventListener('click', function() {
    document.querySelector('.month-dropdown').classList.remove('show');
    document.querySelector('.year-dropdown').classList.remove('show');
});

// Initial render
renderCalendar();


function showContextMenu(e, dateString, dayElement) {
    e.preventDefault();
    
    // Hide events from previously active day
    if (activeDay) {
        const prevEventList = activeDay.querySelector('.event-list');
        if (prevEventList) {
            prevEventList.style.display = 'none';
        }
    }
    
    // Position the context menu
    contextMenu.style.display = 'block';
    contextMenu.style.left = e.pageX + 'px';
    contextMenu.style.top = e.pageY + 'px';
    
    // Store the clicked day element
    activeDay = dayElement;
    selectedDate = dateString;
    
    // Handle show events
    document.getElementById('showEvents').onclick = () => {
        const eventList = dayElement.querySelector('.event-list');
        if (eventList) {
            eventList.style.display = 'block';
        }
        contextMenu.style.display = 'none';
    };
    
    // Handle add event
    document.getElementById('addEvent').onclick = () => {
        openModal(dateString);
        contextMenu.style.display = 'none';
        // Hide any visible event list
        const eventList = dayElement.querySelector('.event-list');
        if (eventList) {
            eventList.style.display = 'none';
        }
    };
}

// Close context menu and hide events when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.day-number') && !e.target.closest('.context-menu')) {
        contextMenu.style.display = 'none';
        if (activeDay) {
            const eventList = activeDay.querySelector('.event-list');
            if (eventList) {
                eventList.style.display = 'none';
            }
        }
    }
});

// Prevent context menu on right click
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.day-number')) {
        e.preventDefault();
    }
});