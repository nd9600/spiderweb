import {ref, watch, type TemplateRef} from "vue";
import {drag as d3drag} from "d3-drag";
import type {D3DragEvent, DragBehavior, SubjectPosition} from "d3-drag";
import {
    forceCenter as d3forceCenter,
    forceLink as d3forceLink,
    forceManyBody as d3forceManyBody,
    forceSimulation as d3forceSimulation,
} from "d3-force";
import type {Simulation, SimulationLinkDatum, SimulationNodeDatum} from "d3-force";
import {pointer as d3pointer, select as d3select} from "d3-selection";
import type {Selection} from "d3-selection";
import {zoom as d3zoom, zoomIdentity as d3zoomIdentity} from "d3-zoom";
import type {D3ZoomEvent, ZoomBehavior} from "d3-zoom";
import debounce from "lodash/debounce";
import "d3-transition";

import {ClickMode, type LinkId, type NodePosition, type PostId, type Zoom} from "@/src/@types/StoreTypes";
import {HEIGHT, INITIAL_ZOOM, WIDTH} from "@/src/components/constants";
import {useClickerStore, useDataStore} from "@/src/store";
import type {VisibleGraph, VisibleLink, VisibleNode} from "./useVisibleGraph";

interface RenderNode extends VisibleNode, SimulationNodeDatum {}

interface RenderLink extends Omit<VisibleLink, "source" | "target">, SimulationLinkDatum<RenderNode> {
    source: PostId | RenderNode;
    target: PostId | RenderNode;
}

interface ClickedLinkEndpoint {
    id: PostId;
    x: number;
    y: number;
}

interface ClickedLink {
    id: LinkId;
    source: ClickedLinkEndpoint;
    target: ClickedLinkEndpoint;
}

interface LinkClickPayload {
    link: ClickedLink;
    coordinates: [number, number];
}

/* eslint-disable no-unused-vars */
export interface GraphElements {
    svgElement: TemplateRef<SVGSVGElement>;
    rootElement: TemplateRef<SVGGElement>;
    linksElement: TemplateRef<SVGGElement>;
    nodesElement: TemplateRef<SVGGElement>;
}

export interface GraphRenderer {
    mount(): boolean;
    render(graph: VisibleGraph): boolean;
    setZoom(zoom: Zoom): void;
    resetZoom(): void;
    focusPost(postId: PostId, speed?: number): void;
    highlightPost(postId: PostId): void;
    unhighlightPost(postId: PostId): void;
    zoomIn(): void;
    zoomOut(): void;
    handleSvgClick(event: MouseEvent): void;
}
/* eslint-enable no-unused-vars */

type GraphEndpoint = RenderLink["source"];
type GraphSvgSelection = Selection<SVGSVGElement, unknown, null, undefined>;
type GraphGroupSelection = Selection<SVGGElement, unknown, null, undefined>;
type GraphNodeGroupSelection = Selection<SVGGElement, RenderNode, SVGGElement, unknown>;
type GraphLinkSelection = Selection<SVGLineElement, RenderLink, SVGGElement, unknown>;
type GraphNodeSelection = Selection<SVGCircleElement, RenderNode, SVGGElement, unknown>;
type GraphTextSelection = Selection<SVGTextElement, RenderNode, SVGGElement, unknown>;
type GraphZoomBehavior = ZoomBehavior<SVGSVGElement, unknown>;
type GraphDragBehavior = DragBehavior<SVGElement, RenderNode, RenderNode | SubjectPosition>;
type GraphSimulation = Simulation<RenderNode, RenderLink>;
type GraphNodesById = Record<PostId, RenderNode>;

function isGraphNode(value: GraphEndpoint): value is RenderNode {
    return typeof value === "object" && value !== null && "id" in value;
}

function getEndpointId(value: GraphEndpoint): PostId {
    if (typeof value === "object") {
        return value.id;
    }

    return String(value);
}

function getEndpointPosition(value: GraphEndpoint): NodePosition {
    if (!isGraphNode(value) || value.x == null || value.y == null) {
        return {x: 0, y: 0};
    }

    return {
        x: value.x,
        y: value.y,
    };
}

function neighbourKey(postAId: PostId, postBId: PostId): string {
    return [postAId, postBId].sort().join(",");
}

function isPhone(): boolean {
    const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    return viewportWidth <= 576;
}

function createRenderNodes(nodes: VisibleNode[]): RenderNode[] {
    return nodes.map((node): RenderNode => {
        const renderNode: RenderNode = {...node};

        if (node.position != null) {
            renderNode.fx = node.position.x;
            renderNode.fy = node.position.y;
            renderNode.x = node.position.x;
            renderNode.y = node.position.y;
        }

        return renderNode;
    });
}

function createRenderLinks(links: VisibleLink[]): RenderLink[] {
    return links.map((link): RenderLink => ({...link}));
}

