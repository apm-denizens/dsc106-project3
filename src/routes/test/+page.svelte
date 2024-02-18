<script>
	
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
    $: {
        console.log("SANITY")
        console.log(filters)
    }

	
	
	function updateFoo() {
		filters.renewable_types.biofuel = false
        filters = filters
	}
</script>

<h2>
	Hello {filters.renewable_types.biofuel}
</h2>

<button on:click={updateFoo}>
	Update Ref
</button>

<pre>
	{JSON.stringify(filters)}
</pre>