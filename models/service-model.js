// models/service-model.js
const pool = require('../database/');

const ServiceModel = {};

/**
 * Add a new service record
 * @param {Object} data
 */
ServiceModel.addService = async (data) => {
  const sql = `INSERT INTO service_records
    (inv_id, service_date, mileage, description, cost, service_center, next_service_date)
    VALUES (?, ?, ?, ?, ?, ?, ?);`;
  const params = [
    data.inv_id,
    data.service_date,
    data.mileage || null,
    data.description,
    data.cost || 0.00,
    data.service_center || null,
    data.next_service_date || null,
  ];
  const [result] = await pool.query(sql, params);
  return result.insertId;
};

ServiceModel.getByVehicle = async (inv_id) => {
  const sql = `SELECT service_id, inv_id, service_date, mileage, description, cost, service_center, next_service_date, created_at
               FROM service_records
               WHERE inv_id = ?
               ORDER BY service_date DESC, created_at DESC;`;
  const [rows] = await pool.query(sql, [inv_id]);
  return rows;
};

ServiceModel.getById = async (service_id) => {
  const sql = `SELECT * FROM service_records WHERE service_id = ? LIMIT 1;`;
  const [rows] = await pool.query(sql, [service_id]);
  return rows[0];
};

ServiceModel.deleteById = async (service_id) => {
  const sql = `DELETE FROM service_records WHERE service_id = ?;`;
  const [result] = await pool.query(sql, [service_id]);
  return result.affectedRows;
};

module.exports = ServiceModel;
