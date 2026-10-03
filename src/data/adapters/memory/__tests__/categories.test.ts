import { createMemoryCategoriesPort } from "../categories";
import { categories } from "../store";
import { setFaultInjectionRate } from "../fault-injection";

describe("memory categories adapter", () => {
  afterEach(() => setFaultInjectionRate(0));

  it("listCategories returns the seeded category list", async () => {
    const port = createMemoryCategoriesPort();
    await expect(port.listCategories()).resolves.toEqual(categories);
  });

  it("honors the fault-injection switch", async () => {
    setFaultInjectionRate(1);
    const port = createMemoryCategoriesPort();
    await expect(port.listCategories()).rejects.toThrow(/Injected fault/);
  });
});
