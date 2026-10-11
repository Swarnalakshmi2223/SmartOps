const isAsciiAlphaNumeric = (character) => (
    (character >= "a" && character <= "z") ||
    (character >= "A" && character <= "Z") ||
    (character >= "0" && character <= "9")
);

const isValidEmail = (email) => {
    if (typeof email !== "string" || email.length < 3 || email.length > 254) {
        return false;
    }

    const atIndex = email.indexOf("@");
    const lastAtIndex = email.lastIndexOf("@");

    if (
        atIndex <= 0 ||
        atIndex !== lastAtIndex ||
        atIndex === email.length - 1 ||
        email.includes(" ")
    ) {
        return false;
    }

    const localPart = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);

    if (
        localPart.length > 64 ||
        localPart.startsWith(".") ||
        localPart.endsWith(".") ||
        localPart.includes("..")
    ) {
        return false;
    }

    const localAllowed = new Set([".", "+", "-", "_"]);
    if (![...localPart].every((character) => (
        isAsciiAlphaNumeric(character) || localAllowed.has(character)
    ))) {
        return false;
    }

    const labels = domain.split(".");
    if (labels.length < 2 || labels.some((label) => (
        !label ||
        label.startsWith("-") ||
        label.endsWith("-") ||
        ![...label].every((character) => (
            isAsciiAlphaNumeric(character) || character === "-"
        ))
    ))) {
        return false;
    }

    const topLevelDomain = labels[labels.length - 1];
    return topLevelDomain.length >= 2;
};

module.exports = {
    isValidEmail
};
