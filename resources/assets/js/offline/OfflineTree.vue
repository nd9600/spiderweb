<template>
    <div class="h-full flex flex-row">
        <svg
            id="treeSvg"
            class="h-full w-4/5 tree"
        >
            <g transform="translate(5, 15)">
                <g class="tree__links"></g>
                <g class="tree__nodes"></g>
            </g>
        </svg>
        <div
            class="h-full w-1/5 p-4 sidebar"
        >
            sidebar
        </div>
    </div>
</template>

<script>
import * as d3 from "d3";
import moment from "moment";

const WIDTH = 50;
const HEIGHT = 50;

export default {
    name: "OfflineTree",
    data() {
        return {
            svgContainer: null,

            posts: {
                1: {
                    "user_id": 1,
                    "title": "Foo",
                    "body": "Foo body",
                    "created_at": moment().format(),
                    "updated_at": moment().format(),
                },
                2: {
                    "user_id": 1,
                    "title": "Bar",
                    "body": "Bar body",
                    "created_at": moment().format(),
                    "updated_at": moment().format(),
                },
                3: {
                    "user_id": 1,
                    "title": "Baz",
                    "body": "Baz body",
                    "created_at": moment().format(),
                    "updated_at": moment().format(),
                },
                4: {
                    "user_id": 1,
                    "title": "Foobar",
                    "body": "Foobar body",
                    "created_at": moment().format(),
                    "updated_at": moment().format(),
                },
                5: {
                    "user_id": 1,
                    "title": "Foobaz",
                    "body": "Foobaz body",
                    "created_at": moment().format(),
                    "updated_at": moment().format(),
                },
                6: {
                    "user_id": 1,
                    "title": "Foobarbaz",
                    "body": "Foobarbaz body",
                    "created_at": moment().format(),
                    "updated_at": moment().format(),
                },
                7: {
                    "user_id": 1,
                    "title": "Barbaz",
                    "body": "Barbaz body",
                    "created_at": moment().format(),
                    "updated_at": moment().format(),
                }
            },
            rootPostIDs: [
                1
            ],
            postToChildPosts: {
                1: [2, 3],
                2: [4],
                3: [5],
                5: [6],
                6: [7],
            }
        };
    },
    computed: {
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
            for (const rootPostID of this.rootPostIDs) {
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
                .id(function (d) {
                    return d.childId;
                })
                .parentId(function (d) {
                    return d.parentId;
                })(this.childrenToParentPosts);

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
                .selectAll("circle.tree__node")
                .data(root.descendants(), (d) => d.data.childId) // key function
                .enter()
                .append("g");

            nodesGs.append("circle")
                .classed("tree__node", true)
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                })
                .attr("r", 4);

            nodesGs.append("text")
                .attr("fill", "black")
                .attr("x", function (d) {
                    return d.x - 10;
                })
                .attr("y", function (d) {
                    return d.y + 5;
                })
                .attr("text-anchor", "end")
                .attr("stroke", "black")
                .text(d => this.posts[d.data.childId].title);
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
    .tree__node {
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

    .sidebar {
        background-color: #333;
        color: white;
    }
</style>