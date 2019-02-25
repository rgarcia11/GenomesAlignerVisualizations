const dims = { height: 700, width: 700, innerRadius: 270, outerRadius: 290, padAngle: 0.02, ticksPadAngle: 0.014, ribbonPadAngle: 0.015, opacity: 0.7, fadedOpacity: 0.01, focusOpacity: 0.9 };
const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5) }

const svg = d3.selectAll('.canvas')
    .append('svg')
    .attr('width', dims.width)
    .attr('height', dims.height);

const graph = svg.append('g')
    .attr('transform', `translate(${cent.x}, ${cent.y})`);

const circularAxisGroup = graph.append('g').attr('class', 'axis');

const chord = d3.chord()
    .padAngle(dims.padAngle)
    .sortSubgroups(d3.descending);


const pie = d3.pie()
    .sort(null)
    .value(d => d.Length);

const arc = d3.arc()
    .innerRadius(dims.innerRadius)
    .outerRadius(dims.outerRadius)
    .padAngle(dims.padAngle);

const ribbon = d3.ribbon()
    .radius(dims.innerRadius);

const colour = d3.scaleOrdinal([
    '#66c2a5',
    '#fc8d62',
    '#8da0cb',
    '#e78ac3',
    '#8dd3c7',
    '#ffffb3',
    '#bebada',
    '#fb8072',
    '#80b1d3',
    '#fdb462',
    '#b3de69',
    '#fccde5',
    '#d9d9d9'
]);

const kiloFormat = d3.formatPrefix(',.0', 1e3);

const update = () => {

    // Link data
    const genomeData = tsvToObject(primer_test_genome1_tsv);
    const chordGroupData = pie(genomeData);
    let chordTicks = [];
    chordGroupData.map(item => createTicks(item, 400000)).forEach(item => {
        chordTicks = [...chordTicks, ...item];
    });

    const ribbons = graph.selectAll('.ribbon').data(createParalogChords(tsvToObject(primer_test_paralogs_G1_tsv), chordGroupData));
    const arcs = graph.selectAll('.arc').data(chordGroupData);
    const axis = circularAxisGroup.selectAll('g').data(chordTicks);

    // Update scales domains
    colour.domain(chordGroupData.map(chordGroupMember => chordGroupMember.index));

    // Exit selection
    ribbons.exit().remove();
    arcs.exit().remove();

    // Current selection
    ribbons.remove();
    arcs.remove();

    // Enter selection
    arcs.enter()
        .append('g')
        .append('path')
        .attr('fill', d => colour(d.index))
        .attr('stroke', d => d3.color(colour(d.index)).darker(1))
        .style('opacity', dims.opacity)
        .attr('class', 'arc')
        .attr('d', arc);

    ribbons.enter()
        .append('g')
        .append('path')
        .attr('fill', d => colour(d.target.index))
        .attr('stroke', d => d3.color(colour(d.target.index)).darker(1))
        .style('opacity', dims.opacity)
        .attr('class', 'ribbon')
        .attr('d', ribbon);

    ticks = axis
        .enter()
        .append('g')
        .attr('transform', d => `rotate(${(d.angle + dims.ticksPadAngle) * 180 / Math.PI - 90}) translate(${dims.outerRadius},0)`);

    ticks
        .append('line')
        .attr('class', 'tick')
        .attr('stroke', '#000')
        .attr('x2', 5);

    ticks
        .filter(d => d.value % 5000 === 0)
        .append('text')
        .attr('class', 'tickLabel')
        .attr('x', 8)
        .attr('y', 5)
        .attr('transform', d => d.angle > Math.PI ? `rotate(180) translate(-15)` : null)
        .attr('text-anchor', d => d.angle > Math.PI ? 'end' : null)
        .text(d => kiloFormat(d.value))

    // Animations
    ribbonsAnimation = graph.selectAll('.ribbon');
    arcsAnimation = graph.selectAll('.arc');

    ribbonsAnimation
        .on('mouseover', (d, i, n) => {
            setOpacity(arcsAnimation, dims.fadedOpacity);
            setOpacity(ribbonsAnimation, dims.fadedOpacity);
            setOpacity(arcsAnimation.filter(arc => arc.index === d.target.index || arc.index === d.source.index), dims.focusOpacity);
            setOpacity(d3.select(n[i]), dims.focusOpacity);
        })
        .on('mouseleave', (d, i, n) => {
            setOpacity(arcsAnimation, dims.opacity);
            setOpacity(ribbonsAnimation, dims.opacity);
        });

    arcsAnimation
        .on('mouseover', (d, i, n) => {
            setOpacity(arcsAnimation, dims.fadedOpacity);
            setOpacity(ribbonsAnimation, dims.fadedOpacity);
            arcsToFocus = {};
            setOpacity(ribbonsAnimation
                .filter(ribbon => {
                    if (ribbon.source.index === d.index || ribbon.target.index === d.index) {
                        if (!(ribbon.source.index in arcsToFocus)) {
                            arcsToFocus[ribbon.source.index] = n[ribbon.source.index];
                        }
                        if (!(ribbon.target.index in arcsToFocus)) {
                            arcsToFocus[ribbon.target.index] = n[ribbon.target.index];
                        }
                        return true;
                    }
                    return false;
                }), dims.focusOpacity);
            setOpacity(d3.selectAll(Object.values(arcsToFocus)), dims.focusOpacity);
        })
        .on('mouseleave', () => {
            setOpacity(arcsAnimation, dims.opacity);
            setOpacity(ribbonsAnimation, dims.opacity);
        })
};


