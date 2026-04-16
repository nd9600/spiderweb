<template>
    <section class="h-full w-full relative pb-4 px-0 flex">
        <svg
            id="graphSvg"
            class="w-full cursor-move border bg-white"
            @click="onSvgClick"
        >
            <defs>
                <marker
                    id="arrowhead"
                    viewBox="-0 -5 10 10"
                    refX="15"
                    refY="0"
                    orient="auto"
                    markerWidth="2"
                    markerHeight="2"
                >
                    <path
                        d="M 0,-5 L 10 ,0 L 0,5"
                        fill="#353535"
                        style="stroke: none;"
                    >
                    </path>
                </marker>

                <filter id="postHoverFilter">
                    <feFlood flood-color="#000"></feFlood>
                    <feComponentTransfer>
                        <feFuncA
                            type="linear"
                            slope="0.75"
                        ></feFuncA>
                    </feComponentTransfer>
                    <feComposite in="SourceGraphic"></feComposite>
                </filter>
            </defs>
            <g transform="translate(5, 15) scale(0.5)">
                <g class="graph__links"></g>
                <g class="graph__nodes"></g>
            </g>
        </svg>
        <FloatingActionButton />
    </section>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {select as d3select, selectAll as d3selectAll, event as d3event, mouse as d3mouse} from "d3-selection";
import {forceSimulation as d3forceSimulation, forceLink as d3forceLink, forceManyBody as d3forceManyBody, forceCenter as d3forceCenter} from "d3-force";
import {zoom as d3zoom, zoomIdentity as d3zoomIdentity} from "d3-zoom";
import {drag as d3drag} from "d3-drag";
import "d3-transition";
import type {Selection} from "d3-selection";
import type {Simulation, SimulationLinkDatum, SimulationNodeDatum} from "d3-force";
import type {ZoomBehavior} from "d3-zoom";
import type {DragBehavior, SubjectPosition} from "d3-drag";
import debounce from "lodash/debounce";

import type {
    ClickMode,
    NodePosition,
    PostId,
    SubgraphId,
    Zoom,
} from "@/src/@types/StoreTypes";
import type {PostSerialised} from "@/src/offline/store/classes/Post";
import type {LinkWithSubgraphId} from "@/src/offline/store/selectors";
import FloatingActionButton from "./FloatingActionButton.vue";
import {HEIGHT, INITIAL_ZOOM, WIDTH} from "@/src/commonComponents/constants";
import graphEventBus from "@/src/helpers/graphEventBus";
import {useClickerStore, useDataStore, useRootStore} from "@/src/offline/store";
import {
    getLinksInSelectedSubgraphs,
    getNeighbourIndex,
    getPostsInSelectedSubgraphs,
    getSubgraphColour,
    getTitleOrBody,
    isNeighbour,
} from "@/src/offline/store/selectors";

interface GraphNode extends PostSerialised, SimulationNodeDatum {}

interface GraphLink extends Omit<LinkWithSubgraphId, "source" | "target">, SimulationLinkDatum<GraphNode> {}
type GraphEndpoint = GraphLink["source"];

type GraphSvgSelection = Selection<SVGSVGElement, unknown, HTMLElement, any>;
type GraphGroupSelection = Selection<SVGGElement, unknown, HTMLElement, any>;
type GraphLinkSelection = Selection<SVGLineElement, GraphLink, SVGGElement, unknown>;
type GraphNodeSelection = Selection<SVGCircleElement, GraphNode, HTMLElement, any>;
type GraphTextSelection = Selection<SVGTextElement, GraphNode, HTMLElement, any>;
type GraphZoomBehavior = ZoomBehavior<SVGSVGElement, unknown>;
type GraphDragBehavior = DragBehavior<SVGElement, GraphNode, GraphNode | SubjectPosition>;
type GraphSimulation = Simulation<GraphNode, GraphLink>;

interface ClickedLinkPayload {
    link: {
        id: string;
        source: {id: string; x: number; y: number;};
        target: {id: string; x: number; y: number;};
    };
    coordinates: [number, number];
}

