import mitt from "mitt";

type Events = {
    focusOnPost: string;
    highlightPost: string;
    unhighlightPost: string;
    refreshGraph: void;
    zoomIn: void;
    zoomOut: void;
};

const EventBus = mitt<Events>();

export default EventBus;
