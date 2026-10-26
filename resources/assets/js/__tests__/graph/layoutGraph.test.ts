import {layoutGraph} from "@/src/components/Viewer/graph/layoutGraph";
import type {VisibleGraph} from "@/src/components/Viewer/graph/useVisibleGraph";

test("keeps the previous force layout when only some nodes have saved positions", () => {
    const graph: VisibleGraph = {
        nodes: [
            {id: "1", title: "One", label: "One", position: {x: 25, y: 50}},
            {id: "2", title: "Two", label: "Two"},
            {id: "3", title: "Three", label: "Three"},
        ],
        links: [
            {id: "1", source: "1", target: "2", type: "reply", colour: "black"},
            {id: "2", source: "2", target: "3", type: "reply", colour: "black"},
        ],
        neighbourIdsByPostId: {},
    };
    const original = structuredClone(graph);

    const layout = layoutGraph(graph);

    expect(layout.nodes.map(({id, x, y}) => ({id, x, y}))).toEqual([
        {id: "1", x: 25, y: 50},
        {id: "2", x: 187.16025688292692, y: 217.50415502798896},
        {id: "3", x: 387.8957480557272, y: 32.57447231054289},
    ]);
    expect(graph).toEqual(original);
});

test("moving a rendered node updates its link endpoints without changing the saved graph", () => {
    const graph: VisibleGraph = {
        nodes: [
            {id: "1", title: "One", label: "One", position: {x: 10, y: 20}},
            {id: "2", title: "Two", label: "Two", position: {x: 30, y: 40}},
        ],
        links: [{id: "1", source: "1", target: "2", type: "reply", colour: "black"}],
        neighbourIdsByPostId: {},
    };
    const layout = layoutGraph(graph);
    expect(layout.nodes.map(({x, y}) => ({x, y}))).toEqual([{x: 10, y: 20}, {x: 30, y: 40}]);

    layout.nodesById["1"].x = 100;
    layout.nodesById["1"].y = 200;

    expect(layout.links[0].source.x).toBe(100);
    expect(layout.links[0].source.y).toBe(200);
    expect(layout.links[0].target.x).toBe(30);
    expect(graph.nodes[0].position).toEqual({x: 10, y: 20});
});
