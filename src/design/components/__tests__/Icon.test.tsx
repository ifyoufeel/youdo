import { render } from "@testing-library/react-native";
import type { TestInstance } from "test-renderer";
import { Icon } from "../Icon";
import { ICON_NAMES } from "../../icons/names";
import { ICON_SHAPES } from "../../icons/shapes";

const SHAPE_TYPES = new Set(["RNSVGPath", "RNSVGCircle", "RNSVGRect"]);

function svgRoot(root: TestInstance): TestInstance {
  // render()'s root is itself the outermost host node here — queryAll
  // excludes the instance it's called on unless told otherwise.
  const [svg] = root.queryAll((n) => n.type === "RNSVGSvgView", { includeSelf: true });
  if (!svg) throw new Error("no RNSVGSvgView found in the rendered tree");
  return svg;
}

describe("Icon", () => {
  it("renders every one of the 47 names with its expected shape-element count", async () => {
    expect(ICON_NAMES.length).toBe(47); // pins the count so a future edit to names.ts is noticed here too
    for (const name of ICON_NAMES) {
      const expectedCount = ICON_SHAPES[name].length;
      const { root } = await render(<Icon name={name} />);
      if (!root) throw new Error("render() returned a null root");
      // A typo'd shape tuple (e.g. one that renders nothing) would show up
      // as a mismatch against ICON_SHAPES' own length for that icon.
      const shapeNodes = root.queryAll((n) => SHAPE_TYPES.has(n.type));
      expect(shapeNodes.length).toBe(expectedCount);
    }
  });

  it("defaults to a real color token, not the web-only 'currentColor'", async () => {
    const { root } = await render(<Icon name="search" />);
    const svg = svgRoot(root!);
    expect(svg.props.stroke).not.toBe("currentColor");
    expect(typeof svg.props.stroke).toBe("string");
    expect((svg.props.stroke as string).length).toBeGreaterThan(0);
  });

  it("filled uses color as fill and drops the stroke", async () => {
    const { root } = await render(<Icon name="heart" filled color="#ff0000" />);
    const svg = svgRoot(root!);
    expect(svg.props.fill).toBe("#ff0000");
    expect(svg.props.stroke).toBe("none");
  });

  it("is hidden from assistive tech when it has no accessibilityLabel, and exposed when it does", async () => {
    const decorative = await render(<Icon name="star" />);
    const decorativeSvg = svgRoot(decorative.root!);
    expect(decorativeSvg.props.accessible).toBe(false);
    expect(decorativeSvg.props.importantForAccessibility).toBe("no-hide-descendants");

    const labelled = await render(<Icon name="star" accessibilityLabel="Favourite" />);
    const labelledSvg = svgRoot(labelled.root!);
    expect(labelledSvg.props.accessible).toBe(true);
    expect(labelledSvg.props.accessibilityLabel).toBe("Favourite");
    expect(labelledSvg.props.importantForAccessibility).toBe("yes");
  });
});
