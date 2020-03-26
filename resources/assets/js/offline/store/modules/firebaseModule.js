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
    setState(state, newState) {
        state.firebaseConfig = newState.firebaseConfig || {
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
    async setFirebaseConfig(context, firebaseConfig) {
        if(firebaseConfig.apiKey === "") {
            throw new Error("firebase config is wrong, please check it");
        }
        context.commit("setFirebaseConfig", firebaseConfig);
        await context.dispatch("loadStateFromStorage", null, {root: true});
    }
};


export default {
    state,
    getters,
    mutations,
    actions,
    namespaced: true
};
