import type { Place } from "../kit";
import type { PlaceKey } from "../table";
import { aurora } from "./aurora";
import { bench } from "./bench";
import { chart } from "./chart";
import { editor } from "./editor";
import { forum } from "./forum";
import { library } from "./library";
import { orbit } from "./orbit";
import { peaks } from "./peaks";
import { thread } from "./thread";
import { violin } from "./violin";

/** One builder per place, in the order of the journey. */
export const build: Record<PlaceKey, () => Place> = { thread, violin, editor, orbit, peaks, bench, chart, forum, library, aurora };
