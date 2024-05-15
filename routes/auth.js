const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SERCET = "Owaish@2002";

// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required
router.post('/createuser',
    body('name', 'Enter a name').isLength({ min: 1 }),
    body('email', 'Enter a valid email').isEmail().custom(value => {
        return User.findOne({ email: value }).then(user => {
            if (user) {
                return Promise.reject('E-mail already in use');
            }
        });
    }),
    body('password', 'Enter a valid password of min 6 characters').isLength({ min: 6 }),
    async (req, res) => {
        let success = false;
        // const user = await User(req.body);
        // await user.save()

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }

        const salt = await bcrypt.genSaltSync(10);
        const hash = await bcrypt.hashSync(req.body.password, salt);

        try {
            let user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: hash
            });
            success = true
            res.json({ success, user });
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ success, message: "Internal Server Error" });
        };
    })

// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
// router.post('/login',
//     [body('email', 'Enter a valid email').isEmail(),
//     body('password', 'Please enter a password').exists()],
//     async (req, res) => {
//         let success = false;
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({success, errors: errors.array() });
//         }

//         const { email, password } = req.body;

//         try {
//             let user = await User.findOne({ email });
//             if (!user) {
//                 res.status(400).json({success, message: "Please enter the correct credentials"});
//             }

//             // const hash = await bcrypt.hashSync(password, user.salt);

//             // if(user.password === hash){
//             //     res.status(200).json({success: "Login successfully"});
//             // }

//             const passwordCompare = await bcrypt.compare(password, user.password);

//             if (!passwordCompare) {
//                 res.json({success, message : "Please enter the correct credentials"});
//             }

//             var token = jwt.sign({ user: { id: user._id } }, JWT_SERCET);
//             success = true
//             res.status(200).json({success, token });

//         } catch (error) {
//             console.log(error.message);
//             res.status(500).json({success, message: "Internal Server Error"});
//         }
//     });

router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            success = false
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SERCET);
        success = true;
        res.json({ success, authtoken })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }


});

// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res) => {
    let success = false;
    let userId = req.user.id;
    console.log(req.user);
    try {
        const user = await User.findById(userId).select("-password");
        console.log(user);
        success = true;
        res.status(200).json({ success, user });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success, message: "Internal Server Error" });
    }
})



module.exports = router;