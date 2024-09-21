import express from "express";
import mysql from "mysql2"
import cors from "cors";
import bodyParser from "body-parser";
import Stripe from "stripe";


const app = express();
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';


app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
const stripe = Stripe('sk_test_51MJVB7SIgdXqjWkRIiPgKZibSditqkCzTCQFRkF5X9YFy1sb9ptzu2PzdgN697k4SgO3Bqgb0dGNoBvqYDUaRoTY00H8MoTYSf')


const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Space Management API",
            version: "1.0.0",
            description: "API for managing cabins and services in a space management system",
        },
        servers: [
            {
                url: "http://localhost:8000/",
            },
        ],
    },
    apis: ['./src/server.js'], // Make sure the path is correct
};

const swaggerSpecs = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

const db = mysql.createPool({
    host: "localhost",
    database: "space",
    user: "root",
    password: "root",
});
/**
 * @swagger
 * components:
 *   schemas:
 *     Cabin:
 *       type: object
 *       required:
 *         - name
 *         - noOfSeat
 *         - price
 *         - code
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the cabin
 *         noOfSeat:
 *           type: integer
 *           description: The number of seats in the cabin
 *         price:
 *           type: number
 *           description: The price of the cabin
 *         code:
 *           type: string
 *           description: The code of the cabin
 *       example:
 *         name: Cabin A
 *         noOfSeat: 10
 *         price: 1000
 *         code: CAB001
 *     Service:
 *       type: object
 *       required:
 *         - serviceName
 *         - serviceType
 *         - desc
 *         - unit
 *         - price
 *         - code
 *       properties:
 *         serviceName:
 *           type: string
 *           description: The name of the service
 *         serviceType:
 *           type: string
 *           description: The type of the service
 *         desc:
 *           type: string
 *           description: The description of the service
 *         unit:
 *           type: string
 *           description: The unit of the service
 *         price:
 *           type: number
 *           description: The price of the service
 *         code:
 *           type: string
 *           description: The code of the service
 *       example:
 *         serviceName: Cleaning
 *         serviceType: Maintenance
 *         desc: Cleaning service for cabins
 *         unit: per hour
 *         price: 100
 *         code: SVC001
 *     Bookings:
 *       type: object
 *       required:
 *         - tenantRefId
 *         - price
 *         - cabinId
 *         - noOfSeat
 *         - noOfDays
 *       properties:
 *         tenantRefId:
 *           type: string
 *           description: The id of user who booked a cabin
 *         price:
 *           type: number
 *           description: Price at which cabin is booked
 *         cabinId:
 *           type: number
 *           description: The id of cabin which is booked
 *         noOfSeat:
 *           type: number
 *           description: No of seats in the cabin
 *         noOfDays:
 *           type: number
 *           description: Number of days for which seat is being booked
 *       example:
 *         tenantRefId: "tenant123"
 *         price: 10000
 *         cabinId: 71
 *         noOfSeat: 10
 *         noOfDays: 14
 */
/**
 * @swagger
 * /api/v1/cabin:
 *   post:
 *     summary: Create a new cabin
 *     tags: [Cabin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cabin'
 *     responses:
 *       201:
 *         description: Cabin created successfully
 *       500:
 *         description: Internal server error
 */
app.post('/api/v1/cabin', (req, res) => {
    const { name, noOfSeat, price, code } = req.body;
    const sql = `INSERT INTO cabin (Name_, No_Of_Seats, BookedPrice, Code_)
     VALUES ('${name}', ${noOfSeat}, ${price}, '${code}')`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(201).send(result);
    });

    return;
});
/**
 * @swagger
 * /api/v1/cabin/{id}:
 *   patch:
 *     summary: Update a cabin's booking information
 *     tags: [Cabin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The cabin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookedPrice:
 *                 type: number
 *               tenantId:
 *                 type: string
 *               bookingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cabin updated successfully
 *       500:
 *         description: Internal server error
 */
