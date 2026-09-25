import { render, fireEvent } from "@testing-library/react-native";
import { QuestCard, type QuestCardVariant } from "../QuestCard";

const ALL_VARIANTS: QuestCardVariant[] = ["feed", "compact", "spacious", "spacious-meta"];

async function withSpies(fn: () => void | Promise<void>) {
  const error = jest.spyOn(console, "error").mockImplementation(() => {});
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  try {
    await fn();
  } finally {
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  }
}

const POSTER = { name: "Wei-Ting C.", rating: 4.9, questsCompleted: 38, verified: true };

describe("QuestCard", () => {
  it("renders every variant, with badges/poster/category/save, with no console warnings/errors", async () => {
    await withSpies(async () => {
      for (const variant of ALL_VARIANTS) {
        await render(
          <QuestCard
            variant={variant}
            title="Walk Biscuit for an hour"
            payout="NT$400"
            distance="5 min walk"
            duration="1 hr"
            when="Today, 6pm"
            category="Dog walking"
            poster={POSTER}
            badges={[{ label: "Urgent", tone: "hot", icon: "zap" }]}
            saved={false}
            onSave={() => {}}
            onPress={() => {}}
          />
        );
      }
    });
  });

  it("renders the title and formatted payout", async () => {
    const { getByText } = await render(
      <QuestCard title="Walk Biscuit for an hour" payout="NT$400" />
    );
    expect(getByText("Walk Biscuit for an hour")).toBeTruthy();
    expect(getByText("NT$400")).toBeTruthy();
  });

  it("calls onPress when the card is tapped", async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <QuestCard title="Walk Biscuit for an hour" payout="NT$400" onPress={onPress} testID="card" />
    );
    await fireEvent.press(getByTestId("card"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("calls onSave, not onPress, when the save button is tapped", async () => {
    const onPress = jest.fn();
    const onSave = jest.fn();
    const { getByLabelText } = await render(
      <QuestCard title="Walk Biscuit for an hour" payout="NT$400" onPress={onPress} onSave={onSave} />
    );
    await fireEvent.press(getByLabelText("Save quest"));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders the poster's name when given one", async () => {
    const { getByText } = await render(
      <QuestCard title="Walk Biscuit for an hour" payout="NT$400" poster={POSTER} />
    );
    expect(getByText("Wei-Ting C.")).toBeTruthy();
  });

  it("renders the category badge when no poster is given", async () => {
    const { getByText } = await render(
      <QuestCard title="Walk Biscuit for an hour" payout="NT$400" category="Dog walking" />
    );
    // textTransform:"uppercase" is a display style, not a content change —
    // the underlying text node is still exactly what was passed in.
    expect(getByText("Dog walking")).toBeTruthy();
  });
});
