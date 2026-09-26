declare module "midtrans-client" {
  export class Snap {
    constructor(opts: {
      isProduction: boolean;
      serverKey: string;
      clientKey?: string;
    });
    createTransactionToken(parameter: Record<string, unknown>): Promise<string>;
  }

  const Midtrans: { Snap: typeof Snap };
  export default Midtrans;
}
