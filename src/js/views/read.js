import m from "mithril";
// Components
import Reader from "../components/Reader";

export default class Read {
    constructor(config) {
        this.uuid = null;
        this.reader = new Reader(config);
    }

    oninit(vnode) { // Welcome
        this.uuid = vnode.attrs.id;
        const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;
        if(!uuidV4Regex.test(this.uuid)) {
            console.error("Invalid content ID");
            m.route.set("/error/:code/:message", { code: 400, message: "Invalid content ID" }, { replace: true });
            this.uuid = null;
        }
    }

    oncreate() { // Initialize 

    }

    view() {
        return [
            m(this.reader, {uuid: this.uuid}),
        ];
    }
}