// scripts/migrate-disponibilidad.js
// Script para migrar documentos antiguos que usan 'disponibilidad' -> 'disponible'
require('dotenv').config();
const mongoose = require('mongoose');
const Producto = require('../models/Producto');

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI no está definido en .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Conectado a MongoDB para migración');

  try {
    const docs = await Producto.find({ disponibilidad: { $exists: true } }).lean();
    console.log(`Documentos encontrados con 'disponibilidad': ${docs.length}`);

    let updated = 0;
    for (const d of docs) {
      // Usar updateOne para evitar traer modelos completos y respetar validaciones mínimas
      const res = await Producto.updateOne(
        { _id: d._id },
        { $set: { disponible: d.disponibilidad }, $unset: { disponibilidad: '' } }
      );
      if (res.modifiedCount && res.modifiedCount > 0) updated++;
    }

    console.log(`Documentos actualizados: ${updated}`);
  } catch (err) {
    console.error('Error durante la migración:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
