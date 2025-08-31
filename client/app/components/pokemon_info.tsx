import { useState, useEffect, use } from "react";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useGlobalState } from "./../global_states_context";
import axios from "axios";
import sprites from "./../../../data/sprites.json";
import pokedex from "./../../../data/pokedex.json";
import types from "./../../../data/types.json";
import React from "react";
import "./../styles/pokemon_info.css";
import moves from "./../../../data/moves.json";
import abilities from "./../../../data/abilities.json";
import items from "./../../../data/items.json";

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);
import { Bar, Doughnut } from "react-chartjs-2";
import "chart.js/auto";

export default function PokemonInfo() {
    const { selectedData, selectedPokemon, setSelectedPokemon } = useGlobalState();

    const [pokemonUsage, setPokemonUsage] = useState(0);

    useEffect(() => {
        if (!selectedPokemon || !selectedData.data || !selectedData.data[selectedPokemon]) return;

        let rawCount = 0;
        for (const key in selectedData.data[selectedPokemon].Abilities)
            rawCount += selectedData.data[selectedPokemon].Abilities[key];
        rawCount = Math.ceil(rawCount);
        setPokemonUsage(rawCount);
    }, [selectedData, selectedPokemon]);

    const PokemonHeader = () => {
        if (!selectedPokemon || !selectedData.data || !selectedData.data[selectedPokemon]) return <></>;

        const jsonKey = selectedPokemon.toLowerCase().replace(/[-.' ]/g, "");

        return (
            <div className="pokemon-header">
                {/* Left: Pokemon Sprite */}
                <img src={sprites[jsonKey]} alt={`${selectedPokemon} sprite`} />

                {/* Center: Name and Types */}
                <div className="name-and-types">
                    <h1>{selectedPokemon}</h1>
                    <div className="types">
                        {pokedex[jsonKey]?.types.map((type) => (
                            <div
                                key={type}
                                className={`type ${type.toLowerCase()}`}
                                style={{ backgroundColor: types.pokemonTypeColors[type] }}
                            >
                                {type}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Usage Stats */}
                <div className="usage-stats">
                    <div>
                        <div className="stat-label">Raw Count</div>
                        <div className="stat-value">{pokemonUsage}</div>
                    </div>
                    <div>
                        <div className="stat-label">Usage %</div>
                        <div className="stat-value">{(selectedData.data[selectedPokemon].usage * 100).toFixed(2)}%</div>
                    </div>
                </div>
            </div>
        );
    };

    const BaseStats = () => {
        if (!selectedPokemon || !selectedData.data || !selectedData.data[selectedPokemon]) return <></>;
        const jsonKey = selectedPokemon.toLowerCase().replace(/[-.' ]/g, "");
        const baseStats = pokedex[jsonKey]?.baseStats || [];
        const maxStat = 200; // adjust based on your max stat

        const getColor = (value) => {
            const percent = value / maxStat;
            if (value < 100) {
                const green = Math.round(255 * (percent / 0.5));
                return `rgb(255, ${green}, 0)`; // red → green
            } else if (value < 200) {
                const blue = Math.round(255 * ((percent - 0.5) / 0.5));
                const red = Math.round(255 * (1 - (percent - 0.5) / 0.5));
                return `rgb(${red}, 255, ${blue})`; // green → blue
            } else {
                return "rgb(0, 255, 255)";
            }
        };

        const data = {
            labels: ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"],
            datasets: [
                { data: baseStats, backgroundColor: baseStats.map(getColor), borderColor: "black", borderWidth: 1 },
            ],
        };

        const options = {
            indexAxis: "y",
            scales: {
                x: {
                    beginAtZero: true,
                    max: 275,
                    display: false,
                    grid: {
                        display: false,
                    },
                },
                y: {
                    grid: {
                        display: false,
                    },
                },
            },

            categoryPercentage: 1.0, // Removes space between categories
            barPercentage: 1.0,

            plugins: {
                legend: {
                    display: false,
                },
                datalabels: {
                    anchor: "end",
                    align: "end",
                    color: "black",
                    font: {
                        weight: "bold",
                    },
                },
            },
        };

        return (
            <div className="datacontainer">
                <h2> Base Stats</h2>
                <div className="bar-chart">
                    <Bar data={data} options={options} />
                </div>
            </div>
        );
    };

    const MovesList = () => {
        if (!selectedPokemon || !selectedData.data || !selectedData.data[selectedPokemon]) return <></>;
        const movesData = selectedData.data[selectedPokemon].Moves;

        let entries = Object.entries(movesData).sort((a, b) => b[1] - a[1]);

        const Row = ({ index, style }) => {
            const [key, value] = entries[index];
            const usage = (value / pokemonUsage) * 100;
            const name = moves[key]?.name || key;

            return (
                <div className={`moves-row ${index % 2 == 0 ? "even" : "odd"}`} style={style}>
                    <div className="moves-info">
                        <strong>{name}</strong>
                        <span>{usage.toFixed(3)}%</span>
                    </div>
                </div>
            );
        };

        return (
            <div className="datacontainer">
                <h2>Used Moves</h2>
                <div className="subcontainer">
                    <div className="lists">
                        {/* Flex container for the list to expand */}
                        <div style={{ flex: 1 }}>
                            <AutoSizer>
                                {({ height, width }) => (
                                    <FixedSizeList
                                        height={height}
                                        width={width}
                                        itemCount={entries.length}
                                        itemSize={60}
                                    >
                                        {Row}
                                    </FixedSizeList>
                                )}
                            </AutoSizer>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const Abilities = () => {
        if (!selectedPokemon || !selectedData.data || !selectedData.data[selectedPokemon]) return <></>;

        const data = selectedData?.data[selectedPokemon].Abilities || {};
        const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
        const top = sorted.slice(0, 7);
        const rest = sorted.slice(7);

        const labels = top.map(([key]) => abilities[key]?.name || key);
        const values = top.map(([, value]) => Math.ceil(value));

        if (rest.length > 0) {
            labels.push("Others");
            values.push(Math.ceil(rest.reduce((sum, [, value]) => sum + value, 0)));
        }

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
                    borderColor: ["#000"],
                    borderWidth: 2,
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: "right",
                },
                title: {
                    display: false,
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
            <div className="datacontainer">
                <h2>Used Abilities</h2>
                <div className="bar-chart">
                    <Doughnut data={chartData} options={options} />
                </div>
            </div>
        );
    };

    const Teammates = () => {
        if (!selectedPokemon || !selectedData.data || !selectedData.data[selectedPokemon]) return <></>;
        const teammatesData = selectedData.data[selectedPokemon].Teammates;

        let entries = Object.entries(teammatesData).sort((a, b) => b[1] - a[1]);

        const Row = ({ index, style }) => {
            const [key, value] = entries[index];
            const usage = (value / pokemonUsage) * 100;
            const jsonKey = key.toLowerCase().replace(/[-.' ]/g, "");

            return (
                <div
                    className={`moves-row ${index % 2 == 0 ? "even" : "odd"} teammate-row`}
                    style={style}
                    onClick={() => {
                        setSelectedPokemon(key);
                    }}
                >
                    <img src={sprites[jsonKey]} className="teammate-sprite"></img>
                    <div className="moves-info">
                        <strong>{key}</strong>
                        <span>{usage.toFixed(3)}%</span>
                    </div>
                </div>
            );
        };

        return (
            <div className="datacontainer">
                <h2>Teammates</h2>
                <div className="subcontainer">
                    <div className="lists">
                        {/* Flex container for the list to expand */}
                        <div style={{ flex: 1 }}>
                            <AutoSizer>
                                {({ height, width }) => (
                                    <FixedSizeList
                                        height={height}
                                        width={width}
                                        itemCount={entries.length}
                                        itemSize={60}
                                    >
                                        {Row}
                                    </FixedSizeList>
                                )}
                            </AutoSizer>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ItemsList = () => {
        if (!selectedPokemon || !selectedData.data || !selectedData.data[selectedPokemon]) return <></>;
        const itemsData = selectedData.data[selectedPokemon].Items;

        let entries = Object.entries(itemsData).sort((a, b) => b[1] - a[1]);

        const Row = ({ index, style }) => {
            const [key, value] = entries[index];
            const usage = (value / pokemonUsage) * 100;
            const name = items[key]?.name || key;
            return (
                <div className={`moves-row ${index % 2 == 0 ? "even" : "odd"}`} style={style}>
                    <img
                        src={`https://play.pokemonshowdown.com/sprites/itemicons/${name
                            .split(" ")
                            .join("-")
                            .toLowerCase()}.png`}
                        onError={(e) => {
                            e.target.src = "https://play.pokemonshowdown.com/sprites/itemicons/0.png";
                        }}
                    ></img>
                    <div className="moves-info">
                        <strong>{name}</strong>
                        <span>{usage.toFixed(3)}%</span>
                    </div>
                </div>
            );
        };

        return (
            <div className="datacontainer">
                <h2>Used Items</h2>
                <div className="subcontainer">
                    <div className="lists">
                        {/* Flex container for the list to expand */}
                        <div style={{ flex: 1 }}>
                            <AutoSizer>
                                {({ height, width }) => (
                                    <FixedSizeList
                                        height={height}
                                        width={width}
                                        itemCount={entries.length}
                                        itemSize={60}
                                    >
                                        {Row}
                                    </FixedSizeList>
                                )}
                            </AutoSizer>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const SpreadsList = () => {
        if (!selectedPokemon || !selectedData.data || !selectedData.data[selectedPokemon]) return <></>;
        const spreadsData = selectedData.data[selectedPokemon].Spreads;

        let entries = Object.entries(spreadsData).sort((a, b) => b[1] - a[1]);

        const Row = ({ index, style }) => {
            const [key, value] = entries[index];
            const usage = (value / pokemonUsage) * 100;
            const text = key.replace(/:/g, " Nature | ");
            return (
                <div className={`moves-row ${index % 2 == 0 ? "even" : "odd"}`} style={style}>
                    <div className="moves-info">
                        <strong>{text}</strong>
                        <span>{usage.toFixed(3)}%</span>
                    </div>
                </div>
            );
        };

        return (
            <div className="datacontainer">
                <h2>Stat Spreads</h2>
                <div className="subcontainer">
                    <div className="lists">
                        {/* Flex container for the list to expand */}
                        <div style={{ flex: 1 }}>
                            <AutoSizer>
                                {({ height, width }) => (
                                    <FixedSizeList
                                        height={height}
                                        width={width}
                                        itemCount={entries.length}
                                        itemSize={60}
                                    >
                                        {Row}
                                    </FixedSizeList>
                                )}
                            </AutoSizer>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div id="pokemon-info">
            <PokemonHeader />
            <BaseStats />
            <Abilities />
            <MovesList />
            <Teammates />
            <ItemsList />
            <SpreadsList />
        </div>
    );
}
