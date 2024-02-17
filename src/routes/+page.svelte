<script lang="ts">
    // import d3
    import { onMount } from "svelte";
    import * as d3 from "d3";
    // import { queue } from "d3-queue"


    // console.log(d3.select("svg")) // document undefined. need to perform this selection inside onMount to make sure the svg is first rendered
    onMount(async () => {
        console.log(d3.select("svg"))
        let svg = d3.select("svg")
        svg.attr("width", window.innerWidth)
        svg.attr("height", window.innerHeight)

        var width = +svg.attr("width");
        var height = +svg.attr("height");

        // Map and projection
        var pathGenerator = d3.geoPath(); 
        var projection = d3.geoEquirectangular()

        Promise.all([
            fetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(response => response.json()),
            d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv")
        ]).then(([geo_json, csv]) => {
            ready(null, geo_json, csv);
        })

        // queue()
        //     .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        //     .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv")
        //     .await(ready);

        function ready(error: any, geo_json: d3.ExtendedFeatureCollection, csv: d3.DSVRowArray) {
            console.log("SANITY CHECK")
            console.log(error)
            console.log(geo_json)
            projection.fitSize([width, height], geo_json);
            // const data_tempmap = new Map<string, number>()
            // csv.forEach(val => data_tempmap.set(val.code, +val.pop))
            // const data = d3.map(data_tempmap)
            svg.append("g")
                .selectAll("path")
                .data(geo_json.features)
                .enter()
                .append("path")
                // get path definition for each geo_json feature without a dom element
                .attr("d", d3.geoPath()
                    .projection(projection) // configures path generator to use the projection provided
                )

        }
    });

</script>

<svg id="my_dataviz" width="800" height="600"></svg>
