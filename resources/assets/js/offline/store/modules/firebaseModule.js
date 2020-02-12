const state = {
    firebaseConfig: {
        apiKey: "",
        authDomain: "xxx.firebaseapp.com",
        databaseURL: "https://xxx.firebaseio.com",
        projectId: "xxx",
        storageBucket: "xxx.appspot.com",
        messagingSenderId: "123",
        appId: "456"
    }
};

const getters = {
};

const mutations = {
    setState(state, stateFromLocalStorage) {
        state.firebaseConfig = stateFromLocalStorage.firebaseConfig || {
            apiKey: "",
            authDomain: "xxx.firebaseapp.com",
            databaseURL: "https://xxx.firebaseio.com",
            projectId: "xxx",
            storageBucket: "xxx.appspot.com",
            messagingSenderId: "123",
            appId: "456"
        };
    },
    setFirebaseConfig(state, firebaseConfig) {
        state.firebaseConfig = firebaseConfig;
    }
};

const actions = {
};


export default {
    state,
    getters,
    mutations,
    actions,
    namespaced: true
};
