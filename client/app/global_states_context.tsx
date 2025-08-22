import React, { createContext, useState, useContext } from "react";

// Create context
const GlobalStateContext = createContext(null);

// Create provider component
export function GlobalStateProvider({ children }) {
    const [months, setMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("");

    const [tiers, setTiers] = useState({});
    const [selectedTier, setSelectedTier] = useState("");

    const [ratingCutoffs, setRatingCutoffs] = useState([]);
    const [selectedRatingCutoff, setSelectedRatingCutoff] = useState("");

    const [selectedData, setSelectedData] = useState({});

    const [selectedPokemon, setSelectedPokemon] = useState("");

    return (
        <GlobalStateContext.Provider
            value={{
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
            }}
        >
            {children}
        </GlobalStateContext.Provider>
    );
}

// Custom hook for easier usage
export const useGlobalState = () => useContext(GlobalStateContext);
