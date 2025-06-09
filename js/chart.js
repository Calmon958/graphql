import { Chart } from 'chart.js/auto';

export const createXPChart = (data, ctx) => {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => new Date(d.createdAt).toLocaleDateString()),
            datasets: [{
                label: 'XP Progress',
                data: data.map(d => d.amount),
                borderColor: '#1DCD9F',
                backgroundColor: 'rgba(29, 205, 159, 0.2)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#169976' },
                    ticks: { color: '#a0b3c7' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#a0b3c7' }
                }
            }
        }
    });
};