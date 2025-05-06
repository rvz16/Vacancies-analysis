function drawBarChartRace(data) {
  const titleCounts = data.reduce((acc, job) => {
    const name = job.name || "No name";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  let titleData = Object.entries(titleCounts).map(([name, count]) => ({ name, count }));
  titleData = titleData.sort((a, b) => b.count - a.count).slice(0, 15); // Top 15 names

  const width = 800, height = 500;
  const svg = d3.select("#treemap").append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleLinear().range([0, width - 150]);
  const y = d3.scaleBand().range([0, height]).padding(0.3);
  const color = d3.scaleOrdinal(d3.schemeSet3);

  y.domain(titleData.map(d => d.name));
  x.domain([0, d3.max(titleData, d => d.count)]);

  svg.selectAll("rect")
    .data(titleData)
    .enter().append("rect")
    .attr("x", 150)
    .attr("y", d => y(d.name))
    .attr("height", y.bandwidth())
    .attr("width", d => x(d.count))
    .attr("fill", d => color(d.name));

  svg.selectAll("text")
    .data(titleData)
    .enter().append("text")
    .attr("x", 145)
    .attr("y", d => y(d.name) + y.bandwidth() / 2)
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .text(d => d.name)
    .style("font-size", "12px");
}

function drawBubbleChart(data) {
  const skillCounts = data.reduce((acc, job) => {
    job.key_skills.forEach(skill => {
      acc[skill] = (acc[skill] || 0) + 1;
    });
    return acc;
  }, {});

  const skills = Object.entries(skillCounts)
    .map(([name, count]) => ({ name, count }));

  const width = 800, height = 500;
  const svg = d3.select("#bubble").append("svg")
    .attr("width", width)
    .attr("height", height);

  const pack = d3.pack()
    .size([width, height])
    .padding(5);

  const root = d3.hierarchy({ children: skills })
    .sum(d => d.count);

  const nodes = pack(root).leaves();
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const node = svg.selectAll("g")
    .data(nodes)
    .enter().append("g")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("circle")
    .attr("r", d => d.r)
    .attr("fill", d => color(d.data.name))
    .on("click", (event, d) => {
      alert(`Навык: ${d.data.name}\nКоличество: ${d.data.count}`);
    });

  node.append("text")
    .text(d => d.data.name)
    .attr("text-anchor", "middle")
    .attr("dy", ".3em")
    .style("font-size", d => Math.min(2 * d.r / d.data.name.length, 14) + "px")
    .style("pointer-events", "none");
}


function drawPieChart(data) {
  const experienceCounts = data.reduce((acc, job) => {
    const experience = job.experience || "Не указан";
    acc[experience] = (acc[experience] || 0) + 1;
    return acc;
  }, {});

  const experienceData = Object.keys(experienceCounts).map(experience => ({
    name: experience,
    count: experienceCounts[experience]
  }));

  const width = 400, height = 400, radius = 200;
  const svg = d3.select("#pie").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const color = d3.scaleOrdinal(d3.schemeSet2);
  const pie = d3.pie().value(d => d.count);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  svg.selectAll("path")
    .data(pie(experienceData))
    .enter().append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.name))
    .attr("stroke", "white");

  svg.selectAll("text")
    .data(pie(experienceData))
    .enter().append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("dy", "0.35em")
    .text(d => d.data.name)
    .style("font-size", "10px")
    .style("text-anchor", "middle");
}



function loadData() {
  fetch("static/data/vacancies_full.json")
    .then(response => response.json())
    .then(data => {
      if (!data || data.length === 0) {
        console.error("Data not downloaded or invalid");
        return;
      }

      drawPieChart(data);
      drawBarChartRace(data);
      drawBubbleChart(data);
    })
    .catch(error => console.error("Error when downloading data:", error));
}

window.onload = loadData;



