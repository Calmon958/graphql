/**
 * Profile Module
 */
const Profile = (function() {
  let userData = null;
  
  /**
   * Initialize profile component
   */
  function init() {
    // Set up event listeners for profile section
    setupEventListeners();
  }
  
  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Add any profile-specific event listeners here
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        Auth.logout();
      });
    }
  }
  
  /**
   * Update profile display with user data
   * @param {Object} data - User data from GraphQL
   */
  function updateProfileDisplay(data) {
    console.log('Updating profile display');
    userData = data;
    
    const profileDisplay = document.getElementById('profile-display');
    if (!profileDisplay) {
      console.error('Profile display element not found');
      return;
    }
    
    // Clear loading text
    profileDisplay.innerHTML = '';
    
    // Create profile display
    const displayGrid = document.createElement('div');
    displayGrid.className = 'profile-display-grid';
    
    // Check if data has the expected structure
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Invalid user data format:', data);
      profileDisplay.innerHTML = '<p class="error-message">Error: Invalid user data format</p>';
      return;
    }
    
    // Login/Username
    const loginItem = createProfileItem('Username', data[0].login);
    displayGrid.appendChild(loginItem);
    
    // User ID
    const userIdItem = createProfileItem('User ID', data[0].id);
    displayGrid.appendChild(userIdItem);
    
    // Display Name
    const displayName = data[0].attrs && data[0].attrs.firstName ? 
                    `${data[0].attrs.firstName} ${data[0].attrs.lastName}` : '-';
    const displayNameItem = createProfileItem('Display Name', displayName);
    displayGrid.appendChild(displayNameItem);
    
    // Email
    const email = data[0].attrs && data[0].attrs.email ? data[0].attrs.email : '-';
    const emailItem = createProfileItem('Email', email);
    displayGrid.appendChild(emailItem);
    
    // Country
    const country = data[0].attrs && data[0].attrs.country ? data[0].attrs.country : '-';
    const countryItem = createProfileItem('Country', country);
    displayGrid.appendChild(countryItem);

    // Phone
    const phone = data[0].attrs && data[0].attrs.phone ? data[0].attrs.phone : '-';
    const phoneItem = createProfileItem('Phone', phone);
    displayGrid.appendChild(phoneItem);

    // Gender
    const gender = data[0].attrs && data[0].attrs.gender ? data[0].attrs.gender : '-';
    const genderItem = createProfileItem('Gender', gender);
    displayGrid.appendChild(genderItem);

    // ID
    const id = data[0].attrs && data[0].attrs["ID.NUMBER"] ? data[0].attrs["ID.NUMBER"] : '-';
    const idItem = createProfileItem('ID Number', id);
    displayGrid.appendChild(idItem);
    
    // Bio
    const bio = document.createElement('div');
    bio.className = 'profile-item';
    bio.style.gridColumn = '1 / -1'; // Span all columns
    
    const bioTitle = document.createElement('h4');
    bioTitle.textContent = 'Bio';
    bio.appendChild(bioTitle);
    
    const bioContent = document.createElement('p');
    bioContent.textContent = data[0].attrs && data[0].attrs.bio ? data[0].attrs.bio : 'No bio available.';
    bio.appendChild(bioContent);
    
    displayGrid.appendChild(bio);
    
    profileDisplay.appendChild(displayGrid);
    
    // Update user avatar in navigation
    if (window.Navigation && typeof window.Navigation.setupUserAvatar === 'function') {
      window.Navigation.setupUserAvatar(data);
    }
  }
  
  /**
   * Create a profile item with label and value
   * @param {string} label - Item label
   * @param {string} value - Item value
   * @return {HTMLElement} Profile item element
   */
  function createProfileItem(label, value) {
    const item = document.createElement('div');
    item.className = 'profile-item';
    
    const labelEl = document.createElement('h4');
    labelEl.textContent = label;
    item.appendChild(labelEl);
    
    const valueEl = document.createElement('p');
    valueEl.textContent = value;
    item.appendChild(valueEl);
    
    return item;
  }
  
  /**
   * Update skills display
   * @param {Array} skills - User skills data
   */
  function updateSkillsDisplay(skills) {
    const skillsChart = document.getElementById('skills-chart');
    if (!skillsChart) return;
    
    if (!skills || skills.length === 0) {
      skillsChart.innerHTML = '<p>No skills data available.</p>';
      return;
    }

    // Check if Charts module is defined
    if (typeof Charts === 'undefined') {
      console.error('Charts module is not defined. Make sure charts.js is loaded correctly.');
      skillsChart.innerHTML = '<p>Charts visualization not available.</p>';
      return;
    }

    // Find the maximum amount for each skill type
    const skillTypeMaxes = {};
    for (const skill of skills) {
      if (!skillTypeMaxes[skill.type] || skill.amount > skillTypeMaxes[skill.type]) {
        skillTypeMaxes[skill.type] = skill.amount;
      }
    }
    
    // Convert to array of objects with type and amount
    const topSkillsByType = Object.entries(skillTypeMaxes).map(([type, amount]) => ({
      type,
      amount
    }));
    
    // Sort by amount (descending) and take top 5
    const top5Skills = topSkillsByType
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    // Prepare chart data
    const chartData = top5Skills.map(skill => ({
      name: formatSkillName(skill.type),
      value: skill.amount
    }));

    // Create chart
    Charts.createBarChart('skills-chart', chartData, {
      barColor: (d, i) => APP_CONFIG.CHART_COLORS[i % APP_CONFIG.CHART_COLORS.length]
    });
  }
  
  /**
   * Update recent activity display
   * @param {Object} data - User data with transactions
   */
  function updateRecentActivity(data) {
    const activityEl = document.getElementById('recent-activity');
    if (!activityEl) return;
    
    // Clear loading text
    activityEl.innerHTML = '';
    
    // Get transactions
    const progress = data.progress || [];
    console.log("Trans",progress)
    
    if (progress.length === 0) {
      const noActivity = document.createElement('p');
      noActivity.textContent = 'No recent activity available.';
      activityEl.appendChild(noActivity);
      return;
    }
    
    // Create activity list
    const activityList = document.createElement('ul');
    activityList.className = 'activity-list';
    
    // Add activity items
    progress.slice(0, 5).forEach(transaction => {
      const item = document.createElement('li');
      item.className = 'activity-item';
      
      const title = document.createElement('div');
      const lastSegment = transaction.path.split('/').filter(Boolean).pop();
      title.textContent = formatTransactionType(lastSegment);
      title.className = 'activity-title';

      
      const date = document.createElement('div');
      date.textContent = formatDate(transaction.createdAt);
      date.className = 'activity-date';
      
      item.appendChild(title);
      item.appendChild(date);
      activityList.appendChild(item);
    });
    
    activityEl.appendChild(activityList);
  }
  
  /**
   * Update user overview display
   * @param {Object} data - User data
   */
  function updateUserOverview(data) {
    console.log('Updating user overview with:', JSON.stringify(data));
    
    const overviewEl = document.getElementById('user-overview');
    if (!overviewEl) {
      console.error('User overview element not found');
      return;
    }
    
    // Check if data has the expected structure
    if (!data || !data.user || !Array.isArray(data.user) || data.user.length === 0) {
      console.error('Invalid user data for overview:', data);
      overviewEl.innerHTML = '<p class="error-message">Error: Invalid user data format</p>';
      return;
    }
    
    // Clear loading text
    overviewEl.innerHTML = '';
    
    // Create overview content
    const content = document.createElement('div');
    
    // Login info
    const loginInfo = document.createElement('p');
    loginInfo.innerHTML = `<strong>Username:</strong> ${data.user[0].login}`;
    content.appendChild(loginInfo);
    
    // Audit ratio
    const auditRatio = document.createElement('p');
    auditRatio.innerHTML = `<strong>Audit Ratio:</strong> ${data.user[0].auditRatio ? data.user[0].auditRatio.toFixed(1) : 'N/A'}`;
    content.appendChild(auditRatio);
    
    // Total Up
    const totalUp = document.createElement('p');
    totalUp.innerHTML = `<strong>Audits Done:</strong> ${data.user[0].totalUp || 0}`;
    content.appendChild(totalUp);
    
    // Total Down
    const totalDown = document.createElement('p');
    totalDown.innerHTML = `<strong>Audits Received:</strong> ${data.user[0].totalDown || 0}`;
    content.appendChild(totalDown);
    
    // Transactions count
    const transactions = data.user[0].transactions || [];
    const transactionsInfo = document.createElement('p');
    transactionsInfo.innerHTML = `<strong>Recent Transactions:</strong> ${transactions.length}`;
    content.appendChild(transactionsInfo);
    
    // XP
    const xpTransactions = transactions.filter(tx => tx.type === "xp") || [];
    const totalXPBytes = xpTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    let displayValue, unit;
    if (totalXPBytes >= 1000000) {
      displayValue = (totalXPBytes / 1000000).toFixed(2);
      unit = 'MB';
    } else if (totalXPBytes >= 1000) {
      displayValue = (totalXPBytes / 1000).toFixed(2);
      unit = 'KB';
    } else {
      displayValue = totalXPBytes;
      unit = 'B';
    }
    
    const xpInfo = document.createElement('p');
    xpInfo.innerHTML = `<strong>XP:</strong> ${displayValue} ${unit}`;
    content.appendChild(xpInfo);

    // Grade
    const gradeInfo = document.createElement('p');
    let totalGrade = 0;

    if (data.progress && data.progress.length > 0) {
      data.progress.forEach(entry => {
        if (entry.grade !== null && entry.grade !== undefined) {
          const gradeValue = typeof entry.grade === 'string' ? parseFloat(entry.grade) : entry.grade;
          
          if (!isNaN(gradeValue)) {
            totalGrade += gradeValue;
          }
        }
      });

      gradeInfo.innerHTML = `<strong>Grade:</strong> ${totalGrade.toFixed(2)}%`;
    } else {
      gradeInfo.innerHTML = `<strong>Grade:</strong> N/A (No grades available)`;
    }

    content.appendChild(gradeInfo);
    overviewEl.appendChild(content);
  }

  function updateAuditOverview(data) {
    const auditEl = document.getElementById('audit-overview');
    if (!auditEl) return;
    // Clear loading text
    auditEl.innerHTML = '';
    // Create overview content
    const content = document.createElement('div');
    
    const audits = data.user[0]?.audits || [];
    if (audits.length === 0) {
      auditEl.innerHTML = '<p>No active audits found.</p>';
      return;
    }
    
    // Audit count
    const auditCount = document.createElement('p');
    auditCount.innerHTML = `<strong>Active Audits:</strong> ${audits.length}`;
    content.appendChild(auditCount);
    
    // Latest audit info
    const latestAudit = audits[0];
    
    // Closed At
    const closedAt = document.createElement('p');
    closedAt.innerHTML = `<strong>Status:</strong> ${latestAudit.closedAt ? 'Closed' : 'Open'}`;
    content.appendChild(closedAt);

    //path
    const path = document.createElement('p');
    const fullPath = latestAudit.group.path;
    const lastSegment = fullPath.split('/').filter(Boolean).pop(); // gets last non-empty part
    path.innerHTML = `<strong>Project:</strong> ${lastSegment}`;
    content.appendChild(path);

    
    // Group Info if exists
    if (latestAudit.group) {
      const groupInfo = document.createElement('p');
      groupInfo.innerHTML = `<strong>Group Captain:</strong> ${latestAudit.group.captainLogin}`;
      content.appendChild(groupInfo);
      
      const membersCount = document.createElement('p');
      membersCount.innerHTML = `<strong>Group Members:</strong> ${latestAudit.group.members.length}`;
      content.appendChild(membersCount);
    }
    
    // Private Code
    const privateCode = document.createElement('p');
    privateCode.innerHTML = `<strong>Private Code:</strong> ${latestAudit.private?.code || 'N/A'}`;
    content.appendChild(privateCode);
    
    // Append content to audit element
    auditEl.appendChild(content);
  }
  
  
  /**
   * Update the progress timeline chart
   * @param {Object} data - User data with progress information
   */
  function updateProgressTimeline(data) {
    const timelineEl = document.getElementById('progress-timeline');
    if (!timelineEl) return;
    
    // Check if Charts module is defined
    if (typeof Charts === 'undefined') {
      console.error('Charts module is not defined. Make sure charts.js is loaded correctly.');
      timelineEl.innerHTML = '<p>Charts visualization not available.</p>';
      return;
    }
    
    const progress = data.progress || [];
    
    if (progress.length === 0) {
      timelineEl.innerHTML = '<p>No progress data available.</p>';
      return;
    }
    
    // Transform data for chart and ensure valid values
    let chartData = [];
    
    try {
      // Filter for valid entries with both date and grade
      chartData = progress
        .filter(p => {
          // Ensure we have a valid date and grade
          const hasValidDate = p.createdAt && !isNaN(new Date(p.createdAt).getTime());
          const hasValidGrade = p.grade !== null && p.grade !== undefined && !isNaN(parseFloat(p.grade));
          return hasValidDate && hasValidGrade;
        })
        .slice(0, 15)  // Take only the first 15 entries
        .map(p => {
          // Convert to the format expected by the chart
          return {
            x: formatDate(p.createdAt, true),  // Format the date
            y: parseFloat(p.grade)             // Ensure grade is a number
          };
        });
      
      // Sort by date
      chartData.sort((a, b) => new Date(a.x) - new Date(b.x));
      
      console.log('Progress timeline data:', chartData);
    } catch (error) {
      console.error('Error processing progress data:', error);
      timelineEl.innerHTML = '<p>Error processing progress data.</p>';
      return;
    }
    
    // Check if we have valid data after filtering
    if (chartData.length === 0) {
      timelineEl.innerHTML = '<p>No valid progress data available.</p>';
      return;
    }
    
    // Create chart with validated data
    try {
      // Clear previous content
      timelineEl.innerHTML = '';
      
      // Create chart with improved visibility
      Charts.createLineChart('progress-timeline', chartData, {
        showArea: true,
        lineColor: APP_CONFIG.CHART_COLORS[0],
        pointColor: APP_CONFIG.CHART_COLORS[0],
        height: 300,  // Increase height for better visibility
        margin: { top: 20, right: 30, bottom: 50, left: 50 },  // Increase margins
        showAxes: true,
        gridLines: true,
        animate: true,
        showPoints: true,
        showTooltips: true,
        lineWidth: 3  // Thicker line for better visibility
      });
    } catch (error) {
      console.error('Error creating progress timeline chart:', error);
      timelineEl.innerHTML = '<p>Error creating chart. Check console for details.</p>';
    }
  }
  
  /**
   * Update audit ratio chart
   * @param {Object} data - User data with audit ratio
   */
  function updateAuditRatioChart(data) {
    const chartEl = document.getElementById('audit-ratio-chart');
    if (!chartEl) return;

    // Clear previous content
    chartEl.innerHTML = '';
  
    // Check if we have user data
    if (!data || !data.user || !data.user[0]) {
      chartEl.innerHTML = '<p>No audit data available.</p>';
      return;
    }
  
    const userData = data.user[0];
  
    // Get the audit totals
    const upTotal = userData.totalUp || 0;
    const downTotal = userData.totalDown || 0;

    // Handle empty data
    if (upTotal === 0 && downTotal === 0) {
      chartEl.innerHTML = '<p>No audits data available.</p>';
      return;
    }

    // Calculate ratio and percentages
    const total = upTotal + downTotal;
    const upPercentage = (upTotal / total) * 100;
    const downPercentage = (downTotal / total) * 100;
  
    // Create SVG element
    const width = chartEl.clientWidth;
    const height = chartEl.clientHeight || 200;
    const radius = Math.min(width, height) / 2 - 20;
  
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.style.overflow = 'visible';
  
    // Create chart group
    const chart = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chart.setAttribute('transform', `translate(${width / 2},${height / 2})`);
    svg.appendChild(chart);
  
    // Create pie slices
    const upSlice = createPieSlice(upPercentage, '#4caf50', 'Audits Done', upTotal);
    const downSlice = createPieSlice(downPercentage, '#f44336', 'Audits Received', downTotal, upPercentage);
  
    chart.appendChild(upSlice);
    chart.appendChild(downSlice);
  
    // Add legend
    const legend = createLegend();
    svg.appendChild(legend);
  
    // Add to DOM
    chartEl.appendChild(svg);
  
    // Helper function to create pie slice
    function createPieSlice(percentage, color, label, value, startPercentage = 0) {
      const slice = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      // Calculate angles
      const startAngle = (startPercentage / 100) * Math.PI * 2;
      const endAngle = ((startPercentage + percentage) / 100) * Math.PI * 2;
      
      // Create path
      const x1 = radius * Math.sin(startAngle);
      const y1 = -radius * Math.cos(startAngle);
      const x2 = radius * Math.sin(endAngle);
      const y2 = -radius * Math.cos(endAngle);
      
      const largeArc = percentage > 50 ? 1 : 0;
      
      const pathData = [
        `M 0 0`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        `Z`
      ].join(' ');
      
      slice.setAttribute('d', pathData);
      slice.setAttribute('fill', color);
      slice.setAttribute('data-label', label);
      slice.setAttribute('data-value', value);
      
      // Add hover effect
      slice.addEventListener('mouseover', function() {
        this.setAttribute('opacity', '0.8');
        
        // Show tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        tooltip.textContent = `${label}: ${value}`;
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0,0,0,0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '3px';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '1000';
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = chartEl.getBoundingClientRect();
        tooltip.style.left = `${rect.left + width / 2}px`;
        tooltip.style.top = `${rect.top + height / 2}px`;
        
        this._tooltip = tooltip;
      });
      
      slice.addEventListener('mouseout', function() {
        this.setAttribute('opacity', '1');
        if (this._tooltip) {
          document.body.removeChild(this._tooltip);
          this._tooltip = null;
        }
      });
      
      return slice;
    }
  
    // Helper function to create legend
    function createLegend() {
      const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      legend.setAttribute('transform', `translate(10, ${height - 30})`);
      
      // Audits Done legend item
      const doneRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      doneRect.setAttribute('width', 15);
      doneRect.setAttribute('height', 15);
      doneRect.setAttribute('fill', '#4caf50');
      legend.appendChild(doneRect);
      
      const doneText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      doneText.setAttribute('x', 20);
      doneText.setAttribute('y', 12);
      doneText.textContent = 'Audits Done';
      doneText.style.fontSize = '12px';
      legend.appendChild(doneText);
      
      // Audits Received legend item
      const receivedRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      receivedRect.setAttribute('width', 15);
      receivedRect.setAttribute('height', 15);
      receivedRect.setAttribute('x', 100);
      receivedRect.setAttribute('fill', '#f44336');
      legend.appendChild(receivedRect);
      
      const receivedText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      receivedText.setAttribute('x', 120);
      receivedText.setAttribute('y', 12);
      receivedText.textContent = 'Audits Received';
      receivedText.style.fontSize = '12px';
      legend.appendChild(receivedText);
      
      return legend;
    }
  }
  
  /**
   * Update skills distribution chart using direct SVG
   * @param {Array} skills - User skills data
   */
  function updateSkillsDistributionChart(skills) {
    const chartEl = document.getElementById('skills-distribution-chart');
    if (!chartEl) return;
    
    // Clear previous content
    chartEl.innerHTML = '';
    
    if (!skills || skills.length === 0) {
      chartEl.innerHTML = '<p>No skills data available.</p>';
      return;
    }

    // Find the maximum amount for each skill type
    const skillTypeMaxes = {};
    for (const skill of skills) {
      if (!skillTypeMaxes[skill.type] || skill.amount > skillTypeMaxes[skill.type]) {
        skillTypeMaxes[skill.type] = skill.amount;
      }
    }
    
    // Convert to array of objects with type and amount
    const topSkillsByType = Object.entries(skillTypeMaxes).map(([type, amount]) => ({
      type: formatSkillName(type),
      amount
    }));
    
    // Sort by amount (descending) and take top 5
    const top5Skills = topSkillsByType
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    // Create SVG element
    const width = chartEl.clientWidth;
    const height = chartEl.clientHeight || 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    
    // Create chart group
    const chart = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chart.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    svg.appendChild(chart);
    
    // Find max value for scaling
    const maxValue = Math.max(...top5Skills.map(s => s.amount));
    
    // Create bars
    const barWidth = chartWidth / top5Skills.length - 10;
    
    top5Skills.forEach((skill, i) => {
      const barHeight = (skill.amount / maxValue) * chartHeight;
      const x = i * (barWidth + 10);
      const y = chartHeight - barHeight;
      
      // Create bar
      const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bar.setAttribute('x', x);
      bar.setAttribute('y', y);
      bar.setAttribute('width', barWidth);
      bar.setAttribute('height', barHeight);
      bar.setAttribute('fill', APP_CONFIG.CHART_COLORS[i % APP_CONFIG.CHART_COLORS.length]);
      
      // Add animation
      const heightAnimation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      heightAnimation.setAttribute('attributeName', 'height');
      heightAnimation.setAttribute('from', 0);
      heightAnimation.setAttribute('to', barHeight);
      heightAnimation.setAttribute('dur', '0.5s');
      heightAnimation.setAttribute('fill', 'freeze');
      bar.appendChild(heightAnimation);
      
      const yAnimation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      yAnimation.setAttribute('attributeName', 'y');
      yAnimation.setAttribute('from', chartHeight);
      yAnimation.setAttribute('to', y);
      yAnimation.setAttribute('dur', '0.5s');
      yAnimation.setAttribute('fill', 'freeze');
      bar.appendChild(yAnimation);
      
      // Add hover effect
      bar.addEventListener('mouseover', function() {
        this.setAttribute('opacity', '0.8');
        
        // Show tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        tooltip.textContent = `${skill.type}: ${skill.amount}`;
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0,0,0,0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '3px';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '1000';
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = chartEl.getBoundingClientRect();
        tooltip.style.left = `${rect.left + x + barWidth / 2}px`;
        tooltip.style.top = `${rect.top + y - 30}px`;
        
        this._tooltip = tooltip;
      });
      
      bar.addEventListener('mouseout', function() {
        this.setAttribute('opacity', '1');
        if (this._tooltip) {
          document.body.removeChild(this._tooltip);
          this._tooltip = null;
        }
      });
      
      chart.appendChild(bar);
      
      // Add label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x + barWidth / 2);
      label.setAttribute('y', chartHeight + 20);
      label.setAttribute('text-anchor', 'middle');
      label.textContent = skill.type;
      label.style.fontSize = '12px';
      chart.appendChild(label);
      
      // Add value
      const value = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      value.setAttribute('x', x + barWidth / 2);
      value.setAttribute('y', y - 5);
      value.setAttribute('text-anchor', 'middle');
      value.textContent = skill.amount;
      value.style.fontSize = '12px';
      chart.appendChild(value);
    });
    
    // Add y-axis
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', 0);
    yAxis.setAttribute('y1', 0);
    yAxis.setAttribute('x2', 0);
    yAxis.setAttribute('y2', chartHeight);
    yAxis.setAttribute('stroke', '#ccc');
    yAxis.setAttribute('stroke-width', 1);
    chart.appendChild(yAxis);
    
    // Add x-axis
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', 0);
    xAxis.setAttribute('y1', chartHeight);
    xAxis.setAttribute('x2', chartWidth);
    xAxis.setAttribute('y2', chartHeight);
    xAxis.setAttribute('stroke', '#ccc');
    xAxis.setAttribute('stroke-width', 1);
    chart.appendChild(xAxis);
    
    // Add to DOM
    chartEl.appendChild(svg);
  }
  
  /**
   * Update events chart
   * @param {Object} data - User data with events
   */
  function updateEventsChart(data) {
    const chartEl = document.getElementById('events-chart');
    if (!chartEl) return;

    // Check if Charts module is defined
    if (typeof Charts === 'undefined') {
      console.error('Charts module is not defined. Make sure charts.js is loaded correctly.');
      chartEl.innerHTML = '<p>Charts visualization not available.</p>';
      return;
    }

    const transactions = data.transaction || [];

    // Filter for 'xp' type transactions
    const xpEvents = transactions.filter(tx => tx.type === 'xp');

    if (xpEvents.length === 0) {
      chartEl.innerHTML = '<p>No XP events data available.</p>';
      return;
    }

    try {
      // Filter for valid entries and transform data
      const chartData = xpEvents
        .filter(tx => {
          // Ensure we have a valid date and amount
          const hasValidDate = tx.createdAt && !isNaN(new Date(tx.createdAt).getTime());
          const hasValidAmount = tx.amount !== null && tx.amount !== undefined && !isNaN(parseFloat(tx.amount));
          return hasValidDate && hasValidAmount;
        })
        .slice(0, 10)  // Take only the first 10 entries
        .map(tx => {
          return {
            x: formatDate(tx.createdAt, true),  // Format the timestamp
            y: (parseFloat(tx.amount) / 10000) || 0  // Use amount as Y-axis, ensure it's a number
          };
        });
      
      // Sort by date
      chartData.sort((a, b) => new Date(a.x) - new Date(b.x));
      
      console.log('Events chart data:', chartData);
      
      // Check if we have valid data after filtering
      if (chartData.length === 0) {
        chartEl.innerHTML = '<p>No valid XP events data available.</p>';
        return;
      }

      // Call the line chart renderer with validated data
      Charts.createLineChart('events-chart', chartData, {
        showArea: true,
        lineColor: APP_CONFIG.CHART_COLORS[1],
        pointColor: APP_CONFIG.CHART_COLORS[1]
      });
    } catch (error) {
      console.error('Error creating events chart:', error);
      chartEl.innerHTML = '<p>Error creating chart. Check console for details.</p>';
    }
  }
  
  /**
   * Update all visualization charts
   * @param {Object} data - User data from GraphQL
   */
  function updateVisualizations(data) {
    if (!data) return;
    console.log("Update1", data);
    
    // Update user overview
    updateUserOverview(data);
    
    // Update audit overview
    updateAuditOverview(data);
    
    // Update recent activity with transactions
    if (data.user && data.user[0] && data.user[0].transactions) {
      updateRecentActivity({
        progress: data.user[0].transactions
      });
    }
    
    // Update audit ratio chart (using direct SVG)
    if (data.user && data.user[0]) {
      updateAuditRatioChart(data);
    }
    
    // Update progress timeline with custom implementation
    if (data.user && data.user[0] && data.user[0].progresses) {
      updateProgressTimeline({
        progress: data.user[0].progresses
      });
    }
  }
  
  /**
   * Format skill name from type string
   * @param {string} type - Skill type string
   * @return {string} Formatted skill name
   */
  function formatSkillName(type) {
    if (!type) return 'Unknown';
    
    // Remove skill_ prefix
    let name = type.replace('skill_', '');
    
    // Replace underscores with spaces
    name = name.replace(/_/g, ' ');
    
    // Capitalize words
    name = name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return name;
  }
  
  /**
   * Format transaction type
   * @param {string} type - Transaction type
   * @return {string} Formatted transaction type
   */
  function formatTransactionType(type) {
    if (!type) return 'Unknown';
    
    // Replace underscores with spaces
    let name = type.replace(/_/g, ' ');
    
    // Capitalize words
    name = name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return name;
  }
  
  /**
   * Format date string
   * @param {string} dateString - Date string
   * @param {boolean} shortFormat - Whether to use short format
   * @return {string} Formatted date string
   */
  function formatDate(dateString, shortFormat = false) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return 'Invalid date';
    }
    
    if (shortFormat) {
      // Short format: MM/DD/YY
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(2)}`;
    } else {
      // Full format: Month DD, YYYY
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return date.toLocaleDateString('en-US', options);
    }
  }

  /**
   * Display profile with user data
   * @param {Object} data - User data from GraphQL
   */
  function displayProfile(data) {
    console.log('Displaying profile with data:', data);
    
    // Update profile display
    updateProfileDisplay(data.user);
    
    // Update user overview
    updateUserOverview(data);
    
    // Update visualizations
    updateVisualizations(data);
    
    // Setup navigation with user data
    if (window.Navigation && typeof window.Navigation.setupUserAvatar === 'function') {
      window.Navigation.setupUserAvatar(data.user);
    }
  }
  
  // Public API
  return {
    init,
    updateProfileDisplay,
    updateVisualizations,
    displayProfile
  };
})();
