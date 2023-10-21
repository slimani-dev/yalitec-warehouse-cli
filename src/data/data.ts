import {select} from "@inquirer/prompts";
import _states from "./states.json";
import _cities from "./cities.json";
import {City, State} from "../../../api-sdk/src/types";

const states = _states as State[];
const cities = _cities as City[];
export const statesSearch = async (query: string | undefined) => {

    return query
        ? states.filter((state: State) => state.name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 10)
        : states.slice(0, 10);
}

// find a state
export const stateFind = async (query: string) => {
    return states.find((state: State) => state.name.toLowerCase().includes(query.toLowerCase())) || null;
}

export const citiesSearch = async (query: string | undefined, state_id?: number) => {
    if (state_id)
        return query
            ? cities.filter((city: City) => city.state_id === state_id && city.name.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 10)
            : cities.filter((city: City) => city.state_id === state_id)
                .slice(0, 10)
    else
        return query
            ? cities.filter((city: City) => city.name.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 10)
            : cities.slice(0, 10);
}

// find a city
export const cityFind = async (query: string) => {
    return cities.find((city: City) => city.name.toLowerCase().includes(query.toLowerCase())) || null;
}

const stateFilter = async (selectedState_id?: number) => {
    let choices = states
        .map((state: State) => ({value: state.id, name: state.name}));
    const selectedState = states.find((state: State) => state.id === selectedState_id)

    if (selectedState) {
        choices = choices.filter(state => state.value !== selectedState.id)
        choices.unshift({value: selectedState.id, name: selectedState.name + ' (selected) :'});
    }

    return select({message: 'State :', choices: choices});
};
const cityFilter = async (state_id: number, selectedCity_id?: number) => {
    let choices = cities.filter((city: City) => city.state_id === state_id)
        .map((state: State) => ({value: state.id, name: state.name}));

    const selectedCity = cities.find((city: City) => city.id === selectedCity_id)

    if (selectedCity) {
        choices = choices.filter(city => city.value !== selectedCity.id)
        choices.unshift({value: selectedCity.id, name: selectedCity.name + ' (selected) :'});
    }

    return select({message: 'City :', choices})
};
export const stateAndCitySearch = async (selectedState_id?: number, selectedCity_id?: number): Promise<{
    state_id: string;
    city_id: string;
}> => {
    const state_id = (await stateFilter(selectedState_id))
    return {
        state_id: state_id?.toString(),
        city_id: (await cityFilter(state_id, selectedCity_id)).toString(),
    }
};
