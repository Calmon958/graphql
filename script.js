document.addEventListener('DOMContentLoaded', () => {
    const loginPage = document.getElementById('login-page');
    const profilePage = document.getElementById('profile-page');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('login-error');

    // Function declarations first
    function showLoginPage() {
        loginPage.style.display = 'block';
        profilePage.style.display = 'none';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const credentials = btoa(`${username}:${password}`);
            
            // Use a CORS proxy to bypass the CORS restrictions
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = 'https://learn.zone01kisumu.ke/api/auth/signin';
            
            const response = await fetch(proxyUrl + targetUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json',
                    'Origin': 'https://learn.zone01kisumu.ke'
                }
            });

            if (response.ok) {
                const token = await response.text();
                if (token) {
                    localStorage.setItem('jwt', token.trim());
                    loginPage.style.display = 'none';
                    profilePage.style.display = 'block';
                    await fetchProfileData();
                } else {
                    showError('Invalid response from server');
                }
            } else {
                if (response.status === 401) {
                    showError('Invalid username or password');
                } else {
                    showError('Login failed. Please try again');
                }
            }
        } catch (error) {
            console.error('Login request failed:', error);
            showError('Connection error. Please try again');
        }
    });

    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('jwt');
        showLoginPage();
    });

    // Check token on load
    const token = localStorage.getItem('jwt');
    if (token) {
        loginPage.style.display = 'none';
        profilePage.style.display = 'block';
        fetchProfileData().catch(() => {
            localStorage.removeItem('jwt');
            showLoginPage();
        });
    }
});

async function fetchProfileData() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        throw new Error('No token found');
    }

    try {
        const response = await fetch('https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Origin': 'https://learn.zone01kisumu.ke'
            },
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify({
                query: `
                    query {
                        user {
                            id
                            login
                        }
                        
                        moduleXP: transaction(
                            where: {
                                type: {_eq: "xp"},
                                path: {_like: "/kisumu/module/%"},
                                _and: {
                                    path: {_nlike: "%piscine%"}
                                }
                            }
                        ) {
                            amount
                            createdAt
                            path
                        }
                        
                        skills: transaction(
                            where: {
                                type: {_like: "skill_%"}
                            },
                            order_by: {
                                createdAt: desc
                            }
                        ) {
                            type
                            amount
                            createdAt
                        }
                        
                        auditsDone: transaction(
                            where: {
                                type: {_eq: "up"},
                                path: {_like: "/kisumu/module/%"}
                            }
                        ) {
                            amount
                            createdAt
                        }
                        
                        auditsReceived: transaction(
                            where: {
                                type: {_eq: "down"},
                                path: {_like: "/kisumu/module/%"}
                            }
                        ) {
                            amount
                            createdAt
                        }
                    }
                `
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        displayProfileData(data.data);
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}

function displayProfileData(data) {
    if (!data?.user?.[0]) {
        throw new Error('Invalid profile data');
    }

    const user = data.user[0];
    document.getElementById('profile-greeting').textContent = `Welcome, ${user.login}!`;
    
    // Display XP data
    const moduleXP = data.moduleXP || [];
    const totalXP = moduleXP.reduce((sum, t) => sum + t.amount, 0) || 0;
    document.getElementById('xp').textContent = `${(totalXP / 1000).toFixed(2)} kB`;
    
    // Display audit data
    const auditsDone = data.auditsDone || [];
    const auditsReceived = data.auditsReceived || [];
    document.getElementById('audits-done').textContent = auditsDone.length;
    document.getElementById('audits-received').textContent = auditsReceived.length;
    document.getElementById('audits-ratio').textContent = 
        auditsDone.length > 0 ? (auditsDone.length / Math.max(1, auditsReceived.length)).toFixed(1) : '0';
    
    // Display skills
    displaySkills(data.skills);
    
    // Generate charts
    generateXPChart(moduleXP);
    updateAuditRatios({
        done: {
            count: auditsDone.length,
            amount: auditsDone.reduce((sum, audit) => sum + audit.amount, 0)
        },
        received: {
            count: auditsReceived.length,
            amount: auditsReceived.reduce((sum, audit) => sum + audit.amount, 0)
        }
    });
}

function displaySkills(skills) {
    const skillsContainer = document.getElementById('skills-container');
    skillsContainer.innerHTML = '';
    
    if (skills && skills.length > 0) {
        const groupedSkills = skills.reduce((acc, skill) => {
            const skillType = skill.type.replace('skill_', '').replace(/_/g, ' ');
            if (!acc[skillType]) {
                acc[skillType] = 0;
            }
            acc[skillType] += skill.amount;
            return acc;
        }, {});

        const skillsHtml = Object.entries(groupedSkills)
            .sort((a, b) => b[1] - a[1])
            .map(([type, amount]) => {
                const percentage = Math.min(amount, 100);
                return `<div class="skill-item">
                    <span class="skill-name">${type}</span>
                    <div class="skill-bar-container">
                        <div class="skill-bar" style="width: ${percentage}%">${amount.toFixed(0)}</div>
                    </div>
                </div>`;
            }).join('');

        skillsContainer.innerHTML = skillsHtml;
    } else {
        skillsContainer.innerHTML = '<p>No skills data available</p>';
    }
}

function generateXPChart(xpData) {
    const svg = document.getElementById('xp-over-time');
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const padding = { left: 60, right: 20, top: 20, bottom: 30 };
    
    svg.innerHTML = '';
    
    if (xpData.length === 0) return;
    
    const sortedXP = [...xpData].sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
    );
    
    let cumulativeXP = 0;
    const dataPoints = sortedXP.map(transaction => {
        cumulativeXP += transaction.amount;
        return {
            date: new Date(transaction.createdAt),
            xp: cumulativeXP
        };
    });
    
    // Draw chart implementation
    // ... (simplified for brevity)
}

function updateAuditRatios(auditData) {
    const svg = document.getElementById('audit-ratios');
    // ... (implementation similar to profile.js)
}
