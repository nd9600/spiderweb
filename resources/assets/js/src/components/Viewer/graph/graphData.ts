import type {NodePosition, PostId} from "@/src/@types/StoreTypes";
import type {Post} from "@/src/store/models/Post";
import type {LinkWithSubgraphId} from "@/src/store/modules/dataModule";

import type {GraphData, GraphEndpoint, GraphLink, GraphNode} from "./types";

export function isGraphNode(value: GraphEndpoint): value is GraphNode {
    return typeof value === "object" && value !== null && "id" in value;
}

export function getEndpointId(value: GraphEndpoint): PostId {
    if (typeof value === "object") {
        return value.id;
    }

    return String(value);
}

export function getEndpointPosition(value: GraphEndpoint): NodePosition {
    if (!isGraphNode(value) || value.x == null || value.y == null) {
        return {x: 0, y: 0};
    }

    return {
        x: value.x,
        y: value.y,
    };
}

export function buildGraphData(
    posts: Post[],
    links: LinkWithSubgraphId[],
    nodePositions: Record<PostId, NodePosition>
): GraphData {
    const nodes = posts.map((post): GraphNode => {
        const node: GraphNode = {...post};
        const nodePosition = nodePositions[node.id];

        if (nodePosition != null) {
            node.fx = nodePosition.x;
            node.fy = nodePosition.y;
            node.x = nodePosition.x;
            node.y = nodePosition.y;
        }

        return node;
    });

    return {
        nodes,
        links: links.map((link): GraphLink => ({...link})),
    };
}
