"use client";

import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

type RHFTextFieldProps = {
  name: string;
} & Omit<TextFieldProps, "name">;

/**
 * React Hook Form-bound MUI TextField (mirrors COSMONYX-FE-001 components/rhf).
 * Reads form context, wires value/onChange and surfaces validation errors.
 */
export default function RHFTextField({ name, type, ...other }: RHFTextFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          value={field.value ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            field.onChange(
              type === "number"
                ? value === ""
                  ? ""
                  : Number(value)
                : value,
            );
          }}
          type={type}
          error={!!error}
          helperText={error?.message}
          {...other}
        />
      )}
    />
  );
}
