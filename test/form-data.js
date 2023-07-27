export const testFormItems = {
  ["1ee13e24-de80-6db8-ad3c-0242994894d2"]: {
    sn: "1ee13e24-de80-6db8-ad3c-0242994894d2",
    type: "form",
    options: { label: "" },
  },
  ["input-cfc487a1-0324-4267-89cf-190b9b0b3087"]: {
    sn: "input-cfc487a1-0324-4267-89cf-190b9b0b3087",
    type: "input",
    category: "basic",
    options: { label: "單行文字" },
  },
  ["textarea-f2883251-2e7f-4312-a8ea-629aaf9025e4"]: {
    sn: "textarea-f2883251-2e7f-4312-a8ea-629aaf9025e4",
    type: "textarea",
    options: { label: "多行文字" },
  },
  ["number-2c78962c-4a31-4b16-9244-5a30864b4fe7"]: {
    sn: "number-2c78962c-4a31-4b16-9244-5a30864b4fe7",
    type: "number",
    options: { label: "數字" },
  },
  ["radio-0c05c59c-854b-4393-ad2a-7900ae865dfa"]: {
    sn: "radio-0c05c59c-854b-4393-ad2a-7900ae865dfa",
    type: "radio",
    options: {
      label: "單選",
      radioOptions: [
        { label: "選項一", value: "value-1" },
        { label: "選項二", value: "value-2" },
        { value: "value-other", label: "其他" },
      ],
      other: "",
    },
  },
  ["checkbox-b1a51709-b470-4d74-94c1-b986fbc0f224"]: {
    sn: "checkbox-b1a51709-b470-4d74-94c1-b986fbc0f224",
    type: "checkbox",
    options: {
      label: "複選",
      checkboxOptions: [
        { label: "選項一", value: "value-1" },
        { label: "選項二", value: "value-2" },
        { value: "value-other", label: "其他" },
      ],
      other: "",
    },
  },
  ["select-1d8de357-e044-4102-924e-49eaf57a545a"]: {
    sn: "select-1d8de357-e044-4102-924e-49eaf57a545a",
    type: "select",
    options: {
      label: "下拉單選",
      selectOptions: [
        { label: "選項一", value: "value-1" },
        { label: "選項二", value: "value-2" },
      ],
    },
  },
  ["select_multiple-6958f624-c3b3-4784-8678-fabbf3a8c2b4"]: {
    sn: "select_multiple-6958f624-c3b3-4784-8678-fabbf3a8c2b4",
    type: "select_multiple",
    options: {
      label: "下拉複選",
      selectMultipleOptions: [
        { label: "選項一", value: "value-1" },
        { label: "選項二", value: "value-2" },
      ],
    },
  },
};

export const testFormData = {
  ["input-cfc487a1-0324-4267-89cf-190b9b0b3087"]: "這是一個單行文字",
  ["textarea-f2883251-2e7f-4312-a8ea-629aaf9025e4"]: "這是一個多行文字\n這是一個多行文字",
  ["number-2c78962c-4a31-4b16-9244-5a30864b4fe7"]: 1000,
  ["radio-0c05c59c-854b-4393-ad2a-7900ae865dfa"]: "value-1",
  ["checkbox-b1a51709-b470-4d74-94c1-b986fbc0f224"]: [
    "value-1",
    "value-2",
    "value-other",
  ],
  ["select-1d8de357-e044-4102-924e-49eaf57a545a"]: "value-2",
  ["select_multiple-6958f624-c3b3-4784-8678-fabbf3a8c2b4"]: [
    "value-1",
    "value-2",
  ],
};
