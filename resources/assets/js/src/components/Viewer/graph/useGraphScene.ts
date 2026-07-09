import {ref, type Ref} from "vue";
import {drag as d3drag} from "d3-drag";
import type {D3DragEvent, SubjectPosition} from "d3-drag";
import {
    forceCenter as d3forceCenter,
    forceLink as d3forceLink,
    forceManyBody as d3forceManyBody,
    forceSimulation as d3forceSimulation,
} from "d3-force";
import {pointer as d3pointer, select as d3select} from "d3-selection";

import type {LinkId, NodePosition, PostId, SubgraphId} from "@/src/@types/StoreTypes";
import {HEIGHT, WIDTH} from "@/src/components/constants";
import {getEndpointId, getEndpointPosition} from "./graphData";
import type {
    GraphData,
    GraphDragBehavior,
    GraphGroupSelection,
    GraphLink,
    GraphLinkSelection,
    GraphNode,
    GraphNodeGroupSelection,
    GraphNodesById,
    GraphNodeSelection,
    GraphSimulation,
    GraphSvgSelection,
    GraphTextSelection,
} from "./types";

type ClickedLinkEndpoint = {
    id: PostId;
    x: number;
    y: number;
};

type LinkClickPayload = {
    link: {
        id: LinkId;
        source: ClickedLinkEndpoint;
        target: ClickedLinkEndpoint;
    };
    coordinates: [number, number];
};

/* eslint-disable no-unused-vars */
type UseGraphSceneOptions = {
    svgElement: Ref<SVGSVGElement | null>;
    rootElement: Ref<SVGGElement | null>;
    linksElement: Ref<SVGGElement | null>;
    nodesElement: Ref<SVGGElement | null>;
    getLinkStroke(): number;
    getSubgraphColour(subgraphId: Nullable<SubgraphId>): string;
    getTitleOrBody(postId: PostId): string;
    isNeighbour(postAId: PostId, postBId: PostId): boolean;
    focusOnPost(postId: PostId, speed?: number): void;
    onLinkClick(payload: LinkClickPayload): Promise<Nullable<PostId>>;
    onPostClick(post: GraphNode): void;
    onPostPositioned(postId: PostId, position: NodePosition): void;
};
/* eslint-enable no-unused-vars */

function createForceSimulation(nodes: GraphNode[], links: GraphLink[]): GraphSimulation {
    const simulation = d3forceSimulation<GraphNode>(nodes) as GraphSimulation;
    simulation
        .force("link", d3forceLink<GraphNode, GraphLink>(links)
            .id((node: GraphNode) => node.id)
            .distance(200)
        )
        .force("charge", d3forceManyBody()
            .strength(-7500)
        )
        .force("center", d3forceCenter(WIDTH / 2, HEIGHT / 2));
    simulation.tick(300);

    return simulation;
}

