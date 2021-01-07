<template>
    <div class="flex flex-col items-start">
        <h2 class="h h--2">
            Blogpost exporter
        </h2>

        <label class="my-4 flex">
            Node IDs:
            <textarea
                v-model="postIdsString"
                class="ml-4 p-2 rounded border text-gray-800 placeholder-gray-600"
                :class="{
                    'input--error': !postIdsStringIsValid
                }"
                type="text"
                placeholder="1, 2, 3"
                minlength="0"
            >
            </textarea>
        </label>

        <label class="my-4 flex">
            Link IDs:
            <textarea
                v-model="linkIdsString"
                class="ml-4 p-2 rounded border text-gray-800 placeholder-gray-600"
                :class="{
                    'input--error': !linkIdsStringIsValid
                }"
                type="text"
                placeholder="1, 2, 3"
                minlength="0"
            >
            </textarea>
        </label>

        <button
            class="btn btn--secondary my-4 py-1 px-2"
            :disabled="!postIdsStringIsValid || !linkIdsStringIsValid"
            @click="exportBlogPost"
        >
            Export blog post
        </button>

        <div>
            Export:
            <div ref="export">
                <article v-if="!postIdsStringIsValid || !linkIdsStringIsValid">
                    invalid
                </article>
                <article v-else>
                    <ExportedPost
                        v-for="postId in postIdsToExport"
                        :key="postId"
                        :post="posts[postId]"
                        :linkIdsToExport="linkIdsToExport"
                    />
                </article>
            </div>
        </div>
    </div>
</template>

<script>
import {isInteger} from "@/src/helpers/numberHelpers";
import {mapGetters, mapState} from "vuex";
import ExportedPost from "./ExportedPost";

export default {
    name: "BlogpostExporter",
    components: {ExportedPost},
    data() {
        return {
            postIdsString: `"255", "251", "257", "61", "258", "259", "260", "262", "263", "264", "265", "266", "267", "268", "269", "271", "272", "273", "274", "275", "276", "277", "278", "279", "280", "281", "282", "283", "284", "285", "286", "287", "288", "289", "290", "291", "292", "294", "295", "296", "297", "299", "300", "301", "302", "303", "79", "304", "305", "306", "307", "308", "309", "310", "311", "312", "313", "314", "315", "316", "317", "318", "320", "321", "322", "323", "324", "39", "325", "326", "327", "328", "329", "330", "331", "332", "333", "334", "335", "336", "337"`,
            linkIdsString: `"336", "338", "339", "340", "341", "342", "343", "345", "346", "347", "348", "349", "350", "351", "352", "354", "355", "356", "357", "358", "359", "360", "361", "362", "363", "364", "365", "366", "367", "368", "369", "370", "371", "372", "373", "374", "375", "376", "377", "378", "380", "381", "382", "383", "384", "385", "387", "388", "389", "390", "391", "392", "393", "394", "395", "396", "397", "398", "399", "400", "401", "402", "403", "404", "405", "406", "407", "408", "409", "410", "411", "412", "413", "414", "415", "416", "417", "418", "419", "420", "422", "423", "424", "425", "426", "427", "428", "429", "430", "431", "432", "433", "434", "435", "436", "437", "438", "439", "440", "441", "442", "443", "444", "445", "446", "447", "448", "449", "450", "451", "452", "453", "454", "455"`,
        };
    },
    computed: {
        ...mapState("dataModule", ["posts", "links"]),
        ...mapGetters("dataModule", ["postIds", "linkIds", "titleOrBody", "postIdsThatLinkToPost"]),

        postIdsToExport() {
            return this.postIdsString
                .split(",")
                .map((s) => s.trim().replaceAll('"', ""))
                .filter((s) => s.length !== 0);
        },

        linkIdsToExport() {
            return this.linkIdsString
                .split(",")
                .map((s) => s.trim().replaceAll('"', ""))
                .filter((s) => s.length !== 0);
        },

        postIdsStringIsValid() {
            return this.postIdsToExport.length > 0
                && this.postIdsToExport
                    .every((postId) => isInteger(postId) && this.postIds.includes(postId));
        },
        linkIdsStringIsValid() {
            return this.linkIdsToExport.length === 0
                || this.linkIdsToExport
                    .every((linkId) => isInteger(linkId) && this.linkIds.includes(linkId));
        },
    },
    methods: {
        exportBlogPost() {
            const blob = new Blob(
                [this.$refs["export"].innerHTML],
                {type: "text/html"}
            );
            const now = new Date().toISOString()
                .replace("T", "_")
                .replace("Z", "");

            this.downloadData(blob, `blogPost-${now}.html`);
        },
        downloadData(blob, filename) {
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";

            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        }
    }
};
</script>

<style scoped>
.input--error {
    border: 1px solid var(--red-dark);
    background-color: #ffdbdb;
}
</style>