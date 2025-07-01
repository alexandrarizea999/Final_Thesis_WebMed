// Importăm biblioteca jsonwebtoken pentru verificarea token-urilor JWT
const jwt = require('jsonwebtoken');
// Importăm cheia secretă pentru verificarea token-urilor
const authConfig = require('../config/auth.config');

// Middleware pentru verificarea autentificării
// Verifică dacă request-ul conține un token valid și decodează informațiile utilizatorului
const auth = (req, res, next) => {
  try {
    let token;
    // Verificăm dacă token-ul este trimis în header-ul 'Authorization'
    if (req.header('Authorization')) {
      // Extragem token-ul din formatul "Bearer <token>"
      token = req.header('Authorization').replace('Bearer ', '');
    } 
    // Alternativ, verificăm header-ul 'x-auth-token'
    else if (req.header('x-auth-token')) {
      token = req.header('x-auth-token');
    } 
    // Dacă nu găsim niciun token, aruncăm o eroare
    else {
      throw new Error('No authentication token provided');
    }   

    // Verificăm și decodăm token-ul folosind cheia secretă
    const decoded = jwt.verify(token, authConfig.JWT_SECRET);
    
    // Atașăm informațiile utilizatorului decodat la obiectul request
    // pentru a fi disponibile în rutele următoare
    req.user = decoded;
    
    // Trecem la următorul middleware sau la ruta finală
    next();
  } catch (error) {
    // În caz de eroare (token invalid, expirat, etc.), returnăm eroare 401
    console.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Authentication required' });
  }
};

// Exportăm middleware-ul pentru a putea fi folosit în alte părți ale aplicației
module.exports = auth; 