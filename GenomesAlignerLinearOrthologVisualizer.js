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

let allOrthologs;
let displayedOrthologs;
let genomeData1;
let genomeData2;

const graph = d3.selectAll('.canvas')
    .append('svg')
    .attr('width', dims.width + margin.left + margin.right)
    .attr('height', dims.height + margin.top + margin.bottom)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// group for chromosome labels
const chromosomeLabelsG1 = graph.append('g')
    .attr('class', 'chromosomeLabelsG1');
const chromosomeLabelsG2 = graph.append('g')
    .attr('class', 'chromosomeLabelsG2');

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
    y1AxisGroup.transition(t).call(y1Axis);
    graph.selectAll("line.orthologLine").transition(t)
        .attr("y1", d => {
            return y1(d.geneStart)
        }).transition(t)
        .attr('visibility', d => d.geneStart > y1.domain()[1] || d.geneStart < y1.domain()[0] ? 'hidden' : null);

    topPinnedLabel = topPinnedLabelG1(y1.domain()[0]);
    bottomPinnedLabel = bottomPinnedLabelG1(y1.domain()[1]);
    graph.selectAll('text.chromosomeLabelG1').transition(t)
        .attr('transform', d => `translate(${margin.left - 50}, 
                ${d.Name === topPinnedLabel ?
                y1.range()[0] + margin.top :
                d.Name === bottomPinnedLabel ?
                    y1.range()[1] :
                    y1(d.Length / 2 + lengthsG1[d.Name]) + margin.top})`)
}

function zoom2() {
    var t = graph.transition().duration(750);
    y2AxisGroup.transition(t).call(y2Axis);
    graph.selectAll("line.orthologLine").transition(t)
        .attr("y2", d => {
            return y2(d.geneStartG2)
        })
        .attr('visibility', d => d.geneStartG2 > y2.domain()[1] || d.geneStartG2 < y2.domain()[0] ? 'hidden' : null);
    topPinnedLabel = topPinnedLabelG2(y2.domain()[0]);
    bottomPinnedLabel = bottomPinnedLabelG2(y2.domain()[1]);
    graph.selectAll('text.chromosomeLabelG2').transition(t)
        .attr('transform', d => `translate(${dims.width + margin.right}, 
            ${d.Name === topPinnedLabel ?
                y2.range()[0] + margin.top :
                d.Name === bottomPinnedLabel ?
                    y2.range()[1] :
                    y2(d.Length / 2 + lengthsG2[d.Name]) + margin.top})`)
}

//auxiliary function to get which label to pin
const topPinnedLabelG1 = value => {
    let pinnedLabel;
    Object.keys(lengthsG1).forEach((chromosome) => {
        if (lengthsG1[chromosome] < value) {
            pinnedLabel = chromosome
        }
    });
    return pinnedLabel;
}
const bottomPinnedLabelG1 = value => {
    let pinnedLabel = 0;
    Object.keys(lengthsG1).forEach((chromosome, index, array) => {
        const invertedChromosome = array[array.length - index - 1];
        if (lengthsG1[invertedChromosome] < value && pinnedLabel === 0) {
            pinnedLabel = invertedChromosome
        }
    });
    return pinnedLabel;
}

const topPinnedLabelG2 = value => {
    let pinnedLabel;
    Object.keys(lengthsG2).forEach((chromosome) => {
        if (lengthsG2[chromosome] < value) {
            pinnedLabel = chromosome
        }
    });
    return pinnedLabel;
}
const bottomPinnedLabelG2 = value => {
    let pinnedLabel = 0;
    Object.keys(lengthsG2).forEach((chromosome, index, array) => {
        const invertedChromosome = array[array.length - index - 1];
        if (lengthsG2[invertedChromosome] < value && pinnedLabel === 0) {
            pinnedLabel = invertedChromosome
        }
    });
    return pinnedLabel;
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
const update = (orthologs) => {

    // Prepare data
    currentCrms = orthologs[0];
    genomeData1 = genomeData1.filter(chromosome => {
        return chromosome.Length > minimumChromosomeLength;
    });
    genomeData2 = genomeData2.filter(chromosome => {
        return chromosome.Length > minimumChromosomeLength;
    });

    genomeData1.forEach(g => {
        lengthsG1[g.Name] = maxG1;
        maxG1 += parseInt(g.Length);
    });
    genomeData2.forEach(g => {
        lengthsG2[g.Name] = maxG2;
        maxG2 += parseInt(g.Length);
    });
    orthologs = createLineData(genomeData1, genomeData2, orthologs);


    const lines = linesGroup.selectAll('line.orthologLine').data(orthologs);

    // Update scale domains

    y1.domain([0, maxG1]);
    y2.domain([0, maxG2]);
    color.domain(genomeData2.map(chromosome => chromosome.Name));

    // Call axes
    y1AxisGroup.call(y1Axis);
    y2AxisGroup.call(y2Axis);

    // Exit selection
    lines.exit().remove();

    // Current selection
    lines.remove();

    // Enter selection
    lines.enter()
        .append('line')
        .attr('class', 'orthologLine')
        .attr('id', d => `${d.geneId}::${d.geneIdG2}`)
        .attr('x1', margin.left)
        .attr('x2', dims.width)
        .attr('y1', d => y1(d.geneStart))
        .attr('y2', d => y2(d.geneStartG2))
        .style('stroke', d => color(d.chromosome));

    // Chromosome labels
    const labelsG1 = chromosomeLabelsG1.selectAll('text').data(genomeData1);
    labelsG1.enter()
        .append('text')
        .attr('class', 'chromosomeLabelG1')
        .text(d => d.Name)
        .attr('transform', d => `translate(${margin.left - 50}, ${y1(d.Length / 2 + lengthsG1[d.Name]) + margin.top})`)
        .attr('text-anchor', 'end')
        .attr('fill', d => color(d.Name));
    const labelsG2 = chromosomeLabelsG2.selectAll('text').data(genomeData2);
    labelsG2.enter()
        .append('text')
        .attr('class', 'chromosomeLabelG2')
        .text(d => d.Name)
        .attr('transform', d => `translate(${dims.width + margin.right}, ${y2(d.Length / 2 + lengthsG2[d.Name]) + margin.top})`)
        .attr('text-anchor', 'start')
        .attr('fill', d => color(d.Name));


    // .attr("transform", function (d, i) {
    //     const c = arc.innerRadius(dims.labelRadius).centroid(d);
    //     return `translate(${c[0]}, ${c[1]}) rotate(${d.angle * 180 / Math.PI - 90}) ${d.angle > Math.PI ? 'rotate(180)' : ''}`;
    // })
    // .attr('fill', d => color(d.index))
    // .style('width', 20)

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
    .then(genomeData1r => {
        genomeData1 = genomeData1r;
        d3.tsv(genome2)
            .then(genomeData2r => {
                genomeData2 = genomeData2r;
                d3.tsv(orthologsG1).then(orthologs => {
                    allOrthologs = orthologs;
                    displayedOrthologs = [...allOrthologs];
                    update(displayedOrthologs);
                });
            });
    });


