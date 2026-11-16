import { describe, expect, it } from "vitest";
import {
  csvCell,
  emptyFilters,
  filterCustomers,
  initialState,
  validState,
} from "../src/domain/model";
describe("客户筛选与本地数据边界", () => {
  it("搜索匹配客户、联系人、邮箱，并与城市和状态取交集", () => {
    const rows = initialState().customers;
    expect(
      filterCustomers(rows, {
        ...emptyFilters,
        search: "  sagara  ",
        city: "Jakarta",
        status: "active",
      }).map((c) => c.name),
    ).toEqual(["Sagara Retail"]);
    expect(
      filterCustomers(rows, {
        ...emptyFilters,
        search: "Sagara",
        city: "Bandung",
      }),
    ).toEqual([]);
    expect(
      filterCustomers(rows, {
        ...emptyFilters,
        search: "contact1@example.com",
      }),
    ).toHaveLength(1);
  });
  it("金额与跟进日期边界包含等值，空条件恢复所有记录", () => {
    const rows = initialState().customers;
    const c = rows[0];
    expect(
      filterCustomers(rows, {
        ...emptyFilters,
        min: c.amount,
        max: c.amount,
        from: c.followup,
        to: c.followup,
      }).some((x) => x.id === c.id),
    ).toBe(true);
    expect(filterCustomers(rows, emptyFilters)).toHaveLength(rows.length);
  });
  it("拒绝损坏、重复和未知状态数据", () => {
    expect(validState(initialState())).toBe(true);
    const duplicate = initialState();
    duplicate.customers.push(duplicate.customers[0]);
    expect(validState(duplicate)).toBe(false);
    const bad = initialState();
    bad.customers[0].status = "unknown";
    expect(validState(bad)).toBe(false);
    const deal = initialState();
    deal.deals[0].stage = 8;
    expect(validState(deal)).toBe(false);
    expect(validState({ customers: [] })).toBe(false);
  });
  it("导出转义引号换行并避免公式被表格软件执行", () => {
    expect(csvCell('A "B", C')).toBe('"A ""B"", C"');
    expect(csvCell("=1+1")).toBe('"\'=1+1"');
    expect(csvCell("普通文本")).toBe('"普通文本"');
  });
});