app.patch('/api/v1/cabin/:id', async (req, res) => {
    const { bookedPrice, tenantId, bookingId } = req.body;
    const cabinId = req.params.id;

    // Corrected SQL query
    const sql = `UPDATE cabin 
                 SET BookedPrice = ${bookedPrice}, 
                     BookingRefId = '${bookingId}', 
                     BookedUtcAt = NOW(), 
                     TenantRefId = '${tenantId}' ,
                      IsBooked = true 
                 WHERE Id = '${cabinId}';`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error updating cabin:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.status(200).send(result);
    });
});

/**
 * @swagger
 * /api/v1/cabin:
 *   patch:
 *     summary: Reset a cabin's booking information
 *     tags: [Cabin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cabinId:
 *                 type: integer
 *                 description: The ID of the cabin to reset
 *     responses:
 *       200:
 *         description: Cabin booking information reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.patch('/api/v1/cabin/', async (req, res) => {
    const { cabinId } = req.body;
    const sql = `update  cabin set TenantRefId = NULL, IsBooked=NULL,
     BookingRefId=NULL, BookedUtcAt=NULL where Id=${cabinId};`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error updating cabin: ', err);
            res.status(500).json({ error: 'Internal Server error' });
            return;
        }
        res.status(200).send(result);
    })
})

/**
 * @swagger
 * /api/v1/cabin:
 *   get:
 *     summary: Get all cabins or a specific cabin by ID
 *     tags: [Cabin]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: The cabin ID (optional)
 *     responses:
 *       200:
 *         description: A list of cabins or a specific cabin
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cabin'
 *                 - $ref: '#/components/schemas/Cabin'
 *       500:
 *         description: Internal server error
 */
app.get('/api/v1/cabin/:id?', (req, res) => {
    const { id } = req.params;
    let sql;
    if (id) {
        sql = `select * from cabin where id= ${id}`;
    } else {
        sql = `SELECT * FROM cabin`;
    }
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

/**
 * @swagger
 * /api/v1/cabin/{id}:
 *   delete:
 *     summary: Delete a cabin by ID
 *     tags: [Cabin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The cabin ID
 *     responses:
 *       200:
 *         description: Cabin deleted successfully
 *       404:
 *         description: Cabin not found
 *       500:
 *         description: Internal server error
 */
app.delete('/api/v1/cabin/:id', (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM cabin WHERE id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({ error: 'Error deleting the Cabin' });
        } else if (result.affectedRows === 0) {
            res.status(404).send({ message: 'Cabin not found' });
        } else {
            res.status(200).send({ message: 'Cabin deleted successfully' });
        }
    });
});

/**
 * @swagger
 * /api/v1/service:
 *   get:
 *     summary: Get all services or a specific service by ID
 *     tags: [Service]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: The service ID (optional)
 *     responses:
 *       200:
 *         description: A list of services or a specific service
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 *                 - $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal server error
 */
app.get('/api/v1/service/:id?', (req, res) => {
    const { id } = req.params;
    let sql;

    if (id) {
        sql = `SELECT * FROM service WHERE id = ?`;
    } else {
        sql = `SELECT * FROM service`;
    }

    db.query(sql, id ? [id] : [], (err, result) => {
        if (err) {
            console.error('Error in database operation:', err);
            return res.status(500).send({ error: 'Database operation failed' });
        }
        if (id && result.length === 0) {
            return res.status(404).send({ error: 'Service not found' });
        }
        res.send(result);
    });
});

/**
 * @swagger
 * /api/v1/service:
 *   post:
 *     summary: Create a new service
 *     tags: [Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: Service created successfully
 *       500:
 *         description: Internal server error
 */
app.post('/api/v1/service', (req, res) => {
    const { serviceName, serviceType, desc, price, code } = req.body;
    const unit = req.body.unit.selectedUnit
    const sql = `INSERT INTO service (Name_, ServiceTypeName, Description_, Unit, Price, Code_) VALUES ('${serviceName}', '${serviceType}', '${desc}', '${unit}', ${price}, '${code}')`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(201).send(result);
    });
});

