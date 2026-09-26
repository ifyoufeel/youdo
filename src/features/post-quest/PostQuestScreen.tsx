/* Ports preview/app.js's PostQuestScreen (2568-2822) — one screen, step-
   branched inline (mirrors QuestDetailScreen.tsx's own role-branching
   style), rather than four routed sub-screens: every step mutates the
   same draft object, so there's nothing separate routes would buy here
   the way onboarding's genuinely-distinct steps needed them.

   Split in two: PostQuestScreen gates on the data a fresh draft's
   defaults need (the signed-in user's own area, the first real
   category) before ever initializing the draft hook, so usePostDraft
   never has to guess at a default and then patch it in later; Wizard
   holds every step's real UI and only mounts once that data is ready. */
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@data/auth-session";
import { useRepository } from "@data/composition-root";
import { Screen } from "@design/components/Screen";
import { LoadingState } from "@design/components/LoadingState";
import { ErrorState } from "@design/components/ErrorState";
import { Card } from "@design/components/Card";
import { Badge } from "@design/components/Badge";
import { RewardPill } from "@design/components/RewardPill";
import { InfoRow } from "@design/components/InfoRow";
import { Input } from "@design/components/Input";
import { Select } from "@design/components/Select";
import { Button } from "@design/components/Button";
import { Icon } from "@design/components/Icon";
import { FeeBreakdown } from "@design/components/FeeBreakdown";
import { money, formatMoney, type Category } from "@data/contracts";
import type { Area } from "@data/ports/areas";
import { formatWhenAt } from "@lib/format";
import { raw } from "@design/tokens/raw";
import { semantic } from "@design/tokens/semantic";
import { fontFamilyName } from "@design/tokens/font-family";
import { t } from "../../i18n/t";
import { usePostDraft } from "./usePostDraft";
import { usePostQuest } from "./usePostQuest";
import { useAreas } from "./useAreas";
import {
  POST_STEPS,
  durationOption,
  dateOptions,
  timeOptions,
  tpeISO,
  expiryISO,
  computeErrors,
  isStepValid,
  budgetMinorOf,
  DURATIONS,
  EXPIRY_OPTIONS,
  type PostQuestForm,
} from "./wizardForm";

const STEP_LABELS: Record<(typeof POST_STEPS)[number], string> = {
  what: t("post.step.what"),
  where: t("post.step.where"),
  budget: t("post.step.budget"),
  review: t("post.step.review"),
};

const TITLE_FONT = fontFamilyName(raw.font.display, raw.fontWeight.bold);
const BODY_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);
const EYEBROW_FONT = fontFamilyName(raw.font.text, raw.fontWeight.bold);
const NOTE_FONT = fontFamilyName(raw.font.text, raw.fontWeight.regular);

export function PostQuestScreen() {
  const { session } = useAuthSession();
  const repository = useRepository();

  const meQuery = useQuery({
    queryKey: ["users", session?.userId],
    queryFn: () => repository.getUser(session!.userId),
    enabled: !!session,
  });
  const areasQuery = useAreas();
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => repository.listCategories(),
    staleTime: Infinity,
  });

  if (meQuery.isError || areasQuery.isError || categoriesQuery.isError) {
    return (
      <Screen title={t("post.title")}>
        <ErrorState onRetry={() => { meQuery.refetch(); areasQuery.refetch(); categoriesQuery.refetch(); }} />
      </Screen>
    );
  }
  if (!meQuery.data || !areasQuery.data || !categoriesQuery.data) {
    return (
      <Screen title={t("post.title")}>
        <LoadingState />
      </Screen>
    );
  }

  const areas = areasQuery.data;
  const categories = categoriesQuery.data.filter((c) => c.id !== "all");
  const defaultCategoryId = categories[0]?.id ?? "";

  return (
    <Wizard
      posterId={session!.userId}
      posterName={meQuery.data.name}
      defaultArea={meQuery.data.area}
      defaultCategoryId={defaultCategoryId}
      areas={areas}
      categories={categories}
    />
  );
}

interface WizardProps {
  posterId: string;
  posterName: string;
  defaultArea: string;
  defaultCategoryId: string;
  areas: Area[];
  categories: Category[];
}

