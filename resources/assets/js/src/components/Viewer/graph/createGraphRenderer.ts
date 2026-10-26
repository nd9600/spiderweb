import {drag, type D3DragEvent} from "d3-drag";
import {pointer, select} from "d3-selection";

import {ClickMode, type PostId} from "@/src/@types/StoreTypes";
import {useClickerStore, useDataStore} from "@/src/store";
import {createGraphViewport} from "./createGraphViewport";
import {layoutGraph, type RenderLink, type RenderNode} from "./layoutGraph";
import type {VisibleGraph} from "./useVisibleGraph";

interface GraphElements {
    svgElement: SVGSVGElement;
    rootElement: SVGGElement;
    linksElement: SVGGElement;
    nodesElement: SVGGElement;
}

// GraphViewer creates the renderer after Vue has added the SVG to the page.
// It also calls destroy() when Vue removes the SVG.
export function createGraphRenderer({svgElement, rootElement, linksElement, nodesElement}: GraphElements) {
    const dataStore = useDataStore();
    const clickerStore = useClickerStore();
    const linksGroup = select(linksElement).attr("stroke", "#999").attr("stroke-opacity", 0.6);
    const nodesGroup = select(nodesElement).attr("stroke", "#fff").attr("stroke-width", 1.5);
    let links = linksGroup.selectAll<SVGLineElement, RenderLink>("line");
    let nodes = nodesGroup.selectAll<SVGGElement, RenderNode>("g.node");
    let nodesById: Record<PostId, RenderNode> = {};
    let neighboursByPostId: VisibleGraph["neighbourIdsByPostId"] = {};
    const viewport = createGraphViewport(svgElement, rootElement);

    function moveNode(event: D3DragEvent<SVGElement, RenderNode, RenderNode>, node: RenderNode): void {
        node.x = event.x;
        node.y = event.y;
        updatePositions();
    }

    // Move the node and its connected lines while the user drags it.
    // Save its coordinates to the store only when the user releases it.
    const dragNode = drag<SVGElement, RenderNode>()
        .on("drag", moveNode)
        .on("end", (event: D3DragEvent<SVGElement, RenderNode, RenderNode>, node: RenderNode) => {
            moveNode(event, node);
            dataStore.setPostPosition({postId: node.id, position: {x: node.x, y: node.y}});
        });

    function render(graph: VisibleGraph): void {
        const layout = layoutGraph(graph);
        nodesById = layout.nodesById;
        neighboursByPostId = graph.neighbourIdsByPostId;

        // Use each link's ID to match its data to an existing SVG line.
        // This lets us update the line without removing and drawing it again.
        links = linksGroup.selectAll<SVGLineElement, RenderLink>("line")
            .data(layout.links, (link) => link.id)
            .join("line")
            .classed("graph__link", true)
            .classed("graph__link--sidenote", (link) => link.type === "sidenote")
            .classed("graph__link--link", (link) => link.type === "link")
            .attr("stroke", (link) => link.colour)
            .attr("marker-end", "url(#arrowhead)")
            .on("click", async (event: MouseEvent, link) => {
                // The click tells us where the pointer is in the browser window.
                // Convert that position to graph coordinates before comparing it with the link's two ends.
                const postId = await clickerStore.handleLinkClick({link, coordinates: pointer(event, linksElement)});
                if (postId != null) {
                    focusPost(postId, 1.5);
                }
            })
            // After the pointer moves more than four pixels, ignore the click that
            // the browser sends when the user releases the pointer.
            .call(drag<SVGLineElement, RenderLink>().clickDistance(4));

        // Create a circle and a label for each new node. Remove nodes that are no
        // longer part of the selected graph or subgraphs.
        const existing = nodesGroup.selectAll<SVGGElement, RenderNode>("g.node").data(layout.nodes, (node) => node.id);
        existing.exit().remove();
        const entering = existing.enter().append("g").classed("node", true);
        entering.append("circle").classed("node__circle", true);
        entering.append("text").classed("node__text", true).attr("text-anchor", "end");
        // Keep the SVG groups in their current order when updating them.
        // This keeps a highlighted node in front of the other nodes.
        nodes = entering.merge(existing).attr("data-id", (node) => node.id);

        nodes.select("circle").attr("r", viewport.nodeRadius).attr("title", (node) => node.title);
        nodes.select("text")
            .attr("id", (node) => `text-${node.id}`)
            .text((node) => node.label)
            .on("mouseover", (_event: MouseEvent, node) => highlightPost(node.id))
            .on("mouseout", (_event: MouseEvent, node) => unhighlightPost(node.id));
        // Let the user click or drag a post using either its circle or its label.
        nodes.selectAll<SVGElement, RenderNode>("circle, text")
            .on("click", (_event: MouseEvent, node) => {
                void clickerStore.handlePostClick({id: node.id});
            })
            .call(dragNode);

        updatePositions();
    }

    function updatePositions(): void {
        links.attr("x1", (link) => link.source.x).attr("y1", (link) => link.source.y)
            .attr("x2", (link) => link.target.x).attr("y2", (link) => link.target.y);
        nodes.select("circle").attr("cx", (node) => node.x).attr("cy", (node) => node.y);
        nodes.select("text").attr("x", (node) => node.x - 6).attr("y", (node) => node.y - 4);
    }

    function focusPost(postId: PostId, speed = 1): void {
        const node = nodesById[postId];
        if (node != null) {
            viewport.focusNode(node, speed);
        }
    }

    function highlightPost(postId: PostId): void {
        const node = nodes.filter((other) => other.id === postId);
        if (node.empty()) {
            return;
        }
        node.raise().select("text").style("filter", "url(#postHoverFilter)");
        const neighbours = neighboursByPostId[postId] ?? {};
        // Keep this post and the posts linked to it at full opacity.
        // Dim the other posts and any links that do not connect to this post.
        nodes.style("opacity", (other) => other.id === postId || neighbours[other.id] ? 1 : 0.2);
        links.style("opacity", (link) => link.source.id === postId || link.target.id === postId ? 1 : 0.2);
    }

    function unhighlightPost(postId: PostId): void {
        nodes.filter((node) => node.id === postId).select("text").style("filter", "");
        nodes.style("opacity", 1);
        links.style("opacity", 1);
    }

    function handleSvgClick(event: MouseEvent): void {
        // Clicks on a node or a link also reach the SVG. Ignore them here so that
        // clicking a post does not cancel the action for adding or changing a link.
        if (event.target !== svgElement) {
            return;
        }
        if (clickerStore.shouldShowClickButtonMenu) {
            clickerStore.setShouldShowClickButtonMenu(false);
        }
        if (clickerStore.clickMode !== ClickMode.OpenPosts) {
            clickerStore.setClickMode(ClickMode.OpenPosts);
        }
    }

    return {
        render,
        focusPost,
        highlightPost,
        unhighlightPost,
        handleSvgClick,
        restoreZoom: viewport.restoreZoom,
        resetZoom: viewport.resetZoom,
        zoomIn: viewport.zoomIn,
        zoomOut: viewport.zoomOut,
        flushZoom: viewport.flushZoom,
        destroy: viewport.destroy,
    };
}
