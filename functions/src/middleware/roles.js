
const checkUserRole = (decodedToken, allowedRoles) => {
  if (!decodedToken || !decodedToken.role) {
    return false;
  }
  return allowedRoles.includes(decodedToken.role);
};

module.exports = { checkUserRole };
