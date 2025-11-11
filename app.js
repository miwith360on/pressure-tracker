// Configuration
const API_KEY = '4c4e76b5d4de3658e7bd0caead08bce6'; // Replace with your API key
const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutes

// State
let currentLocation = null;
let pressureData = [];
let chartInstance = null;
let deferredPrompt = null;

// DOM Elements
const locationInput = document.getElementById('locationInput');
const searchBtn = document.getElementById('searchBtn');
const geoBtn = document.getElementById('geoBtn');
const currentPressure = document.getElementById('currentPressure');
const pressureTrend = document.getElementById('pressureTrend');
const riskLevel = document.getElementById('riskLevel');
const riskText = document.getElementById('riskText');
const alertBox = document.getElementById('alertBox');
const alertMessage = document.getElementById('alertMessage');
const lastUpdate = document.getElementById('lastUpdate');
const alertThreshold = document.getElementById('alertThreshold');
const notificationsEnabled = document.getElementById('notificationsEnabled');
const canvas = document.getElementById('pressureChart');
const installBanner = document.getElementById('installBanner');
const installBtn = document.getElementById('installBtn');
const dismissBtn = document.getElementById('dismissBtn');

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

// PWA Install Prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBanner.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('App installed');
    }
    
    deferredPrompt = null;
    installBanner.classList.add('hidden');
});

dismissBtn.addEventListener('click', () => {
    installBanner.classList.add('hidden');
});

// Hide install banner if already installed
window.addEventListener('appinstalled', () => {
    installBanner.classList.add('hidden');
    console.log('PWA installed');
});

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = locationInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
    }
});

locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

geoBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        geoBtn.textContent = '📍 Getting location...';
        geoBtn.disabled = true;
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
                geoBtn.textContent = '📍 My Location';
                geoBtn.disabled = false;
            },
            (error) => {
                showError('Unable to get your location. Please enter city manually.');
                geoBtn.textContent = '📍 My Location';
                geoBtn.disabled = false;
            }
        );
    } else {
        showError('Geolocation is not supported by your browser.');
    }
});

notificationsEnabled.addEventListener('change', (e) => {
    if (e.target.checked) {
        requestNotificationPermission();
    }
});

alertThreshold.addEventListener('change', () => {
    if (pressureData.length > 0) {
        analyzeRisk();
    }
});

// Fetch weather data by city
async function fetchWeatherByCity(city) {
    try {
        showLoading();
        
        // Get current weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!currentResponse.ok) {
            throw new Error('City not found. Try adding country code (e.g., "London,UK")');
        }
        
        const currentData = await currentResponse.json();
        
        // Get forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        const forecastData = await forecastResponse.json();
        
        processWeatherData(currentData, forecastData);
        currentLocation = city;
        
    } catch (error) {
        showError(`Error: ${error.message}`);
    }
}

// Fetch weather data by coordinates
async function fetchWeatherByCoords(lat, lon) {
    try {
        showLoading();
        
        // Get current weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        const currentData = await currentResponse.json();
        
        // Get forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        const forecastData = await forecastResponse.json();
        
        processWeatherData(currentData, forecastData);
        currentLocation = currentData.name;
        locationInput.value = currentData.name;
        
    } catch (error) {
        showError(`Error: ${error.message}`);
    }
}

// Show loading state
function showLoading() {
    currentPressure.textContent = '...';
    pressureTrend.textContent = '...';
    riskLevel.textContent = '⏳';
    riskText.textContent = 'Loading...';
}

// Process and display weather data
function processWeatherData(current, forecast) {
    // Extract pressure data
    pressureData = [];
    
    // Add current pressure
    pressureData.push({
        time: new Date(current.dt * 1000),
        pressure: current.main.pressure,
        isCurrent: true
    });
    
    // Add forecast pressures (48 hours)
    forecast.list.slice(0, 16).forEach(item => {
        pressureData.push({
            time: new Date(item.dt * 1000),
            pressure: item.main.pressure,
            isCurrent: false
        });
    });
    
    // Update displays
    updateCurrentPressure(current.main.pressure);
    updateTrend();
    analyzeRisk();
    drawChart();
    updateLastUpdateTime();
    
    // Save to localStorage for offline use
    localStorage.setItem('lastPressureData', JSON.stringify(pressureData));
    localStorage.setItem('lastLocation', currentLocation);
}

// Update current pressure display
function updateCurrentPressure(pressure) {
    currentPressure.textContent = pressure.toFixed(1);
}

// Calculate and update pressure trend
function updateTrend() {
    if (pressureData.length < 2) return;
    
    // Calculate 3-hour trend (use data points ~3 hours apart)
    const current = pressureData[0].pressure;
    const threeHoursAgo = pressureData[Math.min(3, pressureData.length - 1)].pressure;
    const change = current - threeHoursAgo;
    
    pressureTrend.textContent = (change >= 0 ? '+' : '') + change.toFixed(1);
    
    // Update styling based on trend
    pressureTrend.classList.remove('falling', 'rising', 'steady');
    if (change < -0.5) {
        pressureTrend.classList.add('falling');
    } else if (change > 0.5) {
        pressureTrend.classList.add('rising');
    } else {
        pressureTrend.classList.add('steady');
    }
}