/**
 * @swagger
 * /api/v1/service/{id}:
 *   delete:
 *     summary: Delete a service by ID
 *     tags: [Service]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The service ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal server error
 */
app.delete('/api/v1/service/:id', (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM service WHERE id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({ error: 'Error deleting the Service' });
        } else if (result.affectedRows === 0) {
            res.status(404).send({ message: 'Service not found' });
        } else {
            res.status(200).send({ message: 'Service deleted successfully' });
        }
    });
});

/**
 * @swagger
 * /api/v1/cabinService:
 *   get:
 *     summary: Get all cabin services
 *     tags: [CabinService]
 *     responses:
 *       200:
 *         description: A list of cabin services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   cabinRefId:
 *                     type: integer
 *                   ServiceRefId:
 *                     type: integer
 *                   Unit:
 *                     type: string
 *                   Price:
 *                     type: number
 *       500:
 *         description: Internal server error
 */
app.get('/api/v1/cabinService', (req, res) => {
    const sql = `SELECT * FROM cabinService`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});



/**
 * @swagger
 * /api/v1/cabinService/{cabinId}:
 *   get:
 *     summary: Get services associated with a specific cabin
 *     tags: [CabinService]
 *     parameters:
 *       - in: path
 *         name: cabinId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the cabin
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ServiceRefId:
 *                         type: integer
 *       500:
 *         description: Database operation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

app.get('/api/v1/cabinService/:cabinId', (req, res) => {
    const { cabinId } = req.params;

    // Escape cabinId to prevent SQL injection
    const sql = `SELECT Name_, Price FROM service WHERE Id IN (SELECT ServiceRefId FROM cabinservice WHERE CabinRefId = ${db.escape(cabinId)});`;
    // Properly escape the cabinId
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error in database operation:', err);
            return res.status(500).send({ error: 'Database operation failed' });
        }
        if (result.length === 0) {
            return res.status(200).send({ message: `No service associated with cabin id ${cabinId}` });
        }
        return res.status(200).send({ message: `Services Associated with cabin ${cabinId}`, result });
    });
});

/**
 * @swagger
 * /api/v1/cabinService:
 *   post:
 *     summary: Associate services with a cabin
 *     tags: [CabinService]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cabinId:
 *                 type: integer
 *               services:
 *                 type: object
 *                 additionalProperties:
 *                   type: number
 *             example:
 *               cabinId: 1
 *               "1": 100
 *               "2": 200
 *     responses:
 *       201:
 *         description: Services associated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Invalid input or no new services to add
 *       500:
 *         description: Server error
 */

