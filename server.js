const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/activities', activityRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});