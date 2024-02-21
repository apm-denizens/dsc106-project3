<h1>Writeup</h1>
<h2>Rationale for Design Decisions</h2>
<p>A rationale for your design decisions. How did you choose your particular visual encodings and interaction techniques? What alternatives did you consider and how did you arrive at your ultimate choices?</p>

<p>
Visual Encodings: <br>
XY axis: Longitude Latitude <br>
Color Intensity: Total energy consumption <br>
Text: Breakdown of energy usage in tooltips. <br>
</p>

<p>
The goal going into this visualization is to explore how energy consumption changes over the time axis, along with another axis of "energy type". To also add in a "spacial" element to the visualization, a choropleth is used to represent a lot of this information. 
Instead of a choropleth, we were thinking of doing something like a bar chart, with specific countries being highlighted in the barchart. There would be a reduced set, but also a greater focus. In the end, while this would've been far easier to implement, we still decided that a choropleth enables the viewer to better explore higher-level geographic trends over time. This could also be split across energy sources, so one can for example, see how renewable energy adoption "spreads" across the globe over time. Or how some countries have a stagnating energy consumption while others continually ramp up over time (We were also thinking of adding in some kind of a GDP axis, to explore how energy consumption of different types affects the economy, but on top of not being able to come up with a clean and compact way to represent this information on the choropleth, the scope of the project would've broadened too much for this project). 
</p>

<p>
Despite it ending up being annoying to set up properly, the choropleth enables the observation of a lot of interesting trends across not just time, but space. 
To make it clear what specific region is being explored, we added an interactive hover, where a country's svg path element will be highlighted in black along with the opacity of all other svg path elements being reduced. This makes the current country of focus pop out to the viewer, which is a nice readability bonus. Coupling this with a tooltip hover, helps to immediate provide the viewer with information that they're looking for. 
</p>

<p>
On top of this, we want to enable the viewer to easily see how the energy consumption numbers WITHIN a specific country change over time. With the current setup, one would have to select the year, mouse over the country, select the next year, and repeat. It's extremely difficult to get a sense for a SINGLE country's change in the breakdown of energy consumption. Having a permanent display box for the last country hovered over was something we thought about. However, doing so would cause issues as the mouse has to actively be over the country on the choropleth to show the tooltip with the information. Moving the mouse to the slider, you would have to move it across the map first, which would then change the tooltip to the last country moused over. This would only work if the country you were interested in was has something like an ocean border. 
</p>

<p>
The graph is zoomable, which enables users to look at specific countries. This would help in the user seeing the specific hue a coountry for a given time, or energy options selected. We also constained the zoom so that the panning wouldn't go out of bounds. This is pretty much default zooming behavior for d3.
</p>

<p>
For the breakdown across energy types, we decided that one should be able to aggregate across whatevery energy types they want to explore. Compared to manually adding in combinations (something we initially had / considered), it makes more sense that the viewer can choose whatever combination they care about. Perhaps someone is only interested in solar+wind. Or perhaps they're only interested in nuclear, oil, and hydro, as they're their country's main sources energy. Through using checkboxes, they can aggregate whatever infromation they want. Furthermore, as a means to improve user experience with being able to uncheck and check by groups, we have "renewable" and "fossil fuel" tags to make it so that they don't constantly have to individually check and uncheck every box. It's a small thing, but it really does make it a lot easier to use. 
</p>

<h2>Development Process</h2>
<p>
An overview of your development process. Describe how the work was split among the team members. Include a commentary on the development process, including answers to the following questions: Roughly how much time did you spend developing your application (in people-hours)? What aspects took the most time?
</p>
<p>
We more or less set aside time to work on every portion of the project together. As a result, work wasn't really "split up" per se, and there wasn't a single person responsible for a single section. It wasn't the most efficient, but it meant that each person had a more hollistic understanding of the project/d3 as a whole. 
</p>

<p>
Learning d3 was not easy for us as there were plenty of things that went wrong all throughout the development process. Most of the time in this project was honestly spent learning the fundamentals of d3/svelte. 
Svelte reactivity was finicky and we spent a long long time debugging to figure out why things weren't updating. Reactive statements have a specific execution order within the script tag, and we were getting subtle bugs based upon that. For some bugs, we just recoded it from scratch, and it somehow started to work. 
We had issues with d3 versioning. We were programming based in d3 v4, where d3.queue was used to load in examples. However, when transitioning to use d3 v7, (there were features we wanted in v7), d3 queue ended up deprecated and was moved to a separate library. Turns out that library didn't work in v7. What sucks is that it didn't error out, but isntead silently failed, which made figuring out the issue take much longer that it should have. For some reason, the processing function was called only after the geojson file was loaded instead of both the geojson file and the csv. In the end, we pretty much just gave up on d3-queue and went with the JS promise.all function. 
Overall there were a lot of bad assumptions made which made debugging very annoying. Typescript helped a lot as it made it clear when we were making bad assumptions about what a type really was. 
</p>

<p>
This was a large initial time investment, but I guess that if we have to do more d3 visualizations in the future, chances are the process will be much faster. We weren't recording the exact times, but if we had to estimate, we probably had 20 hours of sessions, which means that each person put in about 20 hours into the project.
</p> 