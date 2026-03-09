const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const path = require('path');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const UserSchema = new mongoose.Schema({
email:{
    type: String,
    unique: true,
    required: true
},
password: {
    type: String,
    required: true
}
});
const User = mongoose.model('User',UserSchema);

mongoose.connect('mongodb://127.0.0.1:27017/nani')
.then(() => {
console.log('Connected to MongoDB');
}).catch((err) => {
console.error('Error connecting to MongoDB', err);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.post("/signup", async (req, res) => {
try {
    const email = req.body.email;
    const password = req.body.password;
    const existingUser = await User.findOne({ email });
    if(existingUser){
    return res.send("Email already registered");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        email: email,
        password:hashedPassword
    });
    await newUser.save();
    console.log("User Created:", email);
    res.redirect('/signin.html');
} catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
}
});
app.post("/signin", async (req, res) => {
try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).send("Invalid credentials");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        res.sendFile(path.join(__dirname,"public","welcome.html"));
    } else {
        res.status(401).send("Invalid credentials");
    }
} catch (error) {
    console.error(error);
    res.status(500).send("Error signing in");
}
});
app.listen(3000, () => {
console.log('Server is running on port 3000');
});