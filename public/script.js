// Function to fetch statistics from the backend for a specified class name
async function fetchStatistics() {
    const className = document.getElementById('classInput').value.trim();  // Get and trim class name input
    if (!className) {
        alert("Please enter a class name.");
        return;
    }

    console.log(`Fetching statistics for class: ${className}`);

    try {
        const response = await fetch(`/statistics?className=${encodeURIComponent(className)}`);
        const data = await response.json();

        // Handle the case where the class is not found (404 response)
        if (response.status === 404) {
            alert(data.message || "Class not found or no data available.");
            return;
        }

        renderChart(data, className);  // Pass both data and className to renderChart
    } catch (error) {
        console.error('Error fetching statistics:', error);
        alert("An error occurred while fetching statistics.");
    }
}

// Function to render the chart using the fetched data
function renderChart(data, className) {
    // Map data to display question numbers (e.g., "Question 1", "Question 2", etc.)
    const questionNumbers = data.map((_, index) => `Question ${index + 1}`);
    const ctx = document.getElementById('statsChart').getContext('2d');
    
    // Destroy the previous chart (if any) before creating a new one
    if (window.chartInstance) {
        window.chartInstance.destroy();
    }

    // Create a new Chart instance
    window.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: questionNumbers,
            datasets: [
                {
                    label: 'Number of Students Passed',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: { 
                    beginAtZero: true,
                    title: { display: true, text: 'Number of Students Passed' }
                },
                x: { 
                    title: { display: true, text: 'Question Number' }
                }
            },
            plugins: {
                title: { 
                    display: true, 
                    text: `Performance Report for ${className}`  // Display class name in the chart title
                }
            }
        }
    });
}

// Event listener for the button click
document.getElementById('submitBtn').addEventListener('click', fetchStatistics);
