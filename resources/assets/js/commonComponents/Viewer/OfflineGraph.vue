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
import * as d3 from "d3";
import debounce from "lodash.debounce";

import {mapState, mapGetters, mapMutations, mapActions} from "vuex";
import FloatingActionButton from "./FloatingActionButton";
import {WIDTH, HEIGHT, INITIAL_ZOOM} from "@/js/commonComponents/constants";

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

            nodesWithCoordinates: {} // after D3 has added `x` and `y` coordinates to each object
        };
    },
    computed: {
        ...mapState("settingsModule", ["canOpenMultiplePosts"]),

        ...mapState("postsModule", ["selectedGraphIds"]),
        ...mapGetters("postsModule", ["postsInSelectedGraphs", "linksInSelectedGraphs", "graphColour", "titleOrBody", "isNeighbour"]),

        ...mapState("clickerModule", ["shouldShowClickButtonMenu", "clickMode"]),
        selectedPostIds() {
            return this.$store.state.postsModule.selectedPostIds;
        }
    },
    watch: {
        selectedGraphIds() {
            this.shouldResetZooming = true;
            this.debouncedMakeGraphSvg();
        },
        postsInSelectedGraphs() {
            this.debouncedMakeGraphSvg();
        },
        linksInSelectedGraphs() {
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
            this.debouncedSaveZoomState();
        }
    },
    mounted() {
        this.svg = d3.select("#graphSvg");
        this.rootG = d3.select("#graphSvg g");

        this.linksG = d3.select(".graph__links")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6);

        this.nodesG = d3.select(".graph__nodes")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);

        this.setupZooming();
        this.svg.call(this.zoomBehaviour)
            .call(
                this.zoomBehaviour.transform,
                d3.zoomIdentity
                    .translate(
                        this.$store.state.postsModule.zoom.x, // sets initial x/y and zoom amount
                        this.$store.state.postsModule.zoom.y
                    ).scale(this.$store.state.postsModule.zoom.scale)
            );
        this.$nextTick(() => {
            this.debouncedMakeGraphSvg();
        });

        this.$root.$on("focusOnPost", this.focusOnPost);
    },
    methods: {
        ...mapMutations("postsModule", ["selectPostId", "setZoom"]),
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
                "leading": false,
                "trailing": true,
            }
        ),
        makeGraphSvg() {
            //todo: almost definitely in-efficient
            const nodes = JSON.parse(JSON.stringify(this.postsInSelectedGraphs));
            const links = JSON.parse(JSON.stringify(this.linksInSelectedGraphs));

            const vm = this;
            
            // setup force simulation
            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links)
                    .id(d => d.id)
                    .distance(200)
                )
                .force("charge", d3.forceManyBody()
                    .strength(-7500)
                )
                .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2));
            simulation.tick(300);

            // add links
            const link = this.linksG
                .selectAll("line")
                .data(links, link => link.id)
                .join("line")
                .classed("graph__link", true)
                .classed("graph__link--sidenote", (link) => link.type === "sidenote")
                .classed("graph__link--link", (link) => link.type === "link")
                .attr("stroke", (link) => this.graphColour(link.graph))
                .attr("marker-end", "url(#arrowhead)")
                .on("click", async function (link) {
                    const returnedValue = await vm.handleLinkClick(
                        {
                            link,
                            coordinates: d3.mouse(this)
                        }
                    );
                    if (returnedValue != null) {
                        const postIdToFocusOn = returnedValue;
                        vm.focusOnPost(postIdToFocusOn, 1.5);
                    }
                })
                .call(d3.drag().clickDistance(4));

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

            const node = d3.selectAll(".node").select("circle")
                .classed("node__circle", true)
                .attr("r", 15)
                .attr("title", post => post.title);
                //.call(drag(simulation));
                
            const text = d3.selectAll(".node").select("text")
                .classed("node__text", true)
                .attr("text-anchor", "end")
                .text(post => this.titleOrBody(post.id))
                .on("mouseover", function (post) {
                    d3.select(this)
                        .style("filter", "url(#postHoverFilter)");

                    // SVG doesn't have a z-index, the z-direction is by element order, this re-inserts the parent <node> in the DOM at the bottom of its parent so this text is on top of any others
                    d3.select(d3.select(this).node().parentNode).raise();

                    const nonNeighbourNodes = node.filter(otherPost => {
                        if (post.id === otherPost.id) {
                            return false;
                        }
                        return !vm.isNeighbour(post, otherPost);
                    });
                    nonNeighbourNodes.style("opacity", 0.2);

                    const nonNeighbourTexts = text.filter(otherPost => {
                        if (post.id === otherPost.id) {
                            return false;
                        }
                        return !vm.isNeighbour(post, otherPost);
                    });
                    nonNeighbourTexts.style("opacity", 0.2);

                    const nonNeighbourLinks = link.filter(link => {
                        const linkDoesntIncludeThisPost = post.id !== link.source.id
                            && post.id !== link.target.id;
                        return linkDoesntIncludeThisPost;
                    });
                    nonNeighbourLinks.style("opacity", 0.2);
                })
                .on("mouseout", function (post) {
                    d3.select(this)
                        .style("filter", "");
                    node.style("opacity", 1);
                    text.style("opacity", 1);
                    link.style("opacity", 1);
                });
                
            d3.selectAll(".node *")
                .on("click", this.handlePostClick)
                .call(d3.drag().clickDistance(4)); // if the mouse moves less than 4 units while clicking, it's counted as a click

            // set x and y co-ordinates of the links, and nodes
            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);

                text
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
        },

        setupZooming() {
            /*
            https://github.com/d3/d3-zoom/blob/v1.8.3/README.md#zoom
            Zooms work like this:
                there's a zoom _behaviour_, which is a function and object - it's normally applied to a selection with `selection.call(zoomBehaviour)` (which is the same as `zoomBehaviour(selection)`). Applying the behaviour binds the panning and zooming event listeners and initialises the zoom transform
                the behaviour doesn't store the state of the zoom, a zoom _transform_ does
                doing `zoom.transform(selection, transform)` sets the zoom transform on that selection to be the transform argument, which is what you do to programmatically zoom - it seems to trigger the behaviour's "zoom" event listener

                d3.zoomIdentity.translate(x, y).scale(k) makes a new transform
             */
            this.zoomBehaviour = d3.zoom()
                .scaleExtent([0.05, 2]) // limits zooming so you can only zoom between 0.2x and 2x
                .on("zoom", () => {
                    const x = d3.event.transform.x;
                    const y = d3.event.transform.y;
                    const scale = d3.event.transform.k;
                    this.zoom = {x, y, scale};
                });
            this.svg.call(this.zoomBehaviour)
                .on("wheel", () => {
                    d3.event.preventDefault();
                });
        },
        resetZoomToCenter() {
            this.svg.call(this.zoomBehaviour)
                .call(
                    this.zoomBehaviour.transform,
                    d3.zoomIdentity
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

        focusOnPost(id, speed = 1) {
            const post = this.nodesWithCoordinates[id];
            this.svg.transition()
                .duration(1500 / speed)
                .call(
                    this.zoomBehaviour.transform,
                    d3.zoomIdentity
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
