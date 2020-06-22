module.exports = {
    convertB64ToBlob: (data) => {
        return new Buffer.from(data, "base64");
    },
    convertBlobToB64: (data) => {
        let buffer = new Buffer(data);
        return buffer.toString('base64');
    },

}