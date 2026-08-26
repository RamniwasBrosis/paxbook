/** Shape attached to `req.user` by CustomerJwtStrategy.validate(), derived from the access token's claims. */
export interface RequestCustomer {
  sub: string; // Customer.id
  name: string;
  email: string;
  phone: string | null;
  tenantId: string;
}
