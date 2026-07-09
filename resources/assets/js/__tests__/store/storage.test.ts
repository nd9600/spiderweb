import {parseFirebaseStorageObject, parseImportedStorageObject} from "@/src/store/storage";

test("old unversioned data exports are migrated to subgraph-owned graph ids", () => {
    const imported = parseImportedStorageObject({
        dataModule: {
            posts: {
                "1": {
                    id: 1,
                    title: "post",
                    body: "body",
                    createdAt: "2020-01-01T00:00:00.000Z",
                    updatedAt: "2020-01-01T00:00:00.000Z",
                },
            },
            links: {},
            graphs: {
                "1": {
                    id: 1,
                    name: "default",
                    nodes: [1],
                    nodePositions: {},
                    subgraphs: [2],
                },
            },
            subgraphs: {
                "2": {
                    id: 2,
                    name: "subgraph",
                    nodes: [1],
                    links: [],
                },
            },
            selectedPostIds: [1],
            selectedGraphId: 1,
            selectedSubgraphIds: [2],
            zoom: {
                x: 200,
                y: 100,
                scale: 0.5,
            },
        },
    });

    expect(imported.dataModule?.graphs["1"]).toEqual({
        id: "1",
        name: "default",
        nodes: {"1": true},
        nodePositions: {},
    });
    expect(imported.dataModule?.subgraphs["2"]).toEqual({
        id: "2",
        graph: "1",
        name: "subgraph",
        nodes: {"1": true},
        links: {},
        colour: undefined,
    });
    expect(imported.dataModule?.selectedPostIds).toEqual(["1"]);
    expect(imported.dataModule?.selectedGraphId).toBe("1");
    expect(imported.dataModule?.selectedSubgraphIds).toEqual(["2"]);
});

test("firebase storage treats missing membership paths as empty maps", () => {
    const parsed = parseFirebaseStorageObject({
        schemaVersion: 2,
        dataModule: {
            posts: {},
            links: {},
            graphs: {
                "1": {
                    id: "1",
                    name: "default",
                    nodePositions: {},
                },
            },
            subgraphs: {
                "1": {
                    id: "1",
                    graph: "1",
                    name: "subgraph",
                },
            },
            selectedPostIds: [],
            selectedGraphId: "1",
            selectedSubgraphIds: [],
            zoom: {
                x: 200,
                y: 100,
                scale: 0.5,
            },
        },
    });

    expect(parsed.dataModule.graphs["1"].nodes).toEqual({});
    expect(parsed.dataModule.subgraphs["1"].nodes).toEqual({});
    expect(parsed.dataModule.subgraphs["1"].links).toEqual({});
});
