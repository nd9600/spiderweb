import type {DragBehavior, SubjectPosition} from "d3-drag";
import type {Simulation, SimulationLinkDatum, SimulationNodeDatum} from "d3-force";
import type {Selection} from "d3-selection";
import type {ZoomBehavior} from "d3-zoom";

import type {PostId} from "@/src/@types/StoreTypes";
import type {Post} from "@/src/store/models/Post";
import type {LinkWithSubgraphId} from "@/src/store/modules/dataModule";

export interface GraphNode extends Post, SimulationNodeDatum {}

export interface GraphLink extends Omit<LinkWithSubgraphId, "source" | "target">, SimulationLinkDatum<GraphNode> {}

export type GraphEndpoint = GraphLink["source"];

export type GraphData = {
    nodes: GraphNode[];
    links: GraphLink[];
};

export type GraphNodesById = Record<PostId, GraphNode>;

export type GraphSvgSelection = Selection<SVGSVGElement, unknown, null, undefined>;
export type GraphGroupSelection = Selection<SVGGElement, unknown, null, undefined>;
export type GraphNodeGroupSelection = Selection<SVGGElement, GraphNode, SVGGElement, unknown>;
export type GraphLinkSelection = Selection<SVGLineElement, GraphLink, SVGGElement, unknown>;
export type GraphNodeSelection = Selection<SVGCircleElement, GraphNode, SVGGElement, unknown>;
export type GraphTextSelection = Selection<SVGTextElement, GraphNode, SVGGElement, unknown>;
export type GraphZoomBehavior = ZoomBehavior<SVGSVGElement, unknown>;
export type GraphDragBehavior = DragBehavior<SVGElement, GraphNode, GraphNode | SubjectPosition>;
export type GraphSimulation = Simulation<GraphNode, GraphLink>;
