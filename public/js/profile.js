const logoutButton = document.getElementById('logout-button');

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('hasura_jwt_token');
    window.location.href = '/index.html';
});

let moduleXP = [];
let piscineGoXP = [];
let piscineJsXP = [];
let piscineUxXP = [];
let piscineUiXP = [];
let piscineRustXP = [];

async function fetchProfileData() {
    const jwt = localStorage.getItem('hasura_jwt_token');

    if (!jwt || jwt.split('.').length !== 3) {
        console.error('Invalid JWT:', jwt);
        alert('Invalid authentication token');
        window.location.href = '/index.html';
        return;
    }

    const query = `
        query {
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
                order_by: [{type: desc}, {amount: desc}]
                distinct_on: [type]
                where: {type: {_like: "skill_%"}}
            ) {
                type
                amount
            }

            exercises: progress(
                where: {
                    object: {
                        type: {_eq: "exercise"}
                    }
                },
                order_by: {
                    createdAt: desc
                }
            ) {
                id
                grade
                createdAt
                object {
                    id
                    name
                    type
                }
            }

            skillSummary: transaction_aggregate(
                where: {
                    type: {_like: "skill_%"}
                }
            ) {
                nodes {
                    type
                    amount
                }
                aggregate {
                    count
                }
            }

            piscineGoXP: transaction(
                where: {
                    type: {_eq: "xp"},
                    path: {_like: "%piscine-go%"}
                }
            ) {
                amount
                createdAt
                path
            }

            piscineJsXP: transaction(
                where: {
                    type: {_eq: "xp"},
                    path: {_like: "%piscine-js%"}
                }
            ) {
                amount
                createdAt
                path
            }

            piscineUxXP: transaction(
                where: {
                    type: {_eq: "xp"},
                    path: {_like: "%piscine-ux%"}
                }
            ) {
                amount
                createdAt
                path
            }

            piscineUiXP: transaction(
                where: {
                    type: {_eq: "xp"},
                    path: {_like: "%piscine-ui%"}
                }
            ) {
                amount
                createdAt
                path
            }

            piscineRustXP: transaction(
                where: {
                    type: {_eq: "xp"},
                    path: {_like: "%piscine-rust%"}
                }
            ) {
                amount
                createdAt
                path
            }

            auditsDone: transaction(
                where: {
                    type: {_eq: "up"},
                    path: {_like: "/kisumu/module/%"}
                }
            ) {
                amount
                createdAt
                path
            }

            auditsReceived: transaction(
                where: {
                    type: {_eq: "down"},
                    path: {_like: "/kisumu/module/%"}
                }
            ) {
                amount
                createdAt
                path
            }

            user {
                id
                login
                attrs
                totalUp
                totalUpBonus
                 totalDown
            }
        }
    `;

    try {
        const response = await fetch('https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        const responseData = await response.json();

        if (responseData.errors) {
            console.error('GraphQL Errors:', responseData.errors);
            throw new Error(responseData.errors.map(err => err.message).join(', '));
        }

        if (!responseData.data) {
            throw new Error('No data returned from GraphQL query');
        }

        // Initialize the XP arrays from the response
        moduleXP = responseData.data.moduleXP || [];
        piscineGoXP = responseData.data.piscineGoXP || [];
        piscineJsXP = responseData.data.piscineJsXP || [];
        piscineUxXP = responseData.data.piscineUxXP || [];
        piscineUiXP = responseData.data.piscineUiXP || [];
        piscineRustXP = responseData.data.piscineRustXP || [];

        // Update UI with all the data
        document.getElementById('user-id').textContent = responseData.data.user[0].id || 'N/A';
        document.getElementById('username').textContent = responseData.data.user[0].login || 'N/A';

        // Display skills data
        displaySkills(responseData.data.skills, responseData.data.skillSummary);

        // Get user data for direct XP values
        const userData = responseData.data.user[0];
        
        // Calculate total XP got (totalUp + totalUpBonus)
        const totalXPGot = (userData.totalUp || 0) + (userData.totalUpBonus || 0);
        
        // Total XP done is totalDown
        const totalXPDone = userData.totalDown || 0;
        
        // Calculate audit ratio directly from the response
        const auditRatio = totalXPDone > 0 ? (totalXPGot / totalXPDone).toFixed(2) : 'N/A';

        // Calculate different types of XP for breakdown display
        const moduleXPTotal = moduleXP.reduce((sum, t) => sum + t.amount, 0) || 0;
        const piscineGoTotal = piscineGoXP.reduce((sum, t) => sum + t.amount, 0) || 0;
        const piscineJsTotal = piscineJsXP.reduce((sum, t) => sum + t.amount, 0) || 0;
        const piscineUxTotal = piscineUxXP.reduce((sum, t) => sum + t.amount, 0) || 0;
        const piscineUiTotal = piscineUiXP.reduce((sum, t) => sum + t.amount, 0) || 0;
        const piscineRustTotal = piscineRustXP.reduce((sum, t) => sum + t.amount, 0) || 0;

        // Update UI with separated XP values
        document.getElementById('xp').innerHTML = `
            <div>Module XP: ${(moduleXPTotal / (1000 * 1000)).toFixed(2)} MB</div>
            <div>Piscine Go XP: ${(piscineGoTotal / (1000 * 1000)).toFixed(2)} MB</div>
            <div>Piscine JS XP: ${(piscineJsTotal / (1000 * 1000)).toFixed(2)} MB</div>
            <div>Piscine UX XP: ${(piscineUxTotal / (1000 * 1000)).toFixed(2)} MB</div>
            <div>Piscine UI XP: ${(piscineUiTotal / (1000 * 1000)).toFixed(2)} MB</div>
            <div>Piscine Rust XP: ${(piscineRustTotal / (1000 * 1000)).toFixed(2)} MB</div>
            <div>Total XP: ${((moduleXPTotal + piscineGoTotal + piscineJsTotal + piscineUxTotal + piscineUiTotal + piscineRustTotal) / (1000 * 1000)).toFixed(2)} MB</div>
        `;

        // Update the audit ratios visualization using direct values
        updateAuditRatios({
            done: {
                count: 'N/A', // We don't have count from direct values
                amount: totalXPGot
            },
            received: {
                count: 'N/A', // We don't have count from direct values
                amount: totalXPDone
            },
            ratio: auditRatio
        });

        // Generate graphs after data is loaded
        generateGraphs();
    } catch (error) {
        console.error('Full Error:', error);
        alert('Failed to fetch profile data: ' + error.message);
    }
}

function displaySkills(skills, skillSummary) {
    const skillsContainer = document.getElementById('skills-container');

    // Clear previous content
    skillsContainer.innerHTML = '';

    // Process skills data - data is already ordered by amount desc from the query
    if (skills && skills.length > 0) {
        const skillsHtml = skills.map(skill => {
            const skillType = skill.type.replace('skill_', '').replace(/_/g, ' ');
            const amount = skill.amount;
            
            // Calculate percentage for the circle (capped at 100)
            const percentage = Math.min(amount, 100);
            const radius = 36;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (percentage / 100) * circumference;

            return `
                <div class="skill-item">
                    <div class="skill-progress-circle">
                        <svg viewBox="0 0 80 80">
                            <circle class="skill-progress-background"
                                cx="40" cy="40" r="${radius}"
                            />
                            <circle class="skill-progress-value"
                                cx="40" cy="40" r="${radius}"
                                stroke-dasharray="${circumference}"
                                stroke-dashoffset="${offset}"
                            />
                        </svg>
                        <span class="skill-amount">${amount.toFixed(0)}</span>
                    </div>
                    <span class="skill-name">${skillType}</span>
                </div>
            `;
        }).join('');

        skillsContainer.innerHTML = skillsHtml;
    } else {
        skillsContainer.innerHTML = '<p>No skills data available</p>';
    }
}

function processXPData(transactions) {
    if (!transactions || transactions.length === 0) {
        return [];
    }

    const sorted = transactions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let cumulativeXP = 0;
    return sorted.map(transaction => {
        cumulativeXP += transaction.amount;
        return {
            date: new Date(transaction.createdAt),
            xp: cumulativeXP
        };
    });
}

function generateGraphs() {
    const xpSvg = document.getElementById('xp-over-time');
    if (!xpSvg) return;

    const xpWidth = xpSvg.clientWidth;
    const xpHeight = xpSvg.clientHeight;
    const padding = {
        left: 60,
        right: 20,
        top: 20,
        bottom: 50
    };

    // Clear previous content
    xpSvg.innerHTML = '';

    // Combine all XP transactions into one array
    const allXPTransactions = [
        ...moduleXP,
        ...piscineGoXP,
        ...piscineJsXP,
        ...piscineUxXP,
        ...piscineUiXP,
        ...piscineRustXP
    ];

    // Process the combined data
    const combinedXpData = processXPData(allXPTransactions);

    // Find the overall max XP and date range
    let maxXP = 0;
    let minDate = new Date();
    let maxDate = new Date(0);
    let hasData = false;

    if (combinedXpData.length > 0) {
        hasData = true;
        maxXP = combinedXpData[combinedXpData.length - 1].xp;
        minDate = combinedXpData[0].date;
        maxDate = combinedXpData[combinedXpData.length - 1].date;
    }

    if (!hasData) {
        // Handle no XP data case
        const noDataText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        noDataText.setAttribute('x', xpWidth / 2);
        noDataText.setAttribute('y', xpHeight / 2);
        noDataText.setAttribute('text-anchor', 'middle');
        noDataText.setAttribute('class', 'chart-label');
        noDataText.textContent = 'No XP data available';
        xpSvg.appendChild(noDataText);
        return;
    }

    // Add grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (i / gridLines) * (xpHeight - padding.top - padding.bottom);
        const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gridLine.setAttribute('x1', padding.left);
        gridLine.setAttribute('x2', xpWidth - padding.right);
        gridLine.setAttribute('y1', y);
        gridLine.setAttribute('y2', y);
        gridLine.setAttribute('class', 'chart-grid-line');
        xpSvg.appendChild(gridLine);
    }

    // Draw a single line for combined XP
    if (combinedXpData.length > 0) {
        const dataPoints = combinedXpData;
        let path = 'M ';
        dataPoints.forEach((point, i) => {
            const x = padding.left + ((point.date - minDate) / (maxDate - minDate)) * (xpWidth - padding.left - padding.right);
            const y = padding.top + (xpHeight - padding.top - padding.bottom) - ((point.xp / maxXP) * (xpHeight - padding.top - padding.bottom));
            path += `${x},${y} `;
            if (i < dataPoints.length - 1) path += 'L ';

            // Add a circle for each data point
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', 3); // radius of the dot
            circle.setAttribute('fill', 'var(--chart-line-color)');
            xpSvg.appendChild(circle);
        });

        const xpLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        xpLine.setAttribute('d', path);
        xpLine.setAttribute('class', 'chart-line');
        xpLine.setAttribute('stroke', 'var(--chart-line-color)');
        xpLine.setAttribute('stroke-dasharray', '5,5'); // for dotted line
        xpSvg.appendChild(xpLine);
    }


    // Add Y-axis labels
    for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (i / gridLines) * (xpHeight - padding.top - padding.bottom);
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const value = ((gridLines - i) / gridLines * maxXP / (1000 * 1000)).toFixed(1);
        label.setAttribute('x', padding.left - 10);
        label.setAttribute('y', y);
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('alignment-baseline', 'middle');
        label.setAttribute('class', 'chart-label');
        label.textContent = `${value} MB`;
        xpSvg.appendChild(label);
    }

    // Add X-axis labels
    const startLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    startLabel.setAttribute('x', padding.left);
    startLabel.setAttribute('y', xpHeight - padding.bottom + 20);
    startLabel.setAttribute('class', 'chart-label');
    startLabel.textContent = minDate.toLocaleDateString();
    xpSvg.appendChild(startLabel);

    const endLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    endLabel.setAttribute('x', xpWidth - padding.right);
    endLabel.setAttribute('y', xpHeight - padding.bottom + 20);
    endLabel.setAttribute('text-anchor', 'end');
    endLabel.setAttribute('class', 'chart-label');
    endLabel.textContent = maxDate.toLocaleDateString();
    xpSvg.appendChild(endLabel);
}

