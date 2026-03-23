/**
 * Alert Structure
 * Defines the structure of Alert objects
 */

class Alert {
  constructor(message, type = "info", user) {
    this.message = message;
    this.type = type; // info, warning, critical
    this.user = user;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

// Optional: log when structure is loaded
console.log("Alert structure created");

module.exports = Alert;
