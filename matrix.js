const tsvToObject = (tsv) => {
    const lines = tsv.split("\n");
    const headers = lines.shift().split("\t");
    if (!lines[lines.length]) {
        lines.pop();
    }
    return lines.map((line) => {
        const object = {};
        headers.map((header, index) => {
            objectData = line.split("\t")[index];
            object[header] = parseInt(objectData) ? parseInt(objectData) : objectData;
        });
        return object;
    });
}
