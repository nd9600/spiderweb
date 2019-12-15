<template>
    <div>
        <svg
            id="treeSvg"
            class="tree"
            width="400"
            height="220"
        >
            <g transform="translate(5, 15)">
                <g class="tree__links"></g>
                <g class="tree__nodes"></g>
            </g>
        </svg>
    </div>
</template>

<script>
import * as d3 from "d3";
import moment from "moment";

const WIDTH = 932;

export default {
    name: "OfflineTree",
    data() {
        return {
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
            console.log(root);

            /**
             * Gives `root` x and y's that can be use to show it in an SVG
             * @type {TreeLayout<any>}
             */
            const treeLayout = d3.tree();
            treeLayout.size([400, 200]);
            treeLayout(root);

            // Nodes
            const nodesGs = d3.select("#treeSvg g.tree__nodes")
                .selectAll("circle.tree__node")
                .data(root.descendants())
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
                    return d.x;
                })
                .attr("y", function (d) {
                    return d.y;
                })
                // .attr("dy", "0.31em")
                // .attr("x", d => d.children ? -6 : 6)
                .attr("text-anchor", d => d.children ? "end" : "start")
                .attr("stroke", "black")
                .text(d => this.posts[d.data.childId].title);

            // Links
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
</style>