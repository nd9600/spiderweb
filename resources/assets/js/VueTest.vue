<template>
    <div>
        <button
            @click="n = n + 1"
            class="btn btn--secondary"
        >
            inc
        </button>
        <p>{{ n }}</p>
    </div>
</template>

<script>
export default {
    name: "VueTest",
    data() {
        return {
            n: 0
        };
    }
};
</script>

<style scoped>

</style>