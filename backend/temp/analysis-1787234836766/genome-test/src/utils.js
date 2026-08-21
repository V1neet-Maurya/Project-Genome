function isValidEmail(email) {
  return email && email.includes("@");
}

function findUser(users, id) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id == id) {
      return users[i];
    }
  }
  return null;
}

module.exports = { isValidEmail, findUser };
