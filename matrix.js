const matrix = [
    [11975, 5871, 8916, 2868],
    [1951, 10048, 2060, 6171],
    [8010, 16145, 8090, 8045],
    [1013, 990, 940, 6907]
];

const customChords = [
    {
        source: { index: 10, subIndex: 0, startAngle: 0, endAngle: 0.01},
        target: { index: 12, subIndex: 0, startAngle: 0, endAngle: 0.01}
    },
    {
        source: { index: 0, subIndex: 1, startAngle: 1.2, endAngle: 1.3},
        target: { index: 1, subIndex: 0, startAngle: 2.9, endAngle: 3.0}
    }
];

const customChordsNoAngles = [
    {
        source: { index: 0, subIndex: 0},
        target: { index: 0, subIndex: 0}
    },
    {
        source: { index: 0, subIndex: 1, value: 2000 },
        target: { index: 1, subIndex: 0}
    }
];

const PrimerTestGenome1 = [
    { "name": "chrI", "number": 230218 },
    { "name": "chrII", "number": 813184 },
    { "name": "chrIII", "number": 316620 },
    { "name": "chrIV", "number": 1531933 },
    { "name": "chrV", "number": 576874 },
    { "name": "chrVI", "number": 270161 },
    { "name": "chrVII", "number": 1090940 },
    { "name": "chrVIII", "number": 562643 },
    { "name": "chrIX", "number": 439888 },
    { "name": "chrX", "number": 745751 },
    { "name": "chrXI", "number": 666816 },
    { "name": "chrXII", "number": 1078177 },
    { "name": "chrXIII", "number": 924431 },
    { "name": "chrXIV", "number": 784333 },
    { "name": "chrXV", "number": 1091291 },
    { "name": "chrXVI", "number": 948066 },
    { "name": "chrmt", "number": 85779 }
];

const ParalogsGenome1 = [
    {
        "geneId": "YAL068C", "chromosome": "chrI", "geneStart": 1807, "geneEnd": 2169, "paralogId": "YBR301W", "paralogChr": "chrII", "paralogStart": 809057, "paralogEnd": 809419
    },
    {
        "geneId": "YAL067W - A", "chromosome": "chrI", "geneStart": 2480, "geneEnd": 2707, "paralogId": "YIR040C", "paralogChr": "chrIX", "paralogStart": 433389, "paralogEnd": 433721
    },
    {
        "geneId": "YAL067W - A", "chromosome": "chrI", "geneStart": 2480, "geneEnd": 2707, "paralogId": "YJL222W - A", "paralogChr": "chrX", "paralogStart": 9452, "paralogEnd": 9679
    },
]

const chromosomeToIndex = {
    "chrI": 0,
    "chrII": 1,
    "chrIII": 2,
    "chrIV": 3,
    "chrV": 4,
    "chrVI": 5,
    "chrVII": 6,
    "chrVIII": 7,
    "chrIX": 8,
    "chrX": 9,
    "chrXI": 10,
    "chrXII": 11,
    "chrXIII": 12,
    "chrXIV": 13,
    "chrXV": 14,
    "chrXVI": 15,
    "chrmt": 16
}