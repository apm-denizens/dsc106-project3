<script lang="ts">
    // import d3
    import { onMount } from "svelte";
    import * as d3 from "d3";

    onMount(async () => {
        const svg = d3
            .select("body")
            .append("svg")
            .attr("width", 960)
            .attr("height", 600);

        const projection = d3.geoEquirectangular();
        const path = d3.geoPath(projection);

        const response = await fetch(
            "https://unpkg.com/world-atlas@1/world/110m.json"
        );
        const data = await response.json();

        svg.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            // @ts-ignore
            .attr("d", path)
            .style("fill", "steelblue");
    });

    console.log("sanity check");
    
</script>

<h1>Welcome to SvelteKit</h1>
<p>
    Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
