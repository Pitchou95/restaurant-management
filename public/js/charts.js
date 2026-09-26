/**
 * Chart.js Visualizations for GourmetHub Analytics Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
  const dataElement = document.getElementById('analyticsData');
  if (!dataElement) return;

  let analyticsData;
  try {
    analyticsData = JSON.parse(dataElement.textContent);
  } catch (e) {
    console.error('Failed to parse analytics data:', e);
    return;
  }

  const { categoryStats, dietaryStats, chefStats } = analyticsData;

  // Global Chart.js styling defaults
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = '"Plus Jakarta Sans", sans-serif';
  Chart.defaults.font.size = 12;

  // Vibrant Palette
  const colors = [
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
  ];

  // 1. Category Average Price Bar Chart
  const priceCtx = document.getElementById('categoryPriceChart');
  if (priceCtx && categoryStats) {
    const labels = categoryStats.map((c) => c._id);
    const avgPrices = categoryStats.map((c) => parseFloat((c.avgPrice || 0).toFixed(2)));

    new Chart(priceCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Avg Price ($)',
            data: avgPrices,
            backgroundColor: '#f59e0b',
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` $${ctx.parsed.y.toFixed(2)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' },
          },
          y: {
            grid: { color: 'rgba(34, 47, 67, 0.5)' },
            ticks: {
              color: '#94a3b8',
              callback: (value) => `$${value}`,
            },
          },
        },
      },
    });
  }

  // 2. Menu Breakdown by Category (Doughnut)
  const distCtx = document.getElementById('categoryDistributionChart');
  if (distCtx && categoryStats) {
    const labels = categoryStats.map((c) => c._id);
    const counts = categoryStats.map((c) => c.count);

    new Chart(distCtx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 2,
            borderColor: '#121826',
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#cbd5e1', boxWidth: 14, padding: 12 },
          },
        },
        cutout: '68%',
      },
    });
  }

  // 3. Dietary Composition (Pie/Doughnut)
  const dietCtx = document.getElementById('dietaryChart');
  if (dietCtx && dietaryStats) {
    const labels = dietaryStats.map((d) => (d._id ? 'Vegetarian' : 'Standard / Meat & Seafood'));
    const counts = dietaryStats.map((d) => d.count);

    new Chart(dietCtx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: ['#10b981', '#f43f5e'],
            borderWidth: 2,
            borderColor: '#121826',
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#cbd5e1', boxWidth: 14, padding: 12 },
          },
        },
        cutout: '60%',
      },
    });
  }

  // 4. Chef Specialties (Horizontal Bar)
  const chefCtx = document.getElementById('chefSpecialtyChart');
  if (chefCtx && chefStats) {
    const labels = chefStats.map((s) => s._id);
    const counts = chefStats.map((s) => s.count);

    new Chart(chefCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Chefs Count',
            data: counts,
            backgroundColor: '#3b82f6',
            borderRadius: 6,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { color: 'rgba(34, 47, 67, 0.5)' },
            ticks: { stepSize: 1, color: '#94a3b8' },
          },
          y: {
            grid: { display: false },
            ticks: { color: '#cbd5e1', font: { size: 11 } },
          },
        },
      },
    });
  }
});