function updateAuditRatios(auditData) {
    const svg = document.getElementById('audit-ratios');
    const width = svg.clientWidth;
    const height = svg.clientHeight;

    svg.innerHTML = '';

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40; // Leave some padding

    const totalAmount = auditData.done.amount + auditData.received.amount;
    
    if (totalAmount === 0) {
        // Show empty state
        const emptyText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        emptyText.setAttribute('x', centerX);
        emptyText.setAttribute('y', centerY);
        emptyText.setAttribute('text-anchor', 'middle');
        emptyText.setAttribute('alignment-baseline', 'middle');
        emptyText.setAttribute('class', 'audit-label');
        emptyText.textContent = 'No audit data';
        svg.appendChild(emptyText);
        return;
    }

    // Calculate angles for pie slices based on amounts
    const doneAngle = (auditData.done.amount / totalAmount) * 2 * Math.PI;
    const receivedAngle = (auditData.received.amount / totalAmount) * 2 * Math.PI;

    // Helper function to create pie slice path
    function createPieSlice(startAngle, endAngle, radius, centerX, centerY) {
        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);
        
        const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
        
        return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    }

    // Create pie slices
    let currentAngle = -Math.PI / 2; // Start from top

    // Done slice (XP Got)
    if (auditData.done.amount > 0) {
        const doneSlice = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const endAngle = currentAngle + doneAngle;
        doneSlice.setAttribute('d', createPieSlice(currentAngle, endAngle, radius, centerX, centerY));
        doneSlice.setAttribute('fill', 'var(--audit-done-color)');
        doneSlice.setAttribute('class', 'pie-slice');
        doneSlice.setAttribute('stroke', 'var(--background-color)');
        doneSlice.setAttribute('stroke-width', '2');
        svg.appendChild(doneSlice);
        currentAngle = endAngle;
    }

    // Received slice (XP Done)
    if (auditData.received.amount > 0) {
        const receivedSlice = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const endAngle = currentAngle + receivedAngle;
        receivedSlice.setAttribute('d', createPieSlice(currentAngle, endAngle, radius, centerX, centerY));
        receivedSlice.setAttribute('fill', 'var(--audit-received-color)');
        receivedSlice.setAttribute('class', 'pie-slice');
        receivedSlice.setAttribute('stroke', 'var(--background-color)');
        receivedSlice.setAttribute('stroke-width', '2');
        svg.appendChild(receivedSlice);
    }

    // Add center circle for donut effect (optional)
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', centerX);
    centerCircle.setAttribute('cy', centerY);
    centerCircle.setAttribute('r', radius * 0.4);
    centerCircle.setAttribute('fill', 'var(--background-color)');
    centerCircle.setAttribute('stroke', 'var(--text-color)');
    centerCircle.setAttribute('stroke-width', '1');
    svg.appendChild(centerCircle);

    // Add center text showing ratio (use the direct ratio from the data)
    const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerText.setAttribute('x', centerX);
    centerText.setAttribute('y', centerY - 5);
    centerText.setAttribute('text-anchor', 'middle');
    centerText.setAttribute('alignment-baseline', 'middle');
    centerText.setAttribute('class', 'audit-ratio-text');
    centerText.setAttribute('font-size', '14');
    centerText.setAttribute('font-weight', 'bold');
    centerText.textContent = `Ratio: ${auditData.ratio}`;
    svg.appendChild(centerText);

    // Add legend
    const legendY = height - 30;
    const legendSpacing = 140;
    const legendStartX = centerX - legendSpacing;

    // XP Got legend
    const doneRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    doneRect.setAttribute('x', legendStartX);
    doneRect.setAttribute('y', legendY);
    doneRect.setAttribute('width', '12');
    doneRect.setAttribute('height', '12');
    doneRect.setAttribute('fill', 'var(--audit-done-color)');
    svg.appendChild(doneRect);

    const doneText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    doneText.setAttribute('x', legendStartX + 18);
    doneText.setAttribute('y', legendY + 9);
    doneText.setAttribute('class', 'audit-label');
    doneText.setAttribute('font-size', '12');
    doneText.textContent = `XP Got: ${(auditData.done.amount / (1000 * 1000)).toFixed(1)} MB`;
    svg.appendChild(doneText);

    // XP Done legend
    const receivedRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    receivedRect.setAttribute('x', legendStartX + legendSpacing);
    receivedRect.setAttribute('y', legendY);
    receivedRect.setAttribute('width', '12');
    receivedRect.setAttribute('height', '12');
    receivedRect.setAttribute('fill', 'var(--audit-received-color)');
    svg.appendChild(receivedRect);

    const receivedText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    receivedText.setAttribute('x', legendStartX + legendSpacing + 18);
    receivedText.setAttribute('y', legendY + 9);
    receivedText.setAttribute('class', 'audit-label');
    receivedText.setAttribute('font-size', '12');
    receivedText.textContent = `XP Done: ${(auditData.received.amount / (1000 * 1000)).toFixed(1)} MB`;
    svg.appendChild(receivedText);
}

// Call fetchProfileData when the page loads
document.addEventListener('DOMContentLoaded', fetchProfileData);
