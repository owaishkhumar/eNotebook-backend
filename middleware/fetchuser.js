const jwt = require('jsonwebtoken');
const JWT_SERCET = "Owaish@2002";

const fetchuser = (req, res, next) => {
    // Get the user from the jwt token and add id to req object
    let token = req.header('auth-token');
    if (!token) {
        res.status(401).json({ error: "Please authenicate using valid token" });
    }
    try {
        const data = jwt.verify(token, JWT_SERCET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).json({ error: "Please authenicate using valid token" });
    }
}

module.exports = fetchuser;