// Analyze headache risk
function analyzeRisk() {
    const threshold = parseFloat(alertThreshold.value);
    let maxDrop = 0;
    let riskPeriod = null;
    
    // Check for significant drops in forecast
    for (let i = 0; i < pressureData.length - 3; i++) {
        const startPressure = pressureData[i].pressure;
        const endPressure = pressureData[i + 3].pressure;
        const drop = startPressure - endPressure;
        
        if (drop > maxDrop) {
            maxDrop = drop;
            riskPeriod = pressureData[i + 3].time;
        }
    }
    
    // Update risk level
    if (maxDrop >= threshold) {
        riskLevel.textContent = '⚠️';
        riskLevel.style.fontSize = '2rem';
        riskText.textContent = 'High Risk';
        riskText.style.color = 'var(--danger-color)';
        showAlert(maxDrop, riskPeriod);
    } else if (maxDrop >= threshold * 0.7) {
        riskLevel.textContent = '⚡';
        riskLevel.style.fontSize = '2rem';
        riskText.textContent = 'Moderate';
        riskText.style.color = 'var(--warning-color)';
        alertBox.classList.add('hidden');
    } else {
        riskLevel.textContent = '✓';
        riskLevel.style.fontSize = '2.5rem';
        riskText.textContent = 'Low Risk';
        riskText.style.color = 'var(--success-color)';
        alertBox.classList.add('hidden');
    }
}

// Show alert for high risk
function showAlert(drop, time) {
    const timeStr = time.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
    
    alertMessage.textContent = `Pressure expected to drop ${drop.toFixed(1)} hPa by ${timeStr}. Consider taking preventive measures.`;
    alertBox.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)';
    alertBox.classList.remove('hidden');
    
    // Send browser notification if enabled
    if (notificationsEnabled.checked && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('⚠️ Headache Risk Alert', {
            body: `Pressure dropping ${drop.toFixed(1)} hPa by ${timeStr}`,
            icon: 'icon-192.png',
            badge: 'icon-192.png',
            vibrate: [200, 100, 200]
        });
    }
}

// Draw pressure chart
function drawChart() {
    const ctx = canvas.getContext('2d');
    
    const labels = pressureData.map(d => 
        d.time.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric' 
        })
    );
    
    const values = pressureData.map(d => d.pressure);
    
    // Simple canvas chart
    drawSimpleChart(ctx, labels, values);
}

// Simple chart drawing function
function drawSimpleChart(ctx, labels, values) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = 300 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '300px';
    
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = 300;
    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Find min and max
    const minVal = Math.min(...values) - 2;
    const maxVal = Math.max(...values) + 2;
    const range = maxVal - minVal;
    
    // Draw grid
    ctx.strokeStyle = '#e1e8ed';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        
        // Y-axis labels
        const val = maxVal - (range / 5) * i;
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(0), padding - 8, y + 4);
    }
    
    // Draw line
    ctx.strokeStyle = '#4a90e2';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    values.forEach((val, i) => {
        const x = padding + (chartWidth / (values.length - 1)) * i;
        const y = padding + chartHeight - ((val - minVal) / range) * chartHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw points
    values.forEach((val, i) => {
        const x = padding + (chartWidth / (values.length - 1)) * i;
        const y = padding + chartHeight - ((val - minVal) / range) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, i === 0 ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? '#e74c3c' : '#4a90e2';
        ctx.fill();
    });
    
    // X-axis labels (show every 4th label to avoid crowding)
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
        if (i % 4 === 0 || i === labels.length - 1) {
            const x = padding + (chartWidth / (values.length - 1)) * i;
            const shortLabel = label.split(',')[0];
            ctx.fillText(shortLabel, x, height - padding + 20);
        }
    });
}

// Update last update time
function updateLastUpdateTime() {
    const now = new Date();
    lastUpdate.textContent = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

// Show error message
function showError(message) {
    alertMessage.textContent = message;
    alertBox.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
    alertBox.classList.remove('hidden');
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('✅ Notifications Enabled', {
                    body: 'You\'ll receive alerts for pressure changes',
                    icon: 'icon-192.png'
                });
            } else {
                notificationsEnabled.checked = false;
            }
        });
    } else {
        notificationsEnabled.checked = false;
        alert('Your browser does not support notifications.');
    }
}

// Auto-refresh
setInterval(() => {
    if (currentLocation) {
        fetchWeatherByCity(currentLocation);
    }
}, UPDATE_INTERVAL);

// Load last data on startup (for offline use)
window.addEventListener('load', () => {
    const savedData = localStorage.getItem('lastPressureData');
    const savedLocation = localStorage.getItem('lastLocation');
    
    if (savedData && savedLocation) {
        pressureData = JSON.parse(savedData);
        currentLocation = savedLocation;
        locationInput.value = savedLocation;
        
        if (pressureData.length > 0) {
            updateCurrentPressure(pressureData[0].pressure);
            updateTrend();
            analyzeRisk();
            drawChart();
            
            alertMessage.textContent = 'Showing cached data. Pull down to refresh or search for new location.';
            alertBox.style.background = 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)';
            alertBox.classList.remove('hidden');
        }
    } else {
        // Initial message
        alertMessage.textContent = '👋 Welcome! Enter your location to start tracking pressure changes.';
        alertBox.style.background = 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)';
        alertBox.classList.remove('hidden');
    }
});

// Handle window resize for chart
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (pressureData.length > 0) {
            drawChart();
        }
    }, 250);
});
