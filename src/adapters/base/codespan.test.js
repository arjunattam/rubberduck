import { delimiterSplit } from "./codespan";

test("token split works", () => {
  const TEST_STRING = "from django.conf import settings";
  const EXPECTED = [
    "from",
    " ",
    "django",
    ".",
    "conf",
    " ",
    "import",
    " ",
    "settings"
  ];
  expect(delimiterSplit(TEST_STRING)).toEqual(EXPECTED);

  const TEST_STRING_2 = "(TEST)";
  const EXPECTED_2 = ["(", "TEST", ")"];
  expect(delimiterSplit(TEST_STRING_2)).toEqual(EXPECTED_2);
});
