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

<script>
import {select as d3select, selectAll as d3selectAll, event as d3event, mouse as d3mouse} from "d3-selection";
import {forceSimulation as d3forceSimulation, forceLink as d3forceLink, forceManyBody as d3forceManyBody, forceCenter as d3forceCenter} from "d3-force";
import {zoom as d3zoom, zoomIdentity as d3zoomIdentity} from "d3-zoom";
import {drag as d3drag} from "d3-drag";

import debounce from "lodash/debounce";

import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import FloatingActionButton from "./FloatingActionButton";
import {HEIGHT, INITIAL_ZOOM, WIDTH} from "@/src/commonComponents/constants";

export default {
    name: "OfflineGraph",
    components: {
        FloatingActionButton
    },
    data() {
        return {
            svg: null,
            rootG: null,

            shouldSaveZoomChanges: false,
            zoom: null,
            zoomBehaviour: null,
            shouldResetZooming: false,

            linksG: null,
            nodesG: null,
            link: null,
            node: null,
            text: null,

            nodesWithCoordinates: {}, // after D3 has added `x` and `y` coordinates to each object
        };
    },
    computed: {
        ...mapState("settingsModule", ["canOpenMultiplePosts"]),

        ...mapState("dataModule", ["selectedGraphId", "selectedSubgraphIds"]),
        ...mapGetters("dataModule", ["postsInSelectedSubgraphs", "linksInSelectedSubgraphs", "subgraphColour", "titleOrBody", "isNeighbour"]),

        ...mapState("clickerModule", ["shouldShowClickButtonMenu", "clickMode"]),
        nodePositions() {
            return this.$store.state.dataModule.graphs[this.selectedGraphId].nodePositions;
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
        zoom({x, y, scale}) {
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

            document.querySelector(":root")
                .style.setProperty("--node-text-size", newTextSize + "px");

            const minLinkStroke = 8;
            const originalLinkStroke = 20;
            const maxLinkStroke = 110;
            const newLinkStroke = Math.max(
                minLinkStroke,
                Math.min(
                    maxLinkStroke,
                    Math.ceil(originalLinkStroke * textScaleFactor)
                )
            );
            document.querySelector(":root")
                .style.setProperty("--link-stroke-width", newLinkStroke + "px");

            this.debouncedSaveZoomState();
        }
    },
    mounted() {
        this.svg = d3select("#graphSvg");
        this.rootG = d3select("#graphSvg g");

        this.linksG = d3select(".graph__links")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6);

        this.nodesG = d3select(".graph__nodes")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);

        this.setupZooming();
        this.svg.call(this.zoomBehaviour)
            .call(
                this.zoomBehaviour.transform,
                d3zoomIdentity
                    .translate(
                        this.$store.state.dataModule.zoom.x, // sets initial x/y and zoom amount
                        this.$store.state.dataModule.zoom.y
                    ).scale(this.$store.state.dataModule.zoom.scale)
            );
        this.$nextTick(() => {
            this.debouncedMakeGraphSvg();
        });

        this.$root.$on("focusOnPost", this.focusOnPost);
        this.$root.$on("highlightPost", this.highlightPost);
        this.$root.$on("unhighlightPost", this.unhighlightPost);
    },
    methods: {
        ...mapMutations(["setIsRenderingGraph"]),
        ...mapMutations("dataModule", ["setZoom", "setPostPosition"]),
        ...mapMutations("clickerModule", ["setShouldShowClickButtonMenu", "setClickMode"]),

        ...mapActions("clickerModule", ["handlePostClick", "handleLinkClick"]),

        onSvgClick(event) {
            if (event.target.id !== "graphSvg") {
                return;
            }

            if (this.shouldShowClickButtonMenu) {
                this.setShouldShowClickButtonMenu(false);
            }

            if (this.clickMode !== "openPosts") {
                this.setClickMode("openPosts");
            }
        },

        debouncedMakeGraphSvg: debounce(
            function() {
                this.makeGraphSvg();
            },
            500,
            {
                "leading": true,
                "trailing": true,
            }
        ),
        async makeGraphSvg() {
            this.setIsRenderingGraph(true);

            //todo: almost definitely in-efficient
            let nodes = JSON.parse(JSON.stringify(this.postsInSelectedSubgraphs));
            nodes = nodes.map((node) => {
                const nodePosition = this.nodePositions[node.id];
                if (nodePosition != null) {
                    node.fx = nodePosition.x;
                    node.fy = nodePosition.y;
                }
                return node;
            });
            const links = JSON.parse(JSON.stringify(this.linksInSelectedSubgraphs));

            const vm = this;

            const drag = (simulation, nodes) => {
                function dragStarted(node) {
                    if (!d3event.active) {
                        simulation.alphaTarget(0.3).restart();
                    }

                    // Preventing other nodes from moving while dragging one node
                    function fixNodes(thisNode) {
                        nodes.each(function (d) {
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

                function dragged(node) {
                    node.fx = d3event.x;
                    node.fy = d3event.y;
                }

                function dragEnded(node) {
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

                return d3drag()
                    .on("start", dragStarted)
                    .on("drag", dragged)
                    .on("end", dragEnded);
            };

            // setup force simulation
            const simulation = d3forceSimulation(nodes)
                .force("link", d3forceLink(links)
                    .id(d => d.id)
                    .distance(200)
                )
                .force("charge", d3forceManyBody()
                    .strength(-7500)
                )
                .force("center", d3forceCenter(WIDTH / 2, HEIGHT / 2));
            simulation.tick(300);

            // add links
            this.linkSelection = this.linksG
                .selectAll("line")
                .data(links, link => link.id)
                .join("line")
                .classed("graph__link", true)
                .classed("graph__link--sidenote", (link) => link.type === "sidenote")
                .classed("graph__link--link", (link) => link.type === "link")
                .attr("stroke", (link) => this.subgraphColour(link.subgraphId))
                .attr("marker-end", "url(#arrowhead)")
                .on("click", async function (link) {
                    const returnedValue = await vm.handleLinkClick(
                        {
                            link,
                            coordinates: d3mouse(this)
                        }
                    );
                    if (returnedValue != null) {
                        const postIdToFocusOn = returnedValue;
                        vm.focusOnPost(postIdToFocusOn, 1.5);
                    }
                })
                .call(d3drag().clickDistance(4));

            let nodeGroups = this.nodesG
                .selectAll("g")
                .data(nodes, post => post.id);

            // remove nodes for old posts
            nodeGroups.exit().remove();

            // add nodes for new posts
            const newNodeGroups = nodeGroups.enter();
            const newNodeGroup = newNodeGroups.append("g")
                .classed("node", true);
            newNodeGroup.append("circle");
            newNodeGroup.append("text");
            
            // merge the previously-existing and newly-made selections together
            nodeGroups = nodeGroups.merge(newNodeGroups);
            nodeGroups
                .selectAll("g")
                .attr("dataset-id", post => post.id);

            // if the nodes aren't being made, that might be because the .node circles don't exist in the DOM when this function is called
            this.nodeSelection = d3selectAll(".node").select("circle")
                .classed("node__circle", true)
                .attr("r", 15)
                .attr("title", post => post.title);
                
            this.textSelection = d3selectAll(".node").select("text")
                .classed("node__text", true)
                .attr("text-anchor", "end")
                .attr("id", post => `text-${post.id}`)
                .text(post => this.titleOrBody(post.id))
                .on("mouseover", (post) => {
                    this.highlightPost(post.id);
                })
                .on("mouseout", (post) => {
                    this.unhighlightPost(post.id);
                });
                
            d3selectAll(".node *")
                .on("click", this.handlePostClick)
                .call(d3drag().clickDistance(4)) // if the mouse moves less than 4 units while clicking, it's counted as a click
                .call(drag(simulation, this.nodeSelection));

            // set x and y co-ordinates of the links, and nodes
            simulation.on("tick", () => {
                this.linkSelection
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                this.nodeSelection
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);

                this.textSelection
                    .attr("x", d => d.x - 6)
                    .attr("y", d => d.y - 4);
            });

            if (this.shouldResetZooming) {
                this.shouldResetZooming = false;
                this.$nextTick(() => {
                    this.resetZoomToCenter();
                });
            }

            if (!this.shouldSaveZoomChanges) {
                this.$nextTick(() => {
                    this.shouldSaveZoomChanges = true;
                });
            }

            let postsKeyedById = {};
            for (const post of nodes) {
                postsKeyedById[post.id] = post;
            }
            this.nodesWithCoordinates = postsKeyedById;
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
            this.zoomBehaviour = d3zoom()
                .scaleExtent([0.025, 2]) // limits zooming so you can only zoom between 0.2x and 2x
                .on("zoom", () => {
                    const x = d3event.transform.x;
                    const y = d3event.transform.y;
                    const scale = d3event.transform.k;
                    this.zoom = {x, y, scale};
                });
            this.svg.call(this.zoomBehaviour)
                .on("wheel", () => {
                    d3event.preventDefault();
                });
        },
        resetZoomToCenter() {
            this.svg.call(this.zoomBehaviour)
                .call(
                    this.zoomBehaviour.transform,
                    d3zoomIdentity
                        .translate(WIDTH / 2, HEIGHT / 2)
                        .scale(INITIAL_ZOOM)
                ); // sets initial x/y and zoom amount
        },
        debouncedSaveZoomState: debounce(
            function() {
                if (this.shouldSaveZoomChanges) {
                    this.setZoom(this.zoom);
                }
            },
            250,
            {
                "leading": false,
                "trailing": true, // we always need to call it the final time, so that D3 picks up any new nodes or links,
            }
        ),

        highlightPost(postId) {
            const textElement = document.getElementById(`text-${postId}`);
            d3select(textElement)
                .style("filter", "url(#postHoverFilter)");

            // SVG doesn't have a z-index, the z-direction is by element order, this re-inserts the parent <node> in the DOM at the bottom of its parent so this text is on top of any others
            d3select(d3select(textElement).node().parentNode).raise();

            const nonNeighbourNodes = this.nodeSelection.filter(otherPost => {
                if (postId === otherPost.id) {
                    return false;
                }
                return !this.isNeighbour(postId, otherPost.id);
            });
            nonNeighbourNodes.style("opacity", 0.2);

            const nonNeighbourTexts = this.textSelection.filter(otherPost => {
                if (postId === otherPost.id) {
                    return false;
                }
                return !this.isNeighbour(postId, otherPost.id);
            });
            nonNeighbourTexts.style("opacity", 0.2);

            const nonNeighbourLinks = this.linkSelection.filter(link => {
                const linkDoesntIncludeThisPost = postId !== link.source.id
                    && postId !== link.target.id;
                return linkDoesntIncludeThisPost;
            });
            nonNeighbourLinks.style("opacity", 0.2);
        },
        unhighlightPost(postId) {
            const textElement = document.getElementById(`text-${postId}`);
            d3select(textElement)
                .style("filter", "");
            this.nodeSelection.style("opacity", 1);
            this.textSelection.style("opacity", 1);
            this.linkSelection.style("opacity", 1);
        },
        focusOnPost(id, speed = 1) {
            const post = this.nodesWithCoordinates[id];
            this.svg.transition()
                .duration(1500 / speed)
                .call(
                    this.zoomBehaviour.transform,
                    d3zoomIdentity
                        .scale(INITIAL_ZOOM)
                        .translate(-post.x + 550, -post.y + 500) // magic numbers that work on desktop and my phone
                );
        }
    }
};
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
