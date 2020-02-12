<template>
    <section>
        <div class="flex justify-around">
            <button
                class="btn btn--primary"
                @click="loadStateFromStorage"
            >
                Load
            </button>
            <button
                class="btn btn--primary"
                @click="saveStateToStorage"
            >
                Save
            </button>
        </div>

        <div class="mt-8 flex justify-around">
            <div class="inline-block">
                <button
                    class="btn btn--primary"
                    :disabled="!fileToImportIsValid"
                    @click="importState"
                >
                    Import
                </button>

                <label>
                    <button
                        class="btn btn--secondary"
                        @click="$refs.fileInput.click()"
                    >
                        Upload
                    </button>
                    <input
                        ref="fileInput"
                        type="file"
                        class="hidden"
                        accept="application/json"
                        @change="onFileUpload"
                    />
                </label>

            </div>
            <button
                class="btn btn--primary"
                @click="exportState"
            >
                Export
            </button>
        </div>
    </section>
</template>

<script>
import moment from "moment";
import { mapGetters, mapActions } from "vuex";

export default {
    name: "LoadSave",
    data() {
        return {
            fileToImport: null
        };
    },
    computed: {
        ...mapGetters(["storageObject"]),

        fileToImportIsValid() {
            return this.fileToImport !== null
                && this.fileToImport.type === "application/json";
        }
    },
    methods: {
        ...mapActions(["saveStateToStorage", "loadStateFromStorage", "loadState"]),

        onFileUpload(event) {
            const files = event.target.files || event.dataTransfer.files;
            if (!files.length || files.length > 1) {
                return;
            }
            const file = files[0];
            this.fileToImport = files[0];
            if (file.type !== "application/json") {
                alert("You must upload a JSON file exported by the 'export' button");
                return;
            }
        },
        async importState() {
            const stateString = await this.fileToImport.text();
            this.loadState(JSON.parse(stateString));
            this.fileToImport = null;
        },

        exportState() {
            const blob = new Blob(
                [JSON.stringify(this.storageObject)],
                {type: "application/json"}
            );
            const now = moment().format("Y-MM-DD_HH:mm:ss");

            this.saveData(blob, `spiderwebExport-${now}.json`);
        },
        saveData(blob, filename) {
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

</style>
