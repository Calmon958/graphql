import Chart from 'chart.js';
import { Chart as ChartJS, registerables } from 'chart.js';

// Register necessary Chart.js components if not using the full bundle or default import doesn't cover everything
ChartJS.register(...registerables);

// --- Mock Data (Replace with actual data fetching) ---
const userData = {
    fullname: "Alex Doe",
    username: "alexd",
    description: "Passionate developer exploring the web.",
    avatar: "https://images.websim.ai/avatar/alexd", // Example dynamic avatar
    xp: 15780,
    xpRequired: 20000, // For progress bar calculation
    avgGrade: 88,
    auditsDone: 25,
    auditsReceived: 30,
    passRatioDone: 92,
    passRatioReceived: 85,
    skillLevels: { // Data for Skill Donuts (assuming 0-10 scale)
        "JS": 9,
        "HTML": 8,
        "CSS": 7,
        "React": 8,
        "Node": 6,
        "Python": 5,
        "SQL": 7
    },
    xpHistory: [ // Data for XP over time chart
        { month: 'Jan', xp: 1000 },
        { month: 'Feb', xp: 1500 },
        { month: 'Mar', xp: 2200 },
        { month: 'Apr', xp: 3000 },
        { month: 'May', xp: 4500 },
        { month: 'Jun', xp: 6000 },
        { month: 'Jul', xp: 7800 },
        { month: 'Aug', xp: 9500 },
        { month: 'Sep', xp: 11000 },
        { month: 'Oct', xp: 13000 },
        { month: 'Nov', xp: 14500 },
        { month: 'Dec', xp: 15780 },
    ]
};

// --- DOM Elements ---
const userAvatar = document.getElementById('user-avatar');
const userFullname = document.getElementById('user-fullname');
const userUsername = document.getElementById('user-username');
const userDescription = document.getElementById('user-description');
const xpAmount = document.getElementById('xp-amount');
const xpProgress = document.querySelector('.progress');
const xpNextLevel = document.querySelector('.xp small'); // To update "Next level" text
const avgGrade = document.getElementById('avg-grade');
const auditsDone = document.getElementById('audits-done');
const auditsReceived = document.getElementById('audits-received');
const passRatioDone = document.getElementById('pass-ratio-done');
const passRatioReceived = document.getElementById('pass-ratio-received');
const skillsDonutsContainer = document.getElementById('skills-donuts-container'); // New container for donuts

const token = localStorage.getItem('jwt');
if (!token) {
  window.location.href = 'login.html';
}

const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', () => {
  localStorage.removeItem('jwt');
  window.location.href = 'login.html';
});


// --- Populate User Info ---
function populateUserInfo(data) {
    // Fetch logged-in user info if available from websim API
    window.websim?.getUser().then(currentUser => {
        if (currentUser && currentUser.username) {
            userAvatar.src = `https://images.websim.ai/avatar/${currentUser.username}`;
            userUsername.textContent = `@${currentUser.username}`;
            // Use currentUser.description if available, otherwise fallback
            userDescription.textContent = currentUser.description || data.description;
             // You might need an API call to get fullname if not in websim.getUser()
             // For now, use username as fallback if fullname isn't directly available
             // Try to get name from profile or fallback gracefully
             userFullname.textContent = currentUser.fullname || currentUser.profile?.name || currentUser.username;
        } else {
             // Fallback to mock data if no user logged in or API fails
            userAvatar.src = data.avatar;
            userFullname.textContent = data.fullname;
            userUsername.textContent = `@${data.username}`;
            userDescription.textContent = data.description;
        }
    }).catch(() => {
         // Fallback to mock data on error
         userAvatar.src = data.avatar;
         userFullname.textContent = data.fullname;
         userUsername.textContent = `@${data.username}`;
         userDescription.textContent = data.description;
    });


    xpAmount.textContent = data.xp.toLocaleString(); // Format number with commas
    const xpPercentage = (data.xp / data.xpRequired) * 100;
    xpProgress.style.width = `${Math.min(xpPercentage, 100)}%`; // Cap at 100%
    const xpNeeded = data.xpRequired - data.xp;
    xpNextLevel.textContent = xpNeeded > 0 ? `Next level: ${xpNeeded.toLocaleString()} XP` : 'Max Level Reached!';


    avgGrade.textContent = `${data.avgGrade}%`;
    auditsDone.textContent = data.auditsDone;
    auditsReceived.textContent = data.auditsReceived;
    passRatioDone.textContent = `${data.passRatioDone}%`;
    passRatioReceived.textContent = `${data.passRatioReceived}%`;

    // Populate Skills Donuts
    createSkillDonuts(data.skillLevels, skillsDonutsContainer);
}

