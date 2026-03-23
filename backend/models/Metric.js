/**
 * Metric Structure
 * Defines the structure of Metric objects
 */

class Metric {
  constructor(temperature, ph, turbidity, sensor, user) {
    this.temperature = temperature;
    this.ph = ph;
    this.turbidity = turbidity;
    this.sensor = sensor;
    this.user = user;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

module.exports = Metric;
