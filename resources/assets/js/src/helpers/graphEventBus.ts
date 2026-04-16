import mitt from "mitt";

type PostId = string | number;

type GraphEvents = {
    focusOnPost: PostId;
    highlightPost: PostId;
    unhighlightPost: PostId;
    refreshGraph: undefined;
    zoomIn: undefined;
    zoomOut: undefined;
};

const graphEventBus = mitt<GraphEvents>();

export default graphEventBus;