// --- Chart Generation ---

// Common Chart Options updated for dark theme
const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false // Generally hide legends for cleaner look
        },
        title: {
            display: false, // Titles handled by section headers (h3)
            color: '#e0e0e0', // Light text color for titles if used
            font: {
                size: 16,
                weight: 'normal',
            },
            padding: {
                top: 10,
                bottom: 20
            }
        },
        tooltip: { // Style tooltips for dark theme
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#eee',
        }
    },
     scales: {
        y: {
            ticks: { color: '#a0b3c7' }, // Lighter tick labels (secondary color)
            grid: { color: '#169976' }  // Darker teal grid lines
        },
        x: {
            ticks: { color: '#a0b3c7' }, // Lighter tick labels
            grid: { display: false } // Hide vertical grid lines often
        }
    }
};

// --- XP Over Time Chart (Line) - Now in the left column ---
const xpTimeCtx = document.getElementById('xpOverTimeChart')?.getContext('2d'); // Add null check
if (xpTimeCtx) { // Only create chart if canvas exists
    new Chart(xpTimeCtx, {
        type: 'line',
        data: {
            labels: userData.xpHistory.map(item => item.month),
            datasets: [{
                label: 'Total XP Gained', // Tooltip label
                data: userData.xpHistory.map(item => item.xp),
                fill: true,
                borderColor: '#1DCD9F', // Primary color (Bright Teal)
                backgroundColor: 'rgba(29, 205, 159, 0.15)', // Primary color with low opacity
                tension: 0.3, // Smoother curve
                pointRadius: 3, // Smaller points
                pointBackgroundColor: '#1DCD9F', // Match line color
                pointBorderColor: '#fff', // White border for points
                pointHoverRadius: 5, // Larger hover points
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#1DCD9F'
            }]
        },
        options: {
            ...commonChartOptions, // Apply common dark theme options
            scales: {
                ...commonChartOptions.scales, // Apply common dark theme scales
                y: {
                    ...commonChartOptions.scales.y,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cumulative XP',
                        color: '#a0b3c7' // Secondary color for axis title
                    }
                },
                x: {
                    ...commonChartOptions.scales.x,
                    title: {
                        display: false // Month label is implicit
                    }
                }
            }
        }
    });
}

// --- Generate Skill Donut SVGs ---
function createSkillDonuts(skills, container) {
    if (!container) return;
    container.innerHTML = ''; // Clear previous donuts

    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    for (const [skill, level] of Object.entries(skills)) {
        const percentage = Math.min(Math.max(level * 10, 0), 100); // Convert 0-10 scale to 0-100%
        const offset = circumference * (1 - percentage / 100);

        const wrapper = document.createElement('div');
        wrapper.className = 'skill-donut-wrapper';

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute('class', 'skill-donut-svg');
        svg.setAttribute('viewBox', '0 0 100 100'); // Use viewBox for scaling

        // Background Track
        const track = document.createElementNS(svgNS, 'circle');
        track.setAttribute('class', 'skill-donut-track');
        track.setAttribute('cx', '50');
        track.setAttribute('cy', '50');
        track.setAttribute('r', radius);
        svg.appendChild(track);

        // Progress Circle
        const progress = document.createElementNS(svgNS, 'circle');
        progress.setAttribute('class', 'skill-donut-progress');
        progress.setAttribute('cx', '50');
        progress.setAttribute('cy', '50');
        progress.setAttribute('r', radius);
        progress.setAttribute('stroke-dasharray', circumference);
        // Set initial offset for animation effect if desired later
        progress.setAttribute('stroke-dashoffset', circumference);
        // Trigger the animation after element is added to DOM (slight delay)
         setTimeout(() => {
             progress.style.strokeDashoffset = offset;
         }, 10);
        svg.appendChild(progress);

        // Percentage Text (inside SVG for centering)
        const textPercent = document.createElementNS(svgNS, 'text');
        textPercent.setAttribute('class', 'skill-donut-text-percent');
        textPercent.setAttribute('x', '50%'); // Relative to SVG center
        textPercent.setAttribute('y', '-50%'); // Relative to SVG center, adjust due to rotation
        textPercent.textContent = `${percentage}%`;
        svg.appendChild(textPercent);


        // Skill Label (outside SVG, below it)
        const label = document.createElement('span');
        label.className = 'skill-donut-text-label';
        label.textContent = skill;

        wrapper.appendChild(svg);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
    }
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    populateUserInfo(userData);
});