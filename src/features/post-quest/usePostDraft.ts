/* AsyncStorage'd wizard draft — mirrors useBrowseFilters.ts's own
   hydrate-on-mount pattern. Unlike a persisted Quest record, this is
   nothing but the wizard's own in-progress form, never sent to
   postQuest until real submit (see the M3 plan's "draft = AsyncStorage'd
   form state, not a Quest"). Ported from app.js:2517-2542's DRAFT_KEY/
   loadDraft/saveDraft/draftHasContent/clearDraft, minus the localStorage
   ↔ AsyncStorage swap. */
import { useEffect, useState } from "react";
import { getItem, setItem } from "@lib/storage";
import { emptyForm, draftHasContent, type PostQuestForm } from "./wizardForm";

const STORAGE_KEY = "youdo.postQuestDraft.v1";

export function usePostDraft(defaultArea: string) {
  const [form, setForm] = useState<PostQuestForm>(() => emptyForm(defaultArea));
  const [hydrated, setHydrated] = useState(false);
  // A one-time "did we load a draft at mount" flag — unlike form itself,
  // this never flips back to false just because later edits empty the
  // form out again, only clearDraft() resets it.
  const [resumed, setResumed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getItem<PostQuestForm>(STORAGE_KEY).then((stored) => {
      if (cancelled) return;
      if (stored && draftHasContent(stored)) {
        setForm(stored);
        setResumed(true);
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Every form change re-saves, same plain (no debounce) effect app.js's
  // own PostQuestScreen uses — only once hydration has actually run, so
  // this never overwrites a stored draft with the pre-hydration empty
  // form on mount.
  useEffect(() => {
    if (!hydrated) return;
    if (draftHasContent(form)) {
      setItem(STORAGE_KEY, form);
    } else {
      setItem(STORAGE_KEY, null);
    }
  }, [form, hydrated]);

  function clearDraft() {
    setResumed(false);
    setForm(emptyForm(defaultArea));
    setItem(STORAGE_KEY, null);
  }

  return { form, setForm, hydrated, resumed, clearDraft };
}