function createForceSimulation(nodes: RenderNode[], links: RenderLink[]): GraphSimulation {
    const simulation = d3forceSimulation<RenderNode>(nodes) as GraphSimulation;
    simulation
        .force("link", d3forceLink<RenderNode, RenderLink>(links)
            .id((node: RenderNode) => node.id)
            .distance(200)
        )
        .force("charge", d3forceManyBody()
            .strength(-7500)
        )
        .force("center", d3forceCenter(WIDTH / 2, HEIGHT / 2));
    simulation.tick(300);

    return simulation;
}

export function useGraphRenderer(elements: GraphElements): GraphRenderer {
    const dataStore = useDataStore();
    const clickerStore = useClickerStore();

    const svg = ref<Nullable<GraphSvgSelection>>(null);
    const rootG = ref<Nullable<GraphGroupSelection>>(null);
    const linksG = ref<Nullable<GraphGroupSelection>>(null);
    const nodesG = ref<Nullable<GraphGroupSelection>>(null);
    const linkSelection = ref<Nullable<GraphLinkSelection>>(null);
    const nodeSelection = ref<Nullable<GraphNodeSelection>>(null);
    const textSelection = ref<Nullable<GraphTextSelection>>(null);
    const nodesWithCoordinates = ref<GraphNodesById>({});
    const visibleGraph = ref<Nullable<VisibleGraph>>(null);

    let hasMounted = false;
    const originalLinkStroke = 20;
    const linkStroke = ref(originalLinkStroke);
    const zoom = ref<Zoom>({
        x: WIDTH / 2,
        y: HEIGHT / 2,
        scale: INITIAL_ZOOM,
    });
    const zoomBehaviour = ref<Nullable<GraphZoomBehavior>>(null);
    const debouncedSaveZoomState = debounce(
        () => {
            // Avoid immediately autosaving the zoom state we just loaded.
            if (hasMounted) {
                dataStore.setZoom(zoom.value);
            } else {
                hasMounted = true;
            }
        },
        250,
        {
            leading: false,
            trailing: true,
        }
    );

    watch(zoom, ({x, y, scale}: Zoom) => {
        if (rootG.value == null) {
            return;
        }

        rootG.value.attr("transform", `translate(${x} ${y}) scale(${scale})`);

        const unshiftedTextScaleFactor = INITIAL_ZOOM / scale;
        const textScaleFactor = unshiftedTextScaleFactor < 1
            ? unshiftedTextScaleFactor
            : 1 + ((unshiftedTextScaleFactor - 1) * 0.35); // Keep labels readable without making them explode while zooming out.
        const originalTextSize = 48;
        const maxTextSize = 220;
        const newTextSize = Math.min(
            maxTextSize,
            Math.ceil(originalTextSize * textScaleFactor)
        );

        document.documentElement.style.setProperty("--node-text-size", (isPhone() ? (newTextSize / 2) : newTextSize) + "px");

        const minLinkStroke = 8;
        const maxLinkStroke = 110;
        linkStroke.value = Math.max(
            minLinkStroke,
            Math.min(
                maxLinkStroke,
                Math.ceil(originalLinkStroke * textScaleFactor)
            )
        );
        document.documentElement.style.setProperty("--link-stroke-width", linkStroke.value + "px");
        nodeSelection.value?.attr("r", linkStroke.value);

        debouncedSaveZoomState();
    });

    function mount(): boolean {
        if (
            elements.svgElement.value == null
            || elements.rootElement.value == null
            || elements.linksElement.value == null
            || elements.nodesElement.value == null
        ) {
            return false;
        }

        svg.value = d3select(elements.svgElement.value);
        rootG.value = d3select(elements.rootElement.value);

        linksG.value = d3select(elements.linksElement.value)
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6);

        nodesG.value = d3select(elements.nodesElement.value)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);

        setupZooming();

        return true;
    }

    function render(graph: VisibleGraph): boolean {
        if (linksG.value == null || nodesG.value == null) {
            return false;
        }

        visibleGraph.value = graph;
        const nodes = createRenderNodes(graph.nodes);
        const links = createRenderLinks(graph.links);
        const simulation = createForceSimulation(nodes, links);

        bindLinks(links);
        bindNodes(nodes, simulation);
        bindForceSimulationTick(simulation);
        syncNodesWithCoordinates(nodes);

        return true;
    }

    function setupZooming(): void {
        /*
        D3 zoom has a zoom behaviour and a zoom transform. The behaviour is applied to the SVG
        to bind pan/zoom listeners; programmatic zooming works by applying a transform through
        that same behaviour, which then emits the normal zoom event.
         */
        zoomBehaviour.value = d3zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.025, 2])
            .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
                zoom.value = {
                    x: event.transform.x,
                    y: event.transform.y,
                    scale: event.transform.k,
                };
            });

        if (svg.value == null) {
            return;
        }

        svg.value.call(zoomBehaviour.value)
            .on("wheel", (event: WheelEvent) => {
                event.preventDefault();
            });
    }

    function setZoom(storedZoom: Zoom): void {
        if (svg.value == null || zoomBehaviour.value == null) {
            return;
        }

        svg.value.call(zoomBehaviour.value)
            .call(
                zoomBehaviour.value.transform,
                d3zoomIdentity
                    .translate(storedZoom.x, storedZoom.y)
                    .scale(storedZoom.scale)
            );
    }

    function resetZoom(): void {
        if (svg.value == null || zoomBehaviour.value == null) {
            return;
        }

        svg.value.call(zoomBehaviour.value)
            .call(
                zoomBehaviour.value.transform,
                d3zoomIdentity
                    .translate(WIDTH / 2, HEIGHT / 2)
                    .scale(INITIAL_ZOOM)
            );
    }

    function focusPost(postId: PostId, speed = 1): void {
        if (svg.value == null || zoomBehaviour.value == null) {
            return;
        }

        const xOffset = isPhone()
            ? 550
            : 2000;
        const yOffset = isPhone()
            ? 300
            : 500;

        const post = nodesWithCoordinates.value[postId];
        if (post?.x == null || post?.y == null) {
            return;
        }

        svg.value.transition()
            .duration(1500 / speed)
            .call(
                zoomBehaviour.value.transform,
                d3zoomIdentity
                    .scale(INITIAL_ZOOM)
                    .translate(-post.x + xOffset, -post.y + yOffset)
            );
    }

    function zoomIn(): void {
        if (svg.value == null || zoomBehaviour.value == null) {
            return;
        }

        svg.value.transition()
            .call(zoomBehaviour.value.scaleBy, 2);
    }

    function zoomOut(): void {
        if (svg.value == null || zoomBehaviour.value == null) {
            return;
        }

        svg.value.transition()
            .call(zoomBehaviour.value.scaleBy, 0.5);
    }

    function bindLinks(links: RenderLink[]): void {
        if (linksG.value == null) {
            return;
        }

        linkSelection.value = linksG.value
            .selectAll<SVGLineElement, RenderLink>("line")
            .data(links, (link: RenderLink) => link.id)
            .join("line")
            .classed("graph__link", true)
            .classed("graph__link--sidenote", (link: RenderLink) => link.type === "sidenote")
            .classed("graph__link--link", (link: RenderLink) => link.type === "link")
            .attr("stroke", (link: RenderLink) => link.colour)
            .attr("marker-end", "url(#arrowhead)")
            .on("click", async function(this: SVGLineElement, event: MouseEvent, link: RenderLink) {
                await handleLinkClick(
                    link,
                    d3pointer(event, this.parentNode as SVGGElement)
                );
            })
            .call(d3drag<SVGLineElement, RenderLink>().clickDistance(4));
    }

    function bindNodes(nodes: RenderNode[], simulation: GraphSimulation): void {
        if (nodesG.value == null) {
            return;
        }

        let nodeGroups: GraphNodeGroupSelection = nodesG.value
            .selectAll<SVGGElement, RenderNode>("g")
            .data(nodes, (post: RenderNode) => post.id);

        nodeGroups.exit().remove();

        const newNodeGroups = nodeGroups.enter();
        const newNodeGroup = newNodeGroups.append<SVGGElement>("g")
            .classed("node", true);
        newNodeGroup.append("circle");
        newNodeGroup.append("text");

        nodeGroups = newNodeGroup.merge(nodeGroups);
        nodeGroups.attr("data-id", (post: RenderNode) => post.id);

        nodeSelection.value = nodeGroups
            .select<SVGCircleElement>("circle")
            .classed("node__circle", true)
            .attr("r", linkStroke.value)
            .attr("title", (post: RenderNode) => post.title);

        textSelection.value = nodeGroups
            .select<SVGTextElement>("text")
            .classed("node__text", true)
            .attr("text-anchor", "end")
            .attr("id", (post: RenderNode) => `text-${post.id}`)
            .text((post: RenderNode) => post.label)
            .on("mouseover", (_event: MouseEvent, post: RenderNode) => {
                highlightPost(post.id);
            })
            .on("mouseout", (_event: MouseEvent, post: RenderNode) => {
                unhighlightPost(post.id);
            });

        nodeGroups
            .selectAll<SVGElement, RenderNode>("circle, text")
            .on("click", (_event: MouseEvent, post: RenderNode) => {
                void handleNodeClick(post.id);
            })
            .call(d3drag<SVGElement, RenderNode>().clickDistance(4))
            .call(createDragBehaviour(simulation));
    }

    function bindForceSimulationTick(simulation: GraphSimulation): void {
        simulation.on("tick", () => {
            if (linkSelection.value == null || nodeSelection.value == null || textSelection.value == null) {
                return;
            }

            linkSelection.value
                .attr("x1", (link: RenderLink) => getEndpointPosition(link.source).x)
                .attr("y1", (link: RenderLink) => getEndpointPosition(link.source).y)
                .attr("x2", (link: RenderLink) => getEndpointPosition(link.target).x)
                .attr("y2", (link: RenderLink) => getEndpointPosition(link.target).y);

            nodeSelection.value
                .attr("cx", (node: RenderNode) => node.x ?? 0)
                .attr("cy", (node: RenderNode) => node.y ?? 0);

            textSelection.value
                .attr("x", (node: RenderNode) => (node.x ?? 0) - 6)
                .attr("y", (node: RenderNode) => (node.y ?? 0) - 4);
        });
    }

    function createDragBehaviour(simulation: GraphSimulation): GraphDragBehavior {
        interface GraphDragEvent extends D3DragEvent<SVGElement, RenderNode, RenderNode | SubjectPosition> {}

        function dragStarted(event: GraphDragEvent, node: RenderNode) {
            if (!event.active) {
                simulation.alphaTarget(0.3).restart();
            }

            function fixNodes(thisNode: RenderNode) {
                nodeSelection.value?.each(function (d: RenderNode) {
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

        function dragged(event: GraphDragEvent, node: RenderNode) {
            node.fx = event.x;
            node.fy = event.y;
        }

        function dragEnded(event: GraphDragEvent, node: RenderNode) {
            if (!event.active) {
                simulation.alpha(0);
                simulation.alphaTarget(0);
            }

            node.fx = event.x;
            node.fy = event.y;
            handleNodeDragEnd(node.id, {
                x: event.x,
                y: event.y
            });
        }

        return d3drag<SVGElement, RenderNode>()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded);
    }

    function syncNodesWithCoordinates(nodes: RenderNode[]): void {
        const postsKeyedById: GraphNodesById = {};
        for (const post of nodes) {
            postsKeyedById[post.id] = post;
        }
        nodesWithCoordinates.value = postsKeyedById;
    }

    function handleSvgClick(event: MouseEvent): void {
        if (event.target !== elements.svgElement.value) {
            return;
        }

        if (clickerStore.shouldShowClickButtonMenu) {
            clickerStore.setShouldShowClickButtonMenu(false);
        }

        if (clickerStore.clickMode !== ClickMode.OpenPosts) {
            clickerStore.setClickMode(ClickMode.OpenPosts);
        }
    }

    async function handleNodeClick(postId: PostId): Promise<void> {
        await clickerStore.handlePostClick({id: postId});
    }

    async function handleLinkClick(link: RenderLink, coordinates: [number, number]): Promise<void> {
        const sourcePosition = getEndpointPosition(link.source);
        const targetPosition = getEndpointPosition(link.target);
        const payload: LinkClickPayload = {
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
            coordinates,
        };
        const postIdToFocus = await clickerStore.handleLinkClick(payload);
        if (postIdToFocus != null) {
            focusPost(postIdToFocus, 1.5);
        }
    }

    function handleNodeDragEnd(postId: PostId, position: NodePosition): void {
        dataStore.setPostPosition({postId, position});
    }

    function highlightPost(postId: PostId): void {
        const textElement = document.getElementById(`text-${postId}`);
        if (
            textElement == null
            || nodeSelection.value == null
            || textSelection.value == null
            || linkSelection.value == null
            || visibleGraph.value == null
        ) {
            return;
        }

        d3select(textElement)
            .style("filter", "url(#postHoverFilter)");

        const parentNode = d3select(textElement).node()?.parentNode;
        if (parentNode != null) {
            d3select(parentNode as SVGGElement).raise();
        }

        const nonNeighbourNodes = nodeSelection.value.filter((otherPost: unknown) => {
            const post = otherPost as RenderNode;
            if (postId === post.id) {
                return false;
            }
            return visibleGraph.value?.neighbourIndex[neighbourKey(postId, post.id)] !== true;
        });
        nonNeighbourNodes.style("opacity", 0.2);

        const nonNeighbourTexts = textSelection.value.filter((otherPost: unknown) => {
            const post = otherPost as RenderNode;
            if (postId === post.id) {
                return false;
            }
            return visibleGraph.value?.neighbourIndex[neighbourKey(postId, post.id)] !== true;
        });
        nonNeighbourTexts.style("opacity", 0.2);

        const nonNeighbourLinks = linkSelection.value.filter((linkValue: unknown) => {
            const link = linkValue as RenderLink;
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
        mount,
        render,
        setZoom,
        resetZoom,
        focusPost,
        highlightPost,
        unhighlightPost,
        zoomIn,
        zoomOut,
        handleSvgClick,
    };
}
