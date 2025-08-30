import React, { useEffect, useRef } from "react";
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Title, Tooltip, Legend, ChartDataLabels);

// SOLUTION 1: Using useEffect to destroy chart on unmount
const DoughnutChart = ({ data, title, chartId }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        // Cleanup function to destroy chart when component unmounts
        return () => {
            const chartInstance = ChartJS.getChart(chartId);
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    }, [chartId]);

    const labels = Object.keys(data);
    const values = Object.values(data);

    const chartData = {
        labels: labels,
        datasets: [
            {
                data: values,
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                    "#FF6384",
                    "#C9CBCF",
                ],
                borderColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#FF6384", "#C9CBCF"],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: title || "Data Distribution",
            },
            datalabels: {
                display: true,
                color: "white",
                font: {
                    weight: "bold",
                    size: 12,
                },
                formatter: (value, context) => {
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${percentage}%`;
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.raw / total) * 100).toFixed(1);
                        return `${context.label}: ${context.raw} (${percentage}%)`;
                    },
                },
            },
        },
    };

    return (
        <div style={{ width: "400px", height: "400px", margin: "20px" }}>
            <Doughnut
                ref={chartRef}
                data={chartData}
                options={options}
                id={chartId} // Important: unique ID for each chart
            />
        </div>
    );
};

// SOLUTION 2: Alternative approach with key prop
const DoughnutChartWithKey = ({ data, title, uniqueKey }) => {
    const labels = Object.keys(data);
    const values = Object.values(data);

    const chartData = {
        labels: labels,
        datasets: [
            {
                data: values,
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                    "#FF6384",
                    "#C9CBCF",
                ],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: title || "Data Distribution",
            },
            datalabels: {
                display: true,
                color: "white",
                font: {
                    weight: "bold",
                    size: 12,
                },
                formatter: (value, context) => {
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${percentage}%`;
                },
            },
        },
    };

    return (
        <div style={{ width: "400px", height: "400px", margin: "20px" }}>
            <Doughnut
                key={uniqueKey} // React key forces re-render with new instance
                data={chartData}
                options={options}
            />
        </div>
    );
};

// USAGE EXAMPLE:
export default function MultipleChartsPage() {
    const salesData = { "Product A": 150, "Product B": 80, "Product C": 200 };
    const marketingData = { "Social Media": 60, Email: 40, Ads: 100 };
    const regionData = { North: 120, South: 90, East: 110, West: 80 };

    return (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
            {/* Method 1: Using unique chartId */}
            <DoughnutChart data={salesData} title="Sales Distribution" chartId="sales-chart" />
            <DoughnutChart data={marketingData} title="Marketing Channels" chartId="marketing-chart" />
            <DoughnutChart data={regionData} title="Regional Sales" chartId="region-chart" />

            {/* Method 2: Using unique keys */}
            <DoughnutChartWithKey data={salesData} title="Sales (Key Method)" uniqueKey="chart-1" />
            <DoughnutChartWithKey data={marketingData} title="Marketing (Key Method)" uniqueKey="chart-2" />
        </div>
    );
}
