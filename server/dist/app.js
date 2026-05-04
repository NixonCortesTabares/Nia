"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const auth_routes_1 = __importDefault(require("./infraestructure/http/routes/auth.routes"));
const ProfesionalRoutes_1 = __importDefault(require("./infraestructure/http/routes/ProfesionalRoutes"));
const ServiciosRoutes_1 = __importDefault(require("./infraestructure/http/routes/ServiciosRoutes"));
const whatsapp_1 = __importDefault(require("./webhooks/whatsapp"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_routes_1.default);
app.use('/api/profesionales', ProfesionalRoutes_1.default);
app.use('/api/servicios', ServiciosRoutes_1.default);
app.use('/webhook', whatsapp_1.default);
// Ruta de salud â€” para verificar que el servidor funciona
app.get('/health', async (req, res) => {
    try {
        await db_1.default.query('SELECT 1');
        res.json({
            status: 'ok',
            message: 'Servidor y base de datos funcionando',
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error conectando a la base de datos',
        });
    }
});
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
exports.default = app;
