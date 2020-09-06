export default {
    "dataModule": {
        "posts": {
            "1": {
                "title": "post1t",
                "body": "post1",
                "createdAt": "2020-06-03T12:31:23.935Z",
                "updatedAt": "2020-06-03T12:33:21.431Z",
                "id": 1
            },
            "2": {
                "title": "post2t",
                "body": "post2",
                "createdAt": "2020-06-03T12:33:53.859Z",
                "updatedAt": "2020-06-03T12:33:53.859Z",
                "id": 2
            },
            "3": {
                "title": "post3t",
                "body": "post3",
                "createdAt": "2020-06-19T10:11:22.585Z",
                "updatedAt": "2020-06-19T10:11:22.585Z",
                "id": 3
            },
            "4": {
                "title": "post4t",
                "body": "post4",
                "createdAt": "2020-06-19T10:11:47.459Z",
                "updatedAt": "2020-06-19T12:42:33.465Z",
                "id": 4
            },
            "7": {
                "title": "post7t",
                "body": "post7",
                "createdAt": "2020-06-19T12:13:54.581Z",
                "updatedAt": "2020-06-19T12:13:54.581Z",
                "id": 7
            }
        },
        "links": {
            "1": {
                "id": 1,
                "graph": 1,
                "source": 1,
                "target": 2,
                "type": "reply"
            },
            "2": {
                "id": 2,
                "graph": 1,
                "source": 2,
                "target": 4,
                "type": "reply"
            },
            "3": {
                "id": 3,
                "graph": 1,
                "source": 7,
                "target": 2,
                "type": "reply"
            }
        },
        "graphs": {
            "1": {
                "id": 1,
                "name": "default",
                "nodes": [
                    1,
                    2,
                    4,
                    7,
                    3
                ],
                "nodePositions": {
                    "2": {
                        x: 1,
                        y: 2
                    },
                    "3": {
                        x: 2,
                        y: 3
                    }
                },
                "subgraphs": [1, 2]
            }
        },
        "subgraphs": {
            "1": {
                "id": 1,
                "name": "default",
                "nodes": [
                    1,
                    2,
                    4,
                    7
                ],
                "colour": "black",
                "links": [1, 2, 3]
            },
            "2": {
                "id": 2,
                "name": "foo",
                "nodes": [
                    3
                ],
                "links": []
            }
        },
        "selectedPostIds": [
            4,
            2
        ],
        "selectedGraphId": 1,
        "selectedSubgraphIds": [
            1
        ]
    },
    "settingsModule": {
        "shouldAutosave": true,
        "remoteStorageMethod": "none",
        "canOpenMultiplePosts": true,
        "graphHeight": 66,
        "postBarHeight": 66,
        "postWidth": 24
    },
    "firebaseModule": {
        "firebaseConfig": {
            "apiKey": "",
            "authDomain": "xxx.firebaseapp.com",
            "databaseURL": "https://xxx.firebaseio.com",
            "projectId": "xxx",
            "storageBucket": "xxx.appspot.com",
            "messagingSenderId": "123",
            "appId": "456"
        }
    }
}