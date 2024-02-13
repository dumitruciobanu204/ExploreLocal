const express = require('express');
const app = express();
const PORT = 3000;
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const MemoryStore = require('memorystore')(session);

const DB = './database/explorelocal.db';
const db = new Database(DB);
console.log(`Connected to ${DB} database`);

app.use(express.json());
app.use(express.static('views'));
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
        checkPeriod: 86400000,
    }),
}));

const isAuthenticated = (req, res, next) => {
    const sessionToken = req.session && req.session.token;
    
    if (sessionToken || req.path === '/login') {
        return next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};

app.get('/localbusiness/:region', (req, res) => {
    try {
        const query = 'SELECT * FROM localbusiness WHERE region=?' ;
        const local_businesses = db.prepare(query);
        const results = local_businesses.all(req.params.region);
        res.json(results);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/localbusiness/:name/recommend', (req, res) => {
    try {
        const query = 'UPDATE localbusiness SET recommendations = recommendations + 1 WHERE name=?';
        const recommend = db.prepare(query);
        const info = recommend.run(req.params.name);

        if (info.changes === 1) {
            res.json({ success: true, message: 'Recommendation added' });
        } else {
            res.status(404).json({ success: false, message: 'Business not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/localbusiness/add', isAuthenticated, (req, res) => {
    try {

        const query = `
            INSERT INTO localbusiness (name, type, country, region, lon, lat, description, recommendations) 
            VALUES (?,?,?,?,?,?,?,?)
        `;
        const add_business = db.prepare(query);

        const info = add_business.run(
            req.body.name,
            req.body.type,
            req.body.country,
            req.body.region,
            req.body.longitude,
            req.body.latitude,
            req.body.description,
            req.body.recommendations
        );

        res.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const query = 'SELECT * FROM business_users WHERE username=? AND password=?';
        const user = db.prepare(query).get(username, password);

        if (user) {
            const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            
            req.session.token = sessionToken;
            res.json({ success: true, message: 'Login successful', token: sessionToken });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/logout', (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).json({ success: false, error: err.message });
            } else {
                res.json({ success: true, message: 'Logout successful' });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/localbusiness/:id/review', isAuthenticated, (req, res) => {
    try {
        const query = `
        INSERT INTO business_reviews (business_id, user_id, review)
        VALUES (
            (SELECT id FROM localbusiness WHERE name=?), 
            (SELECT id FROM business_users WHERE username=?), 
            ?)
        `;

        const add_review = db.prepare(query);

        const info = add_review.run(
            req.body.business_name,
            req.body.user_name,
            req.body.review
        );

        // console.log('Query Results:', info);

        if (info.changes === 1) {
            res.json({ success: true, message: 'Review added' });
        } else {
            res.status(404).json({ success: false, message: 'Business not found' });
        }

    } catch (error) {
        console.error('Error adding review:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