export function useGraphScene(options: UseGraphSceneOptions) {
    const svg = ref<Nullable<GraphSvgSelection>>(null);
    const rootG = ref<Nullable<GraphGroupSelection>>(null);
    const linksG = ref<Nullable<GraphGroupSelection>>(null);
    const nodesG = ref<Nullable<GraphGroupSelection>>(null);
    const linkSelection = ref<Nullable<GraphLinkSelection>>(null);
    const nodeSelection = ref<Nullable<GraphNodeSelection>>(null);
    const textSelection = ref<Nullable<GraphTextSelection>>(null);
    const nodesWithCoordinates = ref<GraphNodesById>({});

    function initializeScene(): boolean {
        if (
            options.svgElement.value == null
            || options.rootElement.value == null
            || options.linksElement.value == null
            || options.nodesElement.value == null
        ) {
            return false;
        }

        svg.value = d3select(options.svgElement.value);
        rootG.value = d3select(options.rootElement.value);

        linksG.value = d3select(options.linksElement.value)
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6);

        nodesG.value = d3select(options.nodesElement.value)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);

        return true;
    }

    function bindLinks(links: GraphLink[]): void {
        if (linksG.value == null) {
            return;
        }

        linkSelection.value = linksG.value
            .selectAll<SVGLineElement, GraphLink>("line")
            .data(links, (link: GraphLink) => link.id)
            .join("line")
            .classed("graph__link", true)
            .classed("graph__link--sidenote", (link: GraphLink) => link.type === "sidenote")
            .classed("graph__link--link", (link: GraphLink) => link.type === "link")
            .attr("stroke", (link: GraphLink) => options.getSubgraphColour(link.subgraphId))
            .attr("marker-end", "url(#arrowhead)")
            .on("click", async function(this: SVGLineElement, event: MouseEvent, link: GraphLink) {
                const sourcePosition = getEndpointPosition(link.source);
                const targetPosition = getEndpointPosition(link.target);
                const returnedValue = await options.onLinkClick({
                    link: {
                        id: link.id,
                        source: {
                            id: getEndpointId(link.source),
                            x: sourcePosition.x,
                            y: sourcePosition.y,
                        },
                        target: {
                            id: getEndpointId(link.target),
                            x: targetPosition.x,
                            y: targetPosition.y,
                        }
                    },
                    coordinates: d3pointer(event, this.parentNode as SVGGElement)
                });

                if (returnedValue != null) {
                    options.focusOnPost(returnedValue, 1.5);
                }
            })
            .call(d3drag<SVGLineElement, GraphLink>().clickDistance(4));
    }

    function createDragBehaviour(simulation: GraphSimulation): GraphDragBehavior {
        type GraphDragEvent = D3DragEvent<SVGElement, GraphNode, GraphNode | SubjectPosition>;

        function dragStarted(event: GraphDragEvent, node: GraphNode) {
            if (!event.active) {
                simulation.alphaTarget(0.3).restart();
            }

            function fixNodes(thisNode: GraphNode) {
                nodeSelection.value?.each(function (d: GraphNode) {
                    if (thisNode !== d) {
                        d.fx = d.x;
                        d.fy = d.y;
                    }
                });
            }
            node.fx = node.x;
            node.fy = node.y;
            fixNodes(node);
        }

        function dragged(event: GraphDragEvent, node: GraphNode) {
            node.fx = event.x;
            node.fy = event.y;
        }

        function dragEnded(event: GraphDragEvent, node: GraphNode) {
            if (!event.active) {
                simulation.alpha(0);
                simulation.alphaTarget(0);
            }

            node.fx = event.x;
            node.fy = event.y;
            options.onPostPositioned(node.id, {
                x: event.x,
                y: event.y
            });
        }

        return d3drag<SVGElement, GraphNode>()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded);
    }

    function bindNodes(nodes: GraphNode[], simulation: GraphSimulation): void {
        if (nodesG.value == null) {
            return;
        }

        let nodeGroups: GraphNodeGroupSelection = nodesG.value
            .selectAll<SVGGElement, GraphNode>("g")
            .data(nodes, (post: GraphNode) => post.id);

        nodeGroups.exit().remove();

        const newNodeGroups = nodeGroups.enter();
        const newNodeGroup = newNodeGroups.append<SVGGElement>("g")
            .classed("node", true);
        newNodeGroup.append("circle");
        newNodeGroup.append("text");

        nodeGroups = newNodeGroup.merge(nodeGroups);
        nodeGroups.attr("data-id", (post: GraphNode) => post.id);

        nodeSelection.value = nodeGroups
            .select<SVGCircleElement>("circle")
            .classed("node__circle", true)
            .attr("r", options.getLinkStroke())
            .attr("title", (post: GraphNode) => post.title);

        textSelection.value = nodeGroups
            .select<SVGTextElement>("text")
            .classed("node__text", true)
            .attr("text-anchor", "end")
            .attr("id", (post: GraphNode) => `text-${post.id}`)
            .text((post: GraphNode) => options.getTitleOrBody(post.id))
            .on("mouseover", (_event: MouseEvent, post: GraphNode) => {
                highlightPost(post.id);
            })
            .on("mouseout", (_event: MouseEvent, post: GraphNode) => {
                unhighlightPost(post.id);
            });

        nodeGroups
            .selectAll<SVGElement, GraphNode>("circle, text")
            .on("click", (_event: MouseEvent, post: GraphNode) => {
                options.onPostClick(post);
            })
            .call(d3drag<SVGElement, GraphNode>().clickDistance(4))
            .call(createDragBehaviour(simulation));
    }

    function bindForceSimulationTick(simulation: GraphSimulation): void {
        simulation.on("tick", () => {
            if (linkSelection.value == null || nodeSelection.value == null || textSelection.value == null) {
                return;
            }

            linkSelection.value
                .attr("x1", (link: GraphLink) => getEndpointPosition(link.source).x)
                .attr("y1", (link: GraphLink) => getEndpointPosition(link.source).y)
                .attr("x2", (link: GraphLink) => getEndpointPosition(link.target).x)
                .attr("y2", (link: GraphLink) => getEndpointPosition(link.target).y);

            nodeSelection.value
                .attr("cx", (node: GraphNode) => node.x ?? 0)
                .attr("cy", (node: GraphNode) => node.y ?? 0);

            textSelection.value
                .attr("x", (node: GraphNode) => (node.x ?? 0) - 6)
                .attr("y", (node: GraphNode) => (node.y ?? 0) - 4);
        });
    }

    function syncNodesWithCoordinates(nodes: GraphNode[]): void {
        const postsKeyedById: GraphNodesById = {};
        for (const post of nodes) {
            postsKeyedById[post.id] = post;
        }
        nodesWithCoordinates.value = postsKeyedById;
    }

    function renderGraph({nodes, links}: GraphData): boolean {
        if (linksG.value == null || nodesG.value == null) {
            return false;
        }

        const simulation = createForceSimulation(nodes, links);

        bindLinks(links);
        bindNodes(nodes, simulation);
        bindForceSimulationTick(simulation);
        syncNodesWithCoordinates(nodes);

        return true;
    }

    function setNodeRadius(radius: number): void {
        nodeSelection.value?.attr("r", radius);
    }

    function getNodesWithCoordinates(): GraphNodesById {
        return nodesWithCoordinates.value;
    }

    function highlightPost(postId: PostId): void {
        const textElement = document.getElementById(`text-${postId}`);
        if (textElement == null || nodeSelection.value == null || textSelection.value == null || linkSelection.value == null) {
            return;
        }

        d3select(textElement)
            .style("filter", "url(#postHoverFilter)");

        const parentNode = d3select(textElement).node()?.parentNode;
        if (parentNode != null) {
            d3select(parentNode as SVGGElement).raise();
        }

        const nonNeighbourNodes = nodeSelection.value.filter((otherPost: unknown) => {
            const post = otherPost as GraphNode;
            if (postId === post.id) {
                return false;
            }
            return !options.isNeighbour(postId, post.id);
        });
        nonNeighbourNodes.style("opacity", 0.2);

        const nonNeighbourTexts = textSelection.value.filter((otherPost: unknown) => {
            const post = otherPost as GraphNode;
            if (postId === post.id) {
                return false;
            }
            return !options.isNeighbour(postId, post.id);
        });
        nonNeighbourTexts.style("opacity", 0.2);

        const nonNeighbourLinks = linkSelection.value.filter((linkValue: unknown) => {
            const link = linkValue as GraphLink;
            const linkDoesntIncludeThisPost = postId !== getEndpointId(link.source)
                && postId !== getEndpointId(link.target);
            return linkDoesntIncludeThisPost;
        });
        nonNeighbourLinks.style("opacity", 0.2);
    }

    function unhighlightPost(postId: PostId): void {
        const textElement = document.getElementById(`text-${postId}`);
        if (textElement != null) {
            d3select(textElement)
                .style("filter", "");
        }
        nodeSelection.value?.style("opacity", 1);
        textSelection.value?.style("opacity", 1);
        linkSelection.value?.style("opacity", 1);
    }

    return {
        svg,
        rootG,
        initializeScene,
        renderGraph,
        setNodeRadius,
        getNodesWithCoordinates,
        highlightPost,
        unhighlightPost,
    };
}
