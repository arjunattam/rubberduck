import { flattenChildren, buildTree } from "./tree";

test("flatten tree works", () => {
  const EMPTY_TREE = {};
  const RESPONSE = { children: [] };
  expect(flattenChildren(EMPTY_TREE)).toEqual(RESPONSE);
});

test("build tree works", () => {
  expect(buildTree([])).toEqual([]);

  const FILE_LIST = ["file.rb", "subdir/file2.rb", "subdir/exec_file"];
  const EXPECTED_TREE = [
    { name: "file.rb", children: [] },
    {
      name: "subdir",
      children: [
        {
          name: "file2.rb",
          children: []
        },
        {
          name: "exec_file",
          children: []
        }
      ]
    }
  ];
  expect(buildTree(FILE_LIST)).toEqual(EXPECTED_TREE);
});

test("fill paths works", () => {
  const INPUT_TREE = [
    { name: "file.rb", children: [] },
    {
      name: "subdir",
      children: [
        {
          name: "file2.rb",
          children: []
        },
        {
          name: "exec_file",
          children: []
        }
      ]
    }
  ];
  const EXPECTED_PATHS = [
    { name: "file.rb", children: [], path: "file.rb" },
    {
      name: "subdir",
      path: "",
      children: [
        {
          name: "file2.rb",
          children: []
        },
        {
          name: "exec_file",
          children: []
        }
      ]
    }
  ];
});
