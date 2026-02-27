require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const pool = require('../config/db');

const validIdentifier = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

async function loadJsonToCategory(filePath) {
    const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    const contents = await fs.readFile(resolved, 'utf8');
    let data = JSON.parse(contents);

    if (data.length === 0) return { inserted: 0 };

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        let inserted = 0;
        const max_id = await client.query('SELECT max(id) FROM platform.category');
        let current_max = max_id.rows[0].max || 0;
        console.log(current_max);
        for (const item of data) {
            let category_name = item['name']
            if (['Mercado', 'Vinos y licores', 'Cuidado personal'].includes(category_name)){
                let category_href = item['href']?.substring(0, 200) || ''
                //Insert into database
                category_id = current_max + 1;
                sql = `INSERT INTO platform.category (id, name, url, parent) VALUES ($1, $2, $3, $4)`;
                await client.query(sql, [category_id, category_name, category_href, null]);
                inserted++;
                current_max += 1;
                for (const subcategory of item['subLinks']) {
                    //Insert into database
                    subcategory_id = current_max + 1;
                    sql = `INSERT INTO platform.category (id, name, url, parent) VALUES ($1, $2, $3, $4)`;
                    await client.query(sql, [subcategory_id, subcategory['name'], subcategory['href']?.substring(0, 200) || '', category_id]);
                    inserted++;
                    current_max += 1;
                    for (const subsubcategory of subcategory['subLinks']) {
                        //Insert into database
                        subsubcategory_id = current_max + 1;
                        console.log(category_name, subcategory['name'], subsubcategory['name']);
                        sql = `INSERT INTO platform.category (id, name, url, parent) VALUES ($1, $2, $3, $4)`;
                        await client.query(sql, [subsubcategory_id, subsubcategory['name'], subsubcategory['href']?.substring(0, 200) || '', subcategory_id]);
                        inserted++;
                        current_max += 1;
                    }
                }
            }
        } 
        await client.query('COMMIT');
         return { inserted };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

if (require.main === module) {
    const file = process.argv[2];
    if (!file) {
        console.error('Usage: node src/services/utilities.js <path-to-json>');
        // Usage example: .\src\services\utilities.js .\src\config\categories_data.json
        process.exit(1);
    }

    loadJsonToCategory(file)
        .then(result => {
            console.log('Done:', result);
            process.exit(0);
        })
        .catch(err => {
            console.error('Error loading JSON to platform.category:', err);
            process.exit(2);
        });
}

module.exports = { loadJsonToCategory };
