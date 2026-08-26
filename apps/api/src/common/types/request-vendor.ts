/** Shape attached to `req.user` by VendorJwtStrategy.validate(), derived from the access token's claims. */
export interface RequestVendor {
  sub: string; // Vendor.id
  name: string;
  email: string;
  tenantId: string;
}
