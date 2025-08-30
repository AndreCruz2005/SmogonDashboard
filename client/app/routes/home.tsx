import { useState, useEffect, use } from "react";
import { FixedSizeList } from "react-window";
import { useGlobalState } from "./../global_states_context";
import AutoSizer from "react-virtualized-auto-sizer";
import axios from "axios";
import { useSearchParams } from "react-router";
import type { Route } from "./+types/home";
import global from "./../global";
import sprites from "./../../../data/sprites.json";
import PokemonInfo from "./../components/pokemon_info.tsx";

export function meta({}: Route.MetaArgs) {
    return [{ title: "SmogonDashboard" }, { name: "description", content: "Welcome to React Router!" }];
}

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [menuVisible, setMenuVisible] = useState(false);

    const {
        months,
        setMonths,
        selectedMonth,
        setSelectedMonth,
        tiers,
        setTiers,
        selectedTier,
        setSelectedTier,
        ratingCutoffs,
        setRatingCutoffs,
        selectedRatingCutoff,
        setSelectedRatingCutoff,
        selectedData,
        setSelectedData,
        selectedPokemon,
        setSelectedPokemon,
    } = useGlobalState();

    async function fetchMonths() {
        try {
            const res = await axios.get(`${global.backend}/months`);
            setMonths(res.data);
            setSelectedMonth(searchParams.get("month") || res.data[res.data.length - 1]);
        } catch (err) {
            console.error("Failed to fetch months:", err);
        }
    }
    async function fetchTier() {
        try {
            if (!months) return;
            const res = await axios.get(`${global.backend}/formats/${selectedMonth}`);
            setTiers(res.data);
            setSelectedTier(searchParams.get("tier") || "gen9ou");
        } catch (err) {
            console.error("Failed to fetch tiers:", err);
        }
    }

    function fetchRatings() {
        const ratings = tiers[selectedTier];
        if (!ratings) return;
        setRatingCutoffs(ratings);

        if (ratings.includes(searchParams.get("rating"))) {
            setSelectedRatingCutoff(searchParams.get("rating"));
        } else if (ratings.includes(selectedRatingCutoff)) {
            setSelectedRatingCutoff(selectedRatingCutoff);
        }
        setSelectedRatingCutoff(ratings[2]);
    }

    async function fetchData() {
        if (!selectedMonth || !selectedTier || !selectedRatingCutoff) return;

        // Update search params
        setSearchParams({
            month: selectedMonth,
            tier: selectedTier,
            rating: selectedRatingCutoff,
        });

        const res = await axios.get(
            `${global.backend}/formats/${selectedMonth}/${selectedTier}-${selectedRatingCutoff}`
        );

        setSelectedData(res.data);
        setSelectedPokemon(res.data ? Object.keys(res.data.data)[0] : "");

        console.log(res.data);
    }

    useEffect(() => {
        fetchMonths();
    }, []);

    useEffect(() => {
        fetchTier();
    }, [selectedMonth]);

    useEffect(() => {
        fetchRatings();
    }, [selectedTier]);

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedTier, selectedRatingCutoff]);

    const Topbar = () => {
        function formatMonthName(month: string) {
            let [y, m, extra] = month.split("-");
            let formatted = `${
                {
                    "01": "January",
                    "02": "February",
                    "03": "March",
                    "04": "April",
                    "05": "May",
                    "06": "June",
                    "07": "July",
                    "08": "August",
                    "09": "September",
                    "10": "October",
                    "11": "November",
                    "12": "December",
                }[m]
            }, ${y}`;
            if (extra) {
                formatted += ` (${extra})`;
            }
            return formatted;
        }
        return (
            <div id="topbar">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                    {months.map((month) => (
                        <option key={month} value={month}>
                            {formatMonthName(month)}
                        </option>
                    ))}
                </select>

                <select value={selectedTier} onChange={(e) => setSelectedTier(e.target.value)}>
                    {Object.keys(tiers).map((tier) => (
                        <option key={tier} value={tier}>
                            {tier}
                        </option>
                    ))}
                </select>

                <label>Rating Cutoff</label>
                <div id="rating-buttons">
                    {ratingCutoffs.map((rating) => (
                        <button
                            key={rating}
                            className={selectedRatingCutoff === rating ? "active" : ""}
                            onClick={() => setSelectedRatingCutoff(rating)}
                        >
                            {rating}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const PokemonList = () => {
        const [searchedPokemon, setSearchedPokemon] = useState("");

        if (!selectedData.data) {
            return <></>;
        }

        // Convert object to entries and sort by usage descending
        let entries = Object.entries(selectedData.data).sort((a, b) => b[1].usage - a[1].usage);
        entries = entries.filter(([key]) => key.toLowerCase().includes(searchedPokemon.toLowerCase()));

        const Row = ({ index, style }) => {
            const [key, value] = entries[index];
            const usage = value.usage * 100;
            const spriteKey = key.toLowerCase().replace(/[-.' ]/g, "");
            return (
                <div
                    className="usage-row"
                    style={style}
                    onClick={() => {
                        setSelectedPokemon(key);
                    }}
                >
                    <img src={sprites[spriteKey]} width={40} height={40} />
                    <div className="usage-info">
                        <strong>{key}</strong>
                        <span>{usage.toFixed(2)}%</span>
                    </div>
                </div>
            );
        };

        return (
            <div id="pokemon-list" className={menuVisible ? "visible" : "hidden"}>
                <Topbar />
                <input
                    onChange={(e) => setSearchedPokemon(e.target.value)}
                    id="search-bar"
                    type="text"
                    placeholder="Search for Pokémon"
                    style={{ margin: "8px", padding: "8px" }}
                />

                {/* Flex container for the list to expand */}
                <div style={{ flex: 1 }}>
                    <AutoSizer>
                        {({ height, width }) => (
                            <FixedSizeList height={height} width={width} itemCount={entries.length} itemSize={60}>
                                {Row}
                            </FixedSizeList>
                        )}
                    </AutoSizer>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: "flex" }}>
            <PokemonList />
            <div
                id="show-menu-button"
                className={menuVisible ? "btn-active" : "btn-inactive"}
                onClick={() => {
                    setMenuVisible(!menuVisible);
                }}
            ></div>
            <PokemonInfo />
        </div>
    );
}
