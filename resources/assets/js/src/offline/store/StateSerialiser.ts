import {StoreState, StoreStateSerialised} from "@/src/@types/StoreTypes";

function serialiseState(state: StoreState): StoreStateSerialised {
    return {
        dataModule: state.dataModule,
        settingsModule: state.settingsModule,
        firebaseModule: state.firebaseModule
    }
}

function unserialiseState(state: StoreStateSerialised): StoreState {
    return {
        dataModule: state.dataModule,
        settingsModule: state.settingsModule,
        firebaseModule: state.firebaseModule
    }
}

export default {serialiseState, unserialiseState}