const express = require('express');
const app = express();

const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Body parser use
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//MODEL
//Connect to DB
mongoose.connect('mongodb://localhost:27017/MentalHealth');
const db = mongoose.connection;
db.on('error', (err) => {
    console.error.bind(console, err);
});
db.once('open', () => {
    console.log('Database Connected');
});

const Schema = new mongoose.Schema({
    Timestamp: String,
    'Choose your gender': String,
    'Age': Number,
    'What is your course?': String,
    'Your current year of Study': String,
    'What is your CGPA?': String,
    'Marital status': String,
    'Do you have Depression?': String,
    'Do you have Anxiety?': String,
    'Do you have Panic attack?': String,
    'Did you seek any specialist for a treatment?': String
},{
    versionKey: false
});

const Model = mongoose.model('MentalHealth', Schema, 'MentalHealth');

async function saveItem(Timestamp, gender, Age, course, year, cgpa, marital, depression, anxiety, panic, treatment){
    const item = new Model({Timestamp: Timestamp,'Choose your gender': gender,'Age': Age, 'What is your course?': course,
        'Your current year of Study': year, 'What is your CGPA?': cgpa, 'Marital status': marital, 'Do you have Depression?': depression, 'Do you have Anxiety?': anxiety,
        'Do you have Panic attack?': panic, 'Did you seek any specialist for a treatment?': treatment});
    await item.save();
}

// FIND functions
async function findAll() {
    const items = await Model.find({}).exec();
    return items;
}

async function findById(id){
    const item = await Model.findById(id).exec();
    return item;
}

async function find(set){
    console.log(set);
    const items = await Model.find(set).exec();
    return items;
}



// --- FIND functions

//UPDATE
async function updateItem(id, Timestamp, gender, Age, course, year, cgpa, marital, depression, anxiety, panic, treatment){
    const item = {Timestamp: Timestamp,'Choose your gender': gender,'Age': Age, 'What is your course?': course,
        'Your current year of Study': year, 'What is your CGPA?': cgpa, 'Marital status': marital, 'Do you have Depression?': depression, 'Do you have Anxiety?': anxiety,
        'Do you have Panic attack?': panic, 'Did you seek any specialist for a treatment?': treatment};
    await Model.findByIdAndUpdate(id, {$set: item}).exec();
}

// DELETE
async function deleteById(id){
    await Model.findByIdAndDelete(id).exec();
}

//CONTROLLER-ROUTES
// Define routes
app.get('/', async (req, res) => {
    const items = await findAll();
    const data ={
        items: items,
    };
    res.render('homepage', {data});
});

app.post('/', async (req, res) => {
    const items = await findAll();
    const data ={
        items: items,
    };
    res.render('homepage', {data});
});

app.post('/find', async (req, res) => {
    //const itemFormatted = {[req.body.column] : req.body.searchbar};
    let itemFormatted;
    const isNumeric = (string) => /^[+-]?\d+$/.test(string);
    if(req.body.searchbar===""){
        itemFormatted = {};
    } else if (!isNumeric(req.body.searchbar)) {
        itemFormatted = { [req.body.column]: { $regex: new RegExp(`^${req.body.searchbar}$`, 'iy') } };
        //itemFormatted = { [req.body.column]: req.body.searchbar };
    } else {
        itemFormatted = { [req.body.column]: parseInt(req.body.searchbar)};
    }
    try {
        const items = await find(itemFormatted);
        const data = {
            items: items,
        };
        res.render('homepage', { data });
    } catch (err) {
        console.error('Error finding items:', err);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/form', (req, res) => {
    res.render('form', {});
});

app.post('/form', async(req, res) => {
    const body = req.body;
    await saveItem(Date(), body.gender, body.age, body.course, body.year, body.cpga, body.marital, body.depression, body.anxiety, body.panic, body.treatment);
    res.redirect('/');
});

app.get('/item/:id',  async (req, res) => {
    const id = req.params.id;
    const item = await findById(id);
    const itemFormatted = {
        id: item._id,
        gender: item['Choose your gender'],
        age: item['Age'],
        course: item['What is your course?'],
        year: item['Your current year of Study'],
        cpga: item['What is your CGPA?'],
        marital: item['Marital status'],
        depression: item['Do you have Depression?'],
        anxiety: item['Do you have Anxiety?'],
        panic: item['Do you have Panic attack?'],
        treatment: item['Did you seek any specialist for a treatment?']
    };
    const data ={
        item: itemFormatted
    };
    res.render('item', { data });
});

//update
app.get('/update/:id', async (req, res) => {
    const id = req.params.id;
    const item = await findById(id);
    const itemFormatted = {
        id: item._id,
        gender: item['Choose your gender'],
        age: item['Age'],
        course: item['What is your course?'],
        year: item['Your current year of Study'],
        cpga: item['What is your CGPA?'],
        marital: item['Marital status'],
        depression: item['Do you have Depression?'],
        anxiety: item['Do you have Anxiety?'],
        panic: item['Do you have Panic attack?'],
        treatment: item['Did you seek any specialist for a treatment?']
    };
    const data ={
        item: itemFormatted
    };
    res.render('update', { data });
});

app.post('/update/exec/:id', async (req, res) => {
    let id = req.params.id;
    const body = req.body;
    await updateItem(id ,Date(), body.gender, body.age, body.course, body.year, body.cpga, body.marital, body.depression, body.anxiety, body.panic, body.treatment);
    res.redirect('/');
});

// delete by id
app.get('/delete/:id', async (req, res) => {
    const id = req.params.id;
    await deleteById(id);
    res.redirect('/');
});

// Endpoint per ottenere i dati
app.get('/ages', async (req, res) => {
    try {
        const users = await Model.find();
        const ages = users.map(user => user.age);
        res.send(ages);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/statistiche', async (req, res) => {
    const items = await findAll();
    const data = {
        items: items,
    };
    res.render('statistiche', {data});
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
