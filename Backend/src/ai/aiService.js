const {
    categoryRules,
    priorityRules,
    departmentRules
} = require("./aiRules");


const findBestMatch = (text, rules) => {
    let bestMatch = null;
    let highestScore = 0;

    for (const [name, keywords] of Object.entries(rules)) {
        let score = 0;

        for (const keyword of keywords) {
            if (text.includes(keyword.toLowerCase())) {
                score++;
            }
        }

        if (score > highestScore) {
            highestScore = score;
            bestMatch = name;
        }
    }

    return {
        result: bestMatch,
        score: highestScore
    };
};


const analyzeRequest = ({ title, description }) => {
    const text = `${title || ""} ${description || ""}`.toLowerCase();

    const categoryMatch = findBestMatch(text, categoryRules);
    const departmentMatch = findBestMatch(text, departmentRules);
    const priorityMatch = findBestMatch(text, priorityRules);

    return {
        category: categoryMatch.result || "Other",
        department: departmentMatch.result || "General",
        priority: priorityMatch.result || "Medium",

        categoryScore: categoryMatch.score,
        departmentScore: departmentMatch.score,
        priorityScore: priorityMatch.score
    };
};


const findDuplicateRequests = async (newRequest, existingRequests) => {
    const newText = `${newRequest.title || ""} ${newRequest.description || ""}`
        .toLowerCase();

    const duplicates = [];

    for (const request of existingRequests) {
        const existingText = `${request.title || ""} ${request.description || ""}`
            .toLowerCase();

        const newWords = new Set(
            newText
                .split(/\s+/)
                .filter(word => word.length > 3)
        );

        const existingWords = new Set(
            existingText
                .split(/\s+/)
                .filter(word => word.length > 3)
        );

        let matchingWords = 0;

        for (const word of newWords) {
            if (existingWords.has(word)) {
                matchingWords++;
            }
        }

        const totalWords = Math.max(
            newWords.size,
            existingWords.size
        );

        const similarity = totalWords > 0
            ? matchingWords / totalWords
            : 0;

        if (similarity >= 0.4) {
            duplicates.push({
                requestId: request._id,
                title: request.title,
                description: request.description,
                similarity: Number((similarity * 100).toFixed(2))
            });
        }
    }

    return duplicates.sort(
        (a, b) => b.similarity - a.similarity
    );
};



module.exports = {
    analyzeRequest,
    findDuplicateRequests
};