<template>
    <svg
        id="graphSvg"
        class="cursor-move border bg-white"
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
                    <feFuncA type="linear" slope="0.75"></feFuncA>
                </feComponentTransfer>
                <feComposite in="SourceGraphic"></feComposite>
            </filter>
        </defs>
        <g transform="translate(5, 15) scale(0.5)">
            <g class="graph__links"></g>
            <g class="graph__nodes"></g>
        </g>
    </svg>
</template>

<script>
import * as d3 from "d3";
import debounce from "lodash.debounce";

import { mapState, mapGetters, mapMutations } from "vuex";

const WIDTH = 400;
const HEIGHT = 200;

export default {
    name: "OfflineGraph",
    data() {
        return {
            svg: null,
            rootG: null,

            linksG: null,
            nodesG: null,
        };
    },
    computed: {
        ...mapState("settingsModule", ["canOpenMultiplePosts"]),

        ...mapState("postsModule", ["selectedGraphIds"]),
        ...mapGetters("postsModule", ["postsInSelectedGraphs", "linksInSelectedGraphs", "graphColour", "titleOrBody"]),

        selectedPostIds() {
            return this.$store.state.postsModule.selectedPostIds;
        },

        linkedByIndex() {
            let linkedByIndex = {};
            this.linksInSelectedGraphs.forEach(function (link) {
                linkedByIndex[link.source + "," + link.target] = 1;
            });
            return linkedByIndex;
        }
    },
    watch: {
        selectedGraphIds() {
            this.debouncedMakeGraphSvg();
        },
        postsInSelectedGraphs() {
            this.debouncedMakeGraphSvg();
        },
        linksInSelectedGraphs() {
            this.debouncedMakeGraphSvg();
        },
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
        this.$nextTick(() => {
            this.debouncedMakeGraphSvg();
        });
    },
    methods: {
        ...mapMutations("postsModule", ["selectPostId"]),

        isNeighbour(a, b) {
            return this.linkedByIndex[a.id + "," + b.id];
        },

        debouncedMakeGraphSvg: debounce(
            function() {
                this.makeGraphSvg();
            },
            250,
            {
                "leading": true,
                "trailing": false,
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
                    .strength(-1000)
                )
                .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2));
            simulation.tick(300);

            // add links
            const link = this.linksG
                .selectAll("line")
                .data(links, link => link.id)
                .join("line")
                .classed("graph__link", true)
                .attr("stroke", (link) => this.graphColour(link.graph))
                .attr("marker-end", "url(#arrowhead)");

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
                .attr("r", 5)
                .attr("title", post => post.title)
                .attr("fill", "#ccc");
                //.call(drag(simulation));
                
            const text = d3.selectAll(".node").select("text")
                .classed("node__text", true)
                .attr("text-anchor", "end")
                .text(post => this.titleOrBody(post.id))
                .on("mouseover", function (post) {
                    d3.select(this)
                        .style("filter", "url(#postHoverFilter)");
                    const otherPostTexts = text.filter(otherPost => {
                        if (post.id === otherPost.id) {
                            return false;
                        }
                        return !vm.isNeighbour(post, otherPost)
                            && !vm.isNeighbour(otherPost, post);
                    });
                    otherPostTexts.style("opacity", 0.2);

                    const otherLinks = link.filter(link => {
                        const linkDoesntIncludeThisPost = post.id !== link.source.id
                            && post.id !== link.target.id;
                        return linkDoesntIncludeThisPost;
                    });
                    otherLinks.style("opacity", 0.2);
                })
                .on("mouseout", function (post) {
                    d3.select(this)
                        .style("filter", "");
                    text.style("opacity", 1);
                    link.style("opacity", 1);
                });
                
            d3.selectAll(".node *")
                .on("click", (post) => {
                    this.selectPostId({
                        id: post.id,
                        canOpenMultiplePosts: this.canOpenMultiplePosts
                    });
                });

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
        },

        setupZooming() {
            const zoom = d3.zoom()
                .scaleExtent([0.05, 2]) // limits zooming so you can only zoom between 0.2x and 2x
                .on("zoom", () => {
                    const x = d3.event.transform.x;
                    const y = d3.event.transform.y;
                    const scale = d3.event.transform.k;

                    this.rootG.attr("transform", `translate(${x} ${y}) scale(${scale})`);
                });
            this.svg.call(zoom)
                .call(
                    zoom.transform,
                    d3.zoomIdentity
                        .translate(WIDTH / 2, HEIGHT / 2)
                        .scale(0.5)) // sets initial x/y and zoom amount
                .on("wheel", () => {
                    d3.event.preventDefault();
                });
        }
    }
};
</script>

<style>
    #graphSvg {
        min-width: 33%;
    }

    .graph__link {
        fill: none;
        /*stroke: #8a8a8a;*/
        stroke-width: 10px;
    }

    .node__circle {
        fill: steelblue;
        stroke: none;
        cursor: pointer;
    }

    .node__text {
        cursor: pointer;
        text-shadow: 0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff;
        fill: #333333;

        font-size: 24px;
        font-weight: bold;
        stroke-width: 0;
    }
</style>
