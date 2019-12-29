import moment from "moment";

const state = {
    posts: {
        1: {
            "id": 1,
            "user_id": 1,
            "title": "Foo",
            "body": "Foo body",
            "created_at": moment().format(),
            "updated_at": moment().format(),
        },
        2: {
            "id": 2,
            "user_id": 1,
            "title": "Bar",
            "body": "Bar body",
            "created_at": moment().format(),
            "updated_at": moment().format(),
        },
        3: {
            "id": 3,
            "user_id": 1,
            "title": "Baz",
            "body": "Baz body",
            "created_at": moment().format(),
            "updated_at": moment().format(),
        },
        4: {
            "id": 4,
            "user_id": 1,
            "title": "Foobar",
            "body": "Foobar body",
            "created_at": moment().format(),
            "updated_at": moment().format(),
        },
        5: {
            "id": 5,
            "user_id": 1,
            "title": "Foobaz",
            "body": "Foobaz body",
            "created_at": moment().format(),
            "updated_at": moment().format(),
        },
        6: {
            "id": 6,
            "user_id": 1,
            "title": "Foobarbaz",
            "body": "Foobarbaz body",
            "created_at": moment().format(),
            "updated_at": moment().format(),
        },
        7: {
            "id": 7,
            "user_id": 1,
            "title": "Barbaz",
            "body": "Barbaz body",
            "created_at": moment().format(),
            "updated_at": moment().format(),
        }
    },
    links: [
        {
            id: 1,
            source: 1,
            target: 2,
            type: "reply",
            graph: "default"
        },
        {
            id: 2,
            source: 1,
            target: 3,
            type: "reply",
            graph: "default"
        },
        {
            id: 3,
            source: 2,
            target: 4,
            type: "reply",
            graph: "default"
        },
        {
            id: 4,
            source: 3,
            target: 5,
            type: "reply",
            graph: "default"
        },
        {
            id: 5,
            source: 5,
            target: 6,
            type: "reply",
            graph: "default"
        },
        {
            id: 6,
            source: 6,
            target: 7,
            type: "reply",
            graph: "default"
        },

        {
            id: 7,
            source: 1,
            target: 2,
            type: "reply",
            graph: "index"
        },
        {
            id: 8,
            source: 1,
            target: 3,
            type: "reply",
            graph: "index"
        },
        {
            id: 9,
            source: 1,
            target: 7,
            type: "reply",
            graph: "index"
        }
    ],
    
    graphs: {
        "default": {
            name: "default",
            nodes: [1, 2, 3, 4, 5, 6, 7]
        },
        "index": {
            name: "index",
            nodes: [1, 2, 3, 4, 7],
        }
    },

    selectedPostId: null,
    selectedGraphNames: ["default"]
};

const getters = {
    newPostId(state, getters, rootState) {
        const highestPostId = Math.max(Object.keys(state.posts));
        return highestPostId + 1;
    },
    graphNames(state) {
        return Object.keys(state.graphs);
    },
    
    postsInSelectedGraph(state) {
        let nodes = [];
        for (let selectedGraphName of state.selectedGraphNames) {
            nodes = nodes.concat(state.graphs[selectedGraphName].nodes);
        }
        const uniqueNodes = [...new Set(nodes)];
        return uniqueNodes.map(id => state.posts[id]);
    },
    linksInSelectedGraph(state) {
        return state.links
            .filter(link => state.selectedGraphNames.includes(link.graph));
    },
};

const mutations = {
    setSelectedPostId(state, selectedPostId) {
        state.selectedPostId = selectedPostId;
    },
    setSelectedGraphNames(state, selectedGraphNames) {
        state.selectedGraphNames = selectedGraphNames;
    },

    makeNewPost(state, newPost) {
        const highestPostId = Math.max(
            ...Object.keys(state.posts)
                .map(id => parseInt(id, 10))
        );
        const newPostId = highestPostId + 1;

        newPost.id = newPostId;
        state.posts[newPostId] = newPost;
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
