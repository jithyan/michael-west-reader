import type { N } from "ts-toolbelt";

export type Size =
    | "xs"
    | "sm"
    | "base"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl";

export type FontWeight =
    | "font-bold"
    | "font-semibold"
    | "font-extrabold"
    | "font-light"
    | "font-normal"
    | "font-light"
    | "font-thin"
    | "font-extralight";

export type TextSize = `text-${Size}`;

export type TextStyle = "underline" | "italic";

export type ColorWeights = `${N.Range<1, 9>[number]}00`;

export type Colors =
    | "cyan"
    | "sky"
    | "amber"
    | "zinc"
    | "slate"
    | "gray"
    | "yellow";

export type BgColors = `bg-${Colors}-${ColorWeights}`;

export type TextColor = `text-${Colors}-${ColorWeights}`;

export type Sides = "b" | "t" | "r" | "l" | "x" | "y";

type PaddingOrMarginSizes = 0.5 | 1.5 | 2.5 | 3.5 | N.Range<0, 16>[number];
export type Margin =
    | `m-${PaddingOrMarginSizes}`
    | `m${Sides}-${PaddingOrMarginSizes}`;
export type Padding =
    | `p-${PaddingOrMarginSizes}`
    | `p${Sides}-${PaddingOrMarginSizes}`;
