const mongoose = require("mongoose");

let connectionPromise;

const connectDB = () => {
    if (mongoose.connection.readyState === 1) {
        return Promise.resolve(mongoose.connection);
    }

    if (!process.env.MONGO_URI) {
        return Promise.reject(new Error("MONGO_URI is not configured"));
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI)
            .then(() => {
                console.log("MongoDB connected successfully");
                return mongoose.connection;
            })
            .catch((error) => {
                connectionPromise = null;
                throw error;
            });
    }

    return connectionPromise;
};

module.exports = connectDB;
