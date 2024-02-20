<script lang="ts">
    import { onMount } from "svelte";
    import * as d3 from "d3";

    type Features =
        | "country"
        | "year"
        | "iso_code"
        | "solar_consumption"
        | "wind_consumption"
        | "hydro_consumption"
        | "biofuel_consumption"
        | "coal_consumption"
        | "gas_consumption"
        | "oil_consumption"
        | "nuclear_consumption";

    interface MapElement {
        country: string;
        solar_consumption: number;
        wind_consumption: number;
        hydro_consumption: number;
        biofuel_consumption: number;
        coal_consumption: number;
        gas_consumption: number;
        oil_consumption: number;
        nuclear_consumption: number;
    }

    var colorScale = d3
        .scaleThreshold()
        .domain([1000, 3000, 5000, 7000, 10000, 13000])
        .range(d3.schemeOranges[7]);

    let mouseX = 0;
    let mouseY = 0;
    let currentTarget: HTMLElement | undefined = undefined;

    let mounted = false;
    let gjson: d3.ExtendedFeatureCollection | undefined = undefined;
    let gmap: Map<string, MapElement> | undefined = undefined;
    let gpath:
        | d3.GeoPath<d3.GeoPermissibleObjects, d3.GeoPermissibleObjects>
        | undefined = undefined;
    onMount(async () => {
        let svg = d3.select("svg");
        let width = 800;
        let height = 400;
        svg.attr("width", width);
        svg.attr("height", height);
        svg.attr("viewBox", `0 0 ${width} ${height}`).attr(
            "preserveAspectRatio",
            "xMidYMid meet"
        );

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
                const { x, y, k } = event.transform;
                svg.selectAll("path").attr(
                    "transform",
                    `translate(${x},${y}) scale(${k})`
                );
            });
        // @ts-ignore
        svg.call(zoom);

        // projection
        var projection = d3.geoEquirectangular();

        Promise.all([
            fetch("./world.geojson").then((response) => response.json()),
            d3.csv<Features>("./owid-subset.csv"),
        ]).then(([geo_json, csv]) => {
            ready(geo_json, csv);
        });

        function ready(
            geo_json: d3.ExtendedFeatureCollection,
            csv: d3.DSVRowArray<Features>
        ) {
            console.log(geo_json);
            console.log(csv);

            // i don't want to have to recalculate the set
            // at the cost of more memory, i'll just store the entire csv in a map
            var map = new Map<string, MapElement>();
            csv.forEach((row) =>
                map.set(`${row.iso_code}-${row.year}`, {
                    country: row.country,
                    solar_consumption: +row.solar_consumption,
                    wind_consumption: +row.wind_consumption,
                    hydro_consumption: +row.hydro_consumption,
                    biofuel_consumption: +row.biofuel_consumption,
                    coal_consumption: +row.coal_consumption,
                    gas_consumption: +row.gas_consumption,
                    oil_consumption: +row.oil_consumption,
                    nuclear_consumption: +row.nuclear_consumption,
                })
            );

            gjson = geo_json;
            gmap = map;
            projection.fitSize([width, height], geo_json);
            gpath = d3.geoPath().projection(projection);

            let mouseOver = function (e: MouseEvent) {
                const target = e.target as HTMLElement;
                const datapoint = map.get(`${target.id}-${year}`)!;

                if(target) {
                    currentTarget = target;
                }

                d3.selectAll(".Country") // reset all countries
                    .transition()
                    .duration(200)
                    .style("opacity", 0.5)
                    .style("stroke", "transparent");

                d3.select(target)
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("stroke", "black");

                // display tooltip with country name and display total depending on the filters selected

                let html_string = "";
                let total = 0;
                let merged = Object.assign(
                    {},
                    filters.renewable_types,
                    filters.fossil_fuel_types,
                    filters.other_types
                );
                for (const [key, value] of Object.entries(merged)) {
                    if (value) {
                        html_string += `${capitalizeFirstLetter(
                            key
                        )}: ${Math.round(
                            Number(datapoint[key + "_consumption"])
                        )}<br>`;
                        total += Number(datapoint[key + "_consumption"]);
                    }
                }
                // console.log(html_string)
                // console.log(total)

                d3.select("#tooltip")
                    .style("opacity", 1)
                    .html(
                        `Region: ${datapoint.country}<br>TOTAL: ${Math.round(
                            total
                        )}<br>${html_string}`
                    );

                const boundingRect = target.getBoundingClientRect();

                d3.select("#tooltip2")
                    .style("opacity", 1)
                    .style("top", `${boundingRect.y + boundingRect.height + 20}px`)
                    .style("left", `${mouseX}px`)
                    .html(
                        `Region: ${datapoint.country}<br>TOTAL (TWh): ${Math.round(
                            total
                        )}<br>${html_string}`
                    )
                    
                    

            };

            let mouseLeave = function (e: MouseEvent) {
                d3.selectAll(".Country")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("stroke", "transparent");
                d3.select("#tooltip2").style("opacity", 0); // Hide the tooltip
            };

            svg.append("g")
                .selectAll("path")
                .data(geo_json.features)
                .enter()
                .append("path")
                // get path definition for each geo_json feature without a dom element
                // configure a svg path generator to use the projection function provided
                .attr("d", gpath)
                .attr("fill", function (d) {
                    const datapoint = map.get(`${d.id}-${year}`);
                    // sum across all consumptions
                    const totalConsumption =
                        (filters.renewable_types.solar
                            ? datapoint?.solar_consumption || 0
                            : 0) +
                        (filters.renewable_types.wind
                            ? datapoint?.wind_consumption || 0
                            : 0) +
                        (filters.renewable_types.hydro
                            ? datapoint?.hydro_consumption || 0
                            : 0) +
                        (filters.renewable_types.biofuel
                            ? datapoint?.biofuel_consumption || 0
                            : 0) +
                        (filters.fossil_fuel_types.coal
                            ? datapoint?.coal_consumption || 0
                            : 0) +
                        (filters.fossil_fuel_types.gas
                            ? datapoint?.gas_consumption || 0
                            : 0) +
                        (filters.fossil_fuel_types.oil
                            ? datapoint?.oil_consumption || 0
                            : 0) +
                        (filters.other_types.nuclear
                            ? datapoint?.nuclear_consumption || 0
                            : 0);

                    // console.log(d.id, totalConsumption);
                    return colorScale(totalConsumption);
                })
                .style("stroke", "transparent")
                .attr("class", (d) => "Country")
                .attr("id", (d) => d.id as string)
                .style("opacity", 1)
                .on("mouseover", mouseOver)
                .on("mouseleave", mouseLeave);

            mounted = true;
        }

        // add listener for mouse movement to update mouse position variables
        document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
    });

    let year = 2000;
    let filters = {
        renewables: true,
        renewable_types: {
            solar: true,
            wind: true,
            hydro: true,
            biofuel: true,
        },

        fossil_fuels: true,
        fossil_fuel_types: {
            coal: true,
            oil: true,
            gas: true,
        },
        others: true,
        other_types: {
            nuclear: true,
        },
    };

    const handleFilterInput = (
        type: "renewables" | "ffs" | "others" | "single"
    ) => {
        if (type == "renewables") {
            const setTo = !filters.renewables;
            filters.renewables = setTo;
            filters.renewable_types.solar = setTo;
            filters.renewable_types.wind = setTo;
            filters.renewable_types.hydro = setTo;
            filters.renewable_types.biofuel = setTo;
        } else if (type == "ffs") {
            const setTo = !filters.fossil_fuels;
            filters.fossil_fuels = setTo;
            filters.fossil_fuel_types.coal = setTo;
            filters.fossil_fuel_types.oil = setTo;
            filters.fossil_fuel_types.gas = setTo;
        } else if (type == "others") {
            const setTo = !filters.others;
            filters.others = setTo;
            filters.other_types.nuclear = setTo;
        }
        filters = filters;
    };

    // seems you have to place reactive statements after the function definitions
    // variables used inside this reactive statement are considered dependencies i guess
    // so you have to make sure that they're used inside the reactive statement
    $: {
        if (mounted && gjson && gmap) {
            // console.log(mounted);
            // console.log(year);
            // console.log(filters);
            // console.log(gmap);
            // console.log(gjson);
            // console.log(gpath);

            d3.selectAll("path")
                .data(gjson.features)
                .attr("fill", function (d) {
                    const datapoint = gmap.get(`${d.id}-${year}`);
                    // sum across all consumptions
                    const totalConsumption =
                        (filters.renewable_types.solar
                            ? datapoint?.solar_consumption || 0
                            : 0) +
                        (filters.renewable_types.wind
                            ? datapoint?.wind_consumption || 0
                            : 0) +
                        (filters.renewable_types.hydro
                            ? datapoint?.hydro_consumption || 0
                            : 0) +
                        (filters.renewable_types.biofuel
                            ? datapoint?.biofuel_consumption || 0
                            : 0) +
                        (filters.fossil_fuel_types.coal
                            ? datapoint?.coal_consumption || 0
                            : 0) +
                        (filters.fossil_fuel_types.gas
                            ? datapoint?.gas_consumption || 0
                            : 0) +
                        (filters.fossil_fuel_types.oil
                            ? datapoint?.oil_consumption || 0
                            : 0) +
                        (filters.other_types.nuclear
                            ? datapoint?.nuclear_consumption || 0
                            : 0);

                    // console.log(d.id, totalConsumption);
                    return colorScale(totalConsumption);
                });

        }
    }
    $: {
        console.log(currentTarget)
        console.log(year)
        if(currentTarget) {

            console.log('testing123')
            const target = currentTarget as HTMLElement;
            console.log("target" + target)
            const datapoint = gmap.get(`${target.id}-${year}`)!;
            if(datapoint !== undefined) {
                console.log("datapoint" + datapoint)

            let html_string = "";
            let total = 0;
            let merged = Object.assign(
                {},
                filters.renewable_types,
                filters.fossil_fuel_types,
                filters.other_types
            );
            for (const [key, value] of Object.entries(merged)) {
                if (value) {
                    html_string += `${capitalizeFirstLetter(key)}: ${Math.round(
                       Number(datapoint[key + "_consumption"]) 
                    )}<br>`;
                    total += Number(datapoint[key + "_consumption"]) 
                }
            }

                        d3.select("#tooltip")
                .style("opacity", 1)
                .html(
                    `Region: ${datapoint.country}<br>TOTAL (TWh): ${Math.round(
                        total
                    )}<br>${html_string}`
                );
            }

        }
        // if(currentTarget) {
        //     console.log('testing123')
        //     const target = currentTarget as HTMLElement;
        //     const datapoint = gmap.get(`${target.id}-${year}`)!;
        //     console.log(datapoint)

        //     let html_string = "";
        //     let total = 0;
        //     let merged = Object.assign(
        //         {},
        //         filters.renewable_types,
        //         filters.fossil_fuel_types,
        //         filters.other_types
        //     );
        //     for (const [key, value] of Object.entries(merged)) {
        //         if (value) {
        //             const datapoint_val = 0
        //             try {
        //                 Number(datapoint[key + "_consumption"])
        //             }  catch(e) {}
                    
        //             html_string += `${capitalizeFirstLetter(key)}: ${Math.round(
        //                datapoint_val 
        //             )}<br>`;
        //             total += datapoint_val;
        //         }
        //     }

        //     d3.select("#tooltip")
        //         .style("opacity", 1)
        //         .html(
        //             `Region: ${datapoint.country}<br>TOTAL: ${Math.round(
        //                 total
        //             )}<br>${html_string}`
        //         );


        //     console.log(html_string)
            

        // }
    }

    function capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
