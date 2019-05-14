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
    width: 1000
}

const margin = { left: 80, right: 20, top: 20, bottom: 20 };

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
const color = d3.scaleOrdinal([
    '#66c2a5',
    '#fc8d62',
    '#8da0cb',
    '#e78ac3',
    '#8dd3c7',
    '#bebada',
    '#fb8072',
    '#80b1d3',
    '#fdb462',
    '#b3de69',
    '#fccde5',
    '#d9d9d9'
]);

// axes groups
const y1AxisGroup = graph.append('g')
    .attr('class', 'y1-axis')
    .attr('transform', `translate(${margin.left}, 0)`);
const y2AxisGroup = graph.append('g')
    .attr('class', 'y2-axis')
    .attr('transform', `translate(${dims.width}, 0)`);

// brush (selection)
const brush1 = d3.brushY()
    .extent([[0, 0], [dims.width / 2, dims.height]])
    .on("end", brushended1);
const brush2 = d3.brushY()
    .extent([[dims.width / 2, 0], [dims.width, dims.height]])
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
        y1.domain([0, maxG1]);
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
        y2.domain([0, maxG2]);
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
            return y1(d.geneStart)
        });
}

function zoom2() {
    var t = graph.transition().duration(750);
    graph.select(".y2-axis").transition(t).call(y2Axis);
    graph.selectAll("line.orthologLine").transition(t)
        .attr("y2", d => {
            return y2(d.geneStartG2)
        });
}

// Create axes
const y1Axis = d3.axisLeft(y1)
    .ticks(4);
const y2Axis = d3.axisRight(y2)
    .ticks(4);

let maxG1 = 0;
let maxG2 = 0;
let currentCrms = {};
let lengthsG1 = {};
let lengthsG2 = {};
const update = (genomeData1, genomeData2, orthologs) => {

    // Prepare data
    currentCrms = orthologs[0];
    genomeData1 = genomeData2.filter(chromosome => {
        return chromosome.Length > minimumChromosomeLength;
    });
    genomeData2 = genomeData2.filter(chromosome => {
        return chromosome.Length > minimumChromosomeLength;
    });

    genomeData1.forEach(g => {
        lengthsG1[g.Name] = maxG1;
        maxG1 += parseInt(g.Length);
    });
    console.log(genomeData1);
    console.log(lengthsG1);
    genomeData2.forEach(g => {
        lengthsG2[g.Name] = maxG2;
        maxG2 += parseInt(g.Length);
    });
    console.log(genomeData2);
    console.log(lengthsG2);

    console.log(maxG1);
    console.log(maxG2);

    console.log(orthologs);
    orthologs = createLineData(genomeData1, genomeData2, orthologs);
    console.log(orthologs);

    const lines = linesGroup.selectAll('line.orthologLine').data(orthologs);


    // Update scale domains

    y1.domain([0, maxG1]);
    y2.domain([0, maxG2]);
    color.domain(genomeData2.map(chromosome => chromosome.Name));

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
        .attr('id', d => `${d.geneId}::${d.geneIdG2}`)
        .attr('x1', margin.left)
        .attr('x2', dims.width)
        .attr('y1', d => y1(d.geneStart))
        .attr('y2', d => y2(d.geneStartG2))
        .style('stroke', d => color(d.chromosome));


    // Animations
}

// create data to draw the lines in the correct positions
// its actually a filter for the orthologs, but can be extended
const createLineData = (genomeData1, genomeData2, orthologs) => {
    lineData = []
    orthologs.forEach((ortholog) => {
        if (chromosomesDisplayed(genomeData1, genomeData2, ortholog)) {
            ortholog.geneStart = lengthsG1[ortholog.chromosome] + parseInt(ortholog.geneStart);
            ortholog.geneStartG2 = lengthsG2[ortholog.chromosomeG2] + parseInt(ortholog.geneStartG2);
            ortholog.geneEnd = lengthsG1[ortholog.chromosome] + parseInt(ortholog.geneEnd);
            ortholog.geneEndG2 = lengthsG2[ortholog.chromosomeG2] + parseInt(ortholog.geneEndG2);

            lineData.push(ortholog);
        }
    });
    return lineData;
}

// Auxiliary function to check if a chromosome is displayed
const chromosomesDisplayed = (genomeData1, genomeData2, ortholog) => {
    const displayed = { genome1: false, genome2: false };
    genomeData1.forEach(chromosome => {
        if (chromosome.Name == ortholog.chromosome) {
            displayed.genome1 = true;
        }
    })
    genomeData2.forEach(chromosome => {
        if (chromosome.Name == ortholog.chromosomeG2) {
            displayed.genome2 = true;
        }
    })
    return displayed.genome1 && displayed.genome2;
};

// read data
d3.tsv(genome1)
    .then(genomeData1 => {
        d3.tsv(genome2)
            .then(genomeData2 => {
                d3.tsv(orthologsG1).then(orthologs => {
                    update(genomeData1, genomeData2, orthologs);
                });
            });
    });


