# Frontend Integration Guide: Validation Error Handling

## Overview

The unit API endpoints now include comprehensive input validation that returns structured error messages. This guide explains the new validation error response format and how to integrate it into frontend components.

## Breaking Changes

### Previous Error Format
```javascript
// Old format - simple string message
{
  message: "Property ID and unit name are required."
}
```

### New Error Format
```javascript
// New format - structured validation errors
{
  message: "Validation failed",
  errors: [
    {
      field: "rentAmount",
      message: "Rent amount must be non-negative",
      constraint: "number >= 0"
    },
    {
      field: "status", 
      message: "Invalid status value",
      constraint: "one of: vacant, occupied, maintenance"
    }
  ]
}
```

## TypeScript Interfaces

Add these interfaces to your frontend code:

```typescript
// types/validation.ts
export interface ValidationError {
  field: string
  message: string
  constraint: string
}

export interface APIErrorResponse {
  message: string
  errors?: ValidationError[]
}

// For successful responses with units
export interface APISuccessResponse<T> {
  data?: T
}
```

## Error Handling Functions

### Basic Error Parser
```typescript
// utils/validation-errors.ts
export function parseValidationErrors(
  response: APIErrorResponse
): Record<string, string> {
  if (!response.errors) {
    return { _general: response.message }
  }
  
  const fieldErrors: Record<string, string> = {}
  response.errors.forEach(error => {
    fieldErrors[error.field] = error.message
  })
  
  return fieldErrors
}

export function getFieldError(
  errors: Record<string, string>,
  fieldName: string
): string | undefined {
  return errors[fieldName]
}

export function hasFieldError(
  errors: Record<string, string>,
  fieldName: string
): boolean {
  return fieldName in errors
}
```

### React Hook for Form Validation
```typescript
// hooks/useFormValidation.ts
import { useState } from 'react'
import { ValidationError, APIErrorResponse } from '@/types/validation'

export interface FormValidationState {
  errors: Record<string, string>
  isValid: boolean
  clearError: (field: string) => void
  clearAllErrors: () => void
  setApiErrors: (response: APIErrorResponse) => void
  getFieldError: (field: string) => string | undefined
  hasFieldError: (field: string) => boolean
}

export function useFormValidation(): FormValidationState {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const clearError = (field: string) => {
    setErrors(prev => {
      const { [field]: _, ...rest } = prev
      return rest
    })
  }

  const clearAllErrors = () => {
    setErrors({})
  }

  const setApiErrors = (response: APIErrorResponse) => {
    if (response.errors) {
      const fieldErrors: Record<string, string> = {}
      response.errors.forEach(error => {
        fieldErrors[error.field] = error.message
      })
      setErrors(fieldErrors)
    } else {
      setErrors({ _general: response.message })
    }
  }

  const getFieldError = (field: string) => errors[field]
  const hasFieldError = (field: string) => field in errors
  const isValid = Object.keys(errors).length === 0

  return {
    errors,
    isValid,
    clearError,
    clearAllErrors,
    setApiErrors,
    getFieldError,
    hasFieldError
  }
}
```

## React Component Examples

### Unit Creation Form
```typescript
// components/UnitForm.tsx
import React, { useState } from 'react'
import { useFormValidation } from '@/hooks/useFormValidation'

interface UnitFormData {
  propertyId: string
  unitName: string
  unitNumber?: string
  floor?: number
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
  rentAmount: number
  status: 'vacant' | 'occupied' | 'maintenance'
  tenantId?: string
  notes?: string
}

export function UnitForm({ propertyId, onSuccess }: { 
  propertyId: string
  onSuccess: (unit: any) => void 
}) {
  const [formData, setFormData] = useState<UnitFormData>({
    propertyId,
    unitName: '',
    rentAmount: 0,
    status: 'vacant'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const validation = useFormValidation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    validation.clearAllErrors()

    try {
      const response = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        validation.setApiErrors(errorData)
        return
      }

      const unit = await response.json()
      onSuccess(unit)
    } catch (error) {
      validation.setApiErrors({
        message: 'Network error. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = (field: keyof UnitFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (validation.hasFieldError(field)) {
      validation.clearError(field)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* General error display */}
      {validation.getFieldError('_general') && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">{validation.getFieldError('_general')}</p>
        </div>
      )}

      {/* Unit Name Field */}
      <div>
        <label htmlFor="unitName" className="block text-sm font-medium">
          Unit Name *
        </label>
        <input
          id="unitName"
          type="text"
          value={formData.unitName}
          onChange={(e) => handleFieldChange('unitName', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
            validation.hasFieldError('unitName') 
              ? 'border-red-500 ring-red-500' 
              : 'focus:border-blue-500 focus:ring-blue-500'
          }`}
        />
        {validation.hasFieldError('unitName') && (
          <p className="mt-1 text-sm text-red-600">
            {validation.getFieldError('unitName')}
          </p>
        )}
      </div>

      {/* Rent Amount Field */}
      <div>
        <label htmlFor="rentAmount" className="block text-sm font-medium">
          Rent Amount *
        </label>
        <input
          id="rentAmount"
          type="number"
          min="0"
          step="0.01"
          value={formData.rentAmount}
          onChange={(e) => handleFieldChange('rentAmount', parseFloat(e.target.value) || 0)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
            validation.hasFieldError('rentAmount') 
              ? 'border-red-500 ring-red-500' 
              : 'focus:border-blue-500 focus:ring-blue-500'
          }`}
        />
        {validation.hasFieldError('rentAmount') && (
          <p className="mt-1 text-sm text-red-600">
            {validation.getFieldError('rentAmount')}
          </p>
        )}
      </div>

      {/* Status Field */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium">
          Status *
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => handleFieldChange('status', e.target.value as any)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
            validation.hasFieldError('status') 
              ? 'border-red-500 ring-red-500' 
              : 'focus:border-blue-500 focus:ring-blue-500'
          }`}
        >
          <option value="vacant">Vacant</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>
        {validation.hasFieldError('status') && (
          <p className="mt-1 text-sm text-red-600">
            {validation.getFieldError('status')}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Unit'}
      </button>
    </form>
  )
}
```

### Error Display Component
```typescript
// components/ValidationErrorDisplay.tsx
import React from 'react'
import { ValidationError } from '@/types/validation'

