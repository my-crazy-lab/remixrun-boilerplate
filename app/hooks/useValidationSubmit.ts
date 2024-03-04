import { useSubmit } from "@remix-run/react";
import { Form } from "@remix-run/react";

import { useForm, useFieldArray } from "react-hook-form";

const useValidationSubmit = () => {
  const submit = useSubmit();
};

export default useValidationSubmit;
