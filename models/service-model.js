const pool = require('../database/');

const ServiceModel = {};

/**
 * Add a new service record
 * @param {Object} data
 */
ServiceModel.addService = async (data) => {
  const sql = `
    INSERT INTO service_records
    (inv_id, service_date, mileage, description, cost, service_center, next_service_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING service_id;
  `;
  const params = [
    data.inv_id,
    data.service_date,
    data.mileage || null,
    data.description,
    data.cost || 0.00,
    data.service_center || null,
    data.next_service_date || null,
  ];
  const result = await pool.query(sql, params);
  return result.rows[0].service_id; // Return ID correctly
};

ServiceModel.getByVehicle = async (inv_id) => {
  const sql = `
    SELECT service_id, inv_id, service_date, mileage, description, cost, service_center, next_service_date, created_at
    FROM service_records
    WHERE inv_id = $1
    ORDER BY service_date DESC, created_at DESC;
  `;
  const result = await pool.query(sql, [inv_id]);
  return result.rows;
};

ServiceModel.getById = async (service_id) => {
  const sql = `SELECT * FROM service_records WHERE service_id = $1 LIMIT 1;`;
  const result = await pool.query(sql, [service_id]);
  return result.rows[0];
};

ServiceModel.deleteById = async (service_id) => {
  const sql = `DELETE FROM service_records WHERE service_id = $1;`;
  const result = await pool.query(sql, [service_id]);
  return result.rowCount;
};

module.exports = ServiceModel;
