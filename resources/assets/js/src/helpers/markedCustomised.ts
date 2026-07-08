import {Marked, Renderer} from "marked";
import type {Tokens} from "marked";

const renderer = new Renderer();
const linkRenderer = renderer.link;
renderer.link = (token: Tokens.Link) => {
    const html = linkRenderer.call(renderer, token);
    return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
};

const marked = new Marked({
    breaks: true,
    gfm: true,
    renderer,
});

export default function parseMarkdown(markdown: string): string {
    return marked.parse(markdown, {async: false});
}
