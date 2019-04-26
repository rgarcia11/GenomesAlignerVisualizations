genome1 = "b_genome1.tsv";
genome2 = "b_genome2.tsv";
orthologsG1 = "b_orthologsG1.tsv";
orthologsG2 = "b_orthologsG2.tsv";
paralogsG1 = "b_paralogsG1.tsv";
paralogsG2 = "b_paralogsG2.tsv";

const option = d3.selectAll("#option");
const containerSection = option.append('div').attr('class', 'container section');
containerSection.append('h5').attr('class', 'black-text center').text('Linear visualization');
const canvasContainer = option.append('div').attr('class', 'container');
canvasContainer.append('div').attr('class', 'canvas');

const dims = {
    height: 800,
    width: 900
}

const margin = { left: 100, right: 20, top: 20, bottom: 20 };

const graph = d3.selectAll('.canvas')
    .append('svg')
    .attr('width', dims.width + margin.left + margin.right)
    .attr('height', dims.height + margin.top + margin.bottom)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//scales
const y1 = d3.scaleLinear()
    .range([0, dims.height]);
const y2 = d3.scaleLinear()
    .range([0, dims.height]);

// axes groups
const y1AxisGroup = graph.append('g')
    .attr('class', 'y1-axis')
    .attr('transform', 'translate(20, 5)');
const y2AxisGroup = graph.append('g')
    .attr('class', 'y2-axis')
    .attr('transform', `translate(${dims.width}, 5)`);

// lines
const line = d3.line()
    .x(d => x(d.x))
    .y(d => y(d.y))
    .curve(d3.curveMonotoneX);

// brush (selection)
const brush1 = d3.brushY()
    .extent([[0, 0], [dims.width / 2, dims.height + 20]])
    .on("end", brushended1);
const brush2 = d3.brushY()
    .extent([[dims.width / 2, 0], [dims.width, dims.height + 20]])
    .on("end", brushended2);
var idleTimeout;
const idleDelay = 350;

graph.append("g")
    .attr("class", "brush1")
    .call(brush1);

graph.append("g")
    .attr("class", "brush2")
    .call(brush2);

function brushended1() {
    var s = d3.event.selection;
    if (!s) {
        if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
        y1.domain([0, max]);
    } else {
        y1.domain([s[0], s[1]].map(y1.invert, y1));
        graph.select(".brush1").call(brush1.move, null);
    }
    zoom1();
}

function brushended2() {
    var s = d3.event.selection;
    if (!s) {
        if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
        y2.domain([0, max]);
    } else {
        y2.domain([s[0], s[1]].map(y2.invert, y2));
        graph.select(".brush2").call(brush2.move, null);
    }
    zoom2();
}

function idled() {
    idleTimeout = null;
}

function zoom1() {
    var t = graph.transition().duration(750);
    graph.select(".y1-axis").transition(t).call(y1Axis);
    graph.selectAll("circle").transition(t)
        .attr("cx", function (d) { return x(d[0]); })
        .attr("cy", function (d) { return y(d[1]); });
}

function zoom2() {
    var t = graph.transition().duration(750);
    graph.select(".y2-axis").transition(t).call(y2Axis);
    graph.selectAll("circle").transition(t)
        .attr("cx", function (d) { return x(d[0]); })
        .attr("cy", function (d) { return y(d[1]); });
}

// Create axes
const y1Axis = d3.axisLeft(y1)
    .ticks(4);
const y2Axis = d3.axisRight(y2)
    .ticks(4);

var max = 0;

const update = (genomeData1, genomeData2, crmsA, crmsB) => {
    // Prepare data
    // const lcs = 0
    // const genomeData1 = [4, 5, 6, 7, 8, 9]
    // const genomeData2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    console.log(genomeData1);
    console.log(genomeData2);
    console.log(crmsA);
    console.log(crmsB);
    genomeData1.forEach(g => {
        max += parseInt(g.Length);
    });
    console.log(max);

    // Update scale domains

    // y.domain([0, d3.max(crmsB, d => d.distance)]);
    y1.domain([0, max]);
    y2.domain([0, max]);


    // Call axes
    y1AxisGroup.call(y1Axis);
    y2AxisGroup.call(y2Axis);

    // Exit selection

    // Current selection

    // Enter selection

    // Animations
}

// read data
d3.tsv(genome1)
    .then(genomeData1 => {
        d3.tsv(genome2)
            .then(genomeData2 => {
                d3.tsv(orthologsG1).then(  crmsA => {
                    d3.tsv(orthologsG2).then(crmsB => {
                        update(genomeData1, genomeData2, crmsA, crmsB);
                    });
                });
            });
    });


