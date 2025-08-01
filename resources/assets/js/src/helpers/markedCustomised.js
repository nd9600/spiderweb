import { marked, Renderer } from "marked";

const renderer = new Renderer();
const linkRenderer = renderer.link;
renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text);
    return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
};
marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: false
});
marked.use({ renderer });

export default marked;