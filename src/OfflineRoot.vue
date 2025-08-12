<template>
    <div class="h-full">
        <OfflineApp class="w-full h-full" />
    </div>
</template>

<script>
import { defineComponent } from "vue";

import OfflineApp from "@/commonComponents/OfflineApp.vue";
import { mapActions } from "vuex";

export default defineComponent({
  name: "OfflineRoot",

  components: {
      OfflineApp,
  },

  async mounted() {
      await this.loadStateFromStorage();
  },

  methods: {
      ...mapActions(["loadStateFromStorage"]),
  },
});
</script>