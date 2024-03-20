import dotenv from 'dotenv'
dotenv.config()
import jwt from 'jsonwebtoken'

const generateAccessToken = (login, password) => {
    // поиск пользователя по логину и паролю в БД
    const user = { login: "admin"} // то что достали из БД

    const accessToken = jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET)
    return accessToken
}

function generateRefreshToken(username) {
    console.log(";generating", username);
    const payload = { name: username };
    const options = { expiresIn: "1y" };
    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET,
      options
    );
    console.log("this is ref", refreshToken);
    return refreshToken;
  }
  
  function verifyRefreshToken(refreshToken) {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
      if (err) {
        console.log("Error while verifying");
      }
      console.log("this is payload : ", payload);
      const usr = payload.name;
      console.log(usr);
      return usr;
    });
    return;
  }

  function authenticateToken(req, res, next) {
    //Это middleware
    //Берем токен с заголовка
    const authHeader = req.headers["authorization"];
    console.log("authHeader", authHeader);
    console.log("Headre: ", req.headers);
    const token = authHeader && authHeader.split(" ")[1];
    console.log("Token: ", token);
    if (token == null) return res.sendStatus(401); //access denied
  
    //Короче просто работает. Magic !!!
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      console.log("this is err: ", err);
      if (err) {
        return res.sendStatus(403); //Your token is no longer valid
      }
  
      req.user = user; //кен оказался верным, поэтому next() пропускает на роут, а в req.user инфа о юзере в нормальном виде
      console.log("this is user from verify", user);
      next(); //Если норм, то пропускаем
    });
  }
  
  export {generateAccessToken, generateRefreshToken, verifyRefreshToken, authenticateToken}