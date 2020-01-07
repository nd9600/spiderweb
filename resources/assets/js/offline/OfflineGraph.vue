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

import { mapState, mapGetters, mapActions } from "vuex";

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
        ...mapGetters("postsModule", ["postsInSelectedGraphs", "linksInSelectedGraphs", "graphColour"]),
        
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
                Object.values(this.postsInSelectedGraphs)
            ));
        },
        links() {
            return JSON.parse(JSON.stringify(
                this.linksInSelectedGraphs
            ));
        }
    },
    watch: {
        selectedGraphNames() {
            this.makeGraphSvg();
        }
    },
    mounted() {
        this.loadState();
        
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
        ...mapActions(["loadState"]),
            
        makeGraphSvg() {
            // setup force simulation
            const simulation = d3.forceSimulation(this.nodes)
                .force("link", d3.forceLink(this.links).id(d => d.id))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2));
              
            // add links
            const link = this.linksG
                .selectAll("line")
                .data(this.links, link => link.id)
                .join("line")
                .classed("graph__link", true)
                .attr("stroke", (link) => this.graphColour(link.graph));

            let nodeGroups = this.nodesG
                .selectAll("g")
                .data(this.nodes, post => post.id);

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
                .attr("stroke", "#333333")
                .text(post => post.title);
                
            d3.selectAll(".node *")
                .on("click", (post) => {
                    this.selectedPostId = post.id;
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
                    .attr("x", d => d.x - 3)
                    .attr("y", d => d.y - 3);
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
        }
    }
};
</script>

<style>
    .graph__link {
        fill: none;
        /*stroke: #8a8a8a;*/
        stroke-width: 3px;
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

        font-size: 12px;
        font-weight: normal;
        stroke-width: 0;
    }
</style>
