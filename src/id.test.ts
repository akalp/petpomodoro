import { describe, expect, it } from "vitest";

import { createLocalId, type LocalIdCrypto } from "./id";

describe("createLocalId", () => {
  it("uses native randomUUID when available", () => {
    expect(
      createLocalId({
        randomUUID: () => "00000000-0000-4000-8000-000000000000",
      }),
    ).toBe("00000000-0000-4000-8000-000000000000");
  });

  it("falls back to an RFC 4122 v4 UUID when randomUUID is unavailable", () => {
    const cryptoSource: LocalIdCrypto = {
      getRandomValues: (array) => {
        if (array instanceof Uint8Array) {
          array.set([
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa,
            0xbb, 0xcc, 0xdd, 0xee, 0xff,
          ]);
        }

        return array;
      },
    };

    expect(createLocalId(cryptoSource)).toBe(
      "00112233-4455-4677-8899-aabbccddeeff",
    );
  });
});
