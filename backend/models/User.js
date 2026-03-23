/**
 * User Structure
 * Defines the structure of User objects
 */

class User {
  constructor(name, email, password, role = "user") {
    this.name = name;          // User name
    this.email = email.toLowerCase().trim(); // Store email in lowercase
    this.password = password;
    this.role = role;          // user or admin
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

// Optional: Log when structure is loaded
console.log("User structure created");

module.exports = User;
