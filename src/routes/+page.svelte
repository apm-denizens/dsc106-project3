<script lang="ts">
    import { onMount } from "svelte";
    import * as d3 from "d3";

    onMount(async () => {
        let svg = d3.select("svg");
        width = window.innerWidth;
        height = window.innerHeight;
        svg.attr("width", width);
        svg.attr("height", height);
        svg.attr("viewBox", `0 0 ${width} ${height}`).attr(
            "preserveAspectRatio",
            "xMidYMid meet"
        ); // Adjust this value based on your needs

        const zoom = d3
            .zoom()
            .scaleExtent([1, 8]) // Limit zoom scale (min, max)
            .translateExtent([
                [0, 0],
                [width, height],
            ]) // Limit panning to the dimensions of the SVG
            .extent([
                [0, 0],
                [width, height],
            ]) // Set the viewport extent to the SVG dimensions
            .on("zoom", (event) => {
                const { x, y, k } = event.transform; // Destructure the transform object to get translate and scale

                // Apply the transformation with potential constraints
                svg.selectAll("path").attr(
                    "transform",
                    `translate(${x},${y}) scale(${k})`
                );
            });

        // @ts-ignore
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
            let mouseOver = function (d: any) {
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
                d3.select("#tooltip")
                    .style("opacity", 1) // Show the tooltip
                    // @ts-ignore
                    .html(`Region: ${d.properties.name}<br>Value: ${d.value}`); // Set the tooltip content
            };

            let mouseLeave = function () {
                d3.selectAll(".Country")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("stroke", "transparent");
                d3.select("#tooltip").style("opacity", 0); // Hide the tooltip
            };

            let mouseMove = function (event) {
                d3.select("#tooltip")
                    .style("left", event.pageX + 10 + "px") // Position the tooltip to the right of the cursor
                    .style("top", event.pageY + 10 + "px"); // Position the tooltip below the cursor
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

            svg.selectAll("path");
        }
    });

    $: filters = {
        renewables: false,
        renewable_types: {
            solar: false,
            wind: false,
            hydro: false,
            geothermal: false,
            biomass: false,
            nuclear: false,
        },

        fossil_fuels: false,
        fossil_fuel_types: {
            coal: false,
            oil: false,
            natural_gas: false,
        },
    };

    const handleFilterInput = (type: "renewables" | "ffs") => {
        if (type == "renewables") {
            const setTo = !filters.renewables;
            filters.renewables = setTo;
            filters.renewable_types.solar = setTo;
            filters.renewable_types.wind = setTo;
            filters.renewable_types.hydro = setTo;
            filters.renewable_types.geothermal = setTo;
            filters.renewable_types.biomass = setTo;
            filters.renewable_types.nuclear = setTo;
        } else if (type == "ffs") {
            const setTo = !filters.fossil_fuels;
            filters.fossil_fuels = setTo;
            filters.fossil_fuel_types.coal = setTo;
            filters.fossil_fuel_types.oil = setTo;
            filters.fossil_fuel_types.natural_gas = setTo;
        }
    };

    function capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
</script>

<div>
    <h1>Worldwide Energy Usage</h1>

    <form>
        <label>
            <input
                type="checkbox"
                bind:checked={filters.renewables}
                on:input={(e) => handleFilterInput("renewables")}
            />
            Renewables
        </label>
        <ul>
            {#each Object.keys(filters.renewable_types) as key (key)}
                <li>
                    <label>
                        <input
                            type="checkbox"
                            bind:checked={filters.renewable_types[key]}
                        />
                        {capitalizeFirstLetter(key)}
                    </label>
                </li>
            {/each}
        </ul>

        <label>
            <input
                type="checkbox"
                bind:checked={filters.fossil_fuels}
                on:input={(e) => handleFilterInput("ffs")}
            />
            Fossil Fuels
        </label>
        <ul>
            {#each Object.keys(filters.fossil_fuel_types) as key (key)}
                <li>
                    <label>
                        <input
                            type="checkbox"
                            bind:checked={filters.fossil_fuel_types[key]}
                        />
                        {capitalizeFirstLetter(key)}
                    </label>
                </li>
            {/each}
        </ul>
    </form>
    <svg id="my_dataviz"></svg>
</div>
