const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = 3000;

const uri = 'mongodb+srv://zugate123:UzGa%40123@zugate.wuucj.mongodb.net/zugate?retryWrites=true&w=majority';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Function to generate statistics for a specific class name
async function generateStatistics(className) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db('zugate');

        const oraCollection = db.collection('ore');
        const statisticaCollection = db.collection('statistici');
        const claseCollection = db.collection('clase');

        // Find the class by name
        const classData = await claseCollection.findOne({ 'nume_clasa': className });
        if (!classData) return null; // Class not found

        const id_clasa = classData.id_clasa;

        const questionStats = [];

        // Find all lessons for this class
        const lessons = await oraCollection.find({ id_clasa }).toArray();
        for (const lesson of lessons) {
            const id_ora = lesson.id_ora;
            const correctAnswers = lesson.raspunsuri.map(r => r[0]); // Get the correct answer for each question

            // Initialize counters for each question
            const correctCounts = Array(correctAnswers.length).fill(0);

            // Get student responses for this lesson
            const studentResponses = await statisticaCollection.find({ id_ora }).toArray();
            for (const response of studentResponses) {
                const studentAnswers = response.raspunsuri_elev;
                studentAnswers.forEach((answer, index) => {
                    if (answer === correctAnswers[index]) {
                        correctCounts[index] += 1;
                    }
                });
            }

            // Add correct answer count for each question to results
            questionStats.push(...correctCounts);
        }

        return questionStats; // Each index represents the number of correct answers for that question
    } catch (error) {
        console.error("Error generating statistics:", error);
        return null;
    } finally {
        await client.close();
    }
}

// API endpoint to return statistics data for a specific class
app.get('/statistics', async (req, res) => {
    const { className } = req.query;  // Read class name from query string
    const statistics = await generateStatistics(className);
    if (statistics) {
        res.json(statistics);
    } else {
        res.status(404).json({ message: "Class not found or no data available" });
    }
});

// Serve the app on port 3000
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
