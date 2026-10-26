import {forceCenter, forceLink, forceManyBody, forceSimulation, type SimulationNodeDatum} from "d3-force";

import {HEIGHT, WIDTH} from "@/src/components/constants";
import type {NodePosition, PostId} from "@/src/@types/StoreTypes";
import type {VisibleGraph, VisibleLink, VisibleNode} from "./useVisibleGraph";

export interface RenderNode extends VisibleNode, NodePosition {}

export interface RenderLink extends Omit<VisibleLink, "source" | "target"> {
    source: RenderNode;
    target: RenderNode;
}

export function layoutGraph(graph: VisibleGraph) {
    // D3 changes coordinates and adds properties to the node objects.
    // Give it copies so that the graph passed to this function stays unchanged.
    const nodes: (RenderNode & SimulationNodeDatum)[] = graph.nodes.map((node) => ({
        ...node,
        // D3 chooses starting coordinates when x or y is NaN.
        x: node.position?.x ?? NaN,
        y: node.position?.y ?? NaN,
        // Set fx and fy to hold saved positions fixed while D3 places the other nodes.
        fx: node.position?.x,
        fy: node.position?.y,
    }));
    const nodesById: Record<PostId, RenderNode> = Object.fromEntries(nodes.map((node) => [node.id, node]));
    // Each link refers to the same node objects that are used for drawing.
    // When a drag changes a node's x and y, the line can use those new coordinates.
    const links: RenderLink[] = graph.links.map((link) => {
        const source = nodesById[link.source];
        const target = nodesById[link.target];
        if (source == null || target == null) {
            throw new Error(`Link ${link.id} refers to a missing node`);
        }

        return {...link, source, target};
    });

    // Calculate missing positions before drawing the graph.
    // Dragging changes coordinates directly, so the simulation can stay stopped.
    if (nodes.some((node) => node.position == null)) {
        forceSimulation(nodes).stop()
            .force("link", forceLink<RenderNode, RenderLink>(links).id((node) => node.id).distance(200))
            .force("charge", forceManyBody().strength(-7500))
            .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
            .tick(300);
    }

    return {nodes, links, nodesById};
}
