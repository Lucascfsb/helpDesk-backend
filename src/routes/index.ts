import { Router } from "express";
import { sessionsRoutes } from "./sessions.routes";
import { adminsRoutes } from "./admins.routes";
import { techniciansRoutes } from "./technicians.routes";
import { customersRoutes } from "./customers.routes";
import { servicesRoutes } from "./services.routes";
import { ticketsRoutes } from "./tickets.routes";

const routes = Router();

routes.use("/sessions", sessionsRoutes);
routes.use("/admins", adminsRoutes);
routes.use("/technicians", techniciansRoutes);
routes.use("/customers", customersRoutes);
routes.use("/services", servicesRoutes);
routes.use("/tickets", ticketsRoutes);

export { routes };
