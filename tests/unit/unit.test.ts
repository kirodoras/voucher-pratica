import voucherRepository from "./../../src/repositories/voucherRepository";
import voucherService, {
  VoucherCreateData,
} from "./../../src/services/voucherService";

describe("voucherService test suite", () => {
  it("should pass to create voucher", async () => {
    const code = "FFF";
    const discount = 10;
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce(null);
    jest.spyOn(voucherRepository, "createVoucher").mockImplementationOnce(null);

    await voucherService.createVoucher(code, discount);
    expect(voucherRepository.getVoucherByCode).toBeCalled();
  });

  it("should pass to not create duplicated voucher", async () => {
    const code = "FFF";
    const discount = 10;

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          code,
          discount,
        };
      });

    const promise = voucherService.createVoucher(code, discount);
    expect(promise).rejects.toEqual({
      message: "Voucher already exist.",
      type: "conflict",
    });
  });

  it("should pass to apply discount", async () => {
    const amount = 9999;
    const voucher: VoucherCreateData = {
      code: "FFF",
      discount: 10,
      used: false,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: voucher.code,
          discount: voucher.discount,
          used: false,
        };
      });
    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {});

    const order = await voucherService.applyVoucher(voucher.code, amount);
    expect(order.applied).toBe(true);
  });

  it("should pass to not apply discount for invalid voucher", async () => {
    const amount = 200;
    const voucher: VoucherCreateData = {
      code: "FFF",
      discount: 10,
      used: false,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return undefined;
      });

    const promise = voucherService.applyVoucher(voucher.code, amount);
    expect(promise).rejects.toEqual({
      message: "Voucher does not exist.",
      type: "conflict",
    });
  });

  it("should pass to not apply discount for values below 100", async () => {
    const amount = 99.99;
    const voucher: VoucherCreateData = {
      code: "FFF",
      discount: 10,
      used: false,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: voucher.code,
          discount: voucher.discount,
          used: false,
        };
      });
    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {});
    const order = await voucherService.applyVoucher(voucher.code, amount);
    expect(order.applied).toBe(false);
  });

  it("should pass to not apply discount for used voucher", async () => {
    const amount = 200;
    const voucher: VoucherCreateData = {
      code: "FFF",
      discount: 10,
      used: true,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: voucher.code,
          discount: voucher.discount,
          used: voucher.used,
        };
      });

    const order = await voucherService.applyVoucher(voucher.code, amount);
    expect(order.applied).toBe(false);
  });
});
