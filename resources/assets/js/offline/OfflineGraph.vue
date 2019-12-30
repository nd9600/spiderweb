<template>
    <div class="h-full flex flex-row">
        <svg
            id="graphSvg"
            class="h-full w-2/3 cursor-move border"
        >
            <g transform="translate(5, 15)">
                <g class="graph__links"></g>
                <g class="graph__nodes"></g>
            </g>
        </svg>
        <sidebar/>
    </div>
</template>

<script>
import * as d3 from "d3";
import moment from "moment";

import Sidebar from "@/js/commonComponents/Sidebar";

import { mapState, mapGetters } from "vuex";

const WIDTH = 400;
const HEIGHT = 200;

export default {
    name: "OfflineTree",
    components: {
        Sidebar,
    },
    data() {
        return {
            svg: null,
            rootG: null,

            linksG: null,
            nodesG: null,
        };
    },
    computed: {
        ...mapState("postsModule", ["selectedGraphNames"]),
        ...mapGetters("postsModule", ["postsInSelectedGraph", "linksInSelectedGraph"]),
        
        selectedPostId: {
            get() {
                return this.$store.state.postsModule.selectedPostId;
            },
            set(selectedPostId) {
                this.$store.commit("postsModule/setSelectedPostId", selectedPostId);
            }
        },
        
        nodes() {
            return JSON.parse(JSON.stringify(
                Object.values(this.postsInSelectedGraph)
            ));
        },
        links() {
            return JSON.parse(JSON.stringify(
                this.linksInSelectedGraph
            ));
        }
    },
    watch: {
        selectedGraphNames() {
            this.makeGraphSvg();
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

        this.makeGraphSvg();
    },
    methods: {
        makeGraphSvg() {
            const simulation = d3.forceSimulation(this.nodes)
                .force("link", d3.forceLink(this.links).id(d => d.id))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2));
              
            const link = this.linksG
                .selectAll("line")
                .data(this.links, link => link.id)
                .join("line")
                .attr("title", link => link.id);

            const node = this.nodesG
                .selectAll("circle")
                .data(this.nodes, post => post.id)
                .join("circle")
                .attr("r", 5)
                .attr("title", post => post.title)
                .attr("fill", "#ccc");
                //.call(drag(simulation));

            node.append("title")
                .text(post => post.id);

            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            });

            this.setupZooming();
        },

        setupZooming() {
            this.svg.call(d3.zoom()
                .scaleExtent([0.2, 2]) // limits zooming so you can only zoom between 0.2x and 2x
                .on("zoom", () => {
                    const x = d3.event.transform.x;
                    const y = d3.event.transform.y;
                    const scale = d3.event.transform.k;

                    this.rootG.attr("transform", `translate(${x} ${y}) scale(${scale})`);
                }))
                .on("wheel", () => {
                    d3.event.preventDefault();
                });
        },

        addNodesToSVG(root) {
            const nodesGs = d3.select("#treeSvg g.tree__nodes")
                .selectAll("node__circle")
                .data(root.descendants(), (d) => d.data.childId) // key function
                .enter()
                .append("g")
                .classed("node", true);

            nodesGs.append("circle")
                .classed("node__circle", true)
                .attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y)
                .attr("r", 4);

            nodesGs.append("text")
                .classed("node__text", true)
                .attr("fill", "black")
                .attr("x", (d) => d.x - 10)
                .attr("y", (d) => d.y + 5)
                .attr("text-anchor", "end")
                .attr("stroke", "black")
                .text(d => this.posts[d.data.childId].title);

            d3.selectAll(".node *")
                .classed("cursor-pointer", true)
                .on("click", (event) => {
                    this.selectedPostId = event.data.childId;
                });
        },
        addLinksToSVG(root) {
            d3.select("#treeSvg g.tree__links")
                .selectAll("line.tree__link")
                .data(root.links())
                .enter()
                .append("line")
                .classed("tree__link", true)
                .attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });
        }
    }
};
</script>

<style>
    .node__circle {
        fill: steelblue;
        stroke: none;
    }

    .tree__link {
        fill: none;
        stroke: #ccc;
        stroke-width: 1px;
    }

    text {
        fill: black; /* <== Set the fill */
        text-shadow: 0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff;
        cursor: move;
    }
</style>
