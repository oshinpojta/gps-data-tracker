const mysql = require('mysql2');

// Create a pool of database connections
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'sqlserver',
  database: 'minematics'
});

async function sendQuery(query){
    try {
        // Use the pool to perform queries
        return new Promise((resolve, reject) => { 
            pool.query(query, (err, results, fields) => {
                if (err) {
                    console.error('Error executing query:', err);
                    reject(err);
                    return;
                }
                resolve(results);
            }) ;
        } );
    } catch (error) {
        return error;
    }
}

module.exports = {
    sendQuery
}
