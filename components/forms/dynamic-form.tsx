"use client";

import { useEffect, useState } from "react";
import { DEFAULT_LLM_MODEL, DEFAULT_LLM_PROVIDER, DEFAULT_LLM_REASONING } from "@/lib/config/llm";
import { FIELD_CONFIG, INTENT_OPTIONS } from "@/lib/config/modes";
import type { AnalysisMode, DecisionIntent, FormPayload, FormFieldConfig } from "@/lib/schemas/analysis";
import type { UserProfile } from "@/lib/schemas/persistence";

type DynamicFormProps = {
  mode: AnalysisMode;
  intent: DecisionIntent;
  pending: boolean;
  defaults: UserProfile | null;
  onSubmit: (payload: FormPayload) => void;
  onSaveDefaults: (payload: FormPayload) => void;
};

const defaults: Partial<FormPayload> = {
  ownIt: "No",
  riskStyle: "Balanced",
  timeHorizon: "Position",
  objective: "Balanced",
  incomeGoal: "Monthly yield",
  llmProvider: DEFAULT_LLM_PROVIDER,
  llmModel: DEFAULT_LLM_MODEL,
  llmReasoning: DEFAULT_LLM_REASONING,
};

export function DynamicForm({ mode, intent, pending, defaults, onSubmit, onSaveDefaults }: DynamicFormProps) {
  const [values, setValues] = useState<Partial<FormPayload>>({
    ...defaults,
    intent,
  });

  const fields = FIELD_CONFIG[mode];

  useEffect(() => {
    if (!defaults) return;

    setValues((current) => ({
      ...current,
      riskStyle: current.riskStyle || defaults.defaultRiskStyle,
      objective: current.objective || defaults.defaultObjective,
      timeHorizon: current.timeHorizon || defaults.defaultTimeHorizon,
      llmProvider: current.llmProvider || defaults.defaultLlmProvider,
      llmModel: current.llmModel || defaults.defaultLlmModel,
      llmReasoning: current.llmReasoning || defaults.defaultLlmReasoning,
    }));
  }, [defaults]);

  function updateField(name: keyof FormPayload, value: string) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      ...values,
      intent,
    });
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <FieldRenderer
        field={{
          name: "intent",
          label: "What do you want to know today?",
          type: "select",
          options: [...INTENT_OPTIONS],
        }}
        value={intent}
        onChange={() => undefined}
        disabled
      />

      {fields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={String(values[field.name] ?? "")}
          onChange={(value) => updateField(field.name, value)}
        />
      ))}

      <div className="field field--wide">
        <div className="button-row">
          <button className="button button--primary" type="submit" disabled={pending}>
            {pending ? "Generating..." : "Generate View"}
          </button>
          <button
            className="button button--secondary"
            type="button"
            disabled={pending}
            onClick={() => onSaveDefaults(values as FormPayload)}
          >
            Save Defaults
          </button>
        </div>
        <p className="inline-note">
          This phase uses mock APIs and deterministic demo scoring. Live data and model-written PM
          memos are next.
        </p>
      </div>
    </form>
  );
}

type FieldRendererProps = {
  field: FormFieldConfig;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function FieldRenderer({ field, value, onChange, disabled = false }: FieldRendererProps) {
  const wideClass = field.type === "textarea" ? " field--wide" : "";

  return (
    <label className={`field${wideClass}`}>
      <span className="field__label">{field.label}</span>
      {field.type === "textarea" ? (
        <textarea
          className="field__input field__input--textarea"
          placeholder={field.placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        />
      ) : field.type === "select" ? (
        <select
          className="field__input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        >
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="field__input"
          type="text"
          placeholder={field.placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        />
      )}
    </label>
  );
}
