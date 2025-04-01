// server/db.js
import { PrismaClient } from './node_modules/.prisma/client'; // Adjust path if needed

const prisma = new PrismaClient();

export default prisma;