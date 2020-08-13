const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const userModel = require('../models/userModel');

router.post('/register', async (req, res) => {
    try {
        let { email, password, passwordCheck, displayName } = req.body;

        // validate 
        if (!email || !password || !passwordCheck)
            return res.status(400).json({ msg: 'Not all fields have bean entered ' })

        if (password.length < 5)
            return res.status(400).json({ msg: 'Password need to be atleast five character length.' })

        if (password !== passwordCheck)
            return res.status(400).json({ msg: 'Enter the same password twise for verification.' })

        const existingUser = await User.findOne({ email: email });

        if (existingUser)
            return res.status(400).json({ msg: "An account with this email already exists " })

        if (!displayName) displayName = email;
        // encodded password implemented 
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        // console.log(passwordHash);

        // assign the vales to the new user 
        const newUser = new User({
            email,
            password: passwordHash,
            displayName
        });

        // save to database table 
        const saveUser = await newUser.save();
        res.json(saveUser);

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;


        // validate 
        if (!email || !password)
            return res.status(400).json({ msg: 'Not all field have been entered.' })
        const user = await User.findOne({ email: email });
        if (!user)
            return res
                .status(400)
                .json({ msg: 'No account with this user regstred.' })
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res
                .status(500)
                .json({ msg: 'Invalid Login Credentials.' })
        // jwt token creations 
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        //console.log(token);
        res.json({
            token,
            user: {
                id: user._id,
                displayName: user.displayName,
                email: user.email
            }
        })
    } catch (error) {

    }
})

module.exports = router; 