interface ValidationErrorDisplayProps {
  errors: ValidationError[]
  className?: string
}

export function ValidationErrorDisplay({ 
  errors, 
  className = '' 
}: ValidationErrorDisplayProps) {
  if (errors.length === 0) return null

  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <h3 className="text-sm font-medium text-red-800 mb-2">
        Please fix the following errors:
      </h3>
      <ul className="list-disc list-inside space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="text-sm text-red-700">
            <span className="font-medium">{error.field}:</span> {error.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## API Client Functions

### Typed API Client
```typescript
// lib/api-client.ts
import { ValidationError, APIErrorResponse } from '@/types/validation'

export class APIValidationError extends Error {
  constructor(
    message: string,
    public errors: ValidationError[]
  ) {
    super(message)
    this.name = 'APIValidationError'
  }
}

export async function createUnit(unitData: any) {
  const response = await fetch('/api/units', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(unitData)
  })

  const data = await response.json()

  if (!response.ok) {
    if (response.status === 400 && data.errors) {
      throw new APIValidationError(data.message, data.errors)
    }
    throw new Error(data.message || 'Failed to create unit')
  }

  return data
}

export async function updateUnit(unitId: string, updates: any) {
  const response = await fetch(`/api/units/${unitId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  })

  const data = await response.json()

  if (!response.ok) {
    if (response.status === 400 && data.errors) {
      throw new APIValidationError(data.message, data.errors)
    }
    throw new Error(data.message || 'Failed to update unit')
  }

  return data
}
```

## Migration Checklist

### For Existing Forms
- [ ] Add TypeScript interfaces for validation errors
- [ ] Update error handling to use structured format
- [ ] Add field-specific error display
- [ ] Implement real-time error clearing
- [ ] Test with various validation scenarios

### For API Calls
- [ ] Update fetch error handling
- [ ] Add support for 400 status with validation errors
- [ ] Implement retry logic for network errors
- [ ] Add loading states for better UX

### Testing Validation
- [ ] Test required field validation
- [ ] Test numeric constraints (negative values)
- [ ] Test enum validation (invalid status values)
- [ ] Test pattern validation (tenant ID format)
- [ ] Test multiple simultaneous errors
- [ ] Test partial update scenarios

## Best Practices

1. **Clear Errors on Input**: Clear field-specific errors when users start typing
2. **Visual Feedback**: Use red borders and text for invalid fields
3. **Helpful Messages**: Display both the error message and constraint information
4. **Loading States**: Show loading indicators during API calls
5. **Error Persistence**: Keep errors visible until fixed or form is reset
6. **Accessibility**: Use proper ARIA labels for screen readers

## Example Error Scenarios

### Multiple Field Errors
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "rentAmount",
      "message": "Rent amount must be non-negative", 
      "constraint": "number >= 0"
    },
    {
      "field": "bedrooms",
      "message": "Bedrooms must be non-negative integer",
      "constraint": "integer >= 0"
    }
  ]
}
```

### Single Field Error
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "tenantId",
      "message": "Invalid tenant ID format",
      "constraint": "pattern: t_[alphanumeric-]+"
    }
  ]
}
```

This new validation system provides much better user experience by giving specific, actionable feedback for each field that fails validation.