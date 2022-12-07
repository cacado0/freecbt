import * as T from "io-ts"
import { Distortion, ID, FromData } from "./distortion"
import { Legacy, LegacyID } from "./legacy"
import { default as list } from "./data"

export const bySlug = Object.fromEntries(list.map((d) => [d.slug, d]))

const FromID = T.string.pipe(
  new T.Type<Distortion, ID, ID>(
    "DistortionFromID",
    FromData.is,
    (id, c) =>
      id in bySlug
        ? T.success(bySlug[id])
        : T.failure("no such distortion-id", c),
    (dis) => dis.slug
  )
)

const FromLegacyID = LegacyID.pipe(
  new T.Type(
    "DistortionFromLegacyID",
    FromData.is,
    ({ slug }: LegacyID, c) =>
      slug in bySlug
        ? T.success(bySlug[slug])
        : T.failure("no such distortion-id", c),
    (dis: Distortion) => ({ slug: dis.slug })
  )
)

/**
 * encoding legacy-distortions is still useful for testing
 */
export const FromLegacy = Legacy.pipe(
  new T.Type(
    "DistortionFromLegacy",
    FromData.is,
    FromLegacyID.validate,
    (dis: Distortion) => ({
      slug: dis.slug,
      emoji: dis.emoji(),
      label: dis.label(),
      description: dis.description(),
    })
  )
)

// This produces a working decoder - it can decode both ID and Legacy.
// The type is wrong, though! It indicates we might encode a Legacy, even though we never actually do.
// export const Codec = T.union([FromID, FromLegacyID])

/**
 * Decode a distortion from an id or a persisted legacy distortion.
 */
export const Codec: typeof FromID = new T.Type(
  "Distortion",
  FromData.is,
  T.union([FromID, FromLegacyID]).validate,
  FromID.encode
)
