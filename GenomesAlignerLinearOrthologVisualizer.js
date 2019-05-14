genome1 = "b_genome1.tsv";
genome2 = "b_genome2.tsv";
orthologsG1 = "b_orthologsG3.tsv";
orthologsG2 = "b_orthologsG2.tsv";
paralogsG1 = "b_paralogsG1.tsv";
paralogsG2 = "b_paralogsG2.tsv";

const option = d3.selectAll("#option");
const containerSection = option.append('div').attr('class', 'container section');
containerSection.append('h5').attr('class', 'black-text center').text('Linear visualization');
const canvasContainer = option.append('div').attr('class', 'container');
canvasContainer.append('div').attr('class', 'canvas');

minimumChromosomeLength = 30000;

const dims = {
    height: 800,
    width: 900
}

const margin = { left: 100, right: 20, top: 20, bottom: 20 };

var dimensionss = [
    {
        name: "averageA",
        scale: d3.scaleLinear().range([dims.height, 0]),
        type: "number"
    },
    {
        name: "averageB",
        scale: d3.scaleLinear().range([dims.height, 0]),
        type: "number"
    }
];

const x = d3.scaleOrdinal().range([0, dims.width])

const graph = d3.selectAll('.canvas')
    .append('svg')
    .attr('width', dims.width + margin.left + margin.right)
    .attr('height', dims.height + margin.top + margin.bottom)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// group for ortholog lines
const linesGroup = graph.append('g')
        .attr('class', 'orthologLines');

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
    .x(margin.left)
    .y(d => y2(d.geneStartG2));
// .curve(d3.curveMonotoneX);

const path = d => {
    // //console.log(d)
    // //var a = line(dimensions.map(function(p) { 
    // //console.log(p)
    // //return [position(p), y[p](d[p])]; }));
    // //console.log(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }))
    // //return a;
    // linee = line(dimensionss.map(function (dimension) {
    //     return [x(dimension.name), dimension.scale(d[dimension.name])];
    // }));
    // return linee;
    console.log(d);
    console.log(line(d));
    return line([[0, 5000], [200, 500]]);
}

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
    graph.selectAll("line.orthologLine").transition(t)
        .attr("y1", d => {
            return y1((d.geneStart))});
}

function zoom2() {
    var t = graph.transition().duration(750);
    graph.select(".y2-axis").transition(t).call(y2Axis);
    graph.selectAll("line.orthologLine").transition(t)
        .attr("y2", d => {
            return y2((d.geneStartG2))});
}

// Create axes
const y1Axis = d3.axisLeft(y1)
    .ticks(4);
const y2Axis = d3.axisRight(y2)
    .ticks(4);

var max = 0;
let currentCrms = {};
const update = (genomeData1, genomeData2, crmsA) => {
    // Prepare data
    console.log(genomeData1);
    console.log(genomeData2);
    console.log(crmsA);
    console.log(crmsA[0]);
    console.log(line(crmsA[0]));
    currentCrms = crmsA[0];
    genomeData1 = genomeData2.filter(chromosome => {
        return chromosome.Length > minimumChromosomeLength;
    });
    genomeData2 = genomeData2.filter(chromosome => {
        return chromosome.Length > minimumChromosomeLength;
    });
    const lines = linesGroup.selectAll('line.orthologLine').data(crmsA);

    
    // Update scale domains
    genomeData1.forEach(g => {
            max += parseInt(g.Length);
        });

    y1.domain([0, max]);
    y2.domain([0, max]);


    // Call axes
    y1AxisGroup.call(y1Axis);
    y2AxisGroup.call(y2Axis);

    // Exit selection
    console.log(lines.exit());
    lines.exit().remove();

    // Current selection
    lines.remove();

    // Enter selection
    // lines.enter();
    // graph.append('g')
    //     .attr('class', 'chromosomeLines')
    //     .append('line')
    //     .attr('class', 'chromosomeLine')
    //     .attr('x1', margin.left)
    //     .attr('x2', dims.width)
    //     .attr('y1', y1(currentCrms.geneStart + 200))
    //     .attr('y2', y2(currentCrms.geneStartG2 + 8000))
    //     .style('stroke', 'black');
    // .attr('d', path);
    

    lines.enter()
        .append('line')
        .attr('class', 'orthologLine')
        .attr('x1', 20)
        .attr('x2', dims.width)
        .attr('y1', d => y1(d.geneStart))
        .attr('y2', d => y2(d.geneStartG2))
        .style('stroke', 'black');


    // Animations
}

// read data
d3.tsv(genome1)
    .then(genomeData1 => {
        d3.tsv(genome2)
            .then(genomeData2 => {
                d3.tsv(orthologsG1).then(crmsA => {
                    update(genomeData1, genomeData2, crmsA);
                });
            });
    });


