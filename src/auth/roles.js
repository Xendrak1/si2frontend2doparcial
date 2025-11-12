export const Roles = {
  Invitado: "invitado",
  Cliente: "cliente",
  Vendedor: "vendedor",
  Admin: "admin",
};

// Permisos granulares
export const Permissions = {
  DashboardVer: "dashboard:ver",
  ProductosLeer: "productos:leer",
  ProductosEditar: "productos:editar",
  CategoriasAll: "categorias:*",
  VentasPOS: "ventas:pos",
  VentasOnline: "ventas:online",
  ClientesAll: "clientes:*",
  StockMov: "stock:mov",
  ReportesVer: "reportes:ver",
  SucursalesAll: "sucursales:*",
  RolesAll: "roles:*",
};

// Mapa sugerido
export const roleToPermissions = {
  [Roles.Invitado]: [],
  [Roles.Cliente]: [Permissions.ProductosLeer, Permissions.VentasOnline],
  [Roles.Vendedor]: [
    Permissions.DashboardVer,
    Permissions.ProductosLeer,
    Permissions.VentasPOS,
    Permissions.ClientesAll,
    Permissions.StockMov,
    Permissions.ReportesVer,
  ],
  [Roles.Admin]: Object.values(Permissions),
};

export function hasPermission(user, permission) {
  if (!user) return false;
  const perms = user.permissions || roleToPermissions[user.role] || [];
  return perms.includes(permission) || perms.includes("*");
}