function isGraphNode(value: GraphEndpoint): value is GraphNode {
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

export default defineComponent({
    name: "OfflineGraph",
    components: {
        FloatingActionButton
    },
    data() {
        const originalLinkStroke = 20;
        return {
            svg: null as Nullable<GraphSvgSelection>,
            rootG: null as Nullable<GraphGroupSelection>,

            hasMounted: false,
            zoom: {
                x: WIDTH / 2,
                y: HEIGHT / 2,
                scale: INITIAL_ZOOM,
            } as Zoom,
            zoomBehaviour: null as Nullable<GraphZoomBehavior>,
            shouldResetZooming: false,

            linksG: null as Nullable<GraphGroupSelection>,
            nodesG: null as Nullable<GraphGroupSelection>,
            linkSelection: null as Nullable<GraphLinkSelection>,
            nodeSelection: null as Nullable<GraphNodeSelection>,
            textSelection: null as Nullable<GraphTextSelection>,

            originalLinkStroke: originalLinkStroke,
            linkStroke: originalLinkStroke,

            nodesWithCoordinates: {} as Record<PostId, GraphNode>,
            debouncedMakeGraphSvg: (() => {}) as () => void,
            debouncedSaveZoomState: (() => {}) as () => void,
        };
    },
    computed: {
        selectedGraphId() {
            return useDataStore().selectedGraphId;
        },
        selectedSubgraphIds() {
            return useDataStore().selectedSubgraphIds;
        },
        postsInSelectedSubgraphs() {
            const dataStore = useDataStore();
            return getPostsInSelectedSubgraphs(
                dataStore.graphs,
                dataStore.posts,
                dataStore.subgraphs,
                dataStore.selectedGraphId,
                dataStore.selectedSubgraphIds
            );
        },
        linksInSelectedSubgraphs() {
            const dataStore = useDataStore();
            return getLinksInSelectedSubgraphs(
                dataStore.links,
                dataStore.subgraphs,
                dataStore.selectedGraphId,
                dataStore.selectedSubgraphIds
            );
        },
        neighbourIndex() {
            return getNeighbourIndex(this.linksInSelectedSubgraphs);
        },
        subgraphColour() {
            return (subgraphId: Nullable<SubgraphId>) => getSubgraphColour(useDataStore().subgraphs, subgraphId);
        },
        titleOrBody() {
            return (postId: PostId) => getTitleOrBody(useDataStore().posts, postId);
        },
        isNeighbour() {
            return (postAId: PostId, postBId: PostId) => isNeighbour(this.neighbourIndex, postAId, postBId);
        },
        shouldShowClickButtonMenu() {
            return useClickerStore().shouldShowClickButtonMenu;
        },
        clickMode() {
            return useClickerStore().clickMode;
        },
        nodePositions() {
            const selectedGraphId = this.selectedGraphId;
            return selectedGraphId == null
                ? {}
                : useDataStore().graphs[selectedGraphId]?.nodePositions ?? {};
        }
    },
    watch: {
        selectedGraphId() {
            this.shouldResetZooming = true;
            this.debouncedMakeGraphSvg();
        },
        selectedSubgraphIds() {
            this.debouncedMakeGraphSvg();
        },
        postsInSelectedSubgraphs() {
            this.debouncedMakeGraphSvg();
        },
        linksInSelectedSubgraphs() {
            this.debouncedMakeGraphSvg();
        },
        zoom({x, y, scale}: Zoom) {
            if (this.rootG == null) {
                return;
            }

            this.rootG.attr("transform", `translate(${x} ${y}) scale(${scale})`);

            const unshiftedTextScaleFactor = INITIAL_ZOOM / scale;
            const textScaleFactor = unshiftedTextScaleFactor < 1
                ? unshiftedTextScaleFactor
                : 1 + ((unshiftedTextScaleFactor - 1) * 0.35); // I don't want the text to get big really quickly
            const originalTextSize = 48;
            const maxTextSize = 220;
            const newTextSize = Math.min(
                maxTextSize,
                Math.ceil(originalTextSize * textScaleFactor)
            );

            document.documentElement.style.setProperty("--node-text-size", (this.isPhone() ? (newTextSize / 2) : newTextSize) + "px");

            const minLinkStroke = 8;
            const maxLinkStroke = 110;
            this.linkStroke = Math.max(
                minLinkStroke,
                Math.min(
                    maxLinkStroke,
                    Math.ceil(this.originalLinkStroke * textScaleFactor)
                )
            );
            document.documentElement.style.setProperty("--link-stroke-width", this.linkStroke + "px");

            if (this.nodeSelection != null) {
                this.nodeSelection
                    .attr("r", this.linkStroke);
            }

            this.debouncedSaveZoomState();
        }
    },
    created() {
        this.debouncedMakeGraphSvg = debounce(
            () => {
                void this.makeGraphSvg();
            },
            500,
            {
                leading: true,
                trailing: true,
            }
        );
        this.debouncedSaveZoomState = debounce(
            () => {
                // Avoid immediately autosaving the zoom state we just loaded.
                if (this.hasMounted) {
                    this.setZoom(this.zoom);
                } else {
                    this.hasMounted = true;
                }
            },
            250,
            {
                leading: false,
                trailing: true,
            }
        );
    },
    mounted() {
        this.svg = d3select<SVGSVGElement, unknown>("#graphSvg");
        this.rootG = d3select<SVGGElement, unknown>("#graphSvg g");

        this.linksG = d3select<SVGGElement, unknown>(".graph__links")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6);

        this.nodesG = d3select<SVGGElement, unknown>(".graph__nodes")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);

        this.setupZooming();
        const dataStore = useDataStore();
        if (this.svg == null || this.zoomBehaviour == null) {
            return;
        }

        this.svg.call(this.zoomBehaviour)
            .call(
                this.zoomBehaviour.transform,
                d3zoomIdentity
                    .translate(
                        dataStore.zoom.x,
                        dataStore.zoom.y
                    ).scale(dataStore.zoom.scale)
            );
        this.$nextTick(() => {
            this.debouncedMakeGraphSvg();
        });

        graphEventBus.on("focusOnPost", this.focusOnPost);
        graphEventBus.on("highlightPost", this.highlightPost);
        graphEventBus.on("unhighlightPost", this.unhighlightPost);
        graphEventBus.on("refreshGraph", this.debouncedMakeGraphSvg);
        graphEventBus.on("zoomIn", this.zoomIn);
        graphEventBus.on("zoomOut", this.zoomOut);
    },
    beforeUnmount() {
        graphEventBus.off("focusOnPost", this.focusOnPost);
        graphEventBus.off("highlightPost", this.highlightPost);
        graphEventBus.off("unhighlightPost", this.unhighlightPost);
        graphEventBus.off("refreshGraph", this.debouncedMakeGraphSvg);
        graphEventBus.off("zoomIn", this.zoomIn);
        graphEventBus.off("zoomOut", this.zoomOut);
    },
    methods: {
        isPhone() {
            const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            return viewportWidth <= 576;
        },
        setIsRenderingGraph(isRenderingGraph: boolean) {
            useRootStore().setIsRenderingGraph(isRenderingGraph);
        },
        setZoom(zoom: Zoom) {
            useDataStore().setZoom(zoom);
        },
        setPostPosition(payload: {postId: PostId; position: NodePosition}) {
            useDataStore().setPostPosition(payload);
        },
        setShouldShowClickButtonMenu(shouldShowClickButtonMenu: boolean) {
            useClickerStore().setShouldShowClickButtonMenu(shouldShowClickButtonMenu);
        },
        setClickMode(clickMode: ClickMode) {
            useClickerStore().setClickMode(clickMode);
        },
        async handlePostClick(post: unknown) {
            await useClickerStore().handlePostClick(post);
        },
        async handleLinkClick(payload: ClickedLinkPayload) {
            return useClickerStore().handleLinkClick(payload);
        },
        onSvgClick(event: MouseEvent) {
            const target = event.target as HTMLElement | null;
            if (target?.id !== "graphSvg") {
                return;
            }

            if (this.shouldShowClickButtonMenu) {
                this.setShouldShowClickButtonMenu(false);
            }

            if (this.clickMode !== "openPosts") {
                this.setClickMode("openPosts");
            }
        },
        buildGraphData(): {
            nodes: GraphNode[];
            links: GraphLink[];
        } {
            const nodes = JSON.parse(JSON.stringify(this.postsInSelectedSubgraphs)) as GraphNode[];
            const positionedNodes = nodes.map((node: GraphNode) => {
                const nodePosition = this.nodePositions[node.id];
                if (nodePosition != null) {
                    node.fx = nodePosition.x;
                    node.fy = nodePosition.y;
                    node.x = nodePosition.x;
                    node.y = nodePosition.y;
                }
                return node;
            });

            return {
                nodes: positionedNodes,
                links: JSON.parse(JSON.stringify(this.linksInSelectedSubgraphs)) as GraphLink[],
            };
        },
        createForceSimulation(nodes: GraphNode[], links: GraphLink[]): GraphSimulation {
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
        },
        bindLinks(links: GraphLink[]): void {
            if (this.linksG == null) {
                return;
            }

            const vm = this;
            this.linkSelection = this.linksG
                .selectAll<SVGLineElement, GraphLink>("line")
                .data(links, (link: GraphLink) => link.id)
                .join("line")
                .classed("graph__link", true)
                .classed("graph__link--sidenote", (link: GraphLink) => link.type === "sidenote")
                .classed("graph__link--link", (link: GraphLink) => link.type === "link")
                .attr("stroke", (link: GraphLink) => this.subgraphColour(link.subgraphId))
                .attr("marker-end", "url(#arrowhead)")
                .on("click", async function(this: SVGLineElement, link: GraphLink) {
                    const sourcePosition = getEndpointPosition(link.source);
                    const targetPosition = getEndpointPosition(link.target);
                    const returnedValue = await vm.handleLinkClick(
                        {
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
                            coordinates: d3mouse(this.parentNode as SVGGElement)
                        }
                    );
                    if (returnedValue != null) {
                        vm.focusOnPost(returnedValue, 1.5);
                    }
                })
                .call(d3drag<SVGLineElement, GraphLink>().clickDistance(4));
        },
        bindNodes(nodes: GraphNode[], simulation: GraphSimulation): void {
            if (this.nodesG == null) {
                return;
            }

            let nodeGroups = this.nodesG
                .selectAll<SVGGElement, GraphNode>("g")
                .data(nodes, (post: GraphNode) => post.id);

            nodeGroups.exit().remove();

            const newNodeGroups = nodeGroups.enter();
            const newNodeGroup = newNodeGroups.append<SVGGElement>("g")
                .classed("node", true);
            newNodeGroup.append("circle");
            newNodeGroup.append("text");

            nodeGroups = newNodeGroup.merge(nodeGroups);
            nodeGroups
                .selectAll<SVGGElement, GraphNode>("g")
                .attr("dataset-id", (post: GraphNode) => post.id);

            this.nodeSelection = d3selectAll<SVGGElement, GraphNode>(".node")
                .select<SVGCircleElement>("circle")
                .classed("node__circle", true)
                .attr("r", this.linkStroke)
                .attr("title", (post: GraphNode) => post.title);

            this.textSelection = d3selectAll<SVGGElement, GraphNode>(".node")
                .select<SVGTextElement>("text")
                .classed("node__text", true)
                .attr("text-anchor", "end")
                .attr("id", (post: GraphNode) => `text-${post.id}`)
                .text((post: GraphNode) => this.titleOrBody(post.id))
                .on("mouseover", (post: GraphNode) => {
                    this.highlightPost(post.id);
                })
                .on("mouseout", (post: GraphNode) => {
                    this.unhighlightPost(post.id);
                });

            d3selectAll<SVGElement, GraphNode>(".node *")
                .on("click", (post: GraphNode) => {
                    void this.handlePostClick(post);
                })
                .call(d3drag<SVGElement, GraphNode>().clickDistance(4))
                .call(this.createDragBehaviour(simulation));
        },
        bindForceSimulationTick(simulation: GraphSimulation): void {
            simulation.on("tick", () => {
                if (this.linkSelection == null || this.nodeSelection == null || this.textSelection == null) {
                    return;
                }

                this.linkSelection
                    .attr("x1", (link: GraphLink) => getEndpointPosition(link.source).x)
                    .attr("y1", (link: GraphLink) => getEndpointPosition(link.source).y)
                    .attr("x2", (link: GraphLink) => getEndpointPosition(link.target).x)
                    .attr("y2", (link: GraphLink) => getEndpointPosition(link.target).y);

                this.nodeSelection
                    .attr("cx", (node: GraphNode) => node.x ?? 0)
                    .attr("cy", (node: GraphNode) => node.y ?? 0);

                this.textSelection
                    .attr("x", (node: GraphNode) => (node.x ?? 0) - 6)
                    .attr("y", (node: GraphNode) => (node.y ?? 0) - 4);
            });
        },
        maybeResetZoom(): void {
            if (!this.shouldResetZooming) {
                return;
            }

            this.shouldResetZooming = false;
            this.$nextTick(() => {
                this.resetZoomToCenter();
            });
        },
        syncNodesWithCoordinates(nodes: GraphNode[]): void {
            const postsKeyedById: Record<PostId, GraphNode> = {};
            for (const post of nodes) {
                postsKeyedById[post.id] = post;
            }
            this.nodesWithCoordinates = postsKeyedById;
        },
        async makeGraphSvg() {
            if (this.linksG == null || this.nodesG == null) {
                return;
            }

            this.setIsRenderingGraph(true);
            const {nodes, links} = this.buildGraphData();
            const forceSimulation = this.createForceSimulation(nodes, links);

            this.bindLinks(links);
            this.bindNodes(nodes, forceSimulation);
            this.bindForceSimulationTick(forceSimulation);
            this.maybeResetZoom();
            this.syncNodesWithCoordinates(nodes);
            this.setIsRenderingGraph(false);
        },

        setupZooming() {
            /*
            https://github.com/d3/d3-zoom/blob/v1.8.3/README.md#zoom
            Zooms work like this:
                there's a zoom _behaviour_, which is a function and object - it's normally applied to a selection with `selection.call(zoomBehaviour)` (which is the same as `zoomBehaviour(selection)`). Applying the behaviour binds the panning and zooming event listeners and initialises the zoom transform
                the behaviour doesn't store the state of the zoom, a zoom _transform_ does
                doing `zoom.transform(selection, transform)` sets the zoom transform on that selection to be the transform argument, which is what you do to programmatically zoom - it seems to trigger the behaviour's "zoom" event listener

                d3zoomIdentity.translate(x, y).scale(k) makes a new transform
             */
            this.zoomBehaviour = d3zoom<SVGSVGElement, unknown>()
                .scaleExtent([0.025, 2])
                .on("zoom", () => {
                    const x = d3event.transform.x;
                    const y = d3event.transform.y;
                    const scale = d3event.transform.k;
                    this.zoom = {x, y, scale};
                });
            if (this.svg == null) {
                return;
            }

            this.svg.call(this.zoomBehaviour)
                .on("wheel", () => {
                    d3event.preventDefault();
                });
        },
        resetZoomToCenter() {
            if (this.svg == null || this.zoomBehaviour == null) {
                return;
            }

            this.svg.call(this.zoomBehaviour)
                .call(
                    this.zoomBehaviour.transform,
                    d3zoomIdentity
                        .translate(WIDTH / 2, HEIGHT / 2)
                        .scale(INITIAL_ZOOM)
                ); // sets initial x/y and zoom amount
        },
        focusOnPost(id: PostId, speed = 1) {
            if (this.svg == null || this.zoomBehaviour == null) {
                return;
            }

            const xOffset = this.isPhone()
                ? 550
                : 2000;
            const yOffset = this.isPhone()
                ? 300
                : 500;

            const post = this.nodesWithCoordinates[id];
            if (post?.x == null || post?.y == null) {
                return;
            }

            this.svg.transition()
                .duration(1500 / speed)
                .call(
                    this.zoomBehaviour.transform,
                    d3zoomIdentity
                        .scale(INITIAL_ZOOM)
                        .translate(-post.x + xOffset, -post.y + yOffset) // magic numbers that work on desktop and my phone
                );
        },
        zoomIn() {
            if (this.svg == null || this.zoomBehaviour == null) {
                return;
            }
            this.svg.transition()
                .call(this.zoomBehaviour.scaleBy, 2);
        },
        zoomOut() {
            if (this.svg == null || this.zoomBehaviour == null) {
                return;
            }
            this.svg.transition()
                .call(this.zoomBehaviour.scaleBy, 0.5);
        },

        createDragBehaviour(simulation: GraphSimulation): GraphDragBehavior {
            const vm = this;
            function dragStarted(node: GraphNode) {
                if (!d3event.active) {
                    simulation.alphaTarget(0.3).restart();
                }

                function fixNodes(thisNode: GraphNode) {
                    vm.nodeSelection?.each(function (d: GraphNode) {
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

            function dragged(node: GraphNode) {
                node.fx = d3event.x;
                node.fy = d3event.y;
            }

            function dragEnded(node: GraphNode) {
                if (!d3event.active) {
                    simulation.alpha(0);
                    simulation.alphaTarget(0);
                }
                node.fx = d3event.x;
                node.fy = d3event.y;
                vm.setPostPosition({
                    postId: node.id,
                    position: {
                        x: d3event.x,
                        y: d3event.y
                    }
                });
            }

            return d3drag<SVGElement, GraphNode>()
                .on("start", dragStarted)
                .on("drag", dragged)
                .on("end", dragEnded);
        },

        highlightPost(postId: PostId) {
            const textElement = document.getElementById(`text-${postId}`);
            if (textElement == null || this.nodeSelection == null || this.textSelection == null || this.linkSelection == null) {
                return;
            }

            d3select(textElement)
                .style("filter", "url(#postHoverFilter)");

            const parentNode = d3select(textElement).node()?.parentNode;
            if (parentNode != null) {
                d3select(parentNode as SVGGElement).raise();
            }

            const nonNeighbourNodes = this.nodeSelection.filter((otherPost: unknown) => {
                const post = otherPost as GraphNode;
                if (postId === post.id) {
                    return false;
                }
                return !this.isNeighbour(postId, post.id);
            });
            nonNeighbourNodes.style("opacity", 0.2);

            const nonNeighbourTexts = this.textSelection.filter((otherPost: unknown) => {
                const post = otherPost as GraphNode;
                if (postId === post.id) {
                    return false;
                }
                return !this.isNeighbour(postId, post.id);
            });
            nonNeighbourTexts.style("opacity", 0.2);

            const nonNeighbourLinks = this.linkSelection.filter((linkValue: unknown) => {
                const link = linkValue as GraphLink;
                const linkDoesntIncludeThisPost = postId !== getEndpointId(link.source)
                    && postId !== getEndpointId(link.target);
                return linkDoesntIncludeThisPost;
            });
            nonNeighbourLinks.style("opacity", 0.2);
        },
        unhighlightPost(postId: PostId) {
            const textElement = document.getElementById(`text-${postId}`);
            if (textElement != null) {
                d3select(textElement)
                    .style("filter", "");
            }
            this.nodeSelection?.style("opacity", 1);
            this.textSelection?.style("opacity", 1);
            this.linkSelection?.style("opacity", 1);
        }
    }
});
</script>

<style>
    :root {
        --node-text-size: 48px;
        --link-stroke-width: 20px;
    }
    #graphSvg {
        min-width: 33%;
    }

    .graph__link {
        fill: none;
        stroke-width: var(--link-stroke-width);
        cursor: pointer;
    }
    .graph__link--sidenote {
        stroke-dasharray: 50, 50;
    }
    .graph__link--link {
        stroke-dasharray: 10, 10;
    }

    .node__circle {
        fill: #353535;
        stroke: none;
        cursor: pointer;
    }

    .node__text {
        cursor: pointer;
        text-shadow: 0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff;
        fill: #333333;

        font-size: var(--node-text-size);
        font-weight: bold;
        stroke-width: 0;
    }
</style>
