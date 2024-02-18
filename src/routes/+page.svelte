<script lang="ts">
    import { onMount } from "svelte";
    import * as d3 from "d3";

    onMount(async () => {
        let svg = d3.select("svg");
        svg.attr("width", window.innerWidth);
        svg.attr("height", window.innerHeight);

        const zoom = d3
            .zoom()
            .scaleExtent([1, 8]) // Limit zoom scale (min, max)
            .translateExtent([
                [0, 0],
                [window.innerWidth, window.innerHeight],
            ]) // Limit panning to the dimensions of the SVG
            .extent([
                [0, 0],
                [window.innerWidth, window.innerHeight],
            ]) // Set the viewport extent to the SVG dimensions
            .on("zoom", (event) => {
                const { x, y, k } = event.transform; // Destructure the transform object to get translate and scale

                // Apply the transformation with potential constraints
                svg.selectAll("path").attr(
                    "transform",
                    `translate(${x},${y}) scale(${k})`
                );
            });

        svg.call(zoom);

        var width = +svg.attr("width");
        var height = +svg.attr("height");

        // Map and projection
        var pathGenerator = d3.geoPath();
        var projection = d3.geoEquirectangular();

        Promise.all([
            fetch(
                "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
            ).then((response) => response.json()),
            d3.csv(
                "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv"
            ),
        ]).then(([geo_json, csv]) => {
            ready(geo_json, csv);
        });

        var colorScale = d3
            .scaleThreshold()
            .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
            // @ts-ignore
            .range(d3.schemeBlues[7]);

        function ready(
            geo_json: d3.ExtendedFeatureCollection,
            csv: d3.DSVRowArray
        ) {
            // @ts-ignore
            // var data = d3.map();
            var map = new Map<string, number>();
            csv.forEach((row) => map.set(row.code, +row.pop));
            console.log(map);

            // @ts-ignore
            let mouseOver = function () {
                d3.selectAll(".Country") // reset all countries
                    .transition()
                    .duration(200)
                    .style("opacity", 0.5)
                    .style("stroke", "transparent");
                // @ts-ignore
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("stroke", "black");
            };

            let mouseLeave = function () {
                d3.selectAll(".Country")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("stroke", "transparent");
            };

            projection.fitSize([width, height], geo_json);
            svg.append("g")
                .selectAll("path")
                .data(geo_json.features)
                .enter()
                .append("path")
                // get path definition for each geo_json feature without a dom element
                // configure a svg path generator to use the projection function provided
                .attr("d", d3.geoPath().projection(projection))
                .attr("fill", function (d) {
                    // @ts-ignore
                    return colorScale(map.get(d.id) || 0);
                })
                .style("stroke", "transparent")
                .attr("class", function (d) {
                    return "Country";
                })
                .style("opacity", 1)
                .on("mouseover", mouseOver)
                .on("mouseleave", mouseLeave);
        }
    });
</script>

<svg id="my_dataviz" width="800" height="600"></svg>