</script>

<div>
    <h1>Worldwide Energy Usage</h1>

    <div style="display:flex; flex-direction: row; padding: 20px;">
        <form style="margin-right: 10px;">
            <label>
                <input
                    type="checkbox"
                    bind:checked={filters.renewables}
                    on:input={(e) => handleFilterInput("renewables")}
                />
                Renewables
            </label>
            <ul style="margin-top: 0;">
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
            <ul style="margin-top: 0;">
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

            <label>
                <input
                    type="checkbox"
                    bind:checked={filters.others}
                    on:input={(e) => handleFilterInput("others")}
                />
                Others
            </label>
            <ul style="margin-top: 0;">
                {#each Object.keys(filters.other_types) as key (key)}
                    <li>
                        <label>
                            <input
                                type="checkbox"
                                bind:checked={filters.other_types[key]}
                            />
                            {capitalizeFirstLetter(key)}
                        </label>
                    </li>
                {/each}
            </ul>
        </form>
        <div style="width: 200px">
            <form>
                <label>
                    Year<br />
                    <input class="year" bind:value={year} /><br />
                    <input
                        class="year"
                        type="range"
                        bind:value={year}
                        name="volume"
                        min="1950"
                        max="2016"
                    />
                </label>
            </form>
            <div id="tooltip" style="opacity: 0;">ASDF asdf</div>
            <div
                id="tooltip2"
                style="opacity: 0; position: absolute; top: 10px; padding: 10px; background-color: white; border: 1px solid black; border-radius: 4px;"
            >
                testing
            </div>
        </div>
        <svg id="my_dataviz"></svg>
    </div>
</div>

<style>
    h1 {
        text-align: center;
        font-family: "YourChosenFont", sans-serif; /* Replace 'YourChosenFont' with the desired font */
    }
</style>
