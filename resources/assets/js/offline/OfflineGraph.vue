<template>
    <svg
        id="graphSvg"
        class="h-full w-1/3 cursor-move border"
    >
        <g transform="translate(5, 15)">
            <g class="graph__links"></g>
            <g class="graph__nodes"></g>
        </g>
    </svg>
</template>

<script>
import * as d3 from "d3";
import debounce from "lodash.debounce";

import { mapState, mapGetters } from "vuex";

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

            previousLinkIds: [],
            previousPostIds: [],
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

        // this.makeGraphSvg();
        this.setupZooming();
    },
    methods: {
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
            const currentLinkIds = Object.values(this.linksInSelectedGraphs).map(l => l.id);
            const currentPostIds = Object.keys(this.postsInSelectedGraphs);

            let linksTheSame = JSON.stringify(this.previousLinkIds) === JSON.stringify(currentLinkIds);
            let postsTheSame = JSON.stringify(this.previousPostIds) === JSON.stringify(currentPostIds);
            const dataHasChanged = !linksTheSame
                || !postsTheSame;

            console.log(
                this.previousLinkIds, currentLinkIds,
                this.previousPostIds, currentPostIds,
                dataHasChanged
            );

            //todo: doesn't notice changes to the post titles/bodies
            if (dataHasChanged) {
                this.previousLinkIds = JSON.parse(JSON.stringify(currentLinkIds));
                this.previousPostIds = JSON.parse(JSON.stringify(currentPostIds));
            } else {
                return;
            }
            console.log("called");

            // setup force simulation
            const simulation = d3.forceSimulation(this.nodes)
                .force("link", d3.forceLink(this.links)
                    .id(d => d.id)
                    .distance(100)
                )
                .force("charge", d3.forceManyBody()
                    .strength(-250)
                )
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
                .text(post => post.title.length > 0
                    ? post.title
                    : post.body.substr(0, 20)
                );
                
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
    #graphSvg {
        min-width: 33%;
    }

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
