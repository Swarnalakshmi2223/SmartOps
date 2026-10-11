const crypto = require("node:crypto");

const generateRefNo = () => {
    const year = new Date().getFullYear();
    const random = crypto.randomInt(100000, 1000000);
    return `SR-${year}-${random}`;
};

module.exports = generateRefNo;
