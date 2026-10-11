const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
    test: {
        environment: "node",
        globals: true,
        include: ["test/**/*.test.js"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "json-summary"],
            reportsDirectory: "./coverage",
            exclude: ["src/config/**", "test/**"]
        }
    }
});
