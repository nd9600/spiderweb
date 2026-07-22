import {Marked, Renderer} from "marked";
import type {RendererObject} from "marked";

const renderer: RendererObject = {
    link(token) {
        const html = Renderer.prototype.link.call(this, token);
        return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
    },
};

const marked = new Marked({
    breaks: true,
    gfm: true,
    renderer,
});

export default function parseMarkdown(markdown: string): string {
    return marked.parse(markdown, {async: false});
}
