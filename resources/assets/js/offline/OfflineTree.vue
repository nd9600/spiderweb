<template>
    <div ref="svgContainer">

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
                    "title": "Foo",
                    "body": "Foobaz body",
                    "created_at": moment().format(),
                    "updated_at": moment().format(),
                },
                6: {
                    "user_id": 1,
                    "title": "Foo",
                    "body": "Foobaz body",
                    "created_at": moment().format(),
                    "updated_at": moment().format(),
                },
                7: {
                    "user_id": 1,
                    "title": "Foobarbaz",
                    "body": "Foobarbaz body",
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

        treeSvg() {
            const root = d3.stratify()
                .id(function (d) {
                    return d.childId;
                })
                .parentId(function (d) {
                    return d.parentId;
                })(this.childrenToParentPosts);
            console.log(root);

            const treeLayout = d3.tree()(root);
            console.log(treeLayout);

            treeLayout.size();

            // let x0 = Infinity;
            // let x1 = -x0;
            // treeLayout.each(d => {
            //     if (d.x > x1) {
            //         x1 = d.x;
            //     }
            //     if (d.x < x0) {
            //         x0 = d.x;
            //     }
            // });
            //
            // const svg = d3.create("svg")
            //     .attr("viewBox", [0, 0, WIDTH, x1 - x0 + treeLayout.dx * 2]);
            //
            // const g = svg.append("g")
            //     .attr("font-family", "sans-serif")
            //     .attr("font-size", 10)
            //     .attr("transform", `translate(${treeLayout.dy / 3},${treeLayout.dx - x0})`);
            //
            // const link = g.append("g")
            //     .attr("fill", "none")
            //     .attr("stroke", "#555")
            //     .attr("stroke-opacity", 0.4)
            //     .attr("stroke-width", 1.5)
            //     .selectAll("path")
            //     .data(treeLayout.links())
            //     .join("path")
            //     .attr("d", d3.linkHorizontal()
            //         .x(d => d.y)
            //         .y(d => d.x));
            //
            // const node = g.append("g")
            //     .attr("stroke-linejoin", "round")
            //     .attr("stroke-width", 3)
            //     .selectAll("g")
            //     .data(treeLayout.descendants())
            //     .join("g")
            //     .attr("transform", d => `translate(${d.y},${d.x})`);
            //
            // node.append("circle")
            //     .attr("fill", d => d.children ? "#555" : "#999")
            //     .attr("r", 2.5);
            //
            // node.append("text")
            //     .attr("dy", "0.31em")
            //     .attr("x", d => d.children ? -6 : 6)
            //     .attr("text-anchor", d => d.children ? "end" : "start")
            //     .text(d => {
            //         console.log (d.data);
            //         return this.posts[d.data.childId].title || "abc";
            //     })
            //     .clone(true).lower()
            //     .attr("stroke", "white");
            //
            // console.log(svg.node());
            // return svg.node();
        }
    },
    mounted() {
        this.$refs["svgContainer"].append(this.treeSvg);
    }
};
</script>

/*
object: posts, indexed by ID
array: root post IDs
object: post ID to child post IDs
*/