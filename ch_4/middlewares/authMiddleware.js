// middleware untuk memeriksa apakah pengguna sudah terautentikasi sebelum mengakses route
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send('Unauthorized access'); 
}

export default isAuthenticated;
