import express from "express";
import mysql from "mysql2"
import cors from "cors";
import bodyParser from "body-parser";


const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createPool({
    host: "localhost",
    database: "al-space-track",
    user: "root",
    password: "root",
})

// app.get('/', (req, res) => {
//     res.send("hello world");
// })

app.get('/api/data', (req, res) => {
    const sql = 'SELECT * FROM seats';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
})


app.post('/api/addFormData', (req, res) => {
    const formData = req.body;
    let sql;
    if (formData.printer && formData.cab) {
        sql = `INSERT INTO seats (seat_type, seat_price, wifi, tea, coffee, printer_price, cab_price) VALUES
                ('${formData.seatType}',${formData.seatPrice},${formData.wifi}, ${formData.tea},, ${formData.service1}
                 ,${formData.printerPrice},${formData.cabPrice})`;
    } else if (formData.printer) {
        sql = `INSERT INTO seats (seat_type, seat_price, wifi, tea, coffee, printer_price) VALUES
                ('${formData.seatType}',${formData.seatPrice},${formData.wifi}, ${formData.tea},, ${formData.service1},
                ${formData.printerPrice})`;
    } else if (formData.cab) {
        sql = `INSERT INTO seats (seat_type, seat_price, wifi, tea, coffee,cab_price) VALUES
                ('${formData.seatType}',${formData.seatPrice},${formData.wifi}, ${formData.tea},, ${formData.service1}
                 ,${formData.cabPrice})`;
    }

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).json({ error: 'Error inserting data' });
            return;
        }
        console.log('Data inserted successfully:', result);
        res.status(200).json({ message: 'Form data received and processed successfully' });
    });

});


app.post('/api/saveFormData', (req, res) => {
    const formData = req.body;

    // Assuming that formData contains seatType, wifi, tea, coffee, and optionally printerPrice, cabPrice

    let updates = [];

    // Add common fields
    //updates.push(`seatPrice=${formData.seatPrice}`)
    updates.push(`seat_price = ${formData.seatPrice}`);
    updates.push(`wifi = ${formData.wifi}`);
    updates.push(`tea = ${formData.tea}`);
    updates.push(`coffee = ${formData.service1}`);

    // Conditionally add printer_price if printer is true
    if (formData.printer) {
        updates.push(`printer_price = ${formData.printerPrice}`);
    }

    // Conditionally add cab_price if cab is true
    if (formData.cab) {
        updates.push(`cab_price = ${formData.cabPrice}`);
    }

    let sql = `UPDATE seats SET ${updates.join(', ')} WHERE seat_type = '${formData.seatType}'`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
            res.status(500).json({ error: 'Error updating data' });
            return;
        }
        console.log('Data updated successfully:', result);
        res.status(200).json({ message: 'Form data received and updated successfully' });
    });
});

app.listen(8000, () => {
    console.log(`Server is running on port : 8000!!`)
})