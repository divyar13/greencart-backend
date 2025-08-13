require("dotenv").config();
// console.log("Mongo URI:", process.env.MONGO_URI);
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const Driver = require("../models/Driver");
const Route = require("../models/Route");
const Order = require("../models/Order");

// CSV file paths
const driversCSV = path.join(__dirname, "drivers.csv");
const routesCSV = path.join(__dirname, "routes.csv");
const ordersCSV = path.join(__dirname, "orders.csv");

async function importData() {
  await connectDB();

  try {
    // 1️⃣ Clear existing data
    await Driver.deleteMany();
    await Route.deleteMany();
    await Order.deleteMany();

    // 2️⃣ Import Routes first
    const routes = [];
    await new Promise((resolve) => {
      fs.createReadStream(routesCSV)
        .pipe(csv())
        .on("data", (row) => {
          routes.push({
            routeId: parseInt(row.route_id),
            distanceKm: parseFloat(row.distance_km),
            trafficLevel: row.traffic_level,
            baseTime: parseFloat(row.base_time_min),
          });
        })
        .on("end", async () => {
          await Route.insertMany(routes);
          console.log(`✅ Imported ${routes.length} routes`);
          resolve();
        });
    });

    // 3️⃣ Import Drivers
    const drivers = [];
    await new Promise((resolve) => {
      fs.createReadStream(driversCSV)
        .pipe(csv())
        .on("data", (row) => {
          drivers.push({
            name: row.name,
            currentShiftHours: parseFloat(row.shift_hours),
            past7DayHours: row.past_week_hours
              .split("|")
              .map((h) => parseFloat(h)),
          });
        })
        .on("end", async () => {
          await Driver.insertMany(drivers);
          console.log(`✅ Imported ${drivers.length} drivers`);
          resolve();
        });
    });

    // 4️⃣ Import Orders
    const orders = [];
    await new Promise((resolve) => {
      fs.createReadStream(ordersCSV)
        .pipe(csv())
        .on("data", (row) => {
          orders.push({
            orderId: row.order_id.toString(), // store as string for consistency
            valueRs: parseFloat(row.value_rs),
            deliveryTimestamp: new Date(`2025-01-01T${row.delivery_time}:00Z`),
            _tempRouteId: parseInt(row.route_id), // for linking
          });
        })
        .on("end", async () => {
          // Fetch all route docs
          const routeDocs = await Route.find();

          const mappedOrders = orders.map((o) => {
            // Find the route whose routeId matches the CSV route_id
            const matchedRoute = routeDocs.find(
              (r) => Number(r.routeId) === o._tempRouteId
            );

            return {
              orderId: o.orderId,
              valueRs: o.valueRs,
              assignedRoute: matchedRoute ? matchedRoute._id : null, // ObjectId ref
              deliveryTimestamp: o.deliveryTimestamp,
            };
          });

          await Order.insertMany(mappedOrders);
          console.log(`✅ Imported ${mappedOrders.length} orders`);
          resolve();
        });
    });

    console.log("🎯 Data import completed!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

importData();
