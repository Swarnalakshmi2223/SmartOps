const categoryRules = {
    "IT & Technical Support": [
        "computer",
        "laptop",
        "software",
        "application",
        "system",
        "login",
        "password",
        "email",
        "wifi",
        "wi-fi",
        "internet",
        "network",
        "printer",
        "technical",
        "server"
    ],

    "Maintenance": [
        "repair",
        "broken",
        "damage",
        "leak",
        "electricity",
        "light",
        "fan",
        "ac",
        "air conditioner",
        "plumbing",
        "water",
        "door",
        "furniture"
    ],

    "Housekeeping": [
        "cleaning",
        "clean",
        "dirty",
        "garbage",
        "waste",
        "dust",
        "washroom",
        "toilet",
        "restroom"
    ],

    "Security": [
        "security",
        "theft",
        "stolen",
        "missing",
        "unauthorized",
        "access",
        "suspicious",
        "camera",
        "cctv",
        "emergency"
    ]
};


const priorityRules = {
    Critical: [
        "emergency",
        "fire",
        "danger",
        "critical",
        "security breach",
        "server down",
        "completely down"
    ],

    High: [
        "cannot access",
        "unable to access",
        "not working",
        "blocked",
        "urgent",
        "major",
        "failed",
        "failure"
    ],

    Medium: [
        "issue",
        "problem",
        "error",
        "slow",
        "unstable"
    ],

    Low: [
        "request",
        "minor",
        "small",
        "suggestion",
        "general"
    ]
};


const departmentRules = {
    "IT & Technical Support": [
        "computer",
        "laptop",
        "software",
        "application",
        "system",
        "login",
        "password",
        "email",
        "wifi",
        "wi-fi",
        "internet",
        "network",
        "printer",
        "technical",
        "server"
    ],

    "Maintenance": [
        "repair",
        "broken",
        "damage",
        "leak",
        "electricity",
        "light",
        "fan",
        "ac",
        "air conditioner",
        "plumbing",
        "water",
        "door",
        "furniture"
    ],

    "Housekeeping": [
        "cleaning",
        "clean",
        "dirty",
        "garbage",
        "waste",
        "dust",
        "washroom",
        "toilet",
        "restroom"
    ],

    "Security": [
        "security",
        "theft",
        "stolen",
        "missing",
        "unauthorized",
        "access",
        "suspicious",
        "camera",
        "cctv",
        "emergency"
    ]
};


module.exports = {
    categoryRules,
    priorityRules,
    departmentRules
};