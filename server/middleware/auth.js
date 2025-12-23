import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  // 1. Get the token from the header (Authorization: Bearer <token>)
  const token = req.header('Authorization');

  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // 3. Verify the token
    // We split "Bearer <token>" to get just the code part
    const actualToken = token.split(" ")[1]; 
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

    // 4. Add the user to the request object so the route can use it
    req.user = decoded; 
    next(); // Allow them to pass
  } catch (e) {
    res.status(400).json({ message: "Token is not valid" });
  }
};