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
    rootPostIds: [
        1,
    ],
    postToChildPosts: {
        1: [2, 3],
        2: [4],
        3: [5],
        5: [6],
        6: [7],
    },

    selectedPostId: null
};

const getters = {
    newPostId(state, getters, rootState) {
        const highestPostId = Math.max(Object.keys(state.posts));
        return highestPostId + 1;
    }
};

const mutations = {
    setSelectedPostId(state, selectedPostId) {
        state.selectedPostId = selectedPostId;
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
