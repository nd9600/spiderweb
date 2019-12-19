<template>
    <div class="h-full flex flex-row">
        <svg
            id="treeSvg"
            class="h-full w-2/3 cursor-move border"
        >
            <g transform="translate(5, 15)">
                <g class="tree__links"></g>
                <g class="tree__nodes"></g>
            </g>
        </svg>
        <sidebar/>
    </div>
</template>

<script>
import * as d3 from "d3";

import Sidebar from "@/js/commonComponents/Sidebar";

import {mapState} from "vuex";

export default {
    name: "OfflineTree",
    components: {
        Sidebar,
    },
    data() {
        return {
            svg: null,
            rootG: null,
        };
    },
    computed: {
        ...mapState("postsModule", ["rootPostIds", "postToChildPosts", "posts"]),
        selectedPostId: {
            get() {
                return this.$store.postsModule.selectedPostId;
            },
            set(selectedPostId) {
                 this.$store.commit("postsModule/setSelectedPostId", selectedPostId);
            }
        },

        /**
         *
         * @returns {Array}
         * ```
         *  [
         *      {
         *          childId: 2,
         *          parentId: 1
         *      }
         *  ]
         *  ```
         */
        childrenToParentPosts() {
            let childrenToParentPosts = [];

            // we need to give the root IDs parents of "" as well
            for (const rootPostID of this.rootPostIds) {
                childrenToParentPosts.push({
                    childId: rootPostID,
                    parentId: ""
                });
            }

            for (const [parentId, children] of Object.entries(this.postToChildPosts)) {
                for (const childId of children) {
                    childrenToParentPosts.push({
                        childId,
                        parentId
                    });
                }
            }
            return childrenToParentPosts;
        },
    },
    mounted() {
        this.makeTreeSvg();
    },
    methods: {
        makeTreeSvg() {
            this.svg = d3.select("#treeSvg");
            this.rootG = d3.select("#treeSvg g");

            /**
             * The data in a hierarchical format that can be laid out with d3.tree()
             * @type {HierarchyNode<any>}
             */
            const root = d3.stratify()
                .id((d) => d.childId)
                .parentId((d) => d.parentId)(this.childrenToParentPosts);

            /**
             * Gives `root` x and y's that can be use to show it in an SVG
             * @type {TreeLayout<any>}
             */
            const treeLayout = d3.tree();
            treeLayout.size([400, 200]);
            treeLayout(root);


            this.setupZooming();

            // Nodes
            this.addNodesToSVG(root);

            // Links
            this.addLinksToSVG(root);
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