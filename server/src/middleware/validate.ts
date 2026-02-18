import { HttpError } from './error.middleware';

type Rule = {
  field: string
  required?: boolean
  type?: 'string' | 'number' | 'boolean'
  min?: number
  max?: number
  oneOf?: string[]
}

export function validate(body: Record<string, unknown>, rules: Rule[]): void
{
  for (const rule of rules)
  {
    const value = body[rule.field];

    if (rule.required && (value === undefined || value === null || value === ''))
      throw new HttpError(400, `Feld '${rule.field}' ist erforderlich.`);

    if (value === undefined || value === null) continue;

    if (rule.type === 'string' && typeof value !== 'string')
      throw new HttpError(400, `Feld '${rule.field}' muss ein Text sein.`);

    if (rule.type === 'number' && (typeof value !== 'number' || isNaN(value)))
      throw new HttpError(400, `Feld '${rule.field}' muss eine Zahl sein.`);

    if (rule.type === 'boolean' && typeof value !== 'boolean')
      throw new HttpError(400, `Feld '${rule.field}' muss ein Boolean sein.`);

    if (rule.min !== undefined && typeof value === 'number' && value < rule.min)
      throw new HttpError(400, `Feld '${rule.field}' muss mindestens ${rule.min} sein.`);

    if (rule.max !== undefined && typeof value === 'number' && value > rule.max)
      throw new HttpError(400, `Feld '${rule.field}' darf höchstens ${rule.max} sein.`);

    if (rule.oneOf && typeof value === 'string' && !rule.oneOf.includes(value))
      throw new HttpError(400, `Feld '${rule.field}' muss einer der Werte sein: ${rule.oneOf.join(', ')}.`);
  }
}
