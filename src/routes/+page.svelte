<script lang="ts">
    // import d3
    import { onMount } from "svelte";
    import * as d3 from "d3";

    onMount(async () => {
        var svg = d3.select("svg"),
            width = +svg.attr("width"),
            height = +svg.attr("height");

        // Map and projection
        var path = d3.geoPath();
        var projection = d3
            .geoEquirectangular()
            .scale(100)
            .center([0, 20])
            .translate([width / 2, height / 2]);

        // Data and color scale
        // @ts-ignore
        var data = d3.map();
        var colorScale = d3
            .scaleThreshold()
            .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
            // @ts-ignore
            .range(d3.schemeBlues[7]);

        // Load external data and boot
        // @ts-ignore
        d3.queue()
            .defer(
                d3.json,
                "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
            )
            .defer(
                d3.csv,
                "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv",
                function (d: any) {
                    // @ts-ignore
                    data.set(d.code, +d.pop);
                }
            )
            .await(ready);

        // @ts-ignore
        function ready(error, topo) {
            // @ts-ignore
            let mouseOver = function (d) {
                d3.selectAll(".Country") // reset all countries
                    .transition()
                    .duration(200)
                    .style("opacity", 0.5)
                    .style("stroke", "transparent");
                            // @ts-ignore
                d3.select(this) // then highlight the current country
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("stroke", "black");
            };

                    // @ts-ignore
            let mouseLeave = function (d) {
                d3.selectAll(".Country")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("stroke", "transparent");
            };

            // Draw the map
            svg.append("g")
                .selectAll("path")
                .data(topo.features)
                .enter()
                .append("path")
                // draw each country
                        // @ts-ignore
                .attr("d", d3.geoPath().projection(projection))
                // set the color of each country
                .attr("fill", function (d) {
                            // @ts-ignore
                    d.total = data.get(d.id) || 0;
                        // @ts-ignore
                    return colorScale(d.total);
                })
                .style("stroke", "transparent")
                .attr("class", function (d) {
                    return "Country";
                })
                .style("opacity", 0.8)
                .on("mouseover", mouseOver)
                .on("mouseleave", mouseLeave);
        }
    });

</script>

<svg id="my_dataviz" width="800" height="600"></svg>