function convertData(input) {
    const { cabinId, ...services } = input;
    const result = {
        cabinId: parseInt(cabinId, 10), // Convert cabinId to a number
        services: []
    };

    for (const key in services) {
        if (services[key] !== false) {
            result.services.push({
                serviceId: parseInt(key, 10),
                //   unit: "EACH", // Set a default unit value
                price: services[key]
            });
        }
    }

    return result;
}
app.post('/api/v1/cabinService', async (req, res) => {

    const convertedData = convertData(req.body);

    const { cabinId, services } = convertedData;
    console.log(convertedData);

    if (!Array.isArray(services) || !cabinId) {
        return res.status(400).send({ error: 'Invalid input. Expecting cabinId and an array of services.' });
    }
    try {
        // Fetch existing associations for the given cabinId
        const existingAssociations = await new Promise((resolve, reject) => {
            const sqlCheck = `SELECT ServiceRefId FROM cabinservice WHERE cabinRefId = ?`;
            db.query(sqlCheck, [cabinId], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results.map(row => row.ServiceRefId));
            });
        });

        // Filter out services that are already associated with the cabinId
        const newServices = services.filter(service => !existingAssociations.includes(service.serviceId));

        if (newServices.length === 0) {
            return res.status(400).send({ error: 'No new services to add' });
        }

        // Prepare values for insertion
        const values = newServices.map(service =>
            `(${cabinId}, ${service.serviceId}, ${service.price})`
        ).join(', ');

        const sqlInsert = `INSERT INTO cabinservice (cabinRefId, ServiceRefId, Price) VALUES ${values}`;

        db.query(sqlInsert, (err, result) => {
            if (err) {
                console.error('Error in database operation:', err);
                return res.status(500).send({ error: 'Database operation failed' });
            }
            res.status(201).send({ message: 'Services associated successfully', result });
        });

    } catch (error) {
        console.error('Error in processing request:', error);
        res.status(500).send({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /api/v1/cabinService/{cabinId}:
 *   delete:
 *     summary: Delete services associated with a cabin
 *     tags: [CabinService]
 *     parameters:
 *       - in: path
 *         name: cabinId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the cabin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceId:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: An array of service IDs to be deleted
 *             required:
 *               - serviceId
 *     responses:
 *       200:
 *         description: Services deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Database operation failed
 */

app.delete('/api/v1/cabinService/:cabinId', (req, res) => {
    const { cabinId } = req.params;
    const { serviceId } = req.body;

    if (!Array.isArray(serviceId) || serviceId.length === 0) {
        return res.status(400).send({ error: 'Invalid input. Expecting an array of service IDs.' });
    }

    // Escape each serviceId to prevent SQL injection
    const serviceIdList = serviceId.map(id => db.escape(id)).join(', ');

    // Escape cabinId to prevent SQL injection
    const sql = `DELETE FROM cabinservice WHERE ServiceRefId IN (${serviceIdList}) AND CabinRefId = ${db.escape(cabinId)};`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error in database operation:', err);
            return res.status(500).send({ error: 'Database operation failed' });
        }
        res.status(200).send({ message: 'Services deleted successfully', result });
    });
});

/**
 * @swagger
 * /api/v1/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenantRefId:
 *                 type: string
 *               price:
 *                 type: number
 *               cabinId:
 *                 type: string
 *               noOfSeat:
 *                 type: integer
 *               noOfDays:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       500:
 *         description: Internal server error
 */
app.post('/api/v1/bookings', async (req, res) => {
    const { tenantRefId, price, cabinId, noOfDays } = req.body;


    //console.log(req.body)
    // Prepare the SQL query
    const sql = `INSERT INTO Bookings (TenantRefId, Price, Status, BookedUtcAt, CabinRefId,No_Of_Days) VALUES
        ('${tenantRefId}', ${price}, 'pending', NOW(), '${cabinId}', ${noOfDays})`;


    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(201).send(result);
    });

});

app.post('/api/v1/jobposting', async (req, res) => {
    const { category, level, title, text, paymentType, amount, min, max, skills, } = req.body

    console.log(req.body);
})


app.post("/api/v1/payment", (req, res) => {
    stripe.paymentIntents.create(
        {
            amount: parseInt(req.body.amount),
            currency: "inr",
            payment_method_types: ["card"],
            description: 'Description of the export transaction',
        },
        function (err, paymentIntent) {
            if (err) {
                res.status(500).json(err.message);
            } else {
                res.status(201).json(paymentIntent);
            }
        }
    );
});

app.post("/api/v1/bookingTransaction", async (req, res) => {

    const { cabinId, price, tenantId, status, noOfDays } = req.body;
    const sql = `INSERT INTO BookingsTransactions (TenantRefId, BookedPrice, Status, BookedUtcAt,
    CabinRefId,No_Of_Days) VALUES ('${tenantId}', ${price},'${status}', NOW(), '${cabinId}', ${noOfDays})`;

    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(201).send(result);
    });
})

app.patch("/api/v1/bookingTransaction", async (req, res) => {
    const { transactionId, status, name, email, address, bookingId } = req.body;
    const sql = `UPDATE BookingsTransactions SET 
    TransactionId = '${transactionId}',
    Status = '${status}',
    Name = '${name}',
    Email = '${email}',
    Address = '${address}'
    WHERE Id = ${bookingId}`;

    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(201).send(result);
    });
})

app.listen(8000, () => {
    console.log(`Server is running on port 8000!`);
});
