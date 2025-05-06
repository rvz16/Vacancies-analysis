fetch("/data")
  .then(res => res.json())
  .then(data => {
    drawDraggableBubbleChart(data.skills);
    drawPieChart(data.experience);
    drawBarChartRace(data.schedule);
  });

function drawDraggableBubbleChart(data) {
  const width = 800, height = 600;

  const svg = d3.select("#bubble").append("svg")
    .attr("width", width)
    .attr("height", height);

  const root = d3.pack()
    .size([width, height])
    .padding(3)(
      d3.hierarchy({ children: data }).sum(d => d.count)
    );

  const nodes = root.leaves().map(d => ({
    ...d,
    x: d.x,
    y: d.y,
    r: d.r
  }));

  const simulation = d3.forceSimulation(nodes)
    .force("x", d3.forceX(width / 2).strength(0.03))
    .force("y", d3.forceY(height / 2).strength(0.03))
    .force("collide", d3.forceCollide(d => d.r + 2))
    .on("tick", ticked);

  const node = svg.selectAll("g")
    .data(nodes)
    .enter().append("g")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
    );

  node.append("circle")
    .attr("r", d => d.r)
    .attr("fill", "#69b3a2");

  node.append("text")
    .text(d => d.data.name)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("dy", ".3em")
    .style("pointer-events", "none");

  function ticked() {
    node.attr("transform", d => `translate(${d.x},${d.y})`);
  }

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

function drawPieChart(data) {
  const width = 400, height = 400, radius = 200;
  const svg = d3.select("#pie").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width/2},${height/2})`);

  const color = d3.scaleOrdinal(d3.schemeSet2);
  const pie = d3.pie().value(d => d.count);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  svg.selectAll("path")
    .data(pie(data))
    .enter().append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.name))
    .attr("stroke", "white");

  svg.selectAll("text")
    .data(pie(data))
    .enter().append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("dy", "0.35em")
    .text(d => d.data.name)
    .style("font-size", "10px")
    .style("text-anchor", "middle");
}

function drawBarChartRace(data) {
  const width = 800, height = 300;
  const svg = d3.select("#treemap").append("svg")
    .attr("width", width)
    .attr("height", height);

  const steps = 30;
  const transformed = data.map(d => ({
    name: d.name,
    steps: Array.from({ length: steps }, (_, i) => ({
      time: i,
      count: Math.round((d.count / steps) * (i + 1))
    }))
  }));

  const flatData = [];
  transformed.forEach(d => {
    d.steps.forEach(s => flatData.push({ time: s.time, name: d.name, count: s.count }));
  });

  const x = d3.scaleLinear().range([0, width - 150]);
  const y = d3.scaleBand().range([0, height]).padding(0.1);
  const color = d3.scaleOrdinal(d3.schemeSet3);

  let time = 0;

  function updateChart() {
    const current = flatData.filter(d => d.time === time).sort((a, b) => b.count - a.count).slice(0, 7);

    x.domain([0, d3.max(current, d => d.count)]);
    y.domain(current.map(d => d.name));

    const bars = svg.selectAll("rect").data(current, d => d.name);

    bars.enter()
      .append("rect")
      .attr("x", 150)
      .attr("y", d => y(d.name))
      .attr("height", y.bandwidth())
      .attr("width", 0)
      .attr("fill", d => color(d.name))
      .transition().duration(400)
      .attr("width", d => x(d.count));

    bars.transition().duration(400)
      .attr("y", d => y(d.name))
      .attr("width", d => x(d.count));

    bars.exit().remove();

    const labels = svg.selectAll("text.label").data(current, d => d.name);

    labels.enter()
      .append("text")
      .attr("class", "label")
      .attr("x", 145)
      .attr("y", d => y(d.name) + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(d => d.name)
      .style("font-size", "12px");

    labels.transition().duration(400)
      .attr("y", d => y(d.name) + y.bandwidth() / 2)
      .text(d => d.name);

    labels.exit().remove();

    time++;
    if (time < steps) {
      setTimeout(updateChart, 700);
    }
  }

  updateChart();
}
