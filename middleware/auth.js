const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRATE || 'helloworld'

const auth = (req, res, next) => {

    const token = req.cookies.jwt;
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const verifyUser = jwt.verify(token, JWT_SECRET);
        console.log(verifyUser);
        next()
    } catch (error) {
        return res.status(401).send("invalid token");
    }
}
module.exports = auth;