function Wizard({ posterId, defaultArea, defaultCategoryId, areas, categories }: WizardProps) {
  const router = useRouter();
  const draft = usePostDraft(defaultArea);
  const postQuest = usePostQuest();
  const [step, setStep] = useState(0);
  const [tried, setTried] = useState<Record<string, boolean>>({});
  const [now] = useState(() => Date.now());

  const form = draft.hydrated && !draft.form.categoryId ? { ...draft.form, categoryId: defaultCategoryId } : draft.form;

  function set<K extends keyof PostQuestForm>(key: K, value: PostQuestForm[K]) {
    draft.setForm({ ...form, [key]: value });
  }

  const errors = computeErrors(form);
  const stepKey = POST_STEPS[step];
  const budgetMinor = budgetMinorOf(form);
  const durOpt = durationOption(form.minutes);
  const scheduled = form.date && form.time ? tpeISO(form.date, form.time) : null;
  const whenLabel = scheduled ? formatWhenAt(scheduled, now) : "";
  const offersCloseLabel = scheduled ? formatWhenAt(expiryISO(scheduled, form.expiry, now), now) : "—";
  const area = areas.find((a) => a.name === form.area) ?? areas[0];
  const category = categories.find((c) => c.id === form.categoryId);

  function show(field: keyof typeof errors): string | undefined {
    return tried[stepKey] && errors[field] ? errors[field] : undefined;
  }

  function next() {
    if (!isStepValid(step, errors)) {
      setTried({ ...tried, [stepKey]: true });
      return;
    }
    setStep(Math.min(POST_STEPS.length - 1, step + 1));
  }

  function submit() {
    if (!scheduled || !area) return;
    postQuest.mutate(
      {
        posterId,
        title: form.title.trim(),
        details: form.details.trim(),
        categoryId: form.categoryId,
        payoutMinor: budgetMinor,
        estimatedMinutes: durOpt.minutes,
        durationLabel: durOpt.open ? durOpt.label : null,
        addressLine: form.address.trim(),
        area: form.area,
        point: area.point,
        scheduledFor: scheduled,
        expiresAt: expiryISO(scheduled, form.expiry, now),
        requirements: [],
      },
      {
        onSuccess: () => {
          draft.clearDraft();
          setStep(0);
          setTried({});
          router.replace("/quests?posted=1");
        },
      }
    );
  }

  const slab = (
    <>
      {step > 0 ? (
        <Button variant="secondary" onPress={() => setStep(step - 1)}>
          {t("post.back")}
        </Button>
      ) : null}
      {stepKey === "review" ? (
        <Button fullWidth icon="plus" onPress={submit} disabled={postQuest.isPending} testID="post-submit">
          {t("post.submit")}
        </Button>
      ) : (
        <Button fullWidth iconRight="arrow-right" onPress={next} testID="post-next">
          {t("post.next")}
        </Button>
      )}
    </>
  );

  return (
    <Screen title={t("post.title")} subtitle={t("post.subtitle")} onBack={step > 0 ? () => setStep(step - 1) : undefined} slab={slab}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepEyebrow}>
          {t("post.stepHeader", { number: step + 1, total: POST_STEPS.length, label: STEP_LABELS[stepKey] })}
        </Text>
        <View style={styles.stepDots}>
          {POST_STEPS.map((key, i) => (
            <View key={key} style={[styles.stepDot, i <= step ? styles.stepDotOn : styles.stepDotOff]} />
          ))}
        </View>
      </View>

      {draft.resumed && step === 0 ? (
        <Card variant="sunken" padding="sm">
          <View style={styles.resumedRow}>
            <Icon name="pencil" size={15} color={raw.color.ink["500"]} />
            <Text style={styles.resumedText}>{t("post.resumedNotice")}</Text>
          </View>
        </Card>
      ) : null}

      {stepKey === "what" ? (
        <Card padding="lg">
          <Input
            label={t("post.what.titleLabel")}
            placeholder={t("post.what.titlePlaceholder")}
            value={form.title}
            onChangeText={(v) => set("title", v)}
            hint={show("title") ? undefined : t("post.what.titleHint")}
            error={show("title")}
            testID="post-title"
          />
          <Input
            label={t("post.what.detailsLabel")}
            placeholder={t("post.what.detailsPlaceholder")}
            multiline
            rows={3}
            value={form.details}
            onChangeText={(v) => set("details", v)}
          />
          <Select
            label={t("post.what.categoryLabel")}
            value={form.categoryId}
            options={categories.map((c) => ({ value: c.id, label: c.label }))}
            onChange={(v) => set("categoryId", v)}
          />
        </Card>
      ) : null}

      {stepKey === "where" ? (
        <>
          <Card padding="lg">
            <Text style={styles.eyebrow}>{t("post.where.heading")}</Text>
            <Input
              label={t("post.where.addressLabel")}
              icon="map-pin"
              placeholder={t("post.where.addressPlaceholder")}
              value={form.address}
              onChangeText={(v) => set("address", v)}
              error={show("address")}
              testID="post-address"
            />
            <Select
              label={t("post.where.districtLabel")}
              value={form.area}
              options={areas.map((a) => ({ value: a.name, label: a.name }))}
              onChange={(v) => set("area", v)}
            />
            <Card variant="sunken" padding="md">
              <View style={styles.privacyRow}>
                <Icon name="lock" size={16} color={raw.color.ink["500"]} />
                <Text style={styles.privacyText}>{t("post.where.privacyNote")}</Text>
              </View>
            </Card>
          </Card>
          <Card padding="lg">
            <Text style={styles.eyebrow}>{t("post.when.heading")}</Text>
            <Select
              label={t("post.when.dateLabel")}
              value={form.date}
              options={dateOptions(now)}
              onChange={(v) => set("date", v)}
              placeholder={t("post.when.datePlaceholder")}
              testID="post-date"
            />
            <Select
              label={t("post.when.timeLabel")}
              value={form.time}
              options={timeOptions()}
              onChange={(v) => set("time", v)}
              placeholder={t("post.when.timePlaceholder")}
              testID="post-time"
            />
            {show("when") ? <Text style={styles.errorText}>{show("when")}</Text> : null}
            <Select
              label={t("post.when.durationLabel")}
              value={form.minutes}
              options={DURATIONS.map((d) => ({ value: d.value, label: d.label }))}
              onChange={(v) => set("minutes", v)}
            />
            <Select
              label={t("post.when.expiryLabel")}
              value={form.expiry}
              options={EXPIRY_OPTIONS.map((e) => ({ value: e.value, label: e.label }))}
              onChange={(v) => set("expiry", v)}
            />
            <Text style={styles.note}>{t("post.when.expiryNote")}</Text>
          </Card>
        </>
      ) : null}

      {stepKey === "budget" ? (
        <Card padding="lg">
          <Text style={styles.eyebrow}>{t("post.budget.heading")}</Text>
          <Input
            label={t("post.budget.priceLabel")}
            prefix="NT$"
            keyboardType="decimal-pad"
            value={form.budget}
            onChangeText={(v) => set("budget", v.replace(/[^0-9.]/g, ""))}
            hint={show("budget") ? undefined : t("post.budget.priceHint")}
            error={show("budget")}
            testID="post-budget"
          />
          {budgetMinor > 0 ? <FeeBreakdown amountMinor={budgetMinor} title={t("post.budget.feeTitle")} /> : null}
        </Card>
      ) : null}

      {stepKey === "review" ? (
        <>
          <Card padding="lg">
            <Badge label={category?.label ?? ""} tone="neutral" size="sm" />
            <Text style={styles.title}>{form.title}</Text>
            <RewardPill amount={formatMoney(money(budgetMinor))} size="lg" style={styles.rewardPill} />
            {form.details ? <Text style={styles.description}>{form.details}</Text> : null}
          </Card>
          <Card padding="md">
            <InfoRow icon="map-pin" label="Where" value={form.area} />
            <InfoRow icon="calendar" label="When" value={whenLabel} />
            <InfoRow icon="clock" label="How long" value={durOpt.label} />
            <InfoRow icon="zap" label="Offers close" value={offersCloseLabel} />
          </Card>
          <FeeBreakdown amountMinor={budgetMinor} title={t("post.review.feeTitle")} />
          <Card variant="sunken" padding="md">
            <View style={styles.privacyRow}>
              <Icon name="lock" size={16} color={raw.color.ink["500"]} />
              <Text style={styles.privacyText}>
                {t("post.review.privacyNote", { address: form.address, area: form.area })}
              </Text>
            </View>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepHeader: {
    gap: 8,
  },
  stepEyebrow: {
    fontFamily: EYEBROW_FONT,
    fontSize: raw.fontSize["2xs"],
    letterSpacing: raw.letterSpacing.caps,
    textTransform: "uppercase",
    color: semantic.color.text.secondary,
  },
  stepDots: {
    flexDirection: "row",
    gap: 4,
  },
  stepDot: {
    flex: 1,
    height: 6,
    borderRadius: raw.radius.pill,
    borderWidth: raw.border.hair,
    borderColor: semantic.color.border.strong,
  },
  stepDotOn: {
    backgroundColor: raw.color.lime["500"],
  },
  stepDotOff: {
    backgroundColor: raw.color.paper["000"],
  },
  resumedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resumedText: {
    flex: 1,
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
  eyebrow: {
    fontFamily: EYEBROW_FONT,
    fontSize: raw.fontSize["2xs"],
    letterSpacing: raw.letterSpacing.caps,
    textTransform: "uppercase",
    color: semantic.color.text.secondary,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  privacyText: {
    flex: 1,
    fontFamily: NOTE_FONT,
    fontSize: raw.fontSize["2xs"],
    lineHeight: raw.fontSize["2xs"] * raw.lineHeight.normal,
    color: semantic.color.text.secondary,
  },
  note: {
    fontFamily: NOTE_FONT,
    fontSize: raw.fontSize["2xs"],
    color: semantic.color.text.secondary,
  },
  errorText: {
    fontFamily: NOTE_FONT,
    fontSize: raw.fontSize.xs,
    color: semantic.color.text.danger,
  },
  title: {
    fontFamily: TITLE_FONT,
    fontSize: raw.fontSize.xl,
    letterSpacing: raw.letterSpacing.heading,
    color: semantic.color.text.primary,
    marginTop: 8,
  },
  rewardPill: {
    alignSelf: "flex-start",
  },
  description: {
    fontFamily: BODY_FONT,
    fontSize: raw.fontSize.sm,
    lineHeight: raw.fontSize.sm * raw.lineHeight.normal,
    color: semantic.color.text.primary,
  },
});