const createTicks = (d, step) => {
    const k = (d.endAngle - d.startAngle - dims.padAngle) / d.value;
    return d3.range(0, d.value, step).map(value => {
        return { value: value, angle: value * k + d.startAngle }
    });
};

const createParalogChords = (paralogs, chromosomes) => paralogs.map((paralog) => {
    targetIndex = chromosomeToIndex[paralog.paralogChr];
    sourceIndex = chromosomeToIndex[paralog.chromosome];
    sourceChromosomeStartAngle = chromosomes[sourceIndex].startAngle + dims.ribbonPadAngle;
    sourceChromosomeEndAngle = chromosomes[sourceIndex].endAngle - dims.ribbonPadAngle;
    targetChromosomeStartAngle = chromosomes[targetIndex].startAngle + dims.ribbonPadAngle;
    targetChromosomeEndAngle = chromosomes[targetIndex].endAngle - dims.ribbonPadAngle;
    sourceRibbonStartAngle = paralog.geneStart / chromosomes[sourceIndex].value * (sourceChromosomeEndAngle - sourceChromosomeStartAngle) + sourceChromosomeStartAngle;
    sourceRibbonEndAngle = paralog.geneEnd / chromosomes[sourceIndex].value * (sourceChromosomeEndAngle - sourceChromosomeStartAngle) + sourceChromosomeStartAngle;
    targetRibbonStartAngle = paralog.paralogStart / chromosomes[targetIndex].value * (targetChromosomeEndAngle - targetChromosomeStartAngle) + targetChromosomeStartAngle;
    targetRibbonEndAngle = paralog.paralogEnd / chromosomes[targetIndex].value * (targetChromosomeEndAngle - targetChromosomeStartAngle) + targetChromosomeStartAngle;
    return {
        source: { index: sourceIndex, subIndex: targetIndex, startAngle: sourceRibbonStartAngle, endAngle: sourceRibbonEndAngle },
        target: { index: targetIndex, subIndex: sourceIndex, startAngle: targetRibbonStartAngle, endAngle: targetRibbonEndAngle }
    };
});

const setOpacity = (elements, opacity) => {
    console.log(elements);
    elements.style('opacity', opacity);
}

